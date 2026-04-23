import { getSettings, SETTING_KEYS } from "../../lib/settings";
import { Settings as SettingsIcon } from "lucide-react";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSettings([
    SETTING_KEYS.SITE_NAME,
    SETTING_KEYS.SITE_TAGLINE,
    SETTING_KEYS.HEADER_LOGO_URL,
    SETTING_KEYS.FOOTER_LOGO_URL,
    SETTING_KEYS.FAVICON_URL,
    SETTING_KEYS.SOCIAL_INSTAGRAM,
    SETTING_KEYS.SOCIAL_FACEBOOK,
    SETTING_KEYS.SOCIAL_PINTEREST,
    SETTING_KEYS.SOCIAL_YOUTUBE,
    SETTING_KEYS.SOCIAL_TWITTER,
    SETTING_KEYS.SOCIAL_TIKTOK,
    SETTING_KEYS.SOCIAL_LINKEDIN,
    SETTING_KEYS.CONTACT_EMAIL,
    SETTING_KEYS.CONTACT_PHONE,
    SETTING_KEYS.CONTACT_ADDRESS,
    SETTING_KEYS.DEFAULT_META_DESCRIPTION,
    SETTING_KEYS.DEFAULT_OG_IMAGE,
    SETTING_KEYS.ENABLE_NEWSLETTER,
    SETTING_KEYS.ENABLE_REVIEWS,
    SETTING_KEYS.FOOTER_COPYRIGHT,
  ]);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <SettingsIcon size={22} className="text-[#E8705A]" />
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Site Settings</h1>
        </div>
        <p className="text-sm text-[#6B6B6B]">
          Branding, logos, social media, contact info, and behavior toggles. Changes apply instantly across the site.
        </p>
      </div>

      <SettingsForm initial={settings} />
    </div>
  );
}
