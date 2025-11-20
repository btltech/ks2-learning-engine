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
