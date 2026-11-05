import type { AvatarConfig, AvatarItem } from '../../services/avatarCustomizationService';

/** Describe the actual equipped options, without replacing the saved avatar model. */
export function describeAvatar(config: AvatarConfig, items: AvatarItem[]): string {
  const name = (id: string | null) => items.find(item => item.id === id)?.name || 'None';
  return `Character: ${name(config.character)}. Colour: ${name(config.characterColor)}. Hat: ${name(config.hat)}. Accessory: ${name(config.accessory)}. Background: ${name(config.background)}. Effect: ${name(config.effect)}. Frame: ${name(config.frame)}.`;
}
