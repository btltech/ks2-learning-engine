"use strict";
/**
 * Firebase Cloud Functions - Parent Weekly Email Reports
 *
 * Sends weekly learning summaries to parents every Sunday at 6 pm (London time).
 * Emails are delivered via Resend (https://resend.com) instead of nodemailer/Gmail.
 *
 * Setup (one-time):
 *   1. Sign up at https://resend.com and verify demiwuraks2.co.uk domain
 *   2. Create an API key in the Resend dashboard
 *   3. Store it in Firebase Functions config:
 *        firebase functions:config:set resend.api_key="re_xxxxxxxxxxxx"
 *        firebase functions:config:set resend.contact_email="support@demiwuraks2.co.uk"
 *   4. Deploy:
 *        cd firebase-functions && npm install && npm run build
 *        firebase deploy --only functions
 *   5. Test (replace uid with a real parent UID):
 *        firebase functions:call sendTestWeeklyReport --data '{"parentId":"<uid>"}'
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTestWeeklyReport = exports.sendWeeklyReports = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
// ─── Email via Resend ─────────────────────────────────────────────────────────
async function sendEmailViaResend(apiKey, to, subject, html) {
    const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: 'KS2 Learning Engine <noreply@demiwuraks2.co.uk>',
            to: [to],
            subject,
            html,
        }),
    });
    if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        const message = err?.message || err?.name || `HTTP ${resp.status}`;
        throw new Error(`Resend: ${message}`);
    }
}
// ─── Stats calculation ────────────────────────────────────────────────────────
async function generateWeeklyStats(childId) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const sessionsSnapshot = await db
        .collection('quizSessions')
        .where('userId', '==', childId)
        .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(oneWeekAgo))
        .get();
    if (sessionsSnapshot.empty) {
        const userDoc = await db.collection('users').doc(childId).get();
        const userData = userDoc.data() ?? {};
        return {
            quizzesCompleted: 0,
            totalQuestions: 0,
            correctAnswers: 0,
            averageScore: 0,
            strongestSubject: 'N/A',
            weakestSubject: 'N/A',
            timeSpent: 0,
            streak: userData.streak ?? 0,
            badges: userData.badges ?? [],
        };
    }
    let totalQuestions = 0;
    let correctAnswers = 0;
    let totalTime = 0;
    const subjectScores = {};
    sessionsSnapshot.forEach((doc) => {
        const session = doc.data();
        totalQuestions += session.totalQuestions ?? 0;
        correctAnswers += session.correctAnswers ?? 0;
        totalTime += session.timeSpent ?? 0;
        const subject = session.subject ?? 'Unknown';
        if (!subjectScores[subject])
            subjectScores[subject] = [];
        subjectScores[subject].push(session.score ?? 0);
    });
    let strongestSubject = 'N/A';
    let weakestSubject = 'N/A';
    let highestAvg = -Infinity;
    let lowestAvg = Infinity;
    for (const [subject, scores] of Object.entries(subjectScores)) {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        if (avg > highestAvg) {
            highestAvg = avg;
            strongestSubject = subject;
        }
        if (avg < lowestAvg) {
            lowestAvg = avg;
            weakestSubject = subject;
        }
    }
    const userDoc = await db.collection('users').doc(childId).get();
    const userData = userDoc.data() ?? {};
    return {
        quizzesCompleted: sessionsSnapshot.size,
        totalQuestions,
        correctAnswers,
        averageScore: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0,
        strongestSubject,
        weakestSubject,
        timeSpent: Math.round(totalTime / 60),
        streak: userData.streak ?? 0,
        badges: userData.badges ?? [],
    };
}
// ─── HTML template ────────────────────────────────────────────────────────────
function buildEmailHtml(parentName, childReports) {
    const childrenHTML = childReports
        .map(({ name, stats }) => `
      <div style="background:#f9fafb;border-radius:12px;padding:24px;margin-bottom:24px;">
        <h2 style="color:#1f2937;margin:0 0 16px;">${name}'s Week</h2>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
          <div style="background:#fff;padding:16px;border-radius:8px;text-align:center;">
            <div style="font-size:32px;font-weight:700;color:#3b82f6;">${stats.quizzesCompleted}</div>
            <div style="color:#6b7280;font-size:13px;">Quizzes Completed</div>
          </div>
          <div style="background:#fff;padding:16px;border-radius:8px;text-align:center;">
            <div style="font-size:32px;font-weight:700;color:#10b981;">${stats.averageScore}%</div>
            <div style="color:#6b7280;font-size:13px;">Average Score</div>
          </div>
          <div style="background:#fff;padding:16px;border-radius:8px;text-align:center;">
            <div style="font-size:32px;font-weight:700;color:#f59e0b;">${stats.timeSpent}</div>
            <div style="color:#6b7280;font-size:13px;">Minutes Learning</div>
          </div>
          <div style="background:#fff;padding:16px;border-radius:8px;text-align:center;">
            <div style="font-size:32px;font-weight:700;color:#ef4444;">${stats.streak}</div>
            <div style="color:#6b7280;font-size:13px;">Day Streak 🔥</div>
          </div>
        </div>
        <div style="margin-top:12px;font-size:14px;">
          <p style="margin:6px 0;"><strong>🌟 Strongest Subject:</strong> ${stats.strongestSubject}</p>
          <p style="margin:6px 0;"><strong>💪 Needs Practice:</strong> ${stats.weakestSubject}</p>
          ${stats.badges.length > 0 ? `<p style="margin:6px 0;"><strong>🏆 Badges Earned:</strong> ${stats.badges.join(', ')}</p>` : ''}
        </div>
        ${stats.quizzesCompleted === 0
        ? '<p style="color:#ef4444;margin-top:12px;font-size:14px;">⚠️ No activity this week — encourage your child to practice!</p>'
        : stats.averageScore < 50
            ? '<p style="color:#f59e0b;margin-top:12px;font-size:14px;">💡 Your child may benefit from extra support or reviewing lesson materials.</p>'
            : '<p style="color:#10b981;margin-top:12px;font-size:14px;">✨ Great progress this week — keep it up!</p>'}
      </div>`)
        .join('');
    return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:0;background:#f3f4f6;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <div style="background:linear-gradient(135deg,#667eea,#764ba2);border-radius:16px;padding:32px;text-align:center;margin-bottom:24px;">
      <h1 style="color:#fff;margin:0;font-size:26px;">📚 Weekly Learning Report</h1>
      <p style="color:rgba(255,255,255,.85);margin:8px 0 0;">Your child's progress this week</p>
    </div>
    <div style="background:#fff;border-radius:12px;padding:24px;margin-bottom:24px;">
      <p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 8px;">Hi ${parentName},</p>
      <p style="color:#6b7280;font-size:16px;line-height:1.6;margin:0;">Here's a summary of your child's learning activity from the past week:</p>
    </div>
    ${childrenHTML}
    <div style="text-align:center;padding:24px;color:#6b7280;font-size:14px;">
      <p>Keep track of progress at <a href="https://demiwuraks2.co.uk" style="color:#3b82f6;">demiwuraks2.co.uk</a></p>
      <p style="margin-top:12px;font-size:12px;">
        You're receiving this because you're a registered parent on KS2 Learning Engine.<br>
        To unsubscribe, update your settings in the app or email <a href="mailto:support@demiwuraks2.co.uk" style="color:#3b82f6;">support@demiwuraks2.co.uk</a>.
      </p>
    </div>
  </div>
</body>
</html>`;
}
// ─── Scheduled function ───────────────────────────────────────────────────────
exports.sendWeeklyReports = functions.pubsub
    .schedule('0 18 * * 0') // Every Sunday at 6 pm
    .timeZone('Europe/London')
    .onRun(async () => {
    const resendApiKey = process.env.RESEND_API_KEY ?? '';
    if (!resendApiKey) {
        console.error('❌ RESEND_API_KEY env var not set — add it to firebase-functions/.env');
        return null;
    }
    console.log('Starting weekly report generation...');
    // Query parents by role field (not a boolean isParent flag)
    const parentsSnapshot = await db
        .collection('users')
        .where('role', '==', 'parent')
        .get();
    let sent = 0;
    let failed = 0;
    for (const parentDoc of parentsSnapshot.docs) {
        const parent = parentDoc.data();
        const parentId = parentDoc.id;
        const parentEmail = parent.email ?? '';
        const parentName = parent.name ?? parent.displayName ?? 'Parent';
        if (!parentEmail) {
            console.warn(`Parent ${parentId} has no email — skipping`);
            continue;
        }
        const childrenSnapshot = await db
            .collection('users')
            .where('parentId', '==', parentId)
            .get();
        if (childrenSnapshot.empty)
            continue;
        const childReports = [];
        for (const childDoc of childrenSnapshot.docs) {
            const child = childDoc.data();
            const stats = await generateWeeklyStats(childDoc.id);
            childReports.push({ name: child.name ?? child.displayName ?? 'Child', stats });
        }
        try {
            const html = buildEmailHtml(parentName, childReports);
            await sendEmailViaResend(resendApiKey, parentEmail, "📚 Weekly Learning Report — Your Child's Progress", html);
            console.log(`✅ Sent to ${parentEmail}`);
            sent++;
        }
        catch (err) {
            console.error(`❌ Failed for ${parentEmail}:`, err);
            failed++;
        }
    }
    console.log(`Weekly reports done — sent: ${sent}, failed: ${failed}`);
    return null;
});
// ─── Manual test trigger ──────────────────────────────────────────────────────
exports.sendTestWeeklyReport = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }
    const resendApiKey = process.env.RESEND_API_KEY ?? '';
    if (!resendApiKey) {
        throw new functions.https.HttpsError('failed-precondition', 'RESEND_API_KEY environment variable not set — add it to firebase-functions/.env');
    }
    const parentId = typeof data.parentId === 'string' ? data.parentId : context.auth.uid;
    const parentDoc = await db.collection('users').doc(parentId).get();
    if (!parentDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Parent not found');
    }
    const parent = parentDoc.data();
    if (parent.role !== 'parent') {
        throw new functions.https.HttpsError('permission-denied', 'User is not a parent');
    }
    const parentEmail = parent.email ?? '';
    if (!parentEmail) {
        throw new functions.https.HttpsError('failed-precondition', 'Parent has no email address');
    }
    const childrenSnapshot = await db
        .collection('users')
        .where('parentId', '==', parentId)
        .get();
    if (childrenSnapshot.empty) {
        throw new functions.https.HttpsError('not-found', 'No linked children found');
    }
    const childReports = [];
    for (const childDoc of childrenSnapshot.docs) {
        const child = childDoc.data();
        const stats = await generateWeeklyStats(childDoc.id);
        childReports.push({ name: child.name ?? child.displayName ?? 'Child', stats });
    }
    const parentName = parent.name ?? parent.displayName ?? 'Parent';
    const html = buildEmailHtml(parentName, childReports);
    await sendEmailViaResend(resendApiKey, parentEmail, "📚 Weekly Learning Report (Test)", html);
    return { success: true, sentTo: parentEmail };
});
//# sourceMappingURL=weeklyReports.js.map