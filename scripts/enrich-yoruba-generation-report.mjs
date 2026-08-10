import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const translations = JSON.parse(fs.readFileSync(
  path.join(projectRoot, 'data', 'audio', 'yoruba-f5-review-translations.json'),
  'utf8',
));

const reports = process.argv.slice(2);
if (reports.length === 0) {
  throw new Error('Pass one or more generation-report.json paths.');
}

for (const argument of reports) {
  const reportPath = path.resolve(projectRoot, argument);
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  const missing = [];
  report.generated = report.generated.map((item) => {
    const english = translations[item.text] || item.english || '';
    if (!english.trim()) missing.push(item.text);
    return { ...item, english };
  });
  if (missing.length > 0) {
    throw new Error(`${argument} has no English translation for: ${missing.join(', ')}`);
  }
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Enriched ${report.generated.length} translations: ${argument}`);
}
