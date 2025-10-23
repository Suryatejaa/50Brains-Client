// Feature flags for MVP configuration
export const FEATURE_FLAGS = {
  // Clan features - disabled for MVP
  CLANS_ENABLED: false,
  CLAN_CREATION: false,
  CLAN_BROWSING: false,
  CLAN_MANAGEMENT: false,
  CLAN_NOTIFICATIONS: false,
  CLAN_GIG_WORKFLOW: false,

  // Credit features - disabled for MVP
  CREDITS_ENABLED: false,
  CREDIT_PURCHASE: false,
  CREDIT_WALLET: false,
  PROFILE_BOOST: false,
  GIG_BOOST: false,

  // Other features that might be disabled in MVP
  ANALYTICS: true,
  NOTIFICATIONS: true,
  PORTFOLIO: true,
  SOCIAL_MEDIA: true,
  EQUIPMENT: true,
} as const;

// Helper function to check if a feature is enabled
export const isFeatureEnabled = (
  feature: keyof typeof FEATURE_FLAGS
): boolean => {
  return FEATURE_FLAGS[feature];
};

// Helper function to conditionally render components based on feature flags
export const withFeatureFlag = (
  feature: keyof typeof FEATURE_FLAGS,
  component: React.ReactNode,
  fallback?: React.ReactNode
) => {
  return isFeatureEnabled(feature) ? component : fallback || null;
};
