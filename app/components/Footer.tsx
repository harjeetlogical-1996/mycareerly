import { Flower2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getSettings, SETTING_KEYS } from "../lib/settings";

// Inline social SVG icons (not all in this older lucide-react version)
const iconProps = { width: 15, height: 15, viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": true } as const;
const InstagramIcon = () => (
  <svg {...iconProps}><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2zm-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6zm9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/></svg>
);
const FacebookIcon = () => (
  <svg {...iconProps}><path d="M12 2C6.48 2 2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95 0-5.52-4.48-10-10-10z"/></svg>
);
const YoutubeIcon = () => (
  <svg {...iconProps}><path d="M23 12s0-3.66-.46-5.42a2.78 2.78 0 0 0-2-2C18.75 4 12 4 12 4s-6.75 0-8.54.58a2.78 2.78 0 0 0-2 2C1 8.34 1 12 1 12s0 3.66.46 5.42a2.78 2.78 0 0 0 2 2C5.25 20 12 20 12 20s6.75 0 8.54-.58a2.78 2.78 0 0 0 2-2C23 15.66 23 12 23 12zM9.75 15.5v-7l6 3.5-6 3.5z"/></svg>
);
const LinkedinIcon = () => (
  <svg {...iconProps}><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46C23.2 24 24 23.23 24 22.28V1.72C24 .77 23.2 0 22.23 0z"/></svg>
);

const footerLinks = {
  "Find Florists": [
    { label: "New York",      href: "/listings?city=new-york" },
    { label: "Los Angeles",   href: "/listings?city=los-angeles" },
    { label: "Chicago",       href: "/listings?city=chicago" },
    { label: "Houston",       href: "/listings?city=houston" },
    { label: "San Francisco", href: "/listings?city=san-francisco" },
    { label: "Seattle",       href: "/listings?city=seattle" },
  ],
  Articles: [
    { label: "Care Guides",    href: "/articles?category=Care+Guide" },
    { label: "DIY Ideas",      href: "/articles?category=DIY" },
    { label: "Seasonal Picks", href: "/articles?category=Seasonal" },
    { label: "Expert Tips",    href: "/articles?category=Expert+Tips" },
    { label: "Wedding",        href: "/articles?category=Wedding" },
    { label: "Gifting",        href: "/articles?category=Gifting" },
  ],
  Company: [
    { label: "About Us",      href: "/about" },
    { label: "Write for Us",  href: "/articles/write" },
    { label: "Contact",       href: "/contact" },
    { label: "FAQ",           href: "/faq" },
  ],
  Support: [
    { label: "Gift Finder",     href: "/tools/gift-finder" },
    { label: "All Tools",       href: "/tools" },
    { label: "List Your Shop",  href: "/listings/create" },
    { label: "Flowers A–Z",     href: "/all-flower-names-a-to-z-complete-guide" },
  ],
};

// Inline SVG for Pinterest (not in lucide-react)
const PinterestIcon = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 0a12 12 0 0 0-4.37 23.17c-.1-.93-.19-2.37.04-3.39.21-.93 1.37-5.94 1.37-5.94s-.35-.7-.35-1.73c0-1.63.94-2.84 2.12-2.84 1 0 1.48.75 1.48 1.65 0 1.01-.64 2.51-.97 3.91-.28 1.17.59 2.13 1.75 2.13 2.1 0 3.72-2.22 3.72-5.42 0-2.83-2.04-4.81-4.95-4.81-3.37 0-5.35 2.53-5.35 5.14 0 1.02.39 2.11.88 2.7.1.12.11.22.08.34-.09.37-.29 1.18-.33 1.35-.05.22-.17.27-.4.16-1.49-.69-2.42-2.87-2.42-4.62 0-3.76 2.73-7.22 7.88-7.22 4.14 0 7.35 2.95 7.35 6.89 0 4.11-2.59 7.42-6.19 7.42-1.21 0-2.34-.63-2.73-1.37l-.74 2.83c-.27 1.03-1 2.33-1.49 3.12A12 12 0 1 0 12 0z"/>
  </svg>
);
const TikTokIcon = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.87a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.3z"/>
  </svg>
);

export default async function Footer() {
  const s = await getSettings([
    SETTING_KEYS.SITE_NAME,
    SETTING_KEYS.SITE_TAGLINE,
    SETTING_KEYS.FOOTER_LOGO_URL,
    SETTING_KEYS.SOCIAL_INSTAGRAM,
    SETTING_KEYS.SOCIAL_FACEBOOK,
    SETTING_KEYS.SOCIAL_PINTEREST,
    SETTING_KEYS.SOCIAL_YOUTUBE,
    SETTING_KEYS.SOCIAL_TIKTOK,
    SETTING_KEYS.SOCIAL_LINKEDIN,
    SETTING_KEYS.CONTACT_EMAIL,
    SETTING_KEYS.FOOTER_COPYRIGHT,
  ]);

  const siteName = s[SETTING_KEYS.SITE_NAME] || "MyCareerly";
  const tagline = s[SETTING_KEYS.SITE_TAGLINE] ||
    "America's flower shop directory — verified local florists, expert flower guides, and everything a flower lover needs in one place.";
  const copyright = s[SETTING_KEYS.FOOTER_COPYRIGHT] || `© ${new Date().getFullYear()} ${siteName}. All rights reserved.`;
  const footerLogo = s[SETTING_KEYS.FOOTER_LOGO_URL];
  const contactEmail = s[SETTING_KEYS.CONTACT_EMAIL];

  const socials = [
    { label: "Instagram", href: s[SETTING_KEYS.SOCIAL_INSTAGRAM], Icon: InstagramIcon },
    { label: "Facebook",  href: s[SETTING_KEYS.SOCIAL_FACEBOOK],  Icon: FacebookIcon },
    { label: "Pinterest", href: s[SETTING_KEYS.SOCIAL_PINTEREST], Icon: PinterestIcon },
    { label: "YouTube",   href: s[SETTING_KEYS.SOCIAL_YOUTUBE],   Icon: YoutubeIcon },
    { label: "TikTok",    href: s[SETTING_KEYS.SOCIAL_TIKTOK],    Icon: TikTokIcon },
    { label: "LinkedIn",  href: s[SETTING_KEYS.SOCIAL_LINKEDIN],  Icon: LinkedinIcon },
  ].filter((x) => x.href && x.href.trim());

  return (
    <footer className="bg-[#1A1A1A] text-white">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-16">
        <div className="grid md:grid-cols-6 gap-10">

          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-5">
              {footerLogo ? (
                <Image src={footerLogo} alt={siteName} width={150} height={45} className="h-10 w-auto object-contain" />
              ) : (
                <>
                  <div className="w-9 h-9 bg-[#E8705A] rounded-xl flex items-center justify-center">
                    <Flower2 size={18} className="text-white" />
                  </div>
                  <span className="text-xl font-bold tracking-tight">
                    My<span className="text-[#E8705A]">Careerly</span>
                  </span>
                </>
              )}
            </Link>
            <p className="text-sm text-[#9A9A9A] leading-relaxed mb-3 max-w-xs">
              {tagline}
            </p>
            {contactEmail && (
              <a href={`mailto:${contactEmail}`} className="text-xs text-[#9A9A9A] hover:text-[#E8705A] transition-colors block mb-6">
                {contactEmail}
              </a>
            )}
            {!contactEmail && <div className="mb-6" />}

            {/* Social icons */}
            {socials.length > 0 && (
              <div className="flex gap-2">
                {socials.map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-9 h-9 bg-white/10 hover:bg-[#E8705A] rounded-xl flex items-center justify-center transition-colors text-white"
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-sm font-semibold text-white mb-4">{heading}</h4>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-[#9A9A9A] hover:text-white transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#9A9A9A]">{copyright}</p>
          <div className="flex items-center gap-5">
            {[
              { label: "Privacy Policy",   href: "/privacy" },
              { label: "Terms of Service", href: "/terms" },
              { label: "Contact",          href: "/contact" },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-xs text-[#9A9A9A] hover:text-white transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
