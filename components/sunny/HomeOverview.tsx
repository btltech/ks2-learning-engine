import { useEffect, type ReactNode } from 'react';
import { StarIcon, SpeakerWaveIcon } from '@heroicons/react/24/solid';
import type { ProgressData, Subject, UserProfile } from '../../types';
import { KidCard } from './KidCard';
import { KidButton } from './KidButton';
import { Chip } from './Chip';
import { Owl } from './Owl';
import { SpeechBubble } from './SpeechBubble';
import { HomeSubjectIcon } from './HomeSubjectIcon';
import { useLocation } from 'react-router-dom';
import { Sparkle } from './Sparkle';
import { useTTSEnhanced } from '../../hooks/useTTSEnhanced';

interface HomeOverviewProps {
  learner: UserProfile | null;
  greeting: string;
  subjects: Subject[];
  progress: ProgressData;
  onSelectSubject: (subject: Subject) => void;
  onOpenAchievements: () => void;
  children: ReactNode;
  dailyChallenge: ReactNode;
}

/** Presentation only: use recorded quiz history; never invent unfinished lesson parts. */
export function HomeOverview({
  learner,
  greeting,
  subjects,
  progress,
  onSelectSubject,
  onOpenAchievements,
  children,
  dailyChallenge,
}: HomeOverviewProps) {
  const { hash } = useLocation();
  useEffect(() => {
    if (hash !== '#subjects') return;
    const frame = requestAnimationFrame(() =>
      document.getElementById('subjects')?.scrollIntoView(),
    );
    return () => cancelAnimationFrame(frame);
  }, [hash]);
  const { speak, cancel, isSpeaking, isLoading, errorMessage } =
    useTTSEnhanced('English');
  const history = [...(learner?.quizHistory || [])]
    .filter(
      (quiz) =>
        subjects.some((subject) => subject.name === quiz.subject) &&
        Number.isFinite(Date.parse(quiz.completedAt)),
    )
    .sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt));
  const recent = history
    .filter(
      (quiz, i, all) =>
        all.findIndex((other) => other.subject === quiz.subject) === i,
    )
    .slice(0, 2);
  const adventure =
    subjects.find((subject) => subject.name === recent[0]?.subject) ||
    subjects.find((subject) => subject.name === 'Maths') ||
    subjects[0];
  const completed = progress[adventure.name]?.length || 0;
  const now = new Date();
  const monday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - ((now.getDay() + 6) % 7),
  );
  const days = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday);
    day.setDate(day.getDate() + index);
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    return {
      day,
      practiced: (learner?.quizHistory || []).some(
        (quiz) =>
          Date.parse(quiz.completedAt) >= day.getTime() &&
          Date.parse(quiz.completedAt) < next.getTime(),
      ),
    };
  });
  return (
    <div className="sunny-home-overview">
      <section
        className="sunny-home-hero"
        aria-label="Welcome and today's adventure"
      >
        <div className="sunny-home-scenery" aria-hidden="true">
          <span className="sunny-home-cloud sunny-float" />
          <span className="sunny-home-cloud" />
          <svg viewBox="0 0 1200 160" preserveAspectRatio="none">
            <path
              d="M0 95 Q170 0 370 95 T780 80 T1200 90 V160 H0Z"
              fill="#8DD9A3"
            />
            <path
              d="M0 130 Q250 30 510 130 T1000 115 T1200 120 V160 H0Z"
              fill="#2FC27A"
            />
          </svg>
          <Sparkle className="sunny-twinkle" />
        </div>
        <div className="sunny-home-greeting">
          <Owl pose="wave" height={240} />
          <div>
            <SpeechBubble>
              <h1>{greeting}</h1>
              <p>Ready to learn today?</p>
            </SpeechBubble>
            <KidButton
              variant="white"
              size="sm"
              onClick={() =>
                isSpeaking
                  ? cancel()
                  : void speak(`${greeting} Ready to learn today?`)
              }
              aria-pressed={isSpeaking}
              disabled={isLoading && !isSpeaking}
            >
              <SpeakerWaveIcon aria-hidden="true" />
              {isSpeaking ? 'Stop listening' : 'Listen'}
            </KidButton>
            {errorMessage && (
              <p role="status">Read aloud could not start. Please try again.</p>
            )}
            {!!learner?.streak && (
              <span className="sunny-home-streak">
                🔥 {learner.streak} day streak!
              </span>
            )}
          </div>
        </div>
        <KidCard className="sunny-adventure">
          <div className="sunny-home-chips">
            <Chip tint="gold">Today's adventure</Chip>
            <Chip tint="sky">{adventure.name}</Chip>
          </div>
          <div className="sunny-adventure-title">
            <HomeSubjectIcon subject={adventure} />
            <h2>{recent[0]?.topic || `Explore ${adventure.name}`}</h2>
          </div>
          <p>
            {recent.length
              ? `Choose your next topic in ${adventure.name}.`
              : 'Pick a topic and start your next adventure.'}
          </p>
          <div className="sunny-quiz-progress">
            <div
              role="progressbar"
              aria-label={`Most recent ${adventure.name} quiz score`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.min(100, Math.max(0, recent[0]?.score || 0))}
            >
              <span
                style={{
                  width: `${Math.min(100, Math.max(0, recent[0]?.score || 0))}%`,
                }}
              />
            </div>
            <p>
              {recent.length
                ? `Last quiz: ${recent[0].score}%`
                : 'Take a quiz to see your score here.'}
            </p>
          </div>
          <div className="sunny-adventure-progress">
            <span aria-hidden="true">✓</span>
            <p>
              {completed} topic{completed === 1 ? '' : 's'} completed in{' '}
              {adventure.name}
            </p>
          </div>
          <div className="sunny-home-actions">
            <KidButton size="lg" onClick={() => onSelectSubject(adventure)}>
              {recent.length ? 'Carry on' : 'Start learning'}{' '}
              <span aria-hidden="true">→</span>
            </KidButton>
            <KidButton size="lg" variant="white" href="#subjects">
              Choose something else
            </KidButton>
          </div>
        </KidCard>
      </section>
      {children}
      <div className="sunny-home-lower">
        <section aria-labelledby="sunny-recent-heading">
          <h2 id="sunny-recent-heading">Pick up where you left off</h2>
          <div className="sunny-recent-list">
            {recent.length ? (
              recent.map((quiz) => {
                const subject = subjects.find(
                  (item) => item.name === quiz.subject,
                )!;
                return (
                  <KidCard key={quiz.id} className="sunny-recent-card">
                    <HomeSubjectIcon subject={subject} size={76} />
                    <div>
                      <h3>
                        {quiz.subject}: {quiz.topic}
                      </h3>
                      <p>Last quiz: {quiz.score}% · Choose your next topic</p>
                    </div>
                    <KidButton
                      variant="white"
                      size="sm"
                      onClick={() => onSelectSubject(subject)}
                      aria-label={`Continue ${quiz.subject}`}
                    >
                      Continue <span aria-hidden="true">→</span>
                    </KidButton>
                  </KidCard>
                );
              })
            ) : (
              <KidCard>
                <p>
                  Your recent subjects will appear here after your first quiz.
                </p>
              </KidCard>
            )}
          </div>
        </section>
        <KidCard className="sunny-week">
          <h2>This week</h2>
          <ol>
            {days.map(({ day, practiced }) => (
              <li
                key={day.getTime()}
                aria-current={
                  day.toDateString() === now.toDateString() ? 'date' : undefined
                }
              >
                <span>
                  {day.toLocaleDateString('en-GB', { weekday: 'short' })}
                </span>
                <span className="sunny-week-star" data-practiced={practiced}>
                  <StarIcon aria-hidden="true" />
                  <span className="sr-only">
                    {practiced ? 'Quiz practice recorded' : 'No quiz recorded'}
                    {day.toDateString() === now.toDateString() ? ', today' : ''}
                  </span>
                </span>
              </li>
            ))}
          </ol>
          <p>
            Quiz practice on {days.filter((day) => day.practiced).length} day
            {days.filter((day) => day.practiced).length === 1 ? '' : 's'} this
            week. Keep going!
          </p>
        </KidCard>
      </div>
      <div className="sunny-home-lower sunny-home-rewards">
        {dailyChallenge}
        <KidCard tint="bubblegum" className="sunny-stars-card">
          <StarIcon aria-hidden="true" />
          <div>
            <h2>{(learner?.totalPoints || 0).toLocaleString()} points</h2>
            <p>Keep learning. Keep shining!</p>
            <KidButton variant="white" onClick={onOpenAchievements}>
              View your badges
            </KidButton>
          </div>
        </KidCard>
      </div>
    </div>
  );
}
