
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const GENERATED_DIR = path.join(__dirname, '../data/questions/generated');

function cleanUnlinkedQuestions() {
  console.log('🧹 Cleaning unlinked questions...');
  
  const files = fs.readdirSync(GENERATED_DIR).filter(f => f.endsWith('.ts') && f !== 'index.ts');
  let totalRemoved = 0;
  let totalKept = 0;

  for (const file of files) {
    const filePath = path.join(GENERATED_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Match all question objects
    const questionBlockRegex = /\{\s*id:[\s\S]*?\}/g;
    const matches = content.match(questionBlockRegex);
    
    if (!matches) continue;
    
    const keptBlocks: string[] = [];
    let removedInFile = 0;
    
    for (const block of matches) {
      // Check if ncObjectives has content
      // We look for ncObjectives: ['...'] where ... is not empty
      // Also handle double quotes which might be used in some files
      const objMatch = block.match(/ncObjectives:\s*\[\s*['"][^'"]+['"][^\]]*\]/);
      
      if (objMatch) {
        keptBlocks.push(block);
        totalKept++;
      } else {
        removedInFile++;
        totalRemoved++;
      }
    }
    
    if (removedInFile > 0) {
      console.log(`  - ${file}: Removed ${removedInFile} unlinked questions (Kept ${keptBlocks.length})`);
      
      // Reconstruct the file
      const header = content.substring(0, content.indexOf('[') + 1);
      // Ensure header is correct (fix the BankQuestion[] issue if present)
      const fixedHeader = header.replace(/BankQuestion\[\s*$/, 'BankQuestion[] = [');
      
      const footer = '];\n';
      const newBody = keptBlocks.length > 0 ? '\n' + keptBlocks.join(',\n') + '\n' : '\n';
      
      fs.writeFileSync(filePath, fixedHeader + newBody + footer);
    }
  }
  
  console.log(`✅ Cleanup complete.`);
  console.log(`  Removed: ${totalRemoved}`);
  console.log(`  Kept: ${totalKept}`);
}

cleanUnlinkedQuestions();
