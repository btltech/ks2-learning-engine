
import * as fs from 'fs';
import * as path from 'path';

const subjects = [
  'maths', 'english', 'science', 'history', 'geography', 
  'computing', 'art', 'music', 'pe', 'pshe', 'dt', 'languages'
];

const outputDir = path.join(process.cwd(), 'data', 'questions', 'generated');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

subjects.forEach(subject => {
  const subjectName = subject.charAt(0).toUpperCase() + subject.slice(1);
  const content = `import { BankQuestion } from '../../questionBank';

export const ${subject}Questions: BankQuestion[] = [];
`;
  fs.writeFileSync(path.join(outputDir, `${subject}.ts`), content);
});

const indexContent = `// Auto-generated index for generated questions
${subjects.map(s => `export { ${s}Questions } from './${s}';`).join('\n')}

// Combined export
import { ${subjects.map(s => `${s}Questions`).join(', ')} } from './';
export const allGeneratedQuestions = [
  ${subjects.map(s => `...${s}Questions`).join(',\n  ')}
];
`;

fs.writeFileSync(path.join(outputDir, 'index.ts'), indexContent);

console.log('Reset generated questions to valid empty state.');
