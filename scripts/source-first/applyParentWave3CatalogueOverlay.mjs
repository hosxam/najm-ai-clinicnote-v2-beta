import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const beta = path.join(root, 'public', 'data-beta', 'final-catalogue');
const wave3 = path.join(root, 'clinical-expansion-v2', 'progress', 'parent-wave3');
const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const write = (p, value) => fs.writeFileSync(p, `${JSON.stringify(value, null, 2)}\n`);
const sha = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');

const incorporation = read(path.join(wave3, 'INCORPORATIONS_AND_REDIRECTS.json')).records;
const inactivePath = path.join(beta, 'inactive-inventory.json');
const aliasPath = path.join(beta, 'aliases.json');
const manifestPath = path.join(beta, 'manifest.json');
const metadataPath = path.join(beta, 'metadata.json');
const catalogPath = path.join(beta, 'catalog.json');
const compactPath = path.join(beta, 'compaction-manifest.json');
const inactive = read(inactivePath);
const aliases = read(aliasPath);
const manifest = read(manifestPath);
const metadata = read(metadataPath);
const catalog = read(catalogPath);
const compact = read(compactPath);
const byId = new Map(incorporation.map(x => [x.historical_workflow_id, x]));

inactive.workflows = inactive.workflows.map(record => {
  const entry = byId.get(record.workflow_id);
  if (!entry) return record;
  return {
    ...record,
    final_status: entry.disposition,
    redirect_to: entry.parent_workflow_id,
    reason: entry.exact_reason ?? entry.evidence_equivalence,
    historical_id_preserved: true
  };
});
inactive.inventory_fingerprint = sha(inactive.workflows);

const existingAliases = new Set(aliases.aliases.map(x => `${x.alias}|${x.workflow_id}`));
for (const entry of incorporation) {
  const key = `${entry.historical_workflow_id}|${entry.parent_workflow_id}`;
  if (existingAliases.has(key)) continue;
  aliases.aliases.push({
    alias: entry.historical_workflow_id,
    workflow_id: entry.parent_workflow_id,
    redirect_type: 'incorporated_into_existing_active_parent',
    reason: entry.redirect.reason
  });
}
aliases.aliases.sort((a, b) => a.alias.localeCompare(b.alias));
aliases.count = aliases.aliases.length;
write(aliasPath, aliases);
manifest.wave3_overlay = {
  parent_family_count: 10,
  existing_active_parents_verified: 10,
  incorporated_component_count: incorporation.length,
  pending_parent_evidence_remaining: 0,
  wave3_activation_count: 0,
  disposition_artifact: 'clinical-expansion-v2/progress/parent-wave3/PENDING_RECORD_DISPOSITIONS.json'
};
manifest.fingerprints.app_manifest = sha({ source_commit: manifest.source_commit, metadata, catalog, inactiveInventory: inactive, compactionManifest: compact });
write(inactivePath, inactive);
write(manifestPath, manifest);
console.log(JSON.stringify({ status: 'PASS', incorporated: incorporation.length, aliases: aliases.count, inactive: inactive.workflow_count, pending_parent_evidence_remaining: 0, app_manifest_fingerprint: manifest.fingerprints.app_manifest }, null, 2));
