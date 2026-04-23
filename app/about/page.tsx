import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "../components/NavbarServer";
import Footer from "../components/Footer";
import { prisma } from "../lib/prisma";
import { Flower2, MapPin, BookOpen, Users, CheckCircle2, Heart, ShieldCheck, Mail } from "lucide-react";

const SITE_URL = "https://mycareerly.com";

export const metadata: Metadata = {
  title: "About MyCareerly — America's Flower Shop Directory",
  description: "Learn about MyCareerly's mission: helping Americans find verified local florists across 50+ cities with expert guides, real reviews, and trusted recommendations.",
  keywords: "about mycareerly, flower directory usa, trusted florist reviews, local flower shops",
  openGraph: {
    title: "About MyCareerly | Flower Shop Directory",
    description: "America's trusted flower shop directory — 500+ verified florists, expert guides, 1900+ flower reference.",
    url: `${SITE_URL}/about`,
    type: "website",
  },
  alternates: { canonical: `${SITE_URL}/about` },
};

export default async function AboutPage() {
  const [listings, articles, authors, cities] = await Promise.all([
    prisma.listing.count({ where: { status: "approved" } }),
    prisma.article.count({ where: { status: "published" } }),
    prisma.author.count({ where: { active: true } }),
    prisma.city.count({ where: { active: true } }),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About MyCareerly",
    description: "America's trusted flower shop directory and florist resource.",
    url: `${SITE_URL}/about`,
    mainEntity: {
      "@type": "Organization",
      name: "MyCareerly",
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      description: "MyCareerly is America's trusted flower shop directory. We help people find verified local florists across 50+ US cities and publish expert flower guides.",
      foundingDate: "2024",
      areaServed: { "@type": "Country", name: "United States" },
      knowsAbout: ["Flowers", "Florists", "Flower Care", "Wedding Flowers", "Gift Flowers", "Flower Delivery"],
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <main className="min-h-screen bg-[#FAFAF8] pt-16">

        {/* Hero */}
        <section className="relative bg-gradient-to-b from-[#F9EBE8] to-white py-20 px-5 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur-sm text-[#E8705A] text-xs font-semibold px-3 py-1.5 rounded-full mb-4 border border-[#E8705A]/20">
              <Flower2 size={11} /> America's Flower Directory
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-[#1A1A1A] leading-tight mb-4">
              Helping America find the <span className="text-[#E8705A]">perfect flowers</span>
            </h1>
            <p className="text-lg text-[#6B6B6B] leading-relaxed max-w-2xl mx-auto">
              MyCareerly is where flower lovers meet trusted florists. We verify every shop, write every guide, and make sure you never have to settle for sad grocery-store bouquets again.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="py-10 px-5 md:px-8 bg-white border-y border-[#E8E4DF]">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Verified Florists", value: `${listings}+` },
              { label: "US Cities", value: `${cities}+` },
              { label: "Expert Articles", value: `${articles}+` },
              { label: "Contributing Experts", value: authors },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-[#E8705A]">{value}</p>
                <p className="text-xs text-[#6B6B6B] mt-1 font-medium uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Mission */}
        <section className="py-16 px-5 md:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <Heart size={18} className="text-[#E8705A]" />
              <p className="text-xs font-semibold text-[#E8705A] uppercase tracking-wider">Our Mission</p>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-5 leading-tight">
              Connect every American with a great local florist
            </h2>
            <div className="prose prose-lg text-[#4A4A4A] leading-relaxed space-y-4">
              <p>
                Getting flowers should be joyful. But for most Americans, it means either a panicky grocery-store run
                or wading through dozens of identical directory sites cluttered with affiliate links. We built MyCareerly
                because flowers deserve better.
              </p>
              <p>
                Every florist on our directory is <strong>manually reviewed</strong> for quality, freshness, and customer
                service before we list them. We read the reviews. We check the photos. If a shop feels off, it doesn't
                make the cut. That's it — no paid "top shop" placements, no sponsored content disguised as editorial.
              </p>
              <p>
                Beyond the directory, our expert guides are written by real florists, horticulturists, and floral designers —
                not AI-generated fluff. When we tell you how long peonies will last in a vase, it's because we've done it
                ourselves (and watched our own wilt a thousand times figuring it out).
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 px-5 md:px-8 bg-white border-y border-[#E8E4DF]">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-10 text-center">
              What we stand for
            </h2>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                {
                  icon: ShieldCheck,
                  title: "Manually Verified",
                  desc: "Every flower shop on our directory gets a human review before going live. We check reviews, photos, hours, and service quality. No bots. No shortcuts.",
                },
                {
                  icon: Users,
                  title: "Expert Contributors",
                  desc: "Our guides come from real floral professionals — florists with decades of experience, horticulturists, and botanical researchers. No anonymous AI content.",
                },
                {
                  icon: Heart,
                  title: "Independent Editorial",
                  desc: "We don't take money to list florists. Editor's picks are based on quality alone. Our recommendations are honest because our readers are more important than our margins.",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-[#FAFAF8] border border-[#E8E4DF] rounded-3xl p-6">
                  <div className="w-11 h-11 bg-[#F9EBE8] rounded-2xl flex items-center justify-center mb-4">
                    <Icon size={20} className="text-[#E8705A]" />
                  </div>
                  <h3 className="font-bold text-[#1A1A1A] mb-2">{title}</h3>
                  <p className="text-sm text-[#4A4A4A] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What you'll find */}
        <section className="py-16 px-5 md:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-8 text-center">
              Everything you need, in one place
            </h2>
            <div className="grid md:grid-cols-2 gap-5">
              {[
                {
                  icon: MapPin,
                  title: "Find a Florist Near You",
                  desc: `Browse ${listings}+ verified local flower shops across ${cities}+ US cities. Real reviews, real hours, real photos.`,
                  href: "/listings",
                  cta: "Browse Florists",
                },
                {
                  icon: BookOpen,
                  title: "Expert Flower Guides",
                  desc: `${articles}+ in-depth guides on flower care, gifting, weddings, meanings, and seasonal picks. Written by real experts.`,
                  href: "/articles",
                  cta: "Read Guides",
                },
                {
                  icon: Flower2,
                  title: "A-Z Flower Reference",
                  desc: "Over 1,900 flower names alphabetized with meanings and descriptions. The most comprehensive flower reference on the web.",
                  href: "/all-flower-names-a-to-z-complete-guide",
                  cta: "Explore A-Z",
                },
                {
                  icon: Users,
                  title: "Join as a Florist",
                  desc: "Run a flower shop? Get listed on MyCareerly for free. Setup takes 5 minutes — we'll handle the rest.",
                  href: "/listings/create",
                  cta: "List Your Shop",
                },
              ].map(({ icon: Icon, title, desc, href, cta }) => (
                <Link key={href} href={href}
                  className="bg-white border border-[#E8E4DF] rounded-3xl p-6 hover:border-[#E8705A] hover:-translate-y-0.5 transition-all group">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-[#F9EBE8] rounded-2xl flex items-center justify-center shrink-0">
                      <Icon size={20} className="text-[#E8705A]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-[#1A1A1A] mb-1.5 group-hover:text-[#E8705A] transition-colors">{title}</h3>
                      <p className="text-sm text-[#4A4A4A] leading-relaxed mb-3">{desc}</p>
                      <p className="text-xs font-semibold text-[#E8705A]">{cta} →</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Trust signals */}
        <section className="py-16 px-5 md:px-8 bg-white border-t border-[#E8E4DF]">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">Trusted by flower lovers across America</h2>
            <p className="text-[#6B6B6B] mb-8 leading-relaxed">
              Whether you're sending birthday flowers in Brooklyn, planning a wedding in Nashville, or picking up a bouquet for yourself in San Diego — we're here to help you find the right local florist.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/contact" className="inline-flex items-center gap-2 bg-[#E8705A] hover:bg-[#C95540] text-white font-semibold px-6 py-3 rounded-2xl text-sm transition-colors">
                <Mail size={14} /> Get in Touch
              </Link>
              <Link href="/articles/write" className="inline-flex items-center gap-2 bg-white border border-[#E8E4DF] hover:border-[#E8705A] text-[#4A4A4A] hover:text-[#E8705A] font-semibold px-6 py-3 rounded-2xl text-sm transition-colors">
                <BookOpen size={14} /> Write for Us
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
