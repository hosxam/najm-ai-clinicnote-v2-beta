import fs from 'node:fs'
const map = JSON.parse(fs.readFileSync('clinical-expansion-v2/progress/catalogue-wave9/CLINICAL_COVERAGE_MAP_WAVE9.json', 'utf8'))
const gaps = JSON.parse(fs.readFileSync('clinical-expansion-v2/progress/catalogue-wave9/CLINICAL_COVERAGE_GAPS_WAVE9.json', 'utf8'))
const errors = []
if (map.dimensions.specialties.length !== 24) errors.push(`expected 24 specialty/archetype coverage categories, found ${map.dimensions.specialties.length}`)
if (!gaps.gaps.length) errors.push('coverage gap map is empty')
if (map.dimensions.specialties.some((row) => row.active_distinct_workflows < 0 || row.inactive_targetable_workflows < 0)) errors.push('coverage map contains negative counts')
console.log(JSON.stringify({ status: errors.length ? 'FAIL' : 'PASS', categories: map.dimensions.specialties.length, gaps: gaps.gaps.length, errors }, null, 2))
if (errors.length) process.exitCode = 1
