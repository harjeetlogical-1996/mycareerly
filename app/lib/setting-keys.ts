// Client-safe constants (no Prisma / fs imports)
// Use this file from client components; server code can import from settings.ts

export const SETTING_KEYS = {
  // Analytics & verification
  GA4_MEASUREMENT_ID: "ga4_measurement_id",
  GSC_VERIFICATION: "gsc_verification",
  BING_VERIFICATION: "bing_verification",
  YANDEX_VERIFICATION: "yandex_verification",
  PINTEREST_VERIFICATION: "pinterest_verification",
  FB_PIXEL_ID: "fb_pixel_id",
  HOTJAR_ID: "hotjar_id",
  CLARITY_ID: "clarity_id",
  // Branding
  SITE_NAME: "site_name",
  SITE_TAGLINE: "site_tagline",
  HEADER_LOGO_URL: "header_logo_url",
  FOOTER_LOGO_URL: "footer_logo_url",
  FAVICON_URL: "favicon_url",
  // Social media
  SOCIAL_INSTAGRAM: "social_instagram",
  SOCIAL_FACEBOOK: "social_facebook",
  SOCIAL_PINTEREST: "social_pinterest",
  SOCIAL_YOUTUBE: "social_youtube",
  SOCIAL_TWITTER: "social_twitter",
  SOCIAL_TIKTOK: "social_tiktok",
  SOCIAL_LINKEDIN: "social_linkedin",
  // Contact info
  CONTACT_EMAIL: "contact_email",
  CONTACT_PHONE: "contact_phone",
  CONTACT_ADDRESS: "contact_address",
  // SEO defaults
  DEFAULT_META_DESCRIPTION: "default_meta_description",
  DEFAULT_OG_IMAGE: "default_og_image",
  // Behavior
  ENABLE_NEWSLETTER: "enable_newsletter",
  ENABLE_REVIEWS: "enable_reviews",
  FOOTER_COPYRIGHT: "footer_copyright",
  // Pinterest — app-level (shared across all connected accounts)
  PINTEREST_CLIENT_ID: "pinterest_client_id",
  PINTEREST_CLIENT_SECRET: "pinterest_client_secret",
  PINTEREST_AUTO_POST_ENABLED: "pinterest_auto_post_enabled",
  PINTEREST_OAUTH_STATE: "pinterest_oauth_state",
  PINTEREST_OAUTH_ACCOUNT_LABEL: "pinterest_oauth_account_label",
  PINTEREST_MAX_PINS_PER_DAY: "pinterest_max_pins_per_day",
  // AI image generation (Nano Banana / Gemini 2.5 Flash Image)
  GEMINI_API_KEY: "gemini_api_key",
} as const;
