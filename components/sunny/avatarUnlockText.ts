import type { AvatarItem } from '../../services/avatarCustomizationService';

const achievementPrompts = new Map<string, string>([
  ['perfect_week', 'Earn a perfect week'],
  ['holiday_special', 'Earn the holiday special achievement'],
  ['first_perfect', 'Earn your first perfect score'],
  ['top_scorer', 'Earn the top scorer achievement'],
  ['party_time', 'Earn the party time achievement'],
]);

/** Presentation only: the service still determines the item's lock and progress. */
export function avatarUnlockText(condition: AvatarItem['unlockCondition'], existingText: string): string {
  return condition.type === 'achievement' && typeof condition.value === 'string'
    ? achievementPrompts.get(condition.value) ?? existingText
    : existingText;
}
