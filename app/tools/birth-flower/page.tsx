import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "../../components/NavbarServer";
import Footer from "../../components/Footer";
import BirthFlowerClient from "./BirthFlowerClient";
import { BIRTH_FLOWERS } from "../../data/tools-data";

const SITE_URL = "https://mycareerly.com";

export const metadata: Metadata = {
  title: "Birth Flower Finder — What Is My Birth Flower?",
  description: "Enter your birth month and discover your primary and secondary birth flowers, their meanings, symbolism, and cultural significance. Free instant tool.",
  keywords: "birth flower finder, what is my birth flower, birth flower by month, birth month flowers, january birth flower, february birth flower",
  openGraph: {
    title: "Birth Flower Finder | MyCareerly",
    description: "Discover your birth flower and its meaning in seconds. Free interactive guide for all 12 months.",
    url: `${SITE_URL}/tools/birth-flower`,
    type: "website",
  },
  alternates: { canonical: `${SITE_URL}/tools/birth-flower` },
};

export default function BirthFlowerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: BIRTH_FLOWERS.map((bf) => ({
      "@type": "Question",
      name: `What is the birth flower for ${bf.monthName}?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `The primary birth flower for ${bf.monthName} is the ${bf.primary.name} (${bf.primary.meaning}). The secondary birth flower is the ${bf.secondary.name} (${bf.secondary.meaning}).`,
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <main className="min-h-screen bg-[#FAFAF8] pt-16">
        <Suspense fallback={<div className="py-20 text-center text-[#6B6B6B]">Loading…</div>}>
          <BirthFlowerClient />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
