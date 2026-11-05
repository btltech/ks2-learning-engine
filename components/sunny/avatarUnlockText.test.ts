import { expect, it } from 'vitest';
import { avatarUnlockText } from './avatarUnlockText';

it.each([
  ['perfect_week', 'Earn a perfect week'],
  ['holiday_special', 'Earn the holiday special achievement'],
  ['first_perfect', 'Earn your first perfect score'],
  ['top_scorer', 'Earn the top scorer achievement'],
  ['party_time', 'Earn the party time achievement'],
])('presents the known %s achievement without its internal code', (value, expected) => {
  expect(avatarUnlockText({ type: 'achievement', value }, `Earn "${value}" achievement`)).toBe(expected);
});

it('preserves unknown achievement wording and other progress types', () => {
  for (const value of ['future_reward', 'toString']) {
    const existing = `Earn "${value}" achievement`;
    expect(avatarUnlockText({ type: 'achievement', value }, existing)).toBe(existing);
  }
  expect(avatarUnlockText({ type: 'xp', value: 500 }, '120/500 XP')).toBe('120/500 XP');
  expect(avatarUnlockText({ type: 'streak', value: 7 }, '4/7 day streak')).toBe('4/7 day streak');
});
