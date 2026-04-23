import { getSettings, SETTING_KEYS } from "../lib/settings";
import Navbar from "./Navbar";

/**
 * Server component wrapper around Navbar.
 * Reads header logo + site name from DB settings and passes them to the client navbar.
 */
export default async function NavbarServer() {
  const s = await getSettings([
    SETTING_KEYS.HEADER_LOGO_URL,
    SETTING_KEYS.SITE_NAME,
  ]);

  return (
    <Navbar
      logoUrl={s[SETTING_KEYS.HEADER_LOGO_URL] || undefined}
      siteName={s[SETTING_KEYS.SITE_NAME] || "MyCareerly"}
    />
  );
}
