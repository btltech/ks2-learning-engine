import { writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read version from version.ts file
const versionFile = join(__dirname, '../version.ts');
const content = readFileSync(versionFile, 'utf-8');

// Extract APP_VERSION using regex
const versionMatch = content.match(/APP_VERSION\s*=\s*['"]([^'"]+)['"]/);
const version = versionMatch ? versionMatch[1] : '1.0.0';

// Generate version.json for deployment
const versionInfo = {
  version: version,
  buildDate: new Date().toISOString(),
  timestamp: Date.now()
};

const distPath = join(__dirname, '../dist/version.json');
writeFileSync(distPath, JSON.stringify(versionInfo, null, 2), 'utf-8');

console.log(`✅ Generated version.json: ${version}`);

