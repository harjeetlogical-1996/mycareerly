import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "../components/NavbarServer";
import Footer from "../components/Footer";
import { ChevronRight } from "lucide-react";

const SITE_URL = "https://mycareerly.com";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "MyCareerly's terms of service. Read the rules and guidelines for using our flower shop directory.",
  alternates: { canonical: `${SITE_URL}/terms` },
  robots: { index: true, follow: false },
};

const sections = [
  {
    title: "Acceptance of Terms",
    content: `By accessing or using MyCareerly (mycareerly.com), you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.

We reserve the right to update these terms at any time. Continued use of the site after changes constitutes acceptance.`,
  },
  {
    title: "Use of the Directory",
    content: `MyCareerly is a flower shop directory for informational purposes. You may use our site to:
• Search for and browse florist listings
• Read flower care guides and articles
• Submit your flower shop for listing consideration

You may not use MyCareerly to scrape data, spam users, submit false information, or engage in any activity that disrupts the site.`,
  },
  {
    title: "Florist Listings",
    content: `Flower shop listings on MyCareerly are manually reviewed before approval. By submitting a listing, you confirm that:
• You are an authorized representative of the business
• All information provided is accurate and current
• You grant MyCareerly a license to display your business information

We reserve the right to reject or remove any listing that violates our guidelines or contains inaccurate information.`,
  },
  {
    title: "User-Submitted Content",
    content: `By submitting content to MyCareerly (including listings, articles, or reviews), you grant us a non-exclusive, royalty-free license to use, display, and distribute that content on our platform.

You are solely responsible for the accuracy of submitted content. MyCareerly does not endorse user-submitted listings or guarantee the quality of listed businesses.`,
  },
  {
    title: "Intellectual Property",
    content: `All content on MyCareerly — including articles, graphics, logos, and design — is the property of MyCareerly and protected by copyright law. You may not reproduce, distribute, or create derivative works without our written permission.

You may link to MyCareerly pages for non-commercial purposes, provided the link does not imply endorsement.`,
  },
  {
    title: "Third-Party Links",
    content: `MyCareerly links to external websites such as florist business websites and Google Maps. We are not responsible for the content, privacy practices, or accuracy of third-party sites. Links do not constitute endorsement.`,
  },
  {
    title: "Disclaimer of Warranties",
    content: `MyCareerly is provided "as is" without warranties of any kind. We do not guarantee the accuracy, completeness, or availability of listings or content. Florist information (hours, availability, pricing) may change without notice.

We are not liable for any loss or damage resulting from reliance on information found on our site.`,
  },
  {
    title: "Limitation of Liability",
    content: `To the fullest extent permitted by law, MyCareerly and its operators shall not be liable for any indirect, incidental, or consequential damages arising from your use of the site or any listed florist services.`,
  },
  {
    title: "Governing Law",
    content: `These Terms of Service are governed by the laws of the United States. Any disputes shall be resolved in the appropriate courts of the United States.`,
  },
  {
    title: "Contact",
    content: `For questions about these Terms of Service, contact us at:\n\nEmail: legal@mycareerly.com\nWebsite: mycareerly.com/contact`,
  },
];

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FAFAF8] pt-16">

        {/* Breadcrumb */}
        <div className="bg-white border-b border-[#E8E4DF] px-5 md:px-8 py-3">
          <div className="max-w-4xl mx-auto flex items-center gap-2 text-xs text-[#6B6B6B]">
            <Link href="/" className="hover:text-[#E8705A] transition-colors">Home</Link>
            <ChevronRight size={12} />
            <span className="text-[#1A1A1A] font-medium">Terms of Service</span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-5 md:px-8 py-12">
          <div className="bg-white border border-[#E8E4DF] rounded-3xl p-8 md:p-12">

            <div className="mb-10">
              <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">Terms of Service</h1>
              <p className="text-sm text-[#6B6B6B]">Last updated: April 21, 2026</p>
              <p className="text-sm text-[#6B6B6B] mt-3 leading-relaxed">
                Please read these Terms of Service carefully before using MyCareerly. These terms govern your use of our flower shop directory and related services.
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
              Questions? <Link href="/contact" className="text-[#E8705A] hover:underline">Contact us</Link> or email <a href="mailto:legal@mycareerly.com" className="text-[#E8705A] hover:underline">legal@mycareerly.com</a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
