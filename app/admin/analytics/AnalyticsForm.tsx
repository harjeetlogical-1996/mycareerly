"use client";

import { useState, useTransition } from "react";
import { Save, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { saveSettings } from "../../actions/settings";
import { SETTING_KEYS } from "../../lib/setting-keys";

type Settings = Record<string, string>;

const FIELDS = [
  {
    key: SETTING_KEYS.GA4_MEASUREMENT_ID,
    label: "Google Analytics 4 — Measurement ID",
    hint: "Starts with G- (e.g. G-XXXXXXXXXX). Get it from analytics.google.com → Admin → Data Streams.",
    placeholder: "G-XXXXXXXXXX",
    getLink: "https://analytics.google.com",
    getLinkLabel: "Get from GA4 →",
  },
  {
    key: SETTING_KEYS.GSC_VERIFICATION,
    label: "Google Search Console — Verification code",
    hint: "Just the content value from the HTML meta tag (not the full tag). From search.google.com/search-console → Add Property → HTML tag.",
    placeholder: "abc123XYZ-long-verification-string",
    getLink: "https://search.google.com/search-console",
    getLinkLabel: "Get from GSC →",
  },
  {
    key: SETTING_KEYS.BING_VERIFICATION,
    label: "Bing Webmaster — Verification code",
    hint: "Content value of msvalidate.01 meta tag. From bing.com/webmasters → Sites → Add → HTML Meta tag method.",
    placeholder: "1234567890ABCDEF",
    getLink: "https://www.bing.com/webmasters",
    getLinkLabel: "Get from Bing →",
  },
  {
    key: SETTING_KEYS.CLARITY_ID,
    label: "Microsoft Clarity (optional) — Project ID",
    hint: "Free heatmaps + session recordings. From clarity.microsoft.com → your project settings.",
    placeholder: "abcd1234ef",
    getLink: "https://clarity.microsoft.com",
    getLinkLabel: "Get from Clarity →",
  },
  {
    key: SETTING_KEYS.FB_PIXEL_ID,
    label: "Meta (Facebook) Pixel ID (optional)",
    hint: "Numeric Pixel ID for ad tracking. From facebook.com/events_manager2 → Pixel → Settings.",
    placeholder: "1234567890123456",
    getLink: "https://www.facebook.com/events_manager2",
    getLinkLabel: "Get from Meta →",
  },
  {
    key: SETTING_KEYS.PINTEREST_VERIFICATION,
    label: "Pinterest verification (optional)",
    hint: "Content value of p:domain_verify meta tag from Pinterest → Claim → Website.",
    placeholder: "1234567890abcdef",
    getLink: "https://www.pinterest.com/settings/claim",
    getLinkLabel: "Get from Pinterest →",
  },
  {
    key: SETTING_KEYS.YANDEX_VERIFICATION,
    label: "Yandex Webmaster (optional)",
    hint: "Content value of yandex-verification meta. From webmaster.yandex.com → Add Site → Meta tag.",
    placeholder: "abc123def456",
    getLink: "https://webmaster.yandex.com",
    getLinkLabel: "Get from Yandex →",
  },
];

export default function AnalyticsForm({ initial }: { initial: Settings }) {
  const [values, setValues] = useState<Settings>(initial);
  const [shown, setShown] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<{ success: boolean; count?: number } | null>(null);
  const [isPending, startTransition] = useTransition();

  const toggleShow = (key: string) => {
    const next = new Set(shown);
    if (next.has(key)) next.delete(key); else next.add(key);
    setShown(next);
  };

  const update = (key: string, v: string) => setValues({ ...values, [key]: v });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResult(null);
    const fd = new FormData();
    for (const { key } of FIELDS) fd.set(key, values[key] ?? "");
    startTransition(async () => {
      const res = await saveSettings(fd);
      setResult(res);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {FIELDS.map((f) => {
        const v = values[f.key] ?? "";
        const isShown = shown.has(f.key);
        return (
          <div key={f.key}>
            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
              <label className="block text-xs font-semibold text-[#1A1A1A]">{f.label}</label>
              <a
                href={f.getLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-semibold text-[#E8705A] hover:underline"
              >
                {f.getLinkLabel}
              </a>
            </div>
            <div className="relative">
              <input
                type={isShown ? "text" : "password"}
                value={v}
                onChange={(e) => update(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="w-full border border-[#E8E4DF] rounded-xl px-4 py-2.5 pr-10 text-sm font-mono bg-[#FAFAF8] focus:outline-none focus:border-[#E8705A] focus:ring-2 focus:ring-[#E8705A]/10"
                autoComplete="off"
              />
              {v && (
                <button
                  type="button"
                  onClick={() => toggleShow(f.key)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9A9A] hover:text-[#1A1A1A]"
                  aria-label={isShown ? "Hide" : "Show"}
                >
                  {isShown ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              )}
            </div>
            <p className="text-[11px] text-[#9A9A9A] mt-1 leading-relaxed">{f.hint}</p>
          </div>
        );
      })}

      {result?.success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-100 text-green-700 rounded-xl p-3 text-sm">
          <CheckCircle2 size={14} /> Saved! Changes are live across the site.
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center gap-2 bg-[#E8705A] hover:bg-[#C95540] disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl text-sm"
      >
        {isPending ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Save size={13} /> Save Settings</>}
      </button>

      <p className="text-[11px] text-[#9A9A9A] flex items-start gap-1.5">
        <AlertCircle size={12} className="mt-0.5 shrink-0" />
        Codes are stored in your database and injected into every page's &lt;head&gt;. Changes apply immediately — no deploy needed.
      </p>
    </form>
  );
}
