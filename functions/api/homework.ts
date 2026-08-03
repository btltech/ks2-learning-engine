import {
  FirebaseFunctionEnv,
  commit,
  documentName,
  fieldFilter,
  firestoreFields,
  getCors,
  getDocument,
  getGoogleAccessToken,
  getProjectId,
  getServiceAccount,
  hasRole,
  isQuotaError,
  jsonResponse,
  runQuery,
  verifyFirebaseIdToken,
} from '../../functions-shared/firebase-admin';

type PagesFunction<E = unknown> = (context: { request: Request; env: E; params: Record<string, string> }) => Response | Promise<Response>;
type Env = FirebaseFunctionEnv;

const HOMEWORK_COLLECTION = 'homeworkAssignments';
const SUBMISSION_COLLECTION = 'homeworkSubmissions';

function cleanText(value: unknown, max: number) {
  // eslint-disable-next-line no-control-regex
  return typeof value === 'string' ? value.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, max) : '';
}

function safeHomework(entry: Record<string, any>, submissions: Record<string, any>[] = []) {
  return {
    homeworkId: entry.homeworkId || entry.id,
    teacherId: entry.teacherId,
    title: entry.title,
    description: entry.description,
    subject: entry.subject,
    topics: Array.isArray(entry.topics) ? entry.topics : [],
    difficulty: entry.difficulty,
    questionCount: Number(entry.questionCount) || 10,
    dueDate: entry.dueDate,
    assignedClassIds: Array.isArray(entry.assignedClassIds) ? entry.assignedClassIds : [],
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
    submissions: submissions.map((submission) => ({
      submissionId: submission.submissionId || submission.id,
      homeworkId: submission.homeworkId,
      studentId: submission.studentId,
      studentName: submission.studentName,
      submittedAt: submission.submittedAt,
      score: Number(submission.score) || 0,
      totalQuestions: Number(submission.totalQuestions) || 0,
      timeSpent: Number(submission.timeSpent) || 0,
      answers: Array.isArray(submission.answers) ? submission.answers : [],
      feedback: submission.feedback || '',
      reviewed: Boolean(submission.reviewed),
    })),
  };
}

async function authenticatedContext(request: Request, env: Env) {
  const projectId = getProjectId(env);
  const serviceAccount = getServiceAccount(env);
  if (!projectId || !serviceAccount?.client_email || !serviceAccount.private_key) {
    throw new Error('Shared homework service is not configured');
  }
  const caller = await verifyFirebaseIdToken(projectId, request.headers.get('Authorization') || '');
  const accessToken = await getGoogleAccessToken(serviceAccount);
  const profile = await getDocument(projectId, accessToken, `users/${caller.uid}`);
  if (!profile) throw new Error('User profile not found');
  return { projectId, accessToken, caller, profile };
}

async function submissionsFor(projectId: string, accessToken: string, homeworkId: string) {
  return runQuery(projectId, accessToken, SUBMISSION_COLLECTION, fieldFilter('homeworkId', 'EQUAL', homeworkId));
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const cors = getCors(request, env);
  if (!cors.allowed) return jsonResponse(403, { error: 'Origin not allowed' }, cors.headers);
  try {
    const { projectId, accessToken, caller, profile } = await authenticatedContext(request, env);
    if (hasRole(profile, caller, 'teacher') || hasRole(profile, caller, 'admin')) {
      const assignments = await runQuery(
        projectId,
        accessToken,
        HOMEWORK_COLLECTION,
        fieldFilter('teacherId', 'EQUAL', caller.uid)
      );
      const hydrated = await Promise.all(
        assignments.map(async (entry) => safeHomework(entry, await submissionsFor(projectId, accessToken, entry.homeworkId || entry.id)))
      );
      return jsonResponse(200, { homework: hydrated }, cors.headers);
    }
    if (hasRole(profile, caller, 'student')) {
      const classIds = Array.isArray(profile.classIds) ? profile.classIds.slice(0, 10) : [];
      const resultSets = await Promise.all(
        classIds.map((classId: string) =>
          runQuery(projectId, accessToken, HOMEWORK_COLLECTION, fieldFilter('assignedClassIds', 'ARRAY_CONTAINS', classId))
        )
      );
      const unique = new Map<string, Record<string, any>>();
      resultSets.flat().forEach((entry) => unique.set(entry.homeworkId || entry.id, entry));
      const hydrated = await Promise.all(
        Array.from(unique.values()).map(async (entry) => {
          const all = await submissionsFor(projectId, accessToken, entry.homeworkId || entry.id);
          return safeHomework(entry, all.filter((submission) => submission.studentId === caller.uid));
        })
      );
      return jsonResponse(200, { homework: hydrated }, cors.headers);
    }
    return jsonResponse(403, { error: 'Homework is available to teacher and learner accounts' }, cors.headers);
  } catch (error: any) {
    if (isQuotaError(error)) return jsonResponse(503, { error: 'Homework data is temporarily unavailable because Firebase daily quota is exhausted. Please try again after the quota resets.' }, cors.headers);
    const unauthorized = /Bearer|token|profile/i.test(error?.message || '');
    return jsonResponse(unauthorized ? 401 : 500, { error: error?.message || 'Unable to load homework' }, cors.headers);
  }
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const cors = getCors(request, env);
  if (!cors.allowed) return jsonResponse(403, { error: 'Origin not allowed' }, cors.headers);
  try {
    const { projectId, accessToken, caller, profile } = await authenticatedContext(request, env);
    const body = (await request.json()) as Record<string, any>;
    const action = cleanText(body.action, 30);

    if (action === 'create') {
      if (!hasRole(profile, caller, 'teacher') && !hasRole(profile, caller, 'admin')) {
        return jsonResponse(403, { error: 'Only teacher accounts can create homework' }, cors.headers);
      }
      const title = cleanText(body.title, 100);
      const description = cleanText(body.description, 600);
      const subject = cleanText(body.subject, 40);
      const topic = cleanText(body.topic, 80);
      const difficulty = cleanText(body.difficulty, 10);
      const questionCount = Math.max(5, Math.min(20, Number(body.questionCount) || 10));
      const assignedClassIds = Array.isArray(body.assignedClassIds)
        ? Array.from(new Set(body.assignedClassIds.map((value: unknown) => cleanText(value, 80)).filter(Boolean))).slice(0, 20)
        : [];
      const dueDate = cleanText(body.dueDate, 40);
      const dueTime = Date.parse(dueDate);
      if (!title || !subject || !topic || !['Easy', 'Medium', 'Hard'].includes(difficulty) || !Number.isFinite(dueTime)) {
        return jsonResponse(400, { error: 'Complete all homework fields' }, cors.headers);
      }
      if (dueTime < Date.now() - 60_000 || dueTime > Date.now() + 366 * 86_400_000) {
        return jsonResponse(400, { error: 'Choose a valid future due date' }, cors.headers);
      }
      if (!assignedClassIds.length) return jsonResponse(400, { error: 'Choose at least one class' }, cors.headers);
      const classes = await Promise.all(
        assignedClassIds.map((classId: string) => getDocument(projectId, accessToken, `teacherClasses/${classId}`))
      );
      if (classes.some((entry) => !entry || entry.teacherId !== caller.uid)) {
        return jsonResponse(403, { error: 'You can only assign homework to your own classes' }, cors.headers);
      }

      const homeworkId = crypto.randomUUID().replace(/-/g, '');
      const now = new Date().toISOString();
      const assignment = {
        homeworkId,
        teacherId: caller.uid,
        title,
        description,
        subject,
        topics: [topic],
        difficulty,
        questionCount,
        dueDate: new Date(dueTime).toISOString(),
        assignedClassIds,
        createdAt: now,
        updatedAt: now,
      };
      await commit(projectId, accessToken, [
        {
          update: {
            name: documentName(projectId, `${HOMEWORK_COLLECTION}/${homeworkId}`),
            fields: firestoreFields(assignment),
          },
          currentDocument: { exists: false },
        },
      ]);
      return jsonResponse(201, { homework: safeHomework(assignment) }, cors.headers);
    }

    if (action === 'submit') {
      if (!hasRole(profile, caller, 'student')) {
        return jsonResponse(403, { error: 'Sign in as a learner to submit homework' }, cors.headers);
      }
      const homeworkId = cleanText(body.homeworkId, 80);
      const assignment = homeworkId ? await getDocument(projectId, accessToken, `${HOMEWORK_COLLECTION}/${homeworkId}`) : null;
      if (!assignment) return jsonResponse(404, { error: 'Homework not found' }, cors.headers);
      const classIds = Array.isArray(profile.classIds) ? profile.classIds : [];
      const assignedClassIds = Array.isArray(assignment.assignedClassIds) ? assignment.assignedClassIds : [];
      if (!assignedClassIds.some((classId: string) => classIds.includes(classId))) {
        return jsonResponse(403, { error: 'This homework is not assigned to you' }, cors.headers);
      }
      const rawAnswers = Array.isArray(body.answers) ? body.answers.slice(0, 30) : [];
      if (!rawAnswers.length) return jsonResponse(400, { error: 'Homework answers are missing' }, cors.headers);
      const answers = rawAnswers.map((answer: any) => ({
        question: cleanText(answer?.question, 1000),
        studentAnswer: cleanText(answer?.studentAnswer, 1000),
        correctAnswer: cleanText(answer?.correctAnswer, 1000),
        isCorrect: answer?.isCorrect === true,
      }));
      const correct = answers.filter((answer) => answer.isCorrect).length;
      const score = Math.round((correct / answers.length) * 100);
      const submissionId = `${homeworkId}_${caller.uid}`;
      const existing = await getDocument(projectId, accessToken, `${SUBMISSION_COLLECTION}/${submissionId}`);
      if (existing) return jsonResponse(409, { error: 'This homework has already been submitted' }, cors.headers);
      const submission = {
        submissionId,
        homeworkId,
        studentId: caller.uid,
        studentName: cleanText(profile.name, 80) || 'Learner',
        submittedAt: new Date().toISOString(),
        score,
        totalQuestions: answers.length,
        timeSpent: Math.max(0, Math.min(86_400, Number(body.timeSpent) || 0)),
        answers,
        feedback: '',
        reviewed: false,
      };
      await commit(projectId, accessToken, [
        {
          update: {
            name: documentName(projectId, `${SUBMISSION_COLLECTION}/${submissionId}`),
            fields: firestoreFields(submission),
          },
          currentDocument: { exists: false },
        },
      ]);
      return jsonResponse(201, { submission: safeHomework(assignment, [submission]).submissions[0] }, cors.headers);
    }

    return jsonResponse(400, { error: 'Unsupported homework action' }, cors.headers);
  } catch (error: any) {
    if (isQuotaError(error)) return jsonResponse(503, { error: 'Homework data is temporarily unavailable because Firebase daily quota is exhausted. Please try again after the quota resets.' }, cors.headers);
    const unauthorized = /Bearer|token|profile/i.test(error?.message || '');
    return jsonResponse(unauthorized ? 401 : 500, { error: error?.message || 'Unable to update homework' }, cors.headers);
  }
};

export const onRequestOptions: PagesFunction<Env> = async ({ request, env }) => {
  const cors = getCors(request, env);
  return new Response(null, { status: cors.allowed ? 204 : 403, headers: cors.headers });
};
