import Link from "next/link";
import { prisma } from "../../lib/prisma";
import { getSettings, SETTING_KEYS } from "../../lib/settings";
import {
  BarChart3, CheckCircle2, XCircle, ExternalLink, Info,
  Eye, Activity, Users, MousePointer2, PinIcon, Share2,
} from "lucide-react";
import AnalyticsForm from "./AnalyticsForm";

export const dynamic = "force-dynamic";

const SITE_URL = "https://mycareerly.com";

export default async function AdminAnalyticsPage() {
  const settings = await getSettings([
    SETTING_KEYS.GA4_MEASUREMENT_ID,
    SETTING_KEYS.GSC_VERIFICATION,
    SETTING_KEYS.BING_VERIFICATION,
    SETTING_KEYS.YANDEX_VERIFICATION,
    SETTING_KEYS.PINTEREST_VERIFICATION,
    SETTING_KEYS.FB_PIXEL_ID,
    SETTING_KEYS.CLARITY_ID,
  ]);

  // Quick content stats (shown in dashboard while GA is loading)
  const [articles, listings, cities] = await Promise.all([
    prisma.article.count({ where: { status: "published" } }),
    prisma.listing.count({ where: { status: "approved" } }),
    prisma.city.count({ where: { active: true } }),
  ]);

  const ga4 = settings[SETTING_KEYS.GA4_MEASUREMENT_ID];
  const gsc = settings[SETTING_KEYS.GSC_VERIFICATION];
  const bing = settings[SETTING_KEYS.BING_VERIFICATION];

  // "Configured" checks
  const isGa4Ok = /^G-[A-Z0-9]+$/i.test(ga4);
  const isGscOk = gsc.length > 20;
  const isBingOk = bing.length > 20;

  const totalConfigured = [isGa4Ok, isGscOk, isBingOk].filter(Boolean).length;

  return (
    <div className="p-8 max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 size={22} className="text-[#E8705A]" />
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Analytics & SEO Tools</h1>
        </div>
        <p className="text-sm text-[#6B6B6B]">
          Connect Google Analytics, Search Console, Bing, and more. Verification codes auto-inject into every page's &lt;head&gt;.
        </p>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatusCard
          title="Google Analytics"
          configured={isGa4Ok}
          value={ga4}
          icon={BarChart3}
        />
        <StatusCard
          title="Search Console"
          configured={isGscOk}
          value={gsc}
          icon={Eye}
        />
        <StatusCard
          title="Bing Webmaster"
          configured={isBingOk}
          value={bing}
          icon={Activity}
        />
      </div>

      {/* Configuration form */}
      <div className="bg-white border border-[#E8E4DF] rounded-3xl p-6 md:p-8 mb-6">
        <h2 className="font-bold text-[#1A1A1A] mb-1">Integration Codes</h2>
        <p className="text-sm text-[#6B6B6B] mb-6">
          Paste your tracking IDs / verification codes below. Changes take effect immediately across the entire site.
        </p>
        <AnalyticsForm initial={settings} />
      </div>

      {/* GA4 Dashboard embed (only if configured) */}
      {isGa4Ok && (
        <div className="bg-white border border-[#E8E4DF] rounded-3xl p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h2 className="font-bold text-[#1A1A1A] mb-0.5">Analytics Overview</h2>
              <p className="text-sm text-[#6B6B6B]">Your content stats + quick links to GA dashboards</p>
            </div>
            <a
              href={`https://analytics.google.com/analytics/web/#/p${ga4.replace("G-", "")}/reports/intelligenthome`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#E8705A] hover:bg-[#C95540] text-white text-sm font-semibold px-4 py-2 rounded-xl"
            >
              Open GA4 <ExternalLink size={13} />
            </a>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <QuickStat label="Published Articles" value={articles} icon={BarChart3} />
            <QuickStat label="Verified Listings" value={listings} icon={Users} />
            <QuickStat label="Cities Covered" value={cities} icon={MousePointer2} />
          </div>

          <div className="bg-[#FAFAF8] border border-[#E8E4DF] rounded-2xl p-5">
            <p className="text-xs font-semibold text-[#4A4A4A] mb-2">📊 Real-time metrics</p>
            <p className="text-xs text-[#6B6B6B] leading-relaxed mb-3">
              GA4 is tracking <strong>Measurement ID: {ga4}</strong>. Full dashboards with visitors, sessions, conversions, and custom events are in your Google Analytics account.
            </p>
            <div className="flex flex-wrap gap-2">
              <a href={`https://analytics.google.com/analytics/web/#/p${ga4.replace("G-", "")}/realtime/overview`}
                target="_blank" rel="noopener noreferrer"
                className="text-xs font-semibold text-[#E8705A] hover:underline inline-flex items-center gap-1">
                Realtime users <ExternalLink size={10} />
              </a>
              <span className="text-[#E8E4DF]">·</span>
              <a href={`https://analytics.google.com/analytics/web/#/p${ga4.replace("G-", "")}/reports/default-landing-page`}
                target="_blank" rel="noopener noreferrer"
                className="text-xs font-semibold text-[#E8705A] hover:underline inline-flex items-center gap-1">
                Landing pages <ExternalLink size={10} />
              </a>
              <span className="text-[#E8E4DF]">·</span>
              <a href={`https://analytics.google.com/analytics/web/#/p${ga4.replace("G-", "")}/reports/explorer?r=user-acquisition`}
                target="_blank" rel="noopener noreferrer"
                className="text-xs font-semibold text-[#E8705A] hover:underline inline-flex items-center gap-1">
                Traffic sources <ExternalLink size={10} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* External dashboard links */}
      <div className="bg-white border border-[#E8E4DF] rounded-3xl p-6 md:p-8">
        <h2 className="font-bold text-[#1A1A1A] mb-1">Dashboard Quick Links</h2>
        <p className="text-sm text-[#6B6B6B] mb-5">Jump straight to the external dashboards where your data lives.</p>

        <div className="grid sm:grid-cols-2 gap-3">
          <DashLink
            href="https://analytics.google.com"
            icon={BarChart3}
            title="Google Analytics 4"
            desc="Real-time visitors, traffic sources, conversions"
            configured={isGa4Ok}
          />
          <DashLink
            href={`https://search.google.com/search-console?resource_id=${encodeURIComponent(SITE_URL)}`}
            icon={Eye}
            title="Google Search Console"
            desc="Search queries, CTR, indexing status, Core Web Vitals"
            configured={isGscOk}
          />
          <DashLink
            href="https://www.bing.com/webmasters"
            icon={Activity}
            title="Bing Webmaster Tools"
            desc="Bing index status, backlinks, SEO reports"
            configured={isBingOk}
          />
          <DashLink
            href="https://clarity.microsoft.com"
            icon={MousePointer2}
            title="Microsoft Clarity"
            desc="Free heatmaps + session recordings"
            configured={!!settings[SETTING_KEYS.CLARITY_ID]}
          />
          <DashLink
            href="https://www.facebook.com/events_manager2"
            icon={Share2}
            title="Meta Events Manager"
            desc="Facebook Pixel data, ad conversions"
            configured={!!settings[SETTING_KEYS.FB_PIXEL_ID]}
          />
          <DashLink
            href="https://analytics.pinterest.com"
            icon={PinIcon}
            title="Pinterest Analytics"
            desc="Pin performance, follower insights"
            configured={!!settings[SETTING_KEYS.PINTEREST_VERIFICATION]}
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-[#F9EBE8] border border-[#E8705A]/20 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <Info size={18} className="text-[#E8705A] shrink-0 mt-0.5" />
          <div className="text-sm text-[#4A4A4A]">
            <p className="font-semibold text-[#1A1A1A] mb-1">How it works</p>
            <p className="text-xs leading-relaxed">
              Paste your codes and save — MyCareerly injects them into every page's &lt;head&gt; on the fly. No code deploy required.
              Verification happens when Google/Bing fetch your site. You've configured <strong>{totalConfigured} of 3</strong> core integrations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Helper components ────────────────────────────────────────────────────────
function StatusCard({
  title, configured, value, icon: Icon,
}: {
  title: string; configured: boolean; value: string; icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <div className={`rounded-2xl p-4 border ${configured ? "bg-green-50 border-green-200" : "bg-[#FAFAF8] border-[#E8E4DF]"}`}>
      <div className="flex items-center justify-between mb-2">
        <Icon size={18} className={configured ? "text-green-600" : "text-[#9A9A9A]"} />
        {configured
          ? <CheckCircle2 size={16} className="text-green-600" />
          : <XCircle size={16} className="text-[#C0B8B2]" />}
      </div>
      <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">{title}</p>
      <p className={`text-sm font-bold mt-0.5 ${configured ? "text-green-900" : "text-[#9A9A9A]"}`}>
        {configured ? (value.length > 20 ? value.slice(0, 20) + "…" : value) : "Not connected"}
      </p>
    </div>
  );
}

function QuickStat({ label, value, icon: Icon }: { label: string; value: number; icon: React.ComponentType<{ size?: number; className?: string }> }) {
  return (
    <div className="bg-[#FAFAF8] border border-[#E8E4DF] rounded-2xl p-4">
      <Icon size={16} className="text-[#E8705A] mb-2" />
      <p className="text-2xl font-bold text-[#1A1A1A]">{value.toLocaleString()}</p>
      <p className="text-xs text-[#6B6B6B] mt-0.5">{label}</p>
    </div>
  );
}

function DashLink({
  href, icon: Icon, title, desc, configured,
}: {
  href: string; icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string; desc: string; configured: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-start gap-3 p-4 rounded-2xl border transition-all ${
        configured
          ? "bg-white border-[#E8E4DF] hover:border-[#E8705A] hover:shadow-sm"
          : "bg-[#FAFAF8] border-[#E8E4DF] opacity-70 hover:opacity-100 hover:border-[#E8705A]"
      }`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${configured ? "bg-[#F9EBE8]" : "bg-[#E8E4DF]"}`}>
        <Icon size={16} className={configured ? "text-[#E8705A]" : "text-[#9A9A9A]"} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-bold text-sm text-[#1A1A1A]">{title}</p>
          {configured && <span className="text-[9px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">CONNECTED</span>}
        </div>
        <p className="text-xs text-[#6B6B6B] mt-0.5 line-clamp-1">{desc}</p>
      </div>
      <ExternalLink size={12} className="text-[#9A9A9A] shrink-0 mt-1" />
    </a>
  );
}
