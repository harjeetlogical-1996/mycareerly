import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "../../components/NavbarServer";
import Footer from "../../components/Footer";
import {
  ArrowLeft, ArrowRight, Mail, CheckCircle2, XCircle,
  PenLine, Users, BarChart2, BookOpen, Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Write for Us | Guest Post on MyCareerly",
  description:
    "Share your flower expertise with 50,000+ monthly readers. We accept guest posts on flower care, gifting, seasonal guides, and wedding floristry from US-based experts.",
};

const CONTACT_EMAIL = "editorial@mycareerly.com";

const process = [
  {
    step: "01",
    title: "Send Your Pitch",
    desc: "Email us a 2–3 sentence pitch with your proposed title, what angle you're taking, and why our audience will love it.",
    icon: Mail,
    color: "#E8705A",
    bg: "#FEF0ED",
  },
  {
    step: "02",
    title: "We Review",
    desc: "Our editorial team reviews every pitch within 3–5 business days. If it's a fit, we'll send you writing guidelines and a deadline.",
    icon: BookOpen,
    color: "#7A9E7E",
    bg: "#EDF5EE",
  },
  {
    step: "03",
    title: "Write & Submit",
    desc: "Write your article following our style guide. Submit it as a Google Doc or plain text file to our editorial email.",
    icon: PenLine,
    color: "#C95540",
    bg: "#FEF0ED",
  },
  {
    step: "04",
    title: "Published",
    desc: "After a light editorial pass, your article goes live with your full byline, bio, and a link back to your site or shop.",
    icon: Sparkles,
    color: "#7A9E7E",
    bg: "#EDF5EE",
  },
];

const weAccept = [
  "Flower care guides (roses, tulips, orchids, seasonal blooms)",
  "Seasonal gifting guides with practical recommendations",
  "Wedding and event floristry planning advice",
  "DIY arrangement tutorials with step-by-step instructions",
  "Expert opinions on flower trends, varieties, or industry topics",
  "Real stories from florists, flower farmers, or passionate hobbyists",
];

const weDontAccept = [
  "Purely promotional content about your business",
  "Articles already published elsewhere (no duplicate content)",
  "Generic AI-generated content with no personal expertise",
  "Topics unrelated to flowers, plants, or floristry",
  "Content targeting markets outside the USA",
];

const benefits = [
  { icon: Users, value: "50K+", label: "Monthly Readers", color: "#E8705A", bg: "#FEF0ED" },
  { icon: BarChart2, value: "500+", label: "Articles Published", color: "#7A9E7E", bg: "#EDF5EE" },
  { icon: CheckCircle2, value: "DA 40+", label: "Domain Authority", color: "#C95540", bg: "#FEF0ED" },
  { icon: BookOpen, value: "Free", label: "No Fees, Ever", color: "#7A9E7E", bg: "#EDF5EE" },
];

const guidelines = [
  { label: "Word count", value: "800 – 2,000 words" },
  { label: "Language", value: "English (US)" },
  { label: "Images", value: "High-res, royalty-free only" },
  { label: "Links", value: "1 author bio link allowed" },
  { label: "Turnaround", value: "3–5 days editorial review" },
  { label: "Format", value: "Google Doc or plain text" },
];

export default function WriteForUsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FAFAF8] pt-16">

        {/* Hero */}
        <section className="bg-white border-b border-[#E8E4DF] px-5 md:px-8 py-16">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 text-sm text-[#6B6B6B] hover:text-[#1A1A1A] mb-6 transition-colors"
            >
              <ArrowLeft size={14} /> Back to Articles
            </Link>

            <div className="inline-flex items-center gap-2 bg-[#F9EBE8] border border-[#E8705A]/20 rounded-full px-4 py-1.5 mb-5">
              <PenLine size={14} className="text-[#E8705A]" />
              <span className="text-xs font-600 text-[#E8705A] uppercase tracking-wider">
                Guest Post
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-800 tracking-tight text-[#1A1A1A] mb-5 leading-tight">
              Write for <span className="text-[#E8705A]">MyCareerly</span>
            </h1>
            <p className="text-[#6B6B6B] text-lg leading-relaxed max-w-2xl mb-8">
              Share your flower expertise with over 50,000 monthly readers across the USA.
              We publish practical, expert-led articles on flower care, gifting, weddings,
              and seasonal floristry — written by real people who love what they do.
            </p>

            <a
              href={`mailto:${CONTACT_EMAIL}?subject=Guest Post Pitch — [Your Article Title]`}
              className="inline-flex items-center gap-2 bg-[#E8705A] hover:bg-[#C95540] text-white font-600 px-8 py-4 rounded-2xl transition-all hover:shadow-[0_8px_30px_rgba(232,112,90,0.4)] group text-sm"
            >
              <Mail size={16} />
              Send Your Pitch
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <p className="text-xs text-[#6B6B6B] mt-3">
              Email your pitch to{" "}
              <span className="font-600 text-[#1A1A1A]">{CONTACT_EMAIL}</span>
            </p>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-5 md:px-8 py-14 space-y-16">

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {benefits.map(({ icon: Icon, value, label, color, bg }) => (
              <div
                key={label}
                className="bg-white border border-[#E8E4DF] rounded-2xl p-5 text-center"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: bg }}
                >
                  <Icon size={18} style={{ color }} />
                </div>
                <p className="text-xl font-800 text-[#1A1A1A]">{value}</p>
                <p className="text-xs text-[#6B6B6B] mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* How it works */}
          <div>
            <h2 className="text-2xl font-700 text-[#1A1A1A] mb-8">How It Works</h2>
            <div className="grid md:grid-cols-2 gap-5">
              {process.map(({ step, title, desc, icon: Icon, color, bg }) => (
                <div
                  key={step}
                  className="bg-white border border-[#E8E4DF] rounded-3xl p-6 flex gap-4"
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ background: bg }}
                  >
                    <Icon size={20} style={{ color }} />
                  </div>
                  <div>
                    <p className="text-xs font-700 text-[#6B6B6B] tracking-widest mb-1">STEP {step}</p>
                    <h3 className="font-700 text-[#1A1A1A] mb-1">{title}</h3>
                    <p className="text-sm text-[#6B6B6B] leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What we accept / don't */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border border-[#E8E4DF] rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <CheckCircle2 size={18} className="text-[#7A9E7E]" />
                <h2 className="font-700 text-[#1A1A1A]">What We Accept</h2>
              </div>
              <ul className="space-y-3">
                {weAccept.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 bg-[#7A9E7E] rounded-full mt-2 shrink-0" />
                    <span className="text-sm text-[#4A4A4A] leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-[#E8E4DF] rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <XCircle size={18} className="text-[#E8705A]" />
                <h2 className="font-700 text-[#1A1A1A]">What We Don't Accept</h2>
              </div>
              <ul className="space-y-3">
                {weDontAccept.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 bg-[#E8705A] rounded-full mt-2 shrink-0" />
                    <span className="text-sm text-[#4A4A4A] leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-white border border-[#E8E4DF] rounded-3xl p-6">
            <h2 className="font-700 text-[#1A1A1A] mb-5">Quick Guidelines</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {guidelines.map(({ label, value }) => (
                <div key={label} className="bg-[#FAFAF8] rounded-2xl px-4 py-3">
                  <p className="text-xs text-[#6B6B6B] mb-0.5">{label}</p>
                  <p className="text-sm font-600 text-[#1A1A1A]">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pitch tips */}
          <div className="bg-gradient-to-br from-[#F9EBE8] to-[#FEF0ED] border border-[#E8705A]/20 rounded-3xl p-8">
            <h2 className="font-700 text-[#1A1A1A] text-xl mb-2">What to Include in Your Pitch</h2>
            <p className="text-sm text-[#6B6B6B] mb-6">
              Keep it short. A good pitch takes 2 minutes to read and answers these questions:
            </p>
            <div className="space-y-3">
              {[
                "Your proposed article title (clear and specific)",
                "A 2–3 sentence summary of what the article covers",
                "Why MyCareerly's audience will find it useful",
                "Your name, bio, and any relevant credentials or experience",
                "Links to any previously published articles (optional but helpful)",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-[#E8705A] text-white text-xs font-700 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm text-[#4A4A4A] leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-white border border-[#E8E4DF] rounded-3xl p-10">
            <div className="w-14 h-14 bg-[#F9EBE8] rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Mail size={24} className="text-[#E8705A]" />
            </div>
            <h2 className="text-2xl font-700 text-[#1A1A1A] mb-2">Ready to Pitch?</h2>
            <p className="text-[#6B6B6B] text-sm mb-6 max-w-sm mx-auto">
              Send your pitch to our editorial team and we'll get back to you within 3–5 business days.
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=Guest Post Pitch — [Your Article Title]`}
              className="inline-flex items-center gap-2 bg-[#E8705A] hover:bg-[#C95540] text-white font-600 px-8 py-3.5 rounded-2xl transition-all hover:shadow-[0_8px_30px_rgba(232,112,90,0.4)] group"
            >
              <Mail size={16} />
              {CONTACT_EMAIL}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
