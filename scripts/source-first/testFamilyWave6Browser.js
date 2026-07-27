async page => {
  const base = 'https://hosxam.github.io/najm-ai-clinicnote-v2-beta';
  const bust = Date.now();
  const consoleErrors = [];
  const failedRequests = [];
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('requestfailed', request => {
    const reason = request.failure()?.errorText ?? 'failed';
    if (!/ABORTED/i.test(reason)) failedRequests.push(`${request.url()} :: ${reason}`);
  });
  const manifests = await page.evaluate(async ({ base, bust }) => ({
    final: await fetch(`${base}/data-beta/final-catalogue/manifest.json?wave6=${bust}`).then(r => r.json()),
    interactive: await fetch(`${base}/data-beta/interactive-workflows/manifest.json?wave6=${bust}`).then(r => r.json())
  }), { base, bust });
  await page.goto(`${base}/?wave6=${bust}#/beta`);
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForLoadState('networkidle');
  const search = page.getByRole('textbox', { name: 'Search interactive workflows' });
  const homeLoaded = await search.count() === 1;
  const body = await page.locator('body').innerText();
  const buildText = body.match(/(?:build|version|commit)[^\n]*([0-9a-f]{7,40})/i)?.[1] ?? '';
  const routeIds = [
    'cardio-blood-pressure-device-technique-review',
    'resp-bronchiectasis-follow-up',
    'endo-adrenal-incidentaloma-referral',
    'ent-adenoid-symptom-documentation',
    'peds-developmental-milestone-review',
    'urgent-abdominal-pain'
  ];
  const routes = [];
  for (const id of routeIds) {
    await page.goto(`${base}/?wave6=${bust}-${id}#/beta/workflows/${id}`);
    await page.waitForLoadState('networkidle');
    const text = await page.locator('body').innerText();
    routes.push({ id, quick: await page.getByRole('button', { name: 'Quick', exact: true }).count() === 1, advanced: await page.getByRole('button', { name: 'Advanced', exact: true }).count() === 1, custom_field: /Wave-6|specific/i.test(text), inactive: /inactive|not available|retired/i.test(text) });
  }
  const inactiveId = manifests.final.wave6_overlay?.remaining_inactive_ids?.[0] ?? null;
  let inactiveIsolation = { id: inactiveId, usable: false, message: '' };
  if (inactiveId) {
    await page.goto(`${base}/?wave6=${bust}-inactive#/beta/workflows/${inactiveId}`);
    await page.waitForLoadState('networkidle');
    const text = await page.locator('body').innerText();
    inactiveIsolation = { id: inactiveId, usable: await page.getByRole('button', { name: 'Quick', exact: true }).count() > 0, message: text.slice(0, 300) };
  }
  const viewports = [];
  for (const [name, width, height] of [['desktop', 1440, 900], ['tablet', 1024, 768], ['mobile', 390, 844]]) {
    await page.setViewportSize({ width, height });
    await page.goto(`${base}/?wave6=${bust}-${name}#/beta`);
    await page.waitForLoadState('networkidle');
    viewports.push({ name, loaded: await page.getByRole('textbox', { name: 'Search interactive workflows' }).count() === 1, overflow: await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1) });
  }
  const counts = manifests.final.counts ?? {};
  const pass = counts.original_workflows === 1500 && counts.active_workflows === 621 && counts.inactive_workflows === 879 && counts.clinician_facing_items === 9656 && counts.internal_evidence_records === 97321 && homeLoaded && routes.every(route => route.quick && route.advanced && route.custom_field) && !inactiveIsolation.usable && viewports.every(view => view.loaded && !view.overflow) && consoleErrors.length === 0 && failedRequests.length === 0;
  return { status: pass ? 'PASS' : 'FAIL', build_text: buildText, home_loaded: homeLoaded, manifest_counts: counts, wave6_overlay: manifests.final.wave6_overlay ?? null, interactive_counts: manifests.interactive.counts ?? {}, routes, inactive_isolation: inactiveIsolation, viewports, console_errors: consoleErrors, failed_requests: failedRequests };
}
