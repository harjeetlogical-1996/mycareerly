import type { Metadata } from "next";
import Navbar from "../../components/NavbarServer";
import Footer from "../../components/Footer";
import VaseLifeClient from "./VaseLifeClient";
import { VASE_LIFE_FLOWERS } from "../../data/tools-data";

const SITE_URL = "https://mycareerly.com";

export const metadata: Metadata = {
  title: "Vase Life Calculator — How Long Will My Flowers Last?",
  description: "Pick your flower and get an exact care schedule with expected vase life. Learn water temperature, flower food needs, retrimming frequency, and pro tips.",
  keywords: "vase life calculator, how long do cut flowers last, rose vase life, tulip care, flower care schedule, extend flower life",
  openGraph: {
    title: "Vase Life Calculator | MyCareerly",
    description: "Free tool: get a personalized care schedule for any cut flower.",
    url: `${SITE_URL}/tools/vase-life`,
    type: "website",
  },
  alternates: { canonical: `${SITE_URL}/tools/vase-life` },
};

export default function VaseLifePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Extend Cut Flower Vase Life",
    description: "Comprehensive care schedules for every common cut flower to maximize vase life.",
    step: VASE_LIFE_FLOWERS.slice(0, 5).map((f, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: `Care for ${f.name}`,
      text: `${f.name} last ${f.minDays}-${f.maxDays} days with ${f.waterTemp.toLowerCase()} water, ${f.flowerFood.toLowerCase()} flower food, and retrimming every ${f.retrimEvery}.`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <main className="min-h-screen bg-[#FAFAF8] pt-16">
        <VaseLifeClient />
      </main>
      <Footer />
    </>
  );
}
