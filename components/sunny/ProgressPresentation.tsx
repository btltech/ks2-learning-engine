import type { Badge, UserProfile } from '../../types';
import type { SkillNode } from '../../services/progressVisualizationService';
import { AVAILABLE_BADGES } from '../../data/badges';
import AvatarDisplay from '../AvatarDisplay';
import { Owl } from './Owl';

export function countInWords(value: number): string {
  const n = Math.max(0, Math.floor(value));
  const small = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  if (n < 20) return small[n];
  if (n < 100) return ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'][Math.floor(n / 10)] + (n % 10 ? `-${small[n % 10]}` : '');
  if (n < 1000) return `${small[Math.floor(n / 100)]} hundred${n % 100 ? ` and ${countInWords(n % 100)}` : ''}`;
  return n.toLocaleString('en-GB');
}

export function skillSegments(nodes: SkillNode[]) {
  const confident = nodes.filter(node => node.isCompleted).length;
  const learning = nodes.filter(node => !node.isCompleted && node.progress > 0).length;
  return { confident, learning, notStarted: nodes.length - confident - learning };
}

export function SubjectSegments({ nodes, label }: { nodes: SkillNode[]; label: string }) {
  const { confident, learning, notStarted } = skillSegments(nodes);
  return <span className="sunny-subject-segments">
    <span className="sunny-segment-track" aria-hidden="true">
      <span data-segment="confident" style={{ flex: confident }} />
      <span data-segment="learning" style={{ flex: learning }} />
      <span data-segment="not-started" style={{ flex: notStarted }} />
    </span>
    <span className="sunny-segment-numbers">{label}: {countInWords(confident)} confident · {countInWords(learning)} learning · {countInWords(notStarted)} not started</span>
  </span>;
}

export function ProgressLegend() {
  return <div className="sunny-progress-legend" aria-label="Subject progress legend">
    <span><i data-segment="not-started" aria-hidden="true" />Not started</span>
    <span><i data-segment="learning" aria-hidden="true" />Learning (striped)</span>
    <span><i data-segment="confident" aria-hidden="true" />Confident</span>
  </div>;
}

export function TrophyHero({ user, completed }: { user?: UserProfile | null; completed: number }) {
  return <section className="sunny-trophy-hero" aria-labelledby="trophy-room-title">
    <div className="sunny-trophy-avatar"><AvatarDisplay size="xl" showEffects={false} /></div>
    <div><h1 id="trophy-room-title">My trophy room</h1>
      <p>{user ? `Keep up the great work, ${user.name}!` : 'Your learning journey and achievements'}</p>
      <div className="sunny-stat-stickers">
        <div><strong>{completed}</strong><span>skill milestones completed</span></div>
        {user && <><div><strong>☆ {user.totalPoints}</strong><span>total points</span></div><div><strong>☀ {user.streak}</strong><span>day streak</span></div></>}
      </div>
    </div>
  </section>;
}

export function StickerBook({ badges }: { badges: Badge[] }) {
  const known = new Set(AVAILABLE_BADGES.map(badge => badge.id));
  const all = [...AVAILABLE_BADGES, ...badges.filter(badge => !known.has(badge.id))];
  return <section className="sunny-sticker-book" aria-labelledby="sticker-book-title">
    <h2 id="sticker-book-title">My sticker book</h2>
    <ul>{all.map(badge => {
      const earned = badges.some(item => item.id === badge.id);
      return <li key={badge.id} data-earned={earned}>
        <span className="sunny-sticker-picture" aria-hidden="true">{earned ? badge.icon : '🔒'}</span>
        <h3>{badge.name}</h3><p>{earned ? '✓ Earned' : `Locked · ${badge.description}`}</p>
      </li>;
    })}</ul>
  </section>;
}

export function PersonalBestBanner() {
  return <aside className="sunny-personal-best"><Owl pose="hooray" height={100} /><div><h2>Beat your own best</h2><p>Your progress is about you. Take your time, practise a skill and see how far you have come.</p></div></aside>;
}
