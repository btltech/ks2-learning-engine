import {
  FirebaseFunctionEnv,
  commit,
  documentName,
  fieldFilter,
  firestoreFields,
  firestoreValue,
  getCors,
  getDocument,
  getGoogleAccessToken,
  getProjectId,
  getServiceAccount,
  hasRole,
  jsonResponse,
  runQuery,
  verifyFirebaseIdToken,
} from '../../functions-shared/firebase-admin';

type PagesFunction<E = unknown> = (context: {
  request: Request;
  env: E;
  params: Record<string, string>;
}) => Response | Promise<Response>;

type Env = FirebaseFunctionEnv;

const CLASS_COLLECTION = 'teacherClasses';
const CLASS_CODE_COLLECTION = 'classCodes';
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function cleanText(value: unknown, max: number) {
  return typeof value === 'string' ? value.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, max) : '';
}

function generateCode() {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join('');
}

function safeClass(classData: Record<string, any>, includeRoster = false) {
  const result: Record<string, unknown> = {
    classId: classData.classId || classData.id,
    className: classData.className,
    teacherId: classData.teacherId,
    teacherName: classData.teacherName,
    grade: classData.grade,
    joinCode: classData.joinCode,
    studentIds: includeRoster && Array.isArray(classData.studentIds) ? classData.studentIds : [],
    createdAt: classData.createdAt,
    updatedAt: classData.updatedAt,
  };
  if (includeRoster) result.students = classData.students || [];
  return result;
}

function studentSummary(profile: Record<string, any>) {
  const quizHistory = Array.isArray(profile.quizHistory) ? profile.quizHistory.slice(-100) : [];
  const scores = quizHistory.map((entry: any) => Number(entry?.score)).filter(Number.isFinite);
  const averageScore = scores.length ? scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length : 0;
  const timeSpent = quizHistory.reduce((sum: number, entry: any) => sum + (Number(entry?.timeSpent) || 0), 0);
  const mastery = profile.mastery && typeof profile.mastery === 'object' ? profile.mastery : {};
  const subjectMastery = Object.fromEntries(
    Object.entries(mastery).map(([subject, topics]) => {
      const values = Object.values((topics && typeof topics === 'object' ? topics : {}) as Record<string, unknown>)
        .map(Number)
        .filter(Number.isFinite);
      return [subject, values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0];
    })
  );
  return {
    studentId: profile.id,
    studentName: profile.name || 'Learner',
    age: Number(profile.age) || 0,
    points: Number(profile.totalPoints) || 0,
    streak: Number(profile.streak) || 0,
    lastActive: profile.lastLoginDate || null,
    totalQuizzes: quizHistory.length,
    averageScore: Math.round(averageScore),
    timeSpent,
    subjectMastery,
  };
}

async function authenticatedContext(request: Request, env: Env) {
  const projectId = getProjectId(env);
  const serviceAccount = getServiceAccount(env);
  if (!projectId || !serviceAccount?.client_email || !serviceAccount.private_key) {
    throw new Error('Shared classroom service is not configured');
  }
  const caller = await verifyFirebaseIdToken(projectId, request.headers.get('Authorization') || '');
  const accessToken = await getGoogleAccessToken(serviceAccount);
  const profile = await getDocument(projectId, accessToken, `users/${caller.uid}`);
  if (!profile) throw new Error('User profile not found');
  return { projectId, accessToken, caller, profile };
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const cors = getCors(request, env);
  if (!cors.allowed) return jsonResponse(403, { error: 'Origin not allowed' }, cors.headers);

  try {
    const { projectId, accessToken, caller, profile } = await authenticatedContext(request, env);
    if (hasRole(profile, caller, 'teacher') || hasRole(profile, caller, 'admin')) {
      const classes = await runQuery(
        projectId,
        accessToken,
        CLASS_COLLECTION,
        fieldFilter('teacherId', 'EQUAL', caller.uid)
      );
      const hydrated = await Promise.all(
        classes.map(async (classData) => {
          const ids = Array.isArray(classData.studentIds) ? classData.studentIds.slice(0, 100) : [];
          const profiles = await Promise.all(ids.map((id: string) => getDocument(projectId, accessToken, `users/${id}`)));
          return safeClass(
            { ...classData, students: profiles.filter(Boolean).map((entry) => studentSummary(entry!)) },
            true
          );
        })
      );
      return jsonResponse(200, { classes: hydrated }, cors.headers);
    }

    if (hasRole(profile, caller, 'student')) {
      const classIds = Array.isArray(profile.classIds) ? profile.classIds.slice(0, 10) : [];
      const classes = await Promise.all(classIds.map((id: string) => getDocument(projectId, accessToken, `${CLASS_COLLECTION}/${id}`)));
      return jsonResponse(200, { classes: classes.filter(Boolean).map((entry) => safeClass(entry!, false)) }, cors.headers);
    }

    return jsonResponse(403, { error: 'Classrooms are available to teacher and learner accounts' }, cors.headers);
  } catch (error: any) {
    const unauthorized = /Bearer|token|profile/i.test(error?.message || '');
    return jsonResponse(unauthorized ? 401 : 500, { error: error?.message || 'Unable to load classes' }, cors.headers);
  }
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const cors = getCors(request, env);
  if (!cors.allowed) return jsonResponse(403, { error: 'Origin not allowed' }, cors.headers);

  try {
    const { projectId, accessToken, caller, profile } = await authenticatedContext(request, env);
    const body = (await request.json()) as Record<string, unknown>;
    const action = cleanText(body.action, 30);

    if (action === 'create') {
      if (!hasRole(profile, caller, 'teacher') && !hasRole(profile, caller, 'admin')) {
        return jsonResponse(403, { error: 'Only teacher accounts can create classes' }, cors.headers);
      }
      const className = cleanText(body.className, 80);
      const grade = cleanText(body.grade, 20);
      if (!className || !/^Year [3-6]$/.test(grade)) {
        return jsonResponse(400, { error: 'Enter a class name and a valid KS2 year' }, cors.headers);
      }

      const now = new Date().toISOString();
      const classId = crypto.randomUUID().replace(/-/g, '');
      for (let attempt = 0; attempt < 12; attempt++) {
        const joinCode = generateCode();
        const classData = {
          classId,
          className,
          teacherId: caller.uid,
          teacherName: cleanText(profile.name, 80) || 'Teacher',
          grade,
          joinCode,
          studentIds: [],
          createdAt: now,
          updatedAt: now,
        };
        try {
          await commit(projectId, accessToken, [
            {
              update: {
                name: documentName(projectId, `${CLASS_CODE_COLLECTION}/${joinCode}`),
                fields: firestoreFields({ classId, createdAt: now }),
              },
              currentDocument: { exists: false },
            },
            {
              update: {
                name: documentName(projectId, `${CLASS_COLLECTION}/${classId}`),
                fields: firestoreFields(classData),
              },
              currentDocument: { exists: false },
            },
          ]);
          return jsonResponse(201, { class: safeClass({ ...classData, students: [] }, true) }, cors.headers);
        } catch (error: any) {
          if (!/already exists|ALREADY_EXISTS/i.test(error?.message || '') || attempt === 11) throw error;
        }
      }
    }

    if (action === 'join') {
      if (!hasRole(profile, caller, 'student')) {
        return jsonResponse(403, { error: 'Sign in as a learner to join a class' }, cors.headers);
      }
      const joinCode = cleanText(body.joinCode, 6).toUpperCase();
      if (!/^[A-Z2-9]{6}$/.test(joinCode)) {
        return jsonResponse(400, { error: 'Enter the 6-character class code' }, cors.headers);
      }
      const codeData = await getDocument(projectId, accessToken, `${CLASS_CODE_COLLECTION}/${joinCode}`);
      const classId = cleanText(codeData?.classId, 80);
      const classData = classId ? await getDocument(projectId, accessToken, `${CLASS_COLLECTION}/${classId}`) : null;
      if (!classData) return jsonResponse(404, { error: 'Class code not found' }, cors.headers);
      const existingClassIds = Array.isArray(profile.classIds) ? profile.classIds : [];
      if (existingClassIds.includes(classId)) {
        return jsonResponse(200, { class: safeClass(classData), alreadyJoined: true }, cors.headers);
      }
      if (existingClassIds.length >= 10 || (Array.isArray(classData.studentIds) && classData.studentIds.length >= 100)) {
        return jsonResponse(409, { error: 'This class membership limit has been reached' }, cors.headers);
      }
      await commit(projectId, accessToken, [
        {
          transform: {
            document: documentName(projectId, `${CLASS_COLLECTION}/${classId}`),
            fieldTransforms: [
              { fieldPath: 'studentIds', appendMissingElements: { values: [firestoreValue(caller.uid)] } },
              { fieldPath: 'updatedAt', setToServerValue: 'REQUEST_TIME' },
            ],
          },
        },
        {
          transform: {
            document: documentName(projectId, `users/${caller.uid}`),
            fieldTransforms: [
              { fieldPath: 'classIds', appendMissingElements: { values: [firestoreValue(classId)] } },
              { fieldPath: 'updatedAt', setToServerValue: 'REQUEST_TIME' },
            ],
          },
        },
      ]);
      return jsonResponse(200, { class: safeClass(classData) }, cors.headers);
    }

    if (action === 'removeStudent') {
      if (!hasRole(profile, caller, 'teacher') && !hasRole(profile, caller, 'admin')) {
        return jsonResponse(403, { error: 'Only teachers can remove class members' }, cors.headers);
      }
      const classId = cleanText(body.classId, 80);
      const studentId = cleanText(body.studentId, 128);
      const classData = classId ? await getDocument(projectId, accessToken, `${CLASS_COLLECTION}/${classId}`) : null;
      if (!classData || classData.teacherId !== caller.uid || !studentId) {
        return jsonResponse(404, { error: 'Class or learner not found' }, cors.headers);
      }
      await commit(projectId, accessToken, [
        {
          transform: {
            document: documentName(projectId, `${CLASS_COLLECTION}/${classId}`),
            fieldTransforms: [
              { fieldPath: 'studentIds', removeAllFromArray: { values: [firestoreValue(studentId)] } },
              { fieldPath: 'updatedAt', setToServerValue: 'REQUEST_TIME' },
            ],
          },
        },
        {
          transform: {
            document: documentName(projectId, `users/${studentId}`),
            fieldTransforms: [
              { fieldPath: 'classIds', removeAllFromArray: { values: [firestoreValue(classId)] } },
              { fieldPath: 'updatedAt', setToServerValue: 'REQUEST_TIME' },
            ],
          },
        },
      ]);
      return jsonResponse(200, { ok: true }, cors.headers);
    }

    return jsonResponse(400, { error: 'Unsupported class action' }, cors.headers);
  } catch (error: any) {
    const unauthorized = /Bearer|token|profile/i.test(error?.message || '');
    return jsonResponse(unauthorized ? 401 : 500, { error: error?.message || 'Unable to update class' }, cors.headers);
  }
};

export const onRequestOptions: PagesFunction<Env> = async ({ request, env }) => {
  const cors = getCors(request, env);
  return new Response(null, { status: cors.allowed ? 204 : 403, headers: cors.headers });
};
