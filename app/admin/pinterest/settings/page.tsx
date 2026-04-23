import { prisma } from "../../../lib/prisma";
import { getSetting, SETTING_KEYS } from "../../../lib/settings";
import { savePinterestAppSettings } from "../../../actions/pinterest";
import { ShieldCheck, Key, Sparkles, Zap, ExternalLink } from "lucide-react";
import { SITE_URL } from "../../../lib/site";

export const dynamic = "force-dynamic";

export default async function PinterestSettings() {
  const [clientId, clientSecret, autoFlag, maxPerDay, geminiKey] = await Promise.all([
    getSetting(SETTING_KEYS.PINTEREST_CLIENT_ID),
    getSetting(SETTING_KEYS.PINTEREST_CLIENT_SECRET),
    getSetting(SETTING_KEYS.PINTEREST_AUTO_POST_ENABLED),
    getSetting(SETTING_KEYS.PINTEREST_MAX_PINS_PER_DAY),
    getSetting(SETTING_KEYS.GEMINI_API_KEY),
  ]);

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-[#1A1A1A] mb-1">Pinterest Settings</h1>
      <p className="text-sm text-[#6B6B6B] mb-6">Configure your Pinterest app credentials, auto-posting, and AI image generation.</p>

      {/* Setup checklist */}
      <div className="bg-[#FEF0ED] border border-[#E8705A]/30 rounded-2xl p-5 mb-6">
        <p className="text-sm font-bold text-[#1A1A1A] mb-2">Setup Checklist</p>
        <ol className="text-xs text-[#6B6B6B] space-y-1.5 list-decimal pl-5">
          <li>
            Create a Pinterest Developer app at{" "}
            <a className="text-[#E60023] underline" target="_blank" rel="noopener" href="https://developers.pinterest.com/apps/">
              developers.pinterest.com/apps
            </a>{" "}
            <ExternalLink size={10} className="inline" />
          </li>
          <li>
            Add these Redirect URIs in your app settings (both, for dev + prod):
            <pre className="mt-1 bg-white border border-[#E8E4DF] rounded-lg p-2 text-[10px] font-mono text-[#1A1A1A] overflow-x-auto">
{`http://localhost:3000/api/pinterest/oauth/callback
${SITE_URL}/api/pinterest/oauth/callback`}
            </pre>
          </li>
          <li>Paste <code>App ID</code> + <code>App Secret</code> below and save</li>
          <li>Go to <strong>Accounts</strong> tab and click Connect for each Pinterest account (up to 3)</li>
          <li>Turn ON <strong>Auto-post new articles</strong> below when ready</li>
        </ol>
      </div>

      <form action={savePinterestAppSettings} className="space-y-5">
        {/* App credentials */}
        <div className="bg-white border border-[#E8E4DF] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Key size={16} className="text-[#E60023]" />
            <h2 className="text-sm font-bold text-[#1A1A1A]">Pinterest App Credentials</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">App ID (Client ID)</label>
              <input
                type="text"
                name="clientId"
                defaultValue={clientId}
                placeholder="1533365"
                className="w-full px-3 py-2 border border-[#E8E4DF] rounded-xl text-sm focus:border-[#E60023] focus:ring-2 focus:ring-[#E60023]/10 outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">
                App Secret {clientSecret && <span className="text-green-600 ml-1">(already set — leave blank to keep)</span>}
              </label>
              <input
                type="password"
                name="clientSecret"
                defaultValue=""
                placeholder={clientSecret ? "•".repeat(20) : "Paste app secret"}
                className="w-full px-3 py-2 border border-[#E8E4DF] rounded-xl text-sm focus:border-[#E60023] focus:ring-2 focus:ring-[#E60023]/10 outline-none font-mono"
                autoComplete="off"
              />
              <p className="text-[10px] text-[#8A8A8A] mt-1">Stored encrypted. Regenerate in Pinterest dashboard if exposed.</p>
            </div>
          </div>
        </div>

        {/* Auto-post */}
        <div className="bg-white border border-[#E8E4DF] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={16} className="text-[#E60023]" />
            <h2 className="text-sm font-bold text-[#1A1A1A]">Auto-posting</h2>
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="autoPost"
              defaultChecked={autoFlag === "true"}
              className="mt-0.5 w-4 h-4 accent-[#E60023]"
            />
            <div>
              <p className="text-sm font-semibold text-[#1A1A1A]">Auto-post new articles to Pinterest</p>
              <p className="text-xs text-[#6B6B6B]">When ON, every published article is queued as a Pin on all active accounts with their defaults.</p>
            </div>
          </label>

          <div className="mt-4">
            <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">Max pins per cron run</label>
            <input
              type="number"
              name="maxPerDay"
              defaultValue={maxPerDay || "20"}
              min={1}
              max={100}
              className="w-32 px-3 py-2 border border-[#E8E4DF] rounded-xl text-sm focus:border-[#E60023] outline-none"
            />
            <p className="text-[10px] text-[#8A8A8A] mt-1">Rate-limits bulk publishing. Pinterest allows ~1000 API req/day per account.</p>
          </div>
        </div>

        {/* Nano Banana */}
        <div className="bg-white border border-[#E8E4DF] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-[#E60023]" />
            <h2 className="text-sm font-bold text-[#1A1A1A]">AI Image Generation (Nano Banana)</h2>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">
              Gemini API Key {geminiKey && <span className="text-green-600 ml-1">(set — leave blank to keep)</span>}
            </label>
            <input
              type="password"
              name="geminiKey"
              defaultValue=""
              placeholder={geminiKey ? "•".repeat(20) : "AIza..."}
              className="w-full px-3 py-2 border border-[#E8E4DF] rounded-xl text-sm focus:border-[#E60023] outline-none font-mono"
              autoComplete="off"
            />
            <p className="text-[10px] text-[#8A8A8A] mt-1">
              Powers Nano Banana (Gemini 2.5 Flash Image) in Pin Composer. Get a key at{" "}
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" className="text-[#E60023] underline">aistudio.google.com/apikey</a>.
            </p>
          </div>
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 bg-[#E60023] hover:bg-[#AD081B] text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
        >
          <ShieldCheck size={14} /> Save Settings
        </button>
      </form>
    </div>
  );
}
