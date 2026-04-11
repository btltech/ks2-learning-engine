
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const GENERATED_DIR = path.join(__dirname, '../data/questions/generated');

function deduplicateSafe() {
  console.log('🧹 Starting Deduplication (Safe Mode)...');
  const files = fs.readdirSync(GENERATED_DIR).filter(f => f.endsWith('.ts') && f !== 'index.ts');
  
  for (const file of files) {
    const filePath = path.join(GENERATED_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Match all question objects
    const questionBlockRegex = /\{\s*id:[\s\S]*?\}/g;
    const matches = content.match(questionBlockRegex);
    
    if (!matches) continue;
    
    const uniqueBlocks: string[] = [];
    const seenQuestions = new Set<string>();
    let removedCount = 0;
    
    for (const block of matches) {
      const qMatch = block.match(/question:\s*"([^"]+)"/);
      if (qMatch) {
        const qText = qMatch[1].toLowerCase().trim();
        if (seenQuestions.has(qText)) {
          removedCount++;
          continue; // Skip duplicate
        }
        seenQuestions.add(qText);
      }
      uniqueBlocks.push(block);
    }
    
    if (removedCount > 0) {
      console.log(`  - ${file}: Removing ${removedCount} duplicates...`);
      
      // Reconstruct the file
      const header = content.substring(0, content.indexOf('[') + 1);
      // Ensure header is correct
      const fixedHeader = header.replace(/BankQuestion\[\s*$/, 'BankQuestion[] = [');
      
      const footer = '];\n';
      const newBody = '\n' + uniqueBlocks.join(',\n') + '\n';
      fs.writeFileSync(filePath, fixedHeader + newBody + footer);
    }
  }
  console.log('✅ Deduplication complete.');
}

deduplicateSafe();
