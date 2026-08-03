import {
  FirebaseFunctionEnv,
  VerifiedCaller,
  commit,
  documentName,
  firestoreFields,
  getCors,
  getDocument,
  getGoogleAccessToken,
  getProjectId,
  getServiceAccount,
  hasRole,
  isQuotaError,
  jsonResponse,
  verifyFirebaseIdToken,
} from '../../functions-shared/firebase-admin';
import {
  GameConfig,
  GameId,
  PrivateGameQuestion,
  answerIsCorrect,
  calculateGameResult,
  createGameQuestions,
  publicQuestion,
} from '../../functions-shared/game-content';
import {
  StoredGameProfile,
  defaultGameProfile,
  publicGameStatus,
  syncQuizCredits,
} from '../../functions-shared/game-progress';

type PagesFunction<E = unknown> = (context: { request: Request; env: E; params: Record<string, string> }) => Response | Promise<Response>;
type Env = FirebaseFunctionEnv;

const GAME_PROFILE_COLLECTION = 'gameProfiles';
const GAME_SESSION_COLLECTION = 'gameSessions';
const SESSION_LENGTH_MS = 45 * 60 * 1000;
const GAME_IDS: GameId[] = ['maths_mission', 'times_table_sprint', 'spelling_workshop', 'science_lab', 'history_detective'];

interface StoredGameSession {
  sessionId: string;
  userId: string;
  gameId: GameId;
  config: GameConfig;
  status: 'active' | 'complete' | 'abandoned' | 'expired';
  questions: PrivateGameQuestion[];
  currentIndex: number;
  answers: Array<{
    questionId: string;
    answer: string;
    correct: boolean;
    answeredAt: string;
  }>;
  startedAt: string;
  expiresAt: string;
  completedAt?: string;
  result?: ReturnType<typeof calculateGameResult>;
  updateTime?: string;
}

function cleanText(value: unknown, max: number) {
  return typeof value === 'string' || typeof value === 'number'
    // eslint-disable-next-line no-control-regex
    ? String(value).replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, max)
    : '';
}

function storedProfile(value: Record<string, any> | null, userId: string): StoredGameProfile {
  const base = defaultGameProfile(userId);
  if (!value) return base;
  return {
    userId,
    gamesRemaining: Math.max(0, Number(value.gamesRemaining) || 0),
    passesCount: Math.max(0, Number(value.passesCount) || 0),
    processedQuizIds: Array.isArray(value.processedQuizIds) ? value.processedQuizIds.filter((id: unknown) => typeof id === 'string').slice(-200) : [],
    highScores: value.highScores && typeof value.highScores === 'object' ? value.highScores : {},
    gamesPlayed: Math.max(0, Number(value.gamesPlayed) || 0),
    activeSessionId: typeof value.activeSessionId === 'string' ? value.activeSessionId : undefined,
    lastQuiz: value.lastQuiz && typeof value.lastQuiz === 'object' ? value.lastQuiz : undefined,
    createdAt: typeof value.createdAt === 'string' ? value.createdAt : base.createdAt,
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : base.updatedAt,
  };
}

function storedSession(value: Record<string, any> | null): StoredGameSession | null {
  if (!value || !GAME_IDS.includes(value.gameId) || !Array.isArray(value.questions)) return null;
  return {
    sessionId: value.sessionId || value.id,
    userId: value.userId,
    gameId: value.gameId,
    config: value.config || {},
    status: value.status,
    questions: value.questions,
    currentIndex: Math.max(0, Number(value.currentIndex) || 0),
    answers: Array.isArray(value.answers) ? value.answers : [],
    startedAt: value.startedAt,
    expiresAt: value.expiresAt,
    completedAt: value.completedAt,
    result: value.result,
    updateTime: typeof value.__updateTime === 'string' ? value.__updateTime : undefined,
  };
}

function sessionFields(session: StoredGameSession) {
  const { updateTime: _updateTime, ...stored } = session;
  return firestoreFields(stored as unknown as Record<string, unknown>);
}

function profileFields(profile: StoredGameProfile) {
  return firestoreFields(profile as unknown as Record<string, unknown>);
}

function safeSession(session: StoredGameSession) {
  return {
    sessionId: session.sessionId,
    gameId: session.gameId,
    config: session.config,
    status: session.status,
    currentIndex: session.currentIndex,
    totalQuestions: session.questions.length,
    correctAnswers: session.answers.filter((answer) => answer.correct).length,
    question: session.status === 'active' && session.questions[session.currentIndex]
      ? publicQuestion(session.questions[session.currentIndex])
      : null,
    startedAt: session.startedAt,
    expiresAt: session.expiresAt,
    result: session.result,
  };
}

async function authenticatedContext(request: Request, env: Env) {
  const projectId = getProjectId(env);
  const serviceAccount = getServiceAccount(env);
  if (!projectId || !serviceAccount?.client_email || !serviceAccount.private_key) {
    throw new Error('Game service is not configured');
  }
  const caller = await verifyFirebaseIdToken(projectId, request.headers.get('Authorization') || '');
  const accessToken = await getGoogleAccessToken(serviceAccount);
  const userProfile = await getDocument(projectId, accessToken, `users/${caller.uid}`);
  if (!userProfile) throw new Error('User profile not found');
  if (!hasRole(userProfile, caller, 'student')) throw new Error('Games are available to learner accounts');
  return { projectId, accessToken, caller, userProfile };
}

async function loadSyncedProfile(
  projectId: string,
  accessToken: string,
  caller: VerifiedCaller,
  userProfile: Record<string, any>
) {
  const raw = await getDocument(projectId, accessToken, `${GAME_PROFILE_COLLECTION}/${caller.uid}`);
  return {
    ...syncQuizCredits(storedProfile(raw, caller.uid), userProfile.quizHistory),
    updateTime: typeof raw?.__updateTime === 'string' ? raw.__updateTime : undefined,
  };
}

async function saveProfile(projectId: string, accessToken: string, profile: StoredGameProfile, updateTime?: string) {
  await commit(projectId, accessToken, [{
    update: {
      name: documentName(projectId, `${GAME_PROFILE_COLLECTION}/${profile.userId}`),
      fields: profileFields(profile),
    },
    currentDocument: updateTime ? { updateTime } : { exists: false },
  }]);
}

async function activeSessionFor(projectId: string, accessToken: string, profile: StoredGameProfile) {
  if (!profile.activeSessionId) return null;
  return storedSession(await getDocument(projectId, accessToken, `${GAME_SESSION_COLLECTION}/${profile.activeSessionId}`));
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const cors = getCors(request, env);
  if (!cors.allowed) return jsonResponse(403, { error: 'Origin not allowed' }, cors.headers);
  try {
    const { projectId, accessToken, caller, userProfile } = await authenticatedContext(request, env);
    const synced = await loadSyncedProfile(projectId, accessToken, caller, userProfile);
    let profile = synced.profile;
    let activeSession = await activeSessionFor(projectId, accessToken, profile);
    let changed = synced.changed;

    if (activeSession && (activeSession.status !== 'active' || Date.parse(activeSession.expiresAt) <= Date.now())) {
      if (activeSession.status === 'active') {
        activeSession.status = 'expired';
        await commit(projectId, accessToken, [{
          update: {
            name: documentName(projectId, `${GAME_SESSION_COLLECTION}/${activeSession.sessionId}`),
            fields: sessionFields(activeSession),
          },
          currentDocument: activeSession.updateTime ? { updateTime: activeSession.updateTime } : { exists: true },
        }]);
      }
      profile = { ...profile, activeSessionId: undefined, updatedAt: new Date().toISOString() };
      activeSession = null;
      changed = true;
    }
    if (changed) await saveProfile(projectId, accessToken, profile, synced.updateTime);

    return jsonResponse(200, {
      status: publicGameStatus(profile),
      activeSession: activeSession ? safeSession(activeSession) : null,
    }, cors.headers);
  } catch (error: any) {
    if (isQuotaError(error)) return jsonResponse(503, { error: 'Game data is temporarily unavailable because Firebase daily quota is exhausted. Please try again after the quota resets.' }, cors.headers);
    const unauthorized = /Bearer|token|profile/i.test(error?.message || '');
    const forbidden = /learner accounts/i.test(error?.message || '');
    return jsonResponse(unauthorized ? 401 : forbidden ? 403 : 500, { error: error?.message || 'Unable to load games' }, cors.headers);
  }
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const cors = getCors(request, env);
  if (!cors.allowed) return jsonResponse(403, { error: 'Origin not allowed' }, cors.headers);
  try {
    const { projectId, accessToken, caller, userProfile } = await authenticatedContext(request, env);
    const body = (await request.json()) as Record<string, any>;
    const action = cleanText(body.action, 30);
    const synced = await loadSyncedProfile(projectId, accessToken, caller, userProfile);
    let profile = synced.profile;

    if (action === 'start') {
      const gameId = cleanText(body.gameId, 40) as GameId;
      if (!GAME_IDS.includes(gameId)) return jsonResponse(400, { error: 'Choose a valid game' }, cors.headers);

      const existingActive = await activeSessionFor(projectId, accessToken, profile);
      if (existingActive?.status === 'active' && Date.parse(existingActive.expiresAt) > Date.now()) {
        return jsonResponse(409, {
          error: 'Finish or leave your current game first',
          activeSession: safeSession(existingActive),
          status: publicGameStatus(profile),
        }, cors.headers);
      }
      if (profile.gamesRemaining <= 0) {
        if (synced.changed) await saveProfile(projectId, accessToken, profile, synced.updateTime);
        return jsonResponse(403, { error: 'Pass three quizzes with 70% or more to earn game plays', status: publicGameStatus(profile) }, cors.headers);
      }

      const config: GameConfig = {
        yearGroup: body?.config?.yearGroup === '5-6' ? '5-6' : '3-4',
        table: body?.config?.table === 'mixed'
          ? 'mixed'
          : Math.max(2, Math.min(12, Number(body?.config?.table) || 2)),
      };
      const questions = createGameQuestions(gameId, config);
      const now = new Date();
      const sessionId = crypto.randomUUID().replace(/-/g, '');
      const session: StoredGameSession = {
        sessionId,
        userId: caller.uid,
        gameId,
        config,
        status: 'active',
        questions,
        currentIndex: 0,
        answers: [],
        startedAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + SESSION_LENGTH_MS).toISOString(),
      };
      profile = {
        ...profile,
        gamesRemaining: profile.gamesRemaining - 1,
        activeSessionId: sessionId,
        updatedAt: now.toISOString(),
      };
      await commit(projectId, accessToken, [
        {
          update: {
            name: documentName(projectId, `${GAME_SESSION_COLLECTION}/${sessionId}`),
            fields: sessionFields(session),
          },
          currentDocument: { exists: false },
        },
        {
          update: {
            name: documentName(projectId, `${GAME_PROFILE_COLLECTION}/${caller.uid}`),
            fields: profileFields(profile),
          },
          currentDocument: synced.updateTime ? { updateTime: synced.updateTime } : { exists: false },
        },
      ]);
      return jsonResponse(201, { session: safeSession(session), status: publicGameStatus(profile) }, cors.headers);
    }

    if (action === 'answer') {
      const sessionId = cleanText(body.sessionId, 80);
      const questionId = cleanText(body.questionId, 80);
      const answer = cleanText(body.answer, 200);
      const session = storedSession(await getDocument(projectId, accessToken, `${GAME_SESSION_COLLECTION}/${sessionId}`));
      if (!session) return jsonResponse(404, { error: 'Game session not found' }, cors.headers);
      if (session.userId !== caller.uid) return jsonResponse(403, { error: 'This game belongs to another learner' }, cors.headers);
      if (session.status !== 'active') return jsonResponse(409, { error: 'This game has already ended', session: safeSession(session) }, cors.headers);
      if (Date.parse(session.expiresAt) <= Date.now()) return jsonResponse(410, { error: 'This game session has expired' }, cors.headers);

      const question = session.questions[session.currentIndex];
      if (!question || question.id !== questionId) {
        return jsonResponse(409, { error: 'Answer the current question before continuing', session: safeSession(session) }, cors.headers);
      }
      if (!answer) return jsonResponse(400, { error: 'Choose or enter an answer' }, cors.headers);

      const correct = answerIsCorrect(session.gameId, question, answer);
      const answeredAt = new Date().toISOString();
      session.answers.push({ questionId, answer, correct, answeredAt });
      session.currentIndex += 1;
      const completed = session.currentIndex >= session.questions.length;
      let result: ReturnType<typeof calculateGameResult> | undefined;

      if (completed) {
        const durationSeconds = (Date.parse(answeredAt) - Date.parse(session.startedAt)) / 1000;
        result = calculateGameResult(
          session.gameId,
          session.answers.filter((entry) => entry.correct).length,
          session.questions.length,
          durationSeconds
        );
        session.status = 'complete';
        session.completedAt = answeredAt;
        session.result = result;
        profile = {
          ...profile,
          activeSessionId: undefined,
          gamesPlayed: profile.gamesPlayed + 1,
          highScores: {
            ...profile.highScores,
            [session.gameId]: Math.max(Number(profile.highScores[session.gameId]) || 0, result.score),
          },
          updatedAt: answeredAt,
        };
      }

      const writes: Record<string, unknown>[] = [
        {
          update: {
            name: documentName(projectId, `${GAME_SESSION_COLLECTION}/${session.sessionId}`),
            fields: sessionFields(session),
          },
          currentDocument: session.updateTime ? { updateTime: session.updateTime } : { exists: true },
        },
      ];
      if (completed && result) {
        writes.push(
          {
            update: {
              name: documentName(projectId, `${GAME_PROFILE_COLLECTION}/${caller.uid}`),
              fields: profileFields(profile),
            },
            currentDocument: synced.updateTime ? { updateTime: synced.updateTime } : { exists: true },
          },
          {
            transform: {
              document: documentName(projectId, `users/${caller.uid}`),
              fieldTransforms: [
                { fieldPath: 'totalPoints', increment: { integerValue: String(result.xpEarned) } },
                { fieldPath: 'updatedAt', setToServerValue: 'REQUEST_TIME' },
              ],
            },
          }
        );
      } else if (synced.changed) {
        writes.push({
          update: {
            name: documentName(projectId, `${GAME_PROFILE_COLLECTION}/${caller.uid}`),
            fields: profileFields(profile),
          },
          currentDocument: synced.updateTime ? { updateTime: synced.updateTime } : { exists: true },
        });
      }
      await commit(projectId, accessToken, writes);

      return jsonResponse(200, {
        correct,
        correctAnswer: question.answer,
        explanation: question.explanation,
        completed,
        session: safeSession(session),
        result,
        status: publicGameStatus(profile),
      }, cors.headers);
    }

    if (action === 'abandon') {
      const sessionId = cleanText(body.sessionId, 80);
      const session = storedSession(await getDocument(projectId, accessToken, `${GAME_SESSION_COLLECTION}/${sessionId}`));
      if (!session) return jsonResponse(404, { error: 'Game session not found' }, cors.headers);
      if (session.userId !== caller.uid) return jsonResponse(403, { error: 'This game belongs to another learner' }, cors.headers);
      if (session.status === 'active') session.status = 'abandoned';
      profile = { ...profile, activeSessionId: undefined, updatedAt: new Date().toISOString() };
      await commit(projectId, accessToken, [
        {
          update: {
            name: documentName(projectId, `${GAME_SESSION_COLLECTION}/${session.sessionId}`),
            fields: sessionFields(session),
          },
          currentDocument: session.updateTime ? { updateTime: session.updateTime } : { exists: true },
        },
        {
          update: {
            name: documentName(projectId, `${GAME_PROFILE_COLLECTION}/${caller.uid}`),
            fields: profileFields(profile),
          },
          currentDocument: synced.updateTime ? { updateTime: synced.updateTime } : { exists: true },
        },
      ]);
      return jsonResponse(200, { status: publicGameStatus(profile) }, cors.headers);
    }

    return jsonResponse(400, { error: 'Unsupported game action' }, cors.headers);
  } catch (error: any) {
    const message = error?.message || 'Unable to update game';
    if (isQuotaError(error)) return jsonResponse(503, { error: 'Game data is temporarily unavailable because Firebase daily quota is exhausted. Please try again after the quota resets.' }, cors.headers);
    const unauthorized = /Bearer|token|profile/i.test(message);
    const forbidden = /learner accounts/i.test(message);
    return jsonResponse(unauthorized ? 401 : forbidden ? 403 : 500, { error: message }, cors.headers);
  }
};

export const onRequestOptions: PagesFunction<Env> = async ({ request, env }) => {
  const cors = getCors(request, env);
  return new Response(null, { status: cors.allowed ? 204 : 403, headers: cors.headers });
};
