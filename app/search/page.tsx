import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "../components/NavbarServer";
import Footer from "../components/Footer";
import SearchClient from "./SearchClient";

const SITE_URL = "https://mycareerly.com";

export const metadata: Metadata = {
  title: "Search — Find Flowers, Florists & Guides",
  description: "Search MyCareerly for flowers, local florists, cities, states, and expert flower guides. Find exactly what you're looking for in seconds.",
  alternates: { canonical: `${SITE_URL}/search` },
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FAFAF8] pt-16">
        <Suspense fallback={<div className="max-w-5xl mx-auto px-5 md:px-8 py-12">Loading…</div>}>
          <SearchClient />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
