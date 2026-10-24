import { readFileSync } from 'node:fs';
const sbom = JSON.parse(readFileSync('sbom.spdx.json','utf8'));
const forbidden = ['GPL-','AGPL-','BUSL-','SSPL'];
const bad = [];
for (const pkg of sbom.packages || []) {
  const lic = (pkg.licenses?.[0]?.licenseConcluded || '').toUpperCase();
  if (forbidden.some(f => lic.includes(f))) bad.push(`${pkg.name}@${pkg.version} ${lic}`);
}
if (bad.length) {
  console.error('Forbidden licences found:');
  bad.forEach(b => console.error(b));
  process.exit(1);
}
console.log('Licence check passed');
