import { beforeEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_ADMIN_PLATFORM_SETTINGS,
  getAdminPlatformSettings,
  saveAdminPlatformSettings,
} from './settingsService';

describe('settingsService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns default admin platform settings when none are saved', () => {
    expect(getAdminPlatformSettings()).toEqual(DEFAULT_ADMIN_PLATFORM_SETTINGS);
  });

  it('persists and normalizes admin platform settings', () => {
    const saved = saveAdminPlatformSettings({
      ...DEFAULT_ADMIN_PLATFORM_SETTINGS,
      platformName: '  ',
      questionsToUnlockGames: -2,
      pointsPerCorrectAnswer: 7.6,
      qualityThreshold: 140,
      maintenanceMode: true,
    });

    expect(saved).toMatchObject({
      platformName: DEFAULT_ADMIN_PLATFORM_SETTINGS.platformName,
      questionsToUnlockGames: 0,
      pointsPerCorrectAnswer: 8,
      qualityThreshold: 100,
      maintenanceMode: true,
    });
    expect(getAdminPlatformSettings()).toEqual(saved);
  });
});
