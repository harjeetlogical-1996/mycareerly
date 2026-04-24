import { getSetting, SETTING_KEYS } from "./settings";

/**
 * Single source of truth for the Gemini API key.
 *
 * Resolution order:
 *   1. DB setting `gemini_api_key` (admin UI → /admin/pinterest/settings)
 *   2. `GEMINI_API_KEY` env var (Cloud Run Secret Manager binding)
 *   3. `GOOGLE_API_KEY` env var (legacy fallback)
 *
 * Both the article generator (`lib/generateArticle.ts`) and Pinterest
 * image generator (`lib/pinterest/generateImage.ts`) should call this
 * helper — never hard-code a key, never read env/DB directly.
 */
export async function getGeminiApiKey(): Promise<string> {
  const fromDb = await getSetting(SETTING_KEYS.GEMINI_API_KEY);
  const key =
    (fromDb && fromDb.trim()) ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    "";
  if (!key) {
    throw new Error(
      "Gemini API key not configured. Set it in /admin/pinterest/settings or the GEMINI_API_KEY env var."
    );
  }
  return key;
}

/**
 * Non-throwing variant — returns empty string if no key configured.
 * Use this when you want to gracefully disable AI features instead of erroring.
 */
export async function getGeminiApiKeyOrEmpty(): Promise<string> {
  try {
    return await getGeminiApiKey();
  } catch {
    return "";
  }
}
