import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "../components/NavbarServer";
import Footer from "../components/Footer";
import { ChevronRight } from "lucide-react";

const SITE_URL = "https://mycareerly.com";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "MyCareerly's privacy policy. Learn how we collect, use, and protect your personal information when you use our flower shop directory.",
  alternates: { canonical: `${SITE_URL}/privacy` },
  robots: { index: true, follow: false },
};

const sections = [
  {
    title: "Information We Collect",
    content: `We collect information you provide directly, such as when you submit a flower shop listing, sign up for our newsletter, or contact us. This may include your name, email address, business name, phone number, and business address.

We also automatically collect certain information when you visit our site, including your IP address, browser type, pages visited, and time spent on pages. This is collected through standard server logs and analytics tools.`,
  },
  {
    title: "How We Use Your Information",
    content: `We use the information we collect to:
• Operate and improve the MyCareerly directory
• Process and display florist listings you submit
• Send newsletter emails (only if you opted in)
• Respond to your inquiries and support requests
• Analyze site usage to improve user experience
• Comply with legal obligations`,
  },
  {
    title: "Cookies",
    content: `MyCareerly uses cookies to improve your browsing experience. These include essential cookies required for the site to function, and analytics cookies to understand how visitors use our site.

You can control cookies through your browser settings. Disabling cookies may affect some functionality of the site.`,
  },
  {
    title: "Third-Party Services",
    content: `We use the following third-party services that may collect data:
• Google Maps — for displaying florist locations (subject to Google's Privacy Policy)
• Google Places API — for fetching business reviews and photos
• Analytics providers — for understanding site traffic

These services have their own privacy policies and we encourage you to review them.`,
  },
  {
    title: "Data Sharing",
    content: `We do not sell, trade, or rent your personal information to third parties. We may share data with trusted service providers who assist in operating our website, subject to confidentiality agreements.

We may disclose information if required by law or to protect the rights and safety of MyCareerly and its users.`,
  },
  {
    title: "Data Retention",
    content: `We retain your information for as long as necessary to provide our services. Newsletter subscribers can unsubscribe at any time. Florist listing submissions are retained until you request removal.`,
  },
  {
    title: "Your Rights",
    content: `You have the right to:
• Access the personal information we hold about you
• Request correction of inaccurate information
• Request deletion of your personal information
• Opt out of newsletter communications at any time

To exercise any of these rights, contact us at privacy@mycareerly.com.`,
  },
  {
    title: "Children's Privacy",
    content: `MyCareerly is not directed at children under 13 years of age. We do not knowingly collect personal information from children. If you believe we have inadvertently collected such information, please contact us immediately.`,
  },
  {
    title: "Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. We will notify users of significant changes by updating the date at the top of this page. Continued use of MyCareerly after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: "Contact Us",
    content: `If you have questions about this Privacy Policy, please contact us at:\n\nEmail: privacy@mycareerly.com\nWebsite: mycareerly.com/contact`,
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FAFAF8] pt-16">

        {/* Breadcrumb */}
        <div className="bg-white border-b border-[#E8E4DF] px-5 md:px-8 py-3">
          <div className="max-w-4xl mx-auto flex items-center gap-2 text-xs text-[#6B6B6B]">
            <Link href="/" className="hover:text-[#E8705A] transition-colors">Home</Link>
            <ChevronRight size={12} />
            <span className="text-[#1A1A1A] font-medium">Privacy Policy</span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-5 md:px-8 py-12">
          <div className="bg-white border border-[#E8E4DF] rounded-3xl p-8 md:p-12">

            <div className="mb-10">
              <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">Privacy Policy</h1>
              <p className="text-sm text-[#6B6B6B]">Last updated: April 21, 2026</p>
              <p className="text-sm text-[#6B6B6B] mt-3 leading-relaxed">
                MyCareerly ("we", "us", or "our") is committed to protecting your privacy. This policy explains how we handle information collected through mycareerly.com.
              </p>
            </div>

            <div className="space-y-8">
              {sections.map((section, i) => (
                <div key={i} className="border-t border-[#E8E4DF] pt-8 first:border-0 first:pt-0">
                  <h2 className="text-lg font-bold text-[#1A1A1A] mb-3">{i + 1}. {section.title}</h2>
                  <p className="text-sm text-[#4A4A4A] leading-relaxed whitespace-pre-line">{section.content}</p>
                </div>
              ))}
            </div>

          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-[#8A8A8A]">
              Questions? <Link href="/contact" className="text-[#E8705A] hover:underline">Contact us</Link> or email <a href="mailto:privacy@mycareerly.com" className="text-[#E8705A] hover:underline">privacy@mycareerly.com</a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
