
import fs from 'fs';
import path from 'path';

// Define types locally to avoid import issues during script execution
enum YearGroup {
  Year3 = 3,
  Year4 = 4,
  Year5 = 5,
  Year6 = 6,
}

interface NCObjective {
  code: string;
  description: string;
  strand: string;
  subject: string;
  yearGroup: YearGroup;
  isStatutory: true;
}

interface JsonTopic {
  topic: string;
  description: string;
  yearGroup: string;
}

interface JsonSubject {
  subject: string;
  type: string;
  topics: JsonTopic[];
}

const jsonPath = path.join(process.cwd(), 'KS2_CURRICULUM_STRUCTURE.json');
const outputPath = path.join(process.cwd(), 'data', 'nationalCurriculum.ts');

const rawData = fs.readFileSync(jsonPath, 'utf-8');
const subjects: JsonSubject[] = JSON.parse(rawData);

const objectives: NCObjective[] = [];

const subjectCodes: Record<string, string> = {
  'Art and Design': 'ART',
  'Computing': 'COMP',
  'Design and Technology': 'DT',
  'Geography': 'GEO',
  'History': 'HIST',
  'Languages': 'LANG',
  'Music': 'MUS',
  'Physical Education': 'PE',
  'Science': 'SC',
  'Mathematics': 'MA',
  'English': 'EN'
};

subjects.forEach(subject => {
  const subjectCode = subjectCodes[subject.subject] || subject.subject.substring(0, 3).toUpperCase();
  
  subject.topics.forEach((topic, index) => {
    const yearsToGenerate: YearGroup[] = [];

    if (topic.yearGroup === 'KS2') {
      yearsToGenerate.push(YearGroup.Year3, YearGroup.Year4, YearGroup.Year5, YearGroup.Year6);
    } else if (topic.yearGroup === 'Lower KS2') {
      yearsToGenerate.push(YearGroup.Year3, YearGroup.Year4);
    } else if (topic.yearGroup === 'Upper KS2') {
      yearsToGenerate.push(YearGroup.Year5, YearGroup.Year6);
    } else if (topic.yearGroup === 'Year 3') {
      yearsToGenerate.push(YearGroup.Year3);
    } else if (topic.yearGroup === 'Year 4') {
      yearsToGenerate.push(YearGroup.Year4);
    } else if (topic.yearGroup === 'Year 5') {
      yearsToGenerate.push(YearGroup.Year5);
    } else if (topic.yearGroup === 'Year 6') {
      yearsToGenerate.push(YearGroup.Year6);
    }

    yearsToGenerate.forEach(year => {
      // Generate a unique code: SUB-YEAR-TOPIC-INDEX
      // Simplify topic for code
      const topicCode = topic.topic.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '').substring(0, 3);
      const uniqueCode = `${subjectCode}${year}-${topicCode}-${index + 1}`;

      objectives.push({
        code: uniqueCode,
        description: topic.description,
        strand: topic.topic,
        subject: subject.subject === 'Mathematics' ? 'Maths' : subject.subject, // Normalize Maths
        yearGroup: year,
        isStatutory: true
      });
    });
  });
});

const fileContent = `import { NCObjective, YearGroup } from '../types';

export const nationalCurriculumObjectives: NCObjective[] = ${JSON.stringify(objectives, null, 2)};

export const getObjectivesByYear = (year: YearGroup) => {
  return nationalCurriculumObjectives.filter(obj => obj.yearGroup === year);
};

export const getObjectivesBySubject = (subject: string) => {
  return nationalCurriculumObjectives.filter(obj => obj.subject === subject);
};

export const getObjectivesByStrand = (strand: string) => {
  return nationalCurriculumObjectives.filter(obj => obj.strand === strand);
};
`;

fs.writeFileSync(outputPath, fileContent);
console.log(`Successfully generated ${objectives.length} objectives in ${outputPath}`);
