import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "../components/NavbarServer";
import Footer from "../components/Footer";
import ContactForm from "./ContactForm";
import { ChevronRight, Mail, Clock, MapPin, MessageSquare } from "lucide-react";

const SITE_URL = "https://mycareerly.com";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with MyCareerly. Questions about listings, articles, partnerships, or general inquiries — we're here to help.",
  alternates: { canonical: `${SITE_URL}/contact` },
  openGraph: {
    title: "Contact MyCareerly",
    description: "Reach out to our team for listing inquiries, editorial questions, or partnerships.",
    url: `${SITE_URL}/contact`,
    type: "website",
  },
};

const cards = [
  {
    icon: Mail,
    title: "General Inquiries",
    desc: "Questions about MyCareerly, partnerships, or press",
    value: "hello@mycareerly.com",
    href: "mailto:hello@mycareerly.com",
  },
  {
    icon: MessageSquare,
    title: "Editorial",
    desc: "Article pitches, corrections, or content feedback",
    value: "editorial@mycareerly.com",
    href: "mailto:editorial@mycareerly.com",
  },
  {
    icon: MapPin,
    title: "Florist Listings",
    desc: "Help with your listing submission or updates",
    value: "listings@mycareerly.com",
    href: "mailto:listings@mycareerly.com",
  },
  {
    icon: Clock,
    title: "Response Time",
    desc: "We reply to all messages within",
    value: "2 business days",
    href: null,
  },
];

export default function ContactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        name: "Contact MyCareerly",
        description: "Reach out to MyCareerly for general inquiries, listing questions, editorial pitches, or partnerships.",
        url: `${SITE_URL}/contact`,
      },
      {
        "@type": "Organization",
        name: "MyCareerly",
        url: SITE_URL,
        contactPoint: cards.filter((c) => c.href).map((c) => ({
          "@type": "ContactPoint",
          contactType: c.title,
          email: c.value,
          availableLanguage: "English",
          areaServed: "US",
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Contact", item: `${SITE_URL}/contact` },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <main className="min-h-screen bg-[#FAFAF8] pt-16">

        {/* Breadcrumb */}
        <div className="bg-white border-b border-[#E8E4DF] px-5 md:px-8 py-3">
          <div className="max-w-6xl mx-auto flex items-center gap-2 text-xs text-[#6B6B6B]">
            <Link href="/" className="hover:text-[#E8705A] transition-colors">Home</Link>
            <ChevronRight size={12} />
            <span className="text-[#1A1A1A] font-medium">Contact</span>
          </div>
        </div>

        {/* Hero */}
        <section className="bg-white border-b border-[#E8E4DF] py-14 px-5 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-[#F9EBE8] text-[#E8705A] text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              🌸 We&apos;d love to hear from you
            </div>
            <h1 className="text-4xl font-bold text-[#1A1A1A] mb-3">Get in Touch</h1>
            <p className="text-[#6B6B6B] text-base max-w-xl leading-relaxed">
              Whether you&apos;re a florist looking to get listed, a writer with a pitch, or just have a question — we&apos;re here.
            </p>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-5 md:px-8 py-12">
          <div className="grid lg:grid-cols-5 gap-10">

            {/* Left: info cards */}
            <div className="lg:col-span-2 space-y-4">
              {cards.map(({ icon: Icon, title, desc, value, href }) => (
                <div key={title} className="bg-white border border-[#E8E4DF] rounded-2xl p-5 flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#F9EBE8] rounded-xl flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-[#E8705A]" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[#1A1A1A]">{title}</p>
                    <p className="text-xs text-[#6B6B6B] mt-0.5 mb-1">{desc}</p>
                    {href ? (
                      <a href={href} className="text-sm font-medium text-[#E8705A] hover:underline">{value}</a>
                    ) : (
                      <p className="text-sm font-medium text-[#1A1A1A]">{value}</p>
                    )}
                  </div>
                </div>
              ))}

              <div className="bg-[#F9EBE8] border border-[#E8705A]/20 rounded-2xl p-5">
                <p className="font-semibold text-sm text-[#1A1A1A] mb-1">Want to list your shop?</p>
                <p className="text-xs text-[#6B6B6B] mb-3">Submit your flower shop to our directory for free.</p>
                <Link href="/listings/create"
                  className="inline-flex items-center gap-1.5 bg-[#E8705A] hover:bg-[#C95540] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors">
                  List Your Shop <ChevronRight size={12} />
                </Link>
              </div>
            </div>

            {/* Right: contact form */}
            <div className="lg:col-span-3">
              <div className="bg-white border border-[#E8E4DF] rounded-3xl p-8">
                <h2 className="text-lg font-bold text-[#1A1A1A] mb-1">Send us a message</h2>
                <p className="text-sm text-[#6B6B6B] mb-6">Fill out the form and we&apos;ll get back to you shortly.</p>
                <ContactForm />
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
