import type { Metadata } from "next";
import Navbar from "../../components/NavbarServer";
import Footer from "../../components/Footer";
import FlowerMeaningClient from "./FlowerMeaningClient";

const SITE_URL = "https://mycareerly.com";

export const metadata: Metadata = {
  title: "Flower Meaning Translator — Symbolism Across Cultures",
  description: "Pick any flower and see its symbolism in Victorian, Japanese, Chinese, Greek, and Christian traditions. Free interactive cultural flower meaning guide.",
  keywords: "flower meanings, flower symbolism, victorian flower language, japanese hanakotoba, flower meaning translator, cultural flower meanings",
  openGraph: {
    title: "Flower Meaning Translator | MyCareerly",
    description: "Discover what flowers mean across Victorian, Japanese, Chinese, Greek, and Christian traditions.",
    url: `${SITE_URL}/tools/flower-meaning`,
    type: "website",
  },
  alternates: { canonical: `${SITE_URL}/tools/flower-meaning` },
};

export default function FlowerMeaningPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Flower Meaning Translator",
        applicationCategory: "EducationalApplication",
        operatingSystem: "Any browser",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        description: "Free interactive tool to discover flower symbolism across Victorian, Japanese, Chinese, Greek, and Christian cultural traditions.",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Tools", item: `${SITE_URL}/tools` },
          { "@type": "ListItem", position: 3, name: "Flower Meaning Translator", item: `${SITE_URL}/tools/flower-meaning` },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <main className="min-h-screen bg-[#FAFAF8] pt-16">
        <FlowerMeaningClient />
      </main>
      <Footer />
    </>
  );
}
