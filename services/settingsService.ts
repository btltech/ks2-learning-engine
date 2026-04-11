export const getAiFallbackSetting = (): boolean => {
  try {
    const raw = localStorage.getItem('ks2_settings');
    if (!raw) return true;
    const parsed = JSON.parse(raw);
    if (typeof parsed.aiFallbackEnabled === 'boolean') return parsed.aiFallbackEnabled;
  } catch {
    // ignore
  }
  return true;
};

export interface AdminPlatformSettings {
  platformName: string;
  maintenanceMode: boolean;
  questionsToUnlockGames: number;
  pointsPerCorrectAnswer: number;
  enableAIQuestions: boolean;
  qualityThreshold: number;
  safetyReviewEnabled: boolean;
  adminOnlyRoleChanges: boolean;
}

const ADMIN_SETTINGS_KEY = 'ks2_admin_platform_settings';

export const DEFAULT_ADMIN_PLATFORM_SETTINGS: AdminPlatformSettings = {
  platformName: "DemiWura's KS2 Learning",
  maintenanceMode: false,
  questionsToUnlockGames: 10,
  pointsPerCorrectAnswer: 10,
  enableAIQuestions: true,
  qualityThreshold: 70,
  safetyReviewEnabled: true,
  adminOnlyRoleChanges: true,
};

export const getAdminPlatformSettings = (): AdminPlatformSettings => {
  try {
    const raw = localStorage.getItem(ADMIN_SETTINGS_KEY);
    if (!raw) return DEFAULT_ADMIN_PLATFORM_SETTINGS;

    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_ADMIN_PLATFORM_SETTINGS,
      ...parsed,
      questionsToUnlockGames: Number(parsed.questionsToUnlockGames ?? DEFAULT_ADMIN_PLATFORM_SETTINGS.questionsToUnlockGames),
      pointsPerCorrectAnswer: Number(parsed.pointsPerCorrectAnswer ?? DEFAULT_ADMIN_PLATFORM_SETTINGS.pointsPerCorrectAnswer),
      qualityThreshold: Number(parsed.qualityThreshold ?? DEFAULT_ADMIN_PLATFORM_SETTINGS.qualityThreshold),
    };
  } catch {
    return DEFAULT_ADMIN_PLATFORM_SETTINGS;
  }
};

export const saveAdminPlatformSettings = (settings: AdminPlatformSettings): AdminPlatformSettings => {
  const normalized: AdminPlatformSettings = {
    ...settings,
    platformName: settings.platformName.trim() || DEFAULT_ADMIN_PLATFORM_SETTINGS.platformName,
    questionsToUnlockGames: Math.max(0, Math.round(Number(settings.questionsToUnlockGames) || 0)),
    pointsPerCorrectAnswer: Math.max(0, Math.round(Number(settings.pointsPerCorrectAnswer) || 0)),
    qualityThreshold: Math.min(100, Math.max(0, Math.round(Number(settings.qualityThreshold) || 0))),
  };

  localStorage.setItem(ADMIN_SETTINGS_KEY, JSON.stringify(normalized));
  return normalized;
};
