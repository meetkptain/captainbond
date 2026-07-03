const bool = (key: string, fallback: boolean): boolean => {
  const val = process.env[key];
  if (val === undefined) return fallback;
  return val === 'true' || val === '1';
};

export const FEATURES = {
  CORPORATE_ONBOARDING: bool('FF_CORPORATE_ONBOARDING', true),
  CORPORATE_QVT: bool('FF_CORPORATE_QVT', true),
  COUPLE_ARCHIVE: bool('FF_COUPLE_ARCHIVE', true),
  COUPLE_DETOX: bool('FF_COUPLE_DETOX', true),
  COUPLE_TIME_CAPSULE: bool('FF_COUPLE_TIME_CAPSULE', true),
  BAR_MONTHLY: bool('FF_BAR_MONTHLY', true),
  GEMINI_DJ_QUESTIONS: bool('FF_GEMINI_DJ_QUESTIONS', false),
  SOLO_PLAY: bool('FF_SOLO_PLAY', true),
  CORPORATE_ANECDOTES: bool('FF_CORPORATE_ANECDOTES', true),
  COUPLE_VOICE_SYNC: bool('FF_COUPLE_VOICE_SYNC', false),
  COUPLE_HEATMAP: bool('FF_COUPLE_HEATMAP', false),
  COUPLE_WEEKLY_RECAP: bool('FF_COUPLE_WEEKLY_RECAP', false),
  COUPLE_TREE_PROGRESS: bool('FF_COUPLE_TREE_PROGRESS', false),
  COUPLE_SHARED_REVEAL: bool('FF_COUPLE_SHARED_REVEAL', false),
} as const;

export function isEnabled(feature: keyof typeof FEATURES): boolean {
  return FEATURES[feature] === true;
}
