"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Menu, X, Flower2, ChevronDown, BookOpen, Store, MapPin, Building2, PlusCircle, Heart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import NavSearch from "./NavSearch";

type Category = { id: string; name: string; slug: string; color: string };

// Top-level static links (Listings + Articles handled separately as dropdowns)
const topLinks = [
  { label: "Home", href: "/" },
];

const tailLinks = [
  { label: "Gift Finder", href: "/tools/gift-finder", highlight: true },
  { label: "Tools",       href: "/tools" },
  { label: "Flowers A–Z", href: "/all-flower-names-a-to-z-complete-guide" },
];

const listingsItems = [
  { label: "All Florists", href: "/listings",        icon: Store,      desc: "Browse 500+ verified shops" },
  { label: "By City",      href: "/cities",          icon: MapPin,     desc: "51 US cities covered" },
  { label: "By State",     href: "/florists",        icon: Building2,  desc: "All 50 states + DC" },
  { label: "List Your Shop", href: "/listings/create", icon: PlusCircle, desc: "Free listing in 5 mins" },
];

export default function Navbar({ logoUrl, siteName = "MyCareerly" }: { logoUrl?: string; siteName?: string } = {}) {
  const [scrolled, setScrolled]               = useState(false);
  const [mobileOpen, setMobileOpen]           = useState(false);
  const [articlesOpen, setArticlesOpen]       = useState(false);
  const [listingsOpen, setListingsOpen]       = useState(false);
  const [mobileArticlesOpen, setMobileArticlesOpen] = useState(false);
  const [mobileListingsOpen, setMobileListingsOpen] = useState(false);
  const [categories, setCategories]           = useState<Category[]>([]);
  const articlesRef = useRef<HTMLLIElement>(null);
  const listingsRef = useRef<HTMLLIElement>(null);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then(setCategories).catch(() => {});
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (articlesRef.current && !articlesRef.current.contains(e.target as Node)) setArticlesOpen(false);
      if (listingsRef.current && !listingsRef.current.contains(e.target as Node)) setListingsOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // Close dropdowns when route changes
  useEffect(() => {
    setArticlesOpen(false);
    setListingsOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  const isArticlesActive = pathname.startsWith("/articles");
  const isListingsActive = pathname.startsWith("/listings") || pathname.startsWith("/cities") || pathname.startsWith("/florists");

  const linkClass = (active: boolean) =>
    `px-3.5 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
      active ? "bg-[#F9EBE8] text-[#E8705A]" : "text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F9EBE8]"
    }`;

  const highlightClass = (active: boolean) =>
    `inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
      active
        ? "bg-[#E8705A] text-white"
        : "bg-[#F9EBE8] text-[#E8705A] hover:bg-[#fde1db]"
    }`;

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || !isHome
          ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-[#E8E4DF]"
          : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0" aria-label={siteName}>
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={siteName}
                className="h-10 w-auto object-contain group-hover:opacity-90 transition-opacity"
              />
            ) : (
              <>
                <div className="w-8 h-8 bg-[#E8705A] rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Flower2 size={18} className="text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight text-[#1A1A1A]">
                  My<span className="text-[#E8705A]">Careerly</span>
                </span>
              </>
            )}
          </Link>

          {/* Desktop nav */}
          <ul className="hidden lg:flex items-center gap-0.5">

            {/* Home */}
            {topLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass(pathname === link.href)}>
                  {link.label}
                </Link>
              </li>
            ))}

            {/* Listings dropdown */}
            <li ref={listingsRef} className="relative">
              <button
                onClick={() => { setListingsOpen((o) => !o); setArticlesOpen(false); }}
                className={`flex items-center gap-1 ${linkClass(isListingsActive)}`}
              >
                Listings
                <ChevronDown size={13} className={`transition-transform ${listingsOpen ? "rotate-180" : ""}`} />
              </button>

              {listingsOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-[#E8E4DF] rounded-2xl shadow-xl py-2 z-50">
                  {listingsItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setListingsOpen(false)}
                        className="flex items-start gap-3 px-4 py-2.5 hover:bg-[#FAFAF8] transition-colors group"
                      >
                        <div className="w-8 h-8 bg-[#F9EBE8] rounded-lg flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#E8705A]/20 transition-colors">
                          <Icon size={14} className="text-[#E8705A]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#1A1A1A] group-hover:text-[#E8705A] transition-colors">{item.label}</p>
                          <p className="text-xs text-[#9A9A9A]">{item.desc}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </li>

            {/* Articles dropdown */}
            <li ref={articlesRef} className="relative">
              <button
                onClick={() => { setArticlesOpen((o) => !o); setListingsOpen(false); }}
                className={`flex items-center gap-1 ${linkClass(isArticlesActive)}`}
              >
                Articles
                <ChevronDown size={13} className={`transition-transform ${articlesOpen ? "rotate-180" : ""}`} />
              </button>

              {articlesOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-[#E8E4DF] rounded-2xl shadow-xl py-2 z-50">
                  <Link href="/articles"
                    onClick={() => setArticlesOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-[#1A1A1A] hover:bg-[#F9EBE8] hover:text-[#E8705A] transition-colors">
                    <BookOpen size={14} className="text-[#E8705A]" />
                    All Articles
                  </Link>

                  {categories.length > 0 && (
                    <>
                      <div className="mx-4 my-1 border-t border-[#E8E4DF]" />
                      <p className="px-4 py-1 text-[10px] font-semibold text-[#8A8A8A] uppercase tracking-wider">Categories</p>
                      {categories.map((cat) => (
                        <Link key={cat.id}
                          href={`/articles/category/${cat.slug}`}
                          onClick={() => setArticlesOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#6B6B6B] hover:bg-[#F9EBE8] hover:text-[#E8705A] transition-colors">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cat.color }} />
                          {cat.name}
                        </Link>
                      ))}
                    </>
                  )}
                </div>
              )}
            </li>

            {/* Tail links: Gift Finder (highlighted) + Tools + Flowers A-Z */}
            {tailLinks.map((link) => (
              <li key={link.href}>
                {link.highlight ? (
                  <Link
                    href={link.href}
                    className={highlightClass(pathname === link.href)}
                  >
                    <Heart size={12} /> {link.label}
                  </Link>
                ) : (
                  <Link href={link.href} className={linkClass(pathname === link.href)}>
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <NavSearch />
            <Link href="/listings"
              className="hidden sm:flex items-center gap-2 bg-[#E8705A] hover:bg-[#C95540] text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
              Find a Shop
            </Link>
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#F9EBE8] text-[#1A1A1A] transition-colors" aria-label="Menu">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`fixed inset-0 z-40 transition-all duration-300 lg:hidden ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        <div className={`absolute top-0 right-0 w-72 h-full bg-white shadow-2xl transition-transform duration-300 overflow-y-auto ${mobileOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="p-6 pt-20">
            <ul className="space-y-1">

              {/* Home */}
              {topLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-3 text-base font-medium rounded-xl transition-all ${pathname === link.href ? "bg-[#F9EBE8] text-[#E8705A]" : "text-[#1A1A1A] hover:bg-[#F9EBE8] hover:text-[#E8705A]"}`}>
                    {link.label}
                  </Link>
                </li>
              ))}

              {/* Listings collapsible */}
              <li>
                <button onClick={() => setMobileListingsOpen((o) => !o)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-base font-medium rounded-xl transition-all ${isListingsActive ? "bg-[#F9EBE8] text-[#E8705A]" : "text-[#1A1A1A] hover:bg-[#F9EBE8] hover:text-[#E8705A]"}`}>
                  Listings
                  <ChevronDown size={14} className={`transition-transform ${mobileListingsOpen ? "rotate-180" : ""}`} />
                </button>
                {mobileListingsOpen && (
                  <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-[#F9EBE8] pl-3">
                    {listingsItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-[#1A1A1A] hover:text-[#E8705A] transition-colors"
                        >
                          <Icon size={13} className="text-[#E8705A]" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </li>

              {/* Articles collapsible */}
              <li>
                <button onClick={() => setMobileArticlesOpen((o) => !o)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-base font-medium rounded-xl transition-all ${isArticlesActive ? "bg-[#F9EBE8] text-[#E8705A]" : "text-[#1A1A1A] hover:bg-[#F9EBE8] hover:text-[#E8705A]"}`}>
                  Articles
                  <ChevronDown size={14} className={`transition-transform ${mobileArticlesOpen ? "rotate-180" : ""}`} />
                </button>
                {mobileArticlesOpen && (
                  <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-[#F9EBE8] pl-3">
                    <Link href="/articles" onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2 text-sm font-semibold text-[#1A1A1A] hover:text-[#E8705A] transition-colors">
                      All Articles
                    </Link>
                    {categories.map((cat) => (
                      <Link key={cat.id} href={`/articles/category/${cat.slug}`} onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-[#6B6B6B] hover:text-[#E8705A] transition-colors">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: cat.color }} />
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </li>

              {/* Tail links — Gift Finder highlighted */}
              {tailLinks.map((link) => (
                <li key={link.href}>
                  {link.highlight ? (
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-2 px-4 py-3 text-base font-semibold rounded-xl transition-all ${
                        pathname === link.href
                          ? "bg-[#E8705A] text-white"
                          : "bg-[#F9EBE8] text-[#E8705A] hover:bg-[#fde1db]"
                      }`}
                    >
                      <Heart size={14} /> {link.label}
                    </Link>
                  ) : (
                    <Link href={link.href} onClick={() => setMobileOpen(false)}
                      className={`block px-4 py-3 text-base font-medium rounded-xl transition-all ${pathname === link.href ? "bg-[#F9EBE8] text-[#E8705A]" : "text-[#1A1A1A] hover:bg-[#F9EBE8] hover:text-[#E8705A]"}`}>
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-6 pt-6 border-t border-[#E8E4DF]">
              <NavSearch mobile />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
