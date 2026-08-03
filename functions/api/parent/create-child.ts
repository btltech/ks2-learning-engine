import {
  commit,
  documentName,
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
  type FirebaseFunctionEnv,
} from '../../../functions-shared/firebase-admin';

type PagesFunction<E = unknown> = (context: {
  request: Request;
  env: E;
  params: Record<string, string>;
  waitUntil: (promise: Promise<unknown>) => void;
  passThroughOnException: () => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
}) => Response | Promise<Response>;

interface Env extends FirebaseFunctionEnv {}

const isQuotaError = (error: unknown): boolean =>
  /quota|resource[_ -]?exhausted/i.test(error instanceof Error ? error.message : String(error));

async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const cors = getCors(request, env);
  if (!cors.allowed) return jsonResponse(403, { error: 'Origin not allowed' }, cors.headers);

  const projectId = getProjectId(env);
  const serviceAccount = getServiceAccount(env);
  if (!projectId || !serviceAccount) {
    return jsonResponse(500, { error: 'Child setup is not configured.' }, cors.headers);
  }

  let caller;
  try {
    caller = await verifyFirebaseIdToken(projectId, request.headers.get('Authorization') || '');
  } catch (error: any) {
    return jsonResponse(401, { error: error?.message || 'Unauthorized' }, cors.headers);
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { error: 'Invalid request.' }, cors.headers);
  }

  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const age = typeof body?.age === 'number' ? body.age : Number(body?.age);
  const pin = typeof body?.pin === 'string' ? body.pin.trim() : '';

  if (!name || name.length > 40) {
    return jsonResponse(400, { error: 'Child name must be between 1 and 40 characters.' }, cors.headers);
  }
  if (!Number.isInteger(age) || age < 5 || age > 18) {
    return jsonResponse(400, { error: 'Child age must be between 5 and 18.' }, cors.headers);
  }
  if (!/^[0-9]{4,6}$/.test(pin)) {
    return jsonResponse(400, { error: 'PIN must be 4 to 6 digits.' }, cors.headers);
  }

  try {
    const accessToken = await getGoogleAccessToken(serviceAccount);
    let existingChildren: Record<string, any>[] = [];
    try {
      const parent = await getDocument(projectId, accessToken, `users/${caller.uid}`);
      if (!parent || !hasRole(parent, caller, 'parent')) {
        return jsonResponse(403, { error: 'Only parent accounts can create child profiles.' }, cors.headers);
      }

      existingChildren = await runQuery(
        projectId,
        accessToken,
        'users',
        {
          fieldFilter: {
            field: { fieldPath: 'parentId' },
            op: 'EQUAL',
            value: firestoreValue(caller.uid),
          },
        }
      );
    } catch (readError) {
      // A signed parent/admin claim may recover child creation when the daily
      // Firestore read quota is exhausted. The write remains server-authenticated;
      // only duplicate name/PIN checks are deferred until reads recover.
      const hasVerifiedParentRole = caller.claims.parent === true || caller.claims.admin === true;
      if (!isQuotaError(readError) || !hasVerifiedParentRole) throw readError;
      console.warn('Creating child through verified-role quota fallback', { uid: caller.uid });
    }

    if (existingChildren.length >= 20) {
      return jsonResponse(409, { error: 'This parent account has reached the child profile limit.' }, cors.headers);
    }

    const duplicate = existingChildren.some((child) =>
      String(child.name || '').trim().toLowerCase() === name.toLowerCase() && Number(child.age) === age
    );
    if (duplicate) {
      return jsonResponse(409, { error: 'A child with this name and age already exists.' }, cors.headers);
    }

    for (const child of existingChildren) {
      if (!child.id || typeof child.childPinHash !== 'string') continue;
      const candidateHash = await sha256Hex(`pin:${child.id}:${pin}`);
      if (candidateHash === child.childPinHash) {
        return jsonResponse(409, { error: 'That PIN is already used by another child. Choose a different PIN.' }, cors.headers);
      }
    }

    const childId = `child_${crypto.randomUUID()}`;
    const now = new Date();
    const childPinHash = await sha256Hex(`pin:${childId}:${pin}`);
    const childProfile = {
      id: childId,
      name,
      role: 'student',
      roles: ['student'],
      age,
      avatarConfig: { color: '#4F46E5' },
      totalPoints: 0,
      unlockedItems: [],
      badges: [],
      streak: 0,
      lastLoginDate: now.toISOString(),
      mastery: {},
      timeSpentLearning: {},
      quizHistory: [],
      preferredDifficulty: 'Medium',
      parentId: caller.uid,
      childPinHash,
      childCode: crypto.randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase(),
      createdAt: now,
      updatedAt: now,
    };

    await commit(projectId, accessToken, [
      {
        update: {
          name: documentName(projectId, `users/${childId}`),
          fields: firestoreFields(childProfile),
        },
        currentDocument: { exists: false },
      },
      {
        update: {
          name: documentName(projectId, `users/${caller.uid}/children/${childId}`),
          fields: firestoreFields({
            childId,
            displayName: name,
            age,
            linkedAt: now,
            lastActiveAt: now,
            createdAt: now,
            updatedAt: now,
          }),
        },
        currentDocument: { exists: false },
      },
      {
        transform: {
          document: documentName(projectId, `users/${caller.uid}`),
          fieldTransforms: [
            { fieldPath: 'childrenIds', appendMissingElements: { values: [firestoreValue(childId)] } },
            { fieldPath: 'updatedAt', setToServerValue: 'REQUEST_TIME' },
          ],
        },
      },
    ]);

    return jsonResponse(201, { child: { id: childId, name, age } }, cors.headers);
  } catch (error: any) {
    if (isQuotaError(error)) {
      return jsonResponse(503, {
        error: 'Firebase daily quota is temporarily exhausted. Please try again after the quota resets.',
      }, cors.headers);
    }
    return jsonResponse(500, { error: error?.message || 'Failed to create child profile.' }, cors.headers);
  }
};

export const onRequestOptions: PagesFunction<Env> = async ({ request, env }) => {
  const cors = getCors(request, env);
  return new Response(null, { status: cors.allowed ? 204 : 403, headers: cors.headers });
};
