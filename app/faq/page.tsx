import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "../components/NavbarServer";
import Footer from "../components/Footer";
import { ChevronRight, HelpCircle } from "lucide-react";

const SITE_URL = "https://mycareerly.com";

export const metadata: Metadata = {
  title: "Frequently Asked Questions — MyCareerly Help Center",
  description: "Answers to common questions about finding florists, flower care, wedding flowers, delivery, pet safety, and listing your shop on MyCareerly.",
  keywords: "mycareerly faq, flower delivery questions, florist help, wedding flowers faq, flower care questions",
  openGraph: {
    title: "FAQ | MyCareerly",
    description: "Answers to common questions about MyCareerly and flowers.",
    url: `${SITE_URL}/faq`,
    type: "website",
  },
  alternates: { canonical: `${SITE_URL}/faq` },
};

type FAQ = { q: string; a: string };

const FAQ_SECTIONS: { title: string; questions: FAQ[] }[] = [
  {
    title: "About MyCareerly",
    questions: [
      {
        q: "What is MyCareerly?",
        a: "MyCareerly is America's trusted flower shop directory. We help people find verified local florists across 50+ US cities and publish expert guides on flower care, gifting, weddings, and more. Every shop on our directory is manually reviewed before listing.",
      },
      {
        q: "Is MyCareerly free to use?",
        a: "Yes, completely free for visitors. Browse florists, read guides, use our A-Z flower reference — all at no cost. Florists can also list their shops for free.",
      },
      {
        q: "How do I find a flower shop near me?",
        a: "Visit our Listings page and filter by city, or use our Near Me feature on the home page to find florists based on your location. We cover 50+ US cities with 500+ verified shops.",
      },
      {
        q: "Are the flower shops on MyCareerly verified?",
        a: "Yes. Every shop is manually reviewed by our editorial team for quality, freshness, customer service, and authenticity before it appears on our directory. We don't auto-list.",
      },
      {
        q: "Can I trust the reviews and ratings?",
        a: "Ratings and reviews come directly from Google Places for established shops, and from verified customer submissions for newer listings. We do not edit or promote fake reviews.",
      },
    ],
  },
  {
    title: "Ordering Flowers",
    questions: [
      {
        q: "Does MyCareerly deliver flowers?",
        a: "No — MyCareerly is a directory. We don't sell or deliver flowers ourselves. You'll order directly from the florist via their phone or website, which we link on every listing.",
      },
      {
        q: "How do I know if a florist offers same-day delivery?",
        a: "Listing cards show a 'Delivery' badge if the florist offers delivery. For same-day availability, call the shop directly — policies vary by time of day and route coverage.",
      },
      {
        q: "What's the average cost of a flower bouquet in the US?",
        a: "Standard hand-tied bouquets typically run $45-$85 in most US cities. Premium arrangements with roses, peonies, or exotics can be $100-$300+. Wedding bouquets start around $150 and scale with complexity.",
      },
      {
        q: "How far in advance should I order for special occasions?",
        a: "For same-day, call before 12 PM local time. For Valentine's Day, Mother's Day, and Christmas, order 1-2 weeks ahead — shops book up fast. Weddings need 2-6 months advance planning.",
      },
      {
        q: "Can I order flowers without a credit card?",
        a: "Some florists accept cash on delivery, Apple Pay, or Google Pay. Most require credit/debit or PayPal. Check individual shop policies on their website or by phone.",
      },
    ],
  },
  {
    title: "Flower Care & Longevity",
    questions: [
      {
        q: "How long do fresh flowers last in a vase?",
        a: "Most cut flowers last 5-10 days with proper care. Roses, tulips, and daisies average 7 days. Carnations and chrysanthemums can last 14+ days. Peonies and hydrangeas typically 5-7 days.",
      },
      {
        q: "What's the best way to keep cut flowers fresh longer?",
        a: "Trim stems at a 45-degree angle underwater, change water every 2 days, add flower food or a tiny bit of sugar with a drop of bleach, keep away from direct sun and fruit (which releases ethylene gas).",
      },
      {
        q: "Why do my roses droop after 2 days?",
        a: "Usually from air bubbles in the stem blocking water uptake. Re-cut stems under running water, use lukewarm water in the vase, and add flower food. Remove leaves below the waterline — they rot and breed bacteria.",
      },
      {
        q: "Are cut flowers toxic to pets?",
        a: "Many are. Lilies are highly toxic to cats (kidney failure). Tulips, daffodils, and hydrangeas are mildly toxic to dogs and cats. Roses, sunflowers, snapdragons, and orchids are generally safe. Always verify for your specific pet.",
      },
    ],
  },
  {
    title: "Weddings & Events",
    questions: [
      {
        q: "How much should I budget for wedding flowers?",
        a: "Typical US wedding flower budgets range from $1,500 (small DIY-friendly) to $8,000+ (full-service premium). The industry average is about 10% of your total wedding budget.",
      },
      {
        q: "When should I book my wedding florist?",
        a: "Book 6-9 months before your wedding date. Popular florists in major cities often fill weekends 12+ months out, especially for peak wedding season (May-October).",
      },
      {
        q: "What flowers are in season for my wedding date?",
        a: "Check our Wedding Flowers by Season guide for a month-by-month breakdown. Generally: peonies (May-June), dahlias (Aug-Oct), tulips (Mar-May), ranunculus (Feb-May), chrysanthemums (Sept-Nov).",
      },
    ],
  },
  {
    title: "For Florists",
    questions: [
      {
        q: "How can my flower shop get listed on MyCareerly?",
        a: "Visit our List Your Shop page and submit your details. You can auto-fetch from your Google Maps URL (fastest) or enter manually. Listings are reviewed within 2 business days.",
      },
      {
        q: "Is listing free?",
        a: "Yes, basic listings are 100% free. We offer optional sponsored placements for shops that want featured positioning, but the core listing is always free.",
      },
      {
        q: "Can I update my listing after it's published?",
        a: "Yes — email us at listings@mycareerly.com with your shop name and the changes. We typically update listings within 24 hours.",
      },
      {
        q: "How do you verify businesses?",
        a: "We cross-check listings against Google Business Profiles, review your website, and verify your phone number with a quick call. We may also request a business license for paid placements.",
      },
    ],
  },
];

export default function FAQPage() {
  const allFaqs = FAQ_SECTIONS.flatMap((s) => s.questions);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allFaqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "FAQ", item: `${SITE_URL}/faq` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <Navbar />
      <main className="min-h-screen bg-[#FAFAF8] pt-16">

        {/* Breadcrumb */}
        <div className="bg-white border-b border-[#E8E4DF] px-5 md:px-8 py-3">
          <div className="max-w-4xl mx-auto flex items-center gap-2 text-xs text-[#6B6B6B]">
            <Link href="/" className="hover:text-[#E8705A] transition-colors">Home</Link>
            <ChevronRight size={12} />
            <span className="text-[#1A1A1A] font-medium">FAQ</span>
          </div>
        </div>

        {/* Hero */}
        <section className="bg-gradient-to-b from-[#F9EBE8] to-white py-14 px-5 md:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 bg-white/80 text-[#E8705A] text-xs font-semibold px-3 py-1.5 rounded-full mb-4 border border-[#E8705A]/20">
              <HelpCircle size={11} /> Help Center
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-3">Frequently Asked Questions</h1>
            <p className="text-[#6B6B6B] text-base leading-relaxed">
              Answers to the most common questions about MyCareerly, flower care, ordering, weddings, and getting your shop listed.
            </p>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-5 md:px-8 py-12 space-y-10">

          {FAQ_SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-bold text-[#1A1A1A] mb-5 flex items-center gap-2">
                <div className="w-1 h-6 rounded-full bg-[#E8705A]" />
                {section.title}
              </h2>
              <div className="space-y-3">
                {section.questions.map((f, i) => (
                  <details key={i} className="group bg-white border border-[#E8E4DF] rounded-2xl overflow-hidden">
                    <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none hover:bg-[#FAFAF8] transition-colors">
                      <span className="font-semibold text-[0.95rem] text-[#1A1A1A] pr-4">{f.q}</span>
                      <span className="w-6 h-6 rounded-full bg-[#E8705A] text-white flex items-center justify-center text-sm shrink-0 font-bold group-open:rotate-45 transition-transform">+</span>
                    </summary>
                    <div className="px-5 pb-5 text-sm text-[#4A4A4A] leading-relaxed border-t border-[#E8E4DF]/50 pt-3">
                      {f.a}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}

          {/* CTA */}
          <section className="bg-[#F9EBE8] border border-[#E8705A]/20 rounded-3xl p-8 text-center mt-12">
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Still have questions?</h2>
            <p className="text-sm text-[#6B6B6B] mb-5">
              Can't find what you're looking for? Our team is happy to help.
            </p>
            <Link href="/contact" className="inline-flex items-center gap-2 bg-[#E8705A] hover:bg-[#C95540] text-white font-semibold px-6 py-3 rounded-2xl text-sm transition-colors">
              Contact Us
            </Link>
          </section>

        </div>
      </main>
      <Footer />
    </>
  );
}
