import Navbar from "./components/NavbarServer";
import Hero from "./components/Hero";
import Articles from "./components/Articles";
import Listings from "./components/Listings";
import Newsletter from "./components/Newsletter";
import Footer from "./components/Footer";
import { ShieldCheck, BookOpen, MapPin, Search } from "lucide-react";

const SITE_URL = "https://mycareerly.com";

const trust = [
  {
    icon: Search,
    title: "Find Local Florists",
    desc: "Search verified flower shops by city or zip code across 50+ major US cities.",
    color: "#E8705A",
    bg: "#FEF0ED",
  },
  {
    icon: ShieldCheck,
    title: "Verified Listings",
    desc: "Every florist on MyCareerly is manually reviewed for quality and customer service before listing.",
    color: "#C95540",
    bg: "#FEF0ED",
  },
  {
    icon: MapPin,
    title: "50+ US Cities",
    desc: "From New York to Los Angeles — find the best local flower shops wherever you are.",
    color: "#7A9E7E",
    bg: "#EDF5EE",
  },
  {
    icon: BookOpen,
    title: "Expert Flower Guides",
    desc: "500+ in-depth articles on flower care, gifting, meanings, and seasonal picks.",
    color: "#E8705A",
    bg: "#FEF0ED",
  },
];

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "MyCareerly",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description:
    "America's trusted flower shop directory. Find verified local florists, read expert flower guides, and order fresh flowers for any occasion.",
  sameAs: [],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Customer Support",
    availableLanguage: "English",
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "MyCareerly",
  url: SITE_URL,
  description: "Find verified local flower shops near you across the USA.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/listings?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const directorySchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Top Flower Shops in the USA",
  description: "Verified local flower shops across major US cities.",
  url: `${SITE_URL}/listings`,
  numberOfItems: 200,
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I find a flower shop near me?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Visit MyCareerly and browse verified flower shops by city. We list 200+ trusted florists across 50+ US cities including New York, Los Angeles, Chicago, and more.",
      },
    },
    {
      "@type": "Question",
      name: "Are the flower shops on MyCareerly verified?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Every flower shop listed on MyCareerly is manually reviewed by our team for quality, freshness, and customer service before being approved.",
      },
    },
    {
      "@type": "Question",
      name: "Is MyCareerly free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. MyCareerly is completely free for visitors. Browse flower shop listings, read expert flower guides, and find the best florist near you — all at no cost.",
      },
    },
    {
      "@type": "Question",
      name: "What cities does MyCareerly cover?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "MyCareerly covers 50+ cities across the USA including New York, Los Angeles, Chicago, Houston, San Francisco, Seattle, Dallas, Phoenix, and Philadelphia.",
      },
    },
    {
      "@type": "Question",
      name: "How can my flower shop get listed on MyCareerly?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Flower shop owners can apply to be listed on MyCareerly through our 'List Your Shop' page. Our team manually reviews every application to ensure quality standards are met.",
      },
    },
  ],
};

export default function Home() {
  return (
    <>
      {/* Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(directorySchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <main>
        <Navbar />
        <Hero />

        {/* Trust bar */}
        <section className="bg-white border-y border-[#E8E4DF] py-12">
          <div className="max-w-7xl mx-auto px-5 md:px-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trust.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="flex gap-4 items-start">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: bg }}
                >
                  <Icon size={20} style={{ color }} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-[#1A1A1A] mb-0.5">{title}</h3>
                  <p className="text-xs text-[#6B6B6B] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Listings />
        <Articles />
        <Newsletter />
        <Footer />
      </main>
    </>
  );
}
