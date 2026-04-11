/**
 * Firebase Cloud Function for Parent Weekly Email Reports
 * Deploy this to Firebase Functions
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Configure email transport (using Gmail as example)
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: functions.config().email.user,
    pass: functions.config().email.password,
  },
});

interface WeeklyStats {
  quizzesCompleted: number;
  totalQuestions: number;
  correctAnswers: number;
  averageScore: number;
  strongestSubject: string;
  weakestSubject: string;
  timeSpent: number; // in minutes
  streak: number;
  badges: string[];
}

/**
 * Scheduled function to send weekly reports every Sunday at 6pm
 */
export const sendWeeklyReports = functions.pubsub
  .schedule('0 18 * * 0') // Every Sunday at 6pm
  .timeZone('Europe/London')
  .onRun(async (context) => {
    console.log('Starting weekly report generation...');

    try {
      // Get all parent users
      const parentsSnapshot = await db
        .collection('users')
        .where('isParent', '==', true)
        .get();

      const emailPromises: Promise<void>[] = [];

      for (const parentDoc of parentsSnapshot.docs) {
        const parent = parentDoc.data();
        const parentId = parentDoc.id;

        // Get linked children
        const childrenSnapshot = await db
          .collection('users')
          .where('parentId', '==', parentId)
          .get();

        if (childrenSnapshot.empty) continue;

        // Generate report for each child
        const childReports: { name: string; stats: WeeklyStats }[] = [];

        for (const childDoc of childrenSnapshot.docs) {
          const child = childDoc.data();
          const stats = await generateWeeklyStats(childDoc.id);
          childReports.push({ name: child.displayName || 'Child', stats });
        }

        // Send email to parent
        const emailPromise = sendParentEmail(parent.email, parent.displayName, childReports);
        emailPromises.push(emailPromise);
      }

      await Promise.all(emailPromises);
      console.log(`✅ Sent ${emailPromises.length} weekly reports`);
      return null;
    } catch (error) {
      console.error('Error sending weekly reports:', error);
      throw error;
    }
  });

/**
 * Generate weekly stats for a child
 */
async function generateWeeklyStats(childId: string): Promise<WeeklyStats> {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  // Get quiz sessions from the last week
  const sessionsSnapshot = await db
    .collection('quizSessions')
    .where('userId', '==', childId)
    .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(oneWeekAgo))
    .get();

  if (sessionsSnapshot.empty) {
    return {
      quizzesCompleted: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      averageScore: 0,
      strongestSubject: 'N/A',
      weakestSubject: 'N/A',
      timeSpent: 0,
      streak: 0,
      badges: [],
    };
  }

  // Calculate stats
  let totalQuestions = 0;
  let correctAnswers = 0;
  let totalTime = 0;
  const subjectScores: { [key: string]: number[] } = {};

  sessionsSnapshot.forEach((doc) => {
    const session = doc.data();
    totalQuestions += session.totalQuestions || 0;
    correctAnswers += session.correctAnswers || 0;
    totalTime += session.timeSpent || 0;

    const subject = session.subject || 'Unknown';
    if (!subjectScores[subject]) {
      subjectScores[subject] = [];
    }
    subjectScores[subject].push(session.score || 0);
  });

  // Find strongest and weakest subjects
  let strongestSubject = 'N/A';
  let weakestSubject = 'N/A';
  let highestAvg = 0;
  let lowestAvg = 100;

  Object.entries(subjectScores).forEach(([subject, scores]) => {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    if (avg > highestAvg) {
      highestAvg = avg;
      strongestSubject = subject;
    }
    if (avg < lowestAvg) {
      lowestAvg = avg;
      weakestSubject = subject;
    }
  });

  // Get user data for streak and badges
  const userDoc = await db.collection('users').doc(childId).get();
  const userData = userDoc.data();

  return {
    quizzesCompleted: sessionsSnapshot.size,
    totalQuestions,
    correctAnswers,
    averageScore: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0,
    strongestSubject,
    weakestSubject,
    timeSpent: Math.round(totalTime / 60), // Convert to minutes
    streak: userData?.streak || 0,
    badges: userData?.badges || [],
  };
}

/**
 * Send email to parent with weekly report
 */
async function sendParentEmail(
  email: string,
  parentName: string,
  childReports: { name: string; stats: WeeklyStats }[]
): Promise<void> {
  const htmlContent = generateEmailHTML(parentName, childReports);

  const mailOptions = {
    from: '"KS2 Learning Engine" <noreply@demiwuraks2.co.uk>',
    to: email,
    subject: '📚 Weekly Learning Report - Your Child\'s Progress',
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${email}:`, error);
    throw error;
  }
}

/**
 * Generate HTML email content
 */
function generateEmailHTML(
  parentName: string,
  childReports: { name: string; stats: WeeklyStats }[]
): string {
  const childrenHTML = childReports
    .map(
      ({ name, stats }) => `
    <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <h2 style="color: #1f2937; margin-bottom: 16px;">${name}'s Week</h2>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
        <div style="background: white; padding: 16px; border-radius: 8px;">
          <div style="font-size: 32px; font-weight: bold; color: #3b82f6;">${stats.quizzesCompleted}</div>
          <div style="color: #6b7280;">Quizzes Completed</div>
        </div>
        
        <div style="background: white; padding: 16px; border-radius: 8px;">
          <div style="font-size: 32px; font-weight: bold; color: #10b981;">${stats.averageScore}%</div>
          <div style="color: #6b7280;">Average Score</div>
        </div>
        
        <div style="background: white; padding: 16px; border-radius: 8px;">
          <div style="font-size: 32px; font-weight: bold; color: #f59e0b;">${stats.timeSpent}</div>
          <div style="color: #6b7280;">Minutes Learning</div>
        </div>
        
        <div style="background: white; padding: 16px; border-radius: 8px;">
          <div style="font-size: 32px; font-weight: bold; color: #ef4444;">${stats.streak}</div>
          <div style="color: #6b7280;">Day Streak</div>
        </div>
      </div>
      
      <div style="margin-top: 16px;">
        <p style="margin: 8px 0;"><strong>🌟 Strongest Subject:</strong> ${stats.strongestSubject}</p>
        <p style="margin: 8px 0;"><strong>💪 Needs Practice:</strong> ${stats.weakestSubject}</p>
        ${
          stats.badges.length > 0
            ? `<p style="margin: 8px 0;"><strong>🏆 Badges Earned:</strong> ${stats.badges.join(', ')}</p>`
            : ''
        }
      </div>
      
      ${
        stats.quizzesCompleted === 0
          ? '<p style="color: #ef4444; margin-top: 16px;">⚠️ No activity this week. Encourage your child to practice!</p>'
          : stats.averageScore < 50
          ? '<p style="color: #f59e0b; margin-top: 16px;">💡 Your child may benefit from extra support or reviewing lesson materials.</p>'
          : '<p style="color: #10b981; margin-top: 16px;">✨ Great progress! Keep up the excellent work!</p>'
      }
    </div>
  `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; padding: 24px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 24px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">📚 Weekly Learning Report</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Your child's progress this week</p>
        </div>
        
        <!-- Greeting -->
        <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <p style="color: #1f2937; font-size: 16px; line-height: 1.6;">
            Hi ${parentName},
          </p>
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
            Here's a summary of your child's learning activity from the past week:
          </p>
        </div>
        
        <!-- Children Reports -->
        ${childrenHTML}
        
        <!-- Footer -->
        <div style="text-align: center; padding: 24px; color: #6b7280; font-size: 14px;">
          <p>Keep track of your child's progress at <a href="https://demiwuraks2.co.uk" style="color: #3b82f6;">demiwuraks2.co.uk</a></p>
          <p style="margin-top: 16px; font-size: 12px;">
            You're receiving this email because you're a registered parent on KS2 Learning Engine.<br>
            To unsubscribe, please update your settings in the app.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Manual trigger for testing
 * Call this function with a parent's user ID to test
 */
export const sendTestWeeklyReport = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const parentId = data.parentId || context.auth.uid;

  // Get parent data
  const parentDoc = await db.collection('users').doc(parentId).get();
  if (!parentDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Parent not found');
  }

  const parent = parentDoc.data();
  if (!parent?.isParent) {
    throw new functions.https.HttpsError('permission-denied', 'User is not a parent');
  }

  // Get linked children
  const childrenSnapshot = await db
    .collection('users')
    .where('parentId', '==', parentId)
    .get();

  if (childrenSnapshot.empty) {
    throw new functions.https.HttpsError('not-found', 'No linked children found');
  }

  // Generate reports
  const childReports: { name: string; stats: WeeklyStats }[] = [];
  for (const childDoc of childrenSnapshot.docs) {
    const child = childDoc.data();
    const stats = await generateWeeklyStats(childDoc.id);
    childReports.push({ name: child.displayName || 'Child', stats });
  }

  // Send email
  await sendParentEmail(parent.email, parent.displayName, childReports);

  return { success: true, message: 'Test email sent successfully' };
});
