import fs from 'node:fs';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import {
  collection,
  documentId,
  getCountFromServer,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  startAfter,
} from 'firebase/firestore';

function readEnv() {
  const values = {};
  for (const path of ['.env', '.env.local']) {
    if (!fs.existsSync(path)) continue;
    for (const rawLine of fs.readFileSync(path, 'utf8').split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const separator = line.indexOf('=');
      if (separator < 1) continue;
      values[line.slice(0, separator).trim()] = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '');
    }
  }
  return values;
}

function text(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function normalized(value) {
  return text(value).toLocaleLowerCase();
}

function normalizedType(value) {
  return normalized(value).replace(/_/g, '-');
}

function answerCanBeResolved(data) {
  const answer = normalized(data.correctAnswer);
  const type = normalizedType(data.questionType);
  const options = Array.isArray(data.options) ? data.options.map(text).filter(Boolean) : [];
  if (type === 'drawing') return Boolean(text(data.question));
  if (type === 'ordering') return options.length >= 2 && Array.isArray(data.correctOrder) && data.correctOrder.length === options.length;
  if (type === 'matching') return Array.isArray(data.matchingPairs) && data.matchingPairs.length >= 2;
  if (type === 'drag-and-drop' || type === 'draganddrop') {
    return Array.isArray(data.dragItems) && data.dragItems.length > 0 && Array.isArray(data.dropZones) && data.dropZones.length > 0;
  }
  if (!answer) return false;
  if (type === 'fill-in-blank' || type === 'fillinblank') return true;
  if (options.some((option) => normalized(option) === answer)) return true;
  const numeric = Number(answer);
  if (Number.isInteger(numeric) && (options[numeric] || options[numeric - 1])) return true;
  const letter = answer.match(/^([a-f])(?:[.)\s:]|$)/i);
  return Boolean(letter && options[letter[1].toLowerCase().charCodeAt(0) - 97]);
}

function inspect(id, data) {
  const issues = [];
  const add = (severity, code, detail) => issues.push({
    id,
    subject: text(data.subject),
    topic: text(data.topic),
    severity,
    code,
    detail,
  });
  const options = Array.isArray(data.options) ? data.options.map(text).filter(Boolean) : [];
  const question = text(data.question);
  const explanation = text(data.explanation);
  if (!question) add('critical', 'missing-question', 'Question text is empty');
  if (!text(data.subject) || !text(data.topic)) add('critical', 'missing-routing-data', 'Subject or topic is empty');
  if (!answerCanBeResolved(data)) add('critical', 'unresolvable-answer', text(data.correctAnswer));
  if (new Set(options.map(normalized)).size !== options.length) add('critical', 'duplicate-options', options.join(' | '));
  if (!explanation) add('warning', 'missing-explanation', 'No explanation supplied');
  if (/\b(our county|our local area|your local area|near your school)\b/i.test(question)) {
    add('warning', 'missing-local-context', question);
  }
  if (/\bwhich (national )?curriculum objective\b/i.test(question)) {
    add('warning', 'tests-curriculum-metadata', question);
  }
  const answer = normalized(data.correctAnswer);
  if (answer === 'true' && /\b(but|however)\b[^.]{0,100}\b(not|isn't|doesn't|incorrect)\b/i.test(explanation)) {
    add('warning', 'possible-true-explanation-contradiction', explanation);
  }
  if (answer === 'false' && /^\s*(yes|correct|true)[,!.]/i.test(explanation)) {
    add('warning', 'possible-false-explanation-contradiction', explanation);
  }
  return issues;
}

const env = readEnv();
const config = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};
if (!config.apiKey || !config.projectId) throw new Error('Firebase web configuration is missing');

const app = initializeApp(config, `question-audit-${Date.now()}`);
const auth = getAuth(app);
await signInAnonymously(auth);
const db = getFirestore(app);
const questionsRef = collection(db, 'questions');
const count = (await getCountFromServer(questionsRef)).data().count;

const records = [];
let lastDocument = null;
const pageSize = 500;
while (records.length < count) {
  const pageQuery = lastDocument
    ? query(questionsRef, orderBy(documentId()), startAfter(lastDocument), limit(pageSize))
    : query(questionsRef, orderBy(documentId()), limit(pageSize));
  const snapshot = await getDocs(pageQuery);
  if (snapshot.empty) break;
  for (const document of snapshot.docs) records.push({ id: document.id, data: document.data() });
  lastDocument = snapshot.docs.at(-1);
}

const issues = records.flatMap(({ id, data }) => inspect(id, data));
const seenPrompts = new Map();
for (const { id, data } of records) {
  const key = `${normalized(data.subject)}|${normalized(data.topic)}|${normalized(data.question)}`;
  if (!normalized(data.question)) continue;
  const previous = seenPrompts.get(key);
  if (previous) {
    issues.push({ id, subject: text(data.subject), topic: text(data.topic), severity: 'warning', code: 'duplicate-question-text', detail: `Duplicates ${previous}` });
  } else {
    seenPrompts.set(key, id);
  }
}

const bySubject = records.reduce((summary, { data }) => {
  const subject = text(data.subject) || 'Missing';
  summary[subject] = (summary[subject] || 0) + 1;
  return summary;
}, {});
const issueCounts = issues.reduce((summary, issue) => {
  summary[issue.code] = (summary[issue.code] || 0) + 1;
  return summary;
}, {});
const criticalBySubject = issues.filter((issue) => issue.severity === 'critical').reduce((summary, issue) => {
  summary[issue.subject || 'Missing'] = (summary[issue.subject || 'Missing'] || 0) + 1;
  return summary;
}, {});
const byQuestionType = records.reduce((summary, { data }) => {
  const type = normalizedType(data.questionType) || 'missing';
  summary[type] = (summary[type] || 0) + 1;
  return summary;
}, {});

console.log(JSON.stringify({
  auditedAt: new Date().toISOString(),
  reportedCount: count,
  documentsRead: records.length,
  bySubject,
  byQuestionType,
  criticalIssues: issues.filter((issue) => issue.severity === 'critical').length,
  criticalBySubject,
  warnings: issues.filter((issue) => issue.severity === 'warning').length,
  issueCounts,
  criticalSamples: issues.filter((issue) => issue.severity === 'critical').slice(0, 200),
  semanticWarningSamples: issues.filter((issue) => !['missing-explanation', 'duplicate-question-text'].includes(issue.code)).slice(0, 200),
}, null, 2));
