import type { Metadata } from "next";
import Navbar from "../../components/NavbarServer";
import Footer from "../../components/Footer";
import WeddingBudgetClient from "./WeddingBudgetClient";

const SITE_URL = "https://mycareerly.com";

export const metadata: Metadata = {
  title: "Wedding Flower Budget Calculator — Estimate Your Florist Costs",
  description: "Calculate your wedding flower budget in seconds. Enter guest count, style, season, and items to get a US-market cost estimate for 2026 weddings.",
  keywords: "wedding flower budget calculator, how much do wedding flowers cost, wedding floral cost estimator, bridal bouquet cost, wedding flowers price",
  openGraph: {
    title: "Wedding Flower Budget Calculator | MyCareerly",
    description: "Free tool: estimate your 2026 wedding flower budget based on guest count, style, and season.",
    url: `${SITE_URL}/tools/wedding-budget`,
    type: "website",
  },
  alternates: { canonical: `${SITE_URL}/tools/wedding-budget` },
};

export default function WeddingBudgetPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Wedding Flower Budget Calculator",
        applicationCategory: "LifestyleApplication",
        operatingSystem: "Any browser",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        description: "Free wedding flower budget calculator using 2026 US market data. Estimates costs based on guest count, floral style, season, and items.",
      },
      {
        "@type": "HowTo",
        name: "How to Calculate Your Wedding Flower Budget",
        totalTime: "PT1M",
        step: [
          { "@type": "HowToStep", position: 1, name: "Enter guests + party size", text: "Add total guest count and number of bridesmaids/groomsmen." },
          { "@type": "HowToStep", position: 2, name: "Choose floral style", text: "Pick from minimal, classic, lush, or extravagant styles." },
          { "@type": "HowToStep", position: 3, name: "Pick season", text: "Spring, summer, fall, or winter — affects flower availability and pricing." },
          { "@type": "HowToStep", position: 4, name: "Select items", text: "Toggle bouquets, ceremony arch, centerpieces, boutonnieres, and other items." },
        ],
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Tools", item: `${SITE_URL}/tools` },
          { "@type": "ListItem", position: 3, name: "Wedding Budget", item: `${SITE_URL}/tools/wedding-budget` },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <main className="min-h-screen bg-[#FAFAF8] pt-16">
        <WeddingBudgetClient />
      </main>
      <Footer />
    </>
  );
}
