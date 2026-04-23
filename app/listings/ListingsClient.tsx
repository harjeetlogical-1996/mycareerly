"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Search, MapPin, Star, Clock, CheckCircle2,
  SlidersHorizontal, Plus, ChevronDown, X, Leaf, Truck,
  Navigation, Loader2, ExternalLink,
} from "lucide-react";

type NearbyShop = {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  phone: string;
  website: string;
  isOpen: boolean | null;
  photo: string | null;
};

const PRICE_LABELS: Record<string, string> = { budget: "Budget", mid: "Mid-range", premium: "Premium" };
const PRICE_COLORS: Record<string, string> = { budget: "#7A9E7E", mid: "#E8705A", premium: "#C95540" };

type Hour = { day: string; time: string; closed?: boolean };

type ListingCard = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  address: string;
  city: string;
  phone: string;
  rating: number;
  reviewCount: number;
  images: string[];
  categories: string[];
  tags: string[];
  hours: Hour[];
  open: boolean;
  verified: boolean;
  featured: boolean;
  priceRange: string;
  deliveryAvailable: boolean;
};

export default function ListingsClient({
  listings,
  cities,
  categories,
}: {
  listings: ListingCard[];
  cities: string[];
  categories: string[];
}) {
  const urlParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("All Cities");
  const [category, setCategory] = useState("All");
  const [openOnly, setOpenOnly] = useState(false);
  const [deliveryOnly, setDeliveryOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Sync filters from URL query params (?city=los-angeles, ?category=Roses, ?q=peonies)
  useEffect(() => {
    const cityParam = urlParams.get("city");
    const catParam = urlParams.get("category");
    const q = urlParams.get("q") ?? urlParams.get("search");
    if (cityParam) {
      // Convert slug "los-angeles" → display name "Los Angeles"
      const display = cities.find((c) => c.toLowerCase().replace(/\s+/g, "-") === cityParam.toLowerCase())
        ?? cityParam.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      setCity(display);
      setShowFilters(true);
    }
    if (catParam) {
      setCategory(catParam);
      setShowFilters(true);
    }
    if (q) setSearch(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlParams]);

  // Near Me state
  const [nearMeLoading, setNearMeLoading] = useState(false);
  const [nearMeShops, setNearMeShops] = useState<NearbyShop[] | null>(null);
  const [nearMeError, setNearMeError] = useState("");
  const [showNearMe, setShowNearMe] = useState(false);

  async function handleNearMe() {
    if (!navigator.geolocation) {
      setNearMeError("Geolocation is not supported by your browser.");
      return;
    }
    setNearMeLoading(true);
    setNearMeError("");
    setShowNearMe(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `/api/places/nearby?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}&radius=5000`
          );
          const data = await res.json();
          setNearMeShops(data.shops ?? []);
        } catch {
          setNearMeError("Failed to fetch nearby shops. Please try again.");
        } finally {
          setNearMeLoading(false);
        }
      },
      () => {
        setNearMeError("Location access denied. Please allow location access and try again.");
        setNearMeLoading(false);
      }
    );
  }

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      const matchSearch =
        !search ||
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.city.toLowerCase().includes(search.toLowerCase()) ||
        l.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchCity = city === "All Cities" || l.city === city;
      const matchCat = category === "All" || l.categories.includes(category);
      const matchOpen = !openOnly || l.open;
      const matchDelivery = !deliveryOnly || l.deliveryAvailable;
      return matchSearch && matchCity && matchCat && matchOpen && matchDelivery;
    });
  }, [search, city, category, openOnly, deliveryOnly, listings]);

  const activeFilterCount = [
    city !== "All Cities",
    category !== "All",
    openOnly,
    deliveryOnly,
  ].filter(Boolean).length;

  return (
    <main className="min-h-screen bg-[#FAFAF8] pt-16">
      {/* Hero */}
      <section className="bg-white border-b border-[#E8E4DF] py-12 px-5 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#F9EBE8] rounded-full px-3 py-1 mb-3">
                <MapPin size={13} className="text-[#E8705A]" />
                <span className="text-xs font-semibold text-[#E8705A] uppercase tracking-wider">Flower Shop Directory</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1A1A1A]">
                Find Flower Shops<br />
                <span style={{ background: "linear-gradient(135deg,#E8705A,#C95540)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  Near You
                </span>
              </h1>
              <p className="text-[#6B6B6B] mt-2">{listings.length} verified shops across the USA</p>
            </div>
            <Link
              href="/listings/create"
              className="inline-flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#333] text-white font-semibold px-5 py-3 rounded-2xl transition-colors group shrink-0"
            >
              <Plus size={16} /> List Your Shop
            </Link>
          </div>

          {/* Search bar */}
          <div className="flex gap-3 flex-col sm:flex-row">
            <div className="flex-1 flex items-center gap-3 bg-[#FAFAF8] border border-[#E8E4DF] rounded-2xl px-4 py-3 focus-within:border-[#E8705A] focus-within:ring-2 focus-within:ring-[#E8705A]/10 transition-all">
              <Search size={18} className="text-[#6B6B6B] shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search shops, cities, flower types..."
                className="flex-1 bg-transparent text-sm outline-none placeholder-[#B0A9A4]"
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-[#6B6B6B] hover:text-[#1A1A1A]">
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              onClick={handleNearMe}
              disabled={nearMeLoading}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl border text-sm font-medium transition-all bg-[#EDF5EE] border-[#B8D4BB] text-[#7A9E7E] hover:bg-[#7A9E7E] hover:text-white disabled:opacity-60"
            >
              {nearMeLoading ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
              Near Me
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-sm font-medium transition-all ${
                activeFilterCount > 0
                  ? "bg-[#E8705A] border-[#E8705A] text-white"
                  : "bg-white border-[#E8E4DF] text-[#1A1A1A] hover:border-[#E8705A]"
              }`}
            >
              <SlidersHorizontal size={16} />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-white text-[#E8705A] w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="mt-4 p-5 bg-[#FAFAF8] border border-[#E8E4DF] rounded-2xl grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-2 block">City</label>
                <div className="relative">
                  <select value={city} onChange={(e) => setCity(e.target.value)}
                    className="w-full appearance-none bg-white border border-[#E8E4DF] rounded-xl px-3 py-2.5 text-sm text-[#1A1A1A] outline-none focus:border-[#E8705A] pr-8 cursor-pointer">
                    {cities.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B6B] pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-2 block">Speciality</label>
                <div className="relative">
                  <select value={category} onChange={(e) => setCategory(e.target.value)}
                    className="w-full appearance-none bg-white border border-[#E8E4DF] rounded-xl px-3 py-2.5 text-sm text-[#1A1A1A] outline-none focus:border-[#E8705A] pr-8 cursor-pointer">
                    {categories.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B6B] pointer-events-none" />
                </div>
              </div>
              <div className="flex flex-col gap-3 justify-center">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div onClick={() => setOpenOnly(!openOnly)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${openOnly ? "bg-[#7A9E7E]" : "bg-[#E8E4DF]"}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${openOnly ? "left-5" : "left-0.5"}`} />
                  </div>
                  <span className="text-sm text-[#1A1A1A]">Open Now Only</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div onClick={() => setDeliveryOnly(!deliveryOnly)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${deliveryOnly ? "bg-[#7A9E7E]" : "bg-[#E8E4DF]"}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${deliveryOnly ? "left-5" : "left-0.5"}`} />
                  </div>
                  <span className="text-sm text-[#1A1A1A]">Delivery Available</span>
                </label>
              </div>
              <div className="flex items-center">
                <button onClick={() => { setCity("All Cities"); setCategory("All"); setOpenOnly(false); setDeliveryOnly(false); }}
                  className="text-sm text-[#E8705A] hover:underline">
                  Reset all filters
                </button>
              </div>
            </div>
          )}

          {/* Category pills */}
          <div className="flex gap-2 flex-wrap mt-4">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  category === cat
                    ? "bg-[#E8705A] text-white"
                    : "bg-[#FAFAF8] border border-[#E8E4DF] text-[#6B6B6B] hover:border-[#E8705A] hover:text-[#E8705A]"
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Near Me Results */}
      {showNearMe && (
        <section className="max-w-7xl mx-auto px-5 md:px-8 pt-8">
          <div className="bg-white border border-[#E8E4DF] rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#EDF5EE] rounded-xl flex items-center justify-center">
                  <Navigation size={15} className="text-[#7A9E7E]" />
                </div>
                <div>
                  <h2 className="font-bold text-[#1A1A1A]">Flower Shops Near You</h2>
                  <p className="text-xs text-[#6B6B6B]">Within 5 km · Powered by Google</p>
                </div>
              </div>
              <button onClick={() => setShowNearMe(false)} className="text-[#6B6B6B] hover:text-[#1A1A1A]">
                <X size={18} />
              </button>
            </div>

            {nearMeLoading && (
              <div className="flex items-center justify-center py-12 gap-3 text-[#6B6B6B]">
                <Loader2 size={20} className="animate-spin text-[#7A9E7E]" />
                <span className="text-sm">Finding shops near you...</span>
              </div>
            )}

            {nearMeError && (
              <div className="text-center py-8">
                <p className="text-sm text-[#E8705A]">{nearMeError}</p>
                <button onClick={handleNearMe} className="mt-3 text-sm text-[#7A9E7E] hover:underline">Try Again</button>
              </div>
            )}

            {!nearMeLoading && nearMeShops && nearMeShops.length === 0 && (
              <p className="text-center text-sm text-[#6B6B6B] py-8">No flower shops found nearby. Try increasing the radius.</p>
            )}

            {!nearMeLoading && nearMeShops && nearMeShops.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {nearMeShops.map((shop) => (
                  <div key={shop.id} className="border border-[#E8E4DF] rounded-2xl overflow-hidden hover:border-[#E8705A] transition-colors">
                    {shop.photo ? (
                      <div className="relative h-32 overflow-hidden">
                        <Image src={shop.photo} alt={shop.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
                      </div>
                    ) : (
                      <div className="h-32 bg-[#F9EBE8] flex items-center justify-center">
                        <MapPin size={28} className="text-[#E8705A]" />
                      </div>
                    )}
                    <div className="p-3">
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <p className="font-bold text-sm text-[#1A1A1A] leading-snug">{shop.name}</p>
                        {shop.isOpen !== null && (
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${shop.isOpen ? "bg-[#EDF5EE] text-[#7A9E7E]" : "bg-gray-100 text-gray-500"}`}>
                            {shop.isOpen ? "Open" : "Closed"}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#6B6B6B] mb-2 line-clamp-1">{shop.address}</p>
                      {shop.rating > 0 && (
                        <div className="flex items-center gap-1 mb-2">
                          <Star size={11} className="text-amber-400 fill-amber-400" />
                          <span className="text-xs font-bold text-[#1A1A1A]">{shop.rating}</span>
                          <span className="text-[10px] text-[#6B6B6B]">({shop.reviewCount.toLocaleString()})</span>
                        </div>
                      )}
                      <div className="flex gap-2 mt-2">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.name + " " + shop.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-center text-[11px] font-semibold bg-[#E8705A] text-white py-1.5 rounded-lg hover:bg-[#C95540] transition-colors"
                        >
                          Directions
                        </a>
                        {shop.website && (
                          <a
                            href={shop.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1 text-[11px] font-semibold border border-[#E8E4DF] text-[#6B6B6B] px-3 py-1.5 rounded-lg hover:border-[#E8705A] hover:text-[#E8705A] transition-colors"
                          >
                            <ExternalLink size={10} /> Website
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Results */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-[#6B6B6B]">
            Showing <span className="font-semibold text-[#1A1A1A]">{filtered.length}</span> shops
            {city !== "All Cities" && <span> in <span className="font-semibold text-[#1A1A1A]">{city}</span></span>}
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <MapPin size={40} className="text-[#E8E4DF] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">No shops found</h3>
            <p className="text-[#6B6B6B] text-sm">Try adjusting your filters or search term</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((shop) => (
              <Link key={shop.id} href={`/listings/${shop.slug}`}
                className="group bg-white rounded-3xl overflow-hidden border border-[#E8E4DF] hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300">
                <div className="relative h-48 overflow-hidden">
                  {shop.images[0] ? (
                    <Image src={shop.images[0]} alt={shop.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-[#EDF5EE] flex items-center justify-center">
                      <MapPin size={32} className="text-[#7A9E7E]" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold ${shop.open ? "bg-[#EDF5EE] text-[#7A9E7E]" : "bg-gray-100 text-gray-500"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${shop.open ? "bg-[#7A9E7E]" : "bg-gray-400"}`} />
                      {shop.open ? "Open" : "Closed"}
                    </span>
                    <span className="px-2 py-1 rounded-full text-[10px] font-semibold" style={{ background: "#FEF0ED", color: PRICE_COLORS[shop.priceRange] }}>
                      {PRICE_LABELS[shop.priceRange]}
                    </span>
                  </div>
                  {shop.verified && (
                    <div className="absolute top-3 right-3 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center">
                      <CheckCircle2 size={14} className="text-[#7A9E7E]" />
                    </div>
                  )}
                  {shop.featured && (
                    <div className="absolute bottom-3 right-3 bg-[#E8705A] text-white text-[10px] font-semibold px-2 py-1 rounded-full">
                      Featured
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h2 className="font-bold text-[#1A1A1A] text-base group-hover:text-[#E8705A] transition-colors leading-snug">
                      {shop.name}
                    </h2>
                    <div className="flex items-center gap-1 shrink-0">
                      <Star size={13} className="text-amber-400 fill-amber-400" />
                      <span className="text-sm font-bold text-[#1A1A1A]">{shop.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[#6B6B6B] text-xs mb-1">
                    <MapPin size={11} />
                    <span>{shop.address}, {shop.city}</span>
                  </div>
                  <p className="text-xs text-[#6B6B6B] italic mb-3">{shop.tagline}</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {shop.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="bg-[#F9EBE8] text-[#E8705A] text-[10px] font-medium px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-[#E8E4DF]">
                    <div className="flex items-center gap-3 text-[#6B6B6B] text-xs">
                      {shop.hours[0] && (
                        <span className="flex items-center gap-1">
                          <Clock size={11} /> {shop.hours[0].time}
                        </span>
                      )}
                      {shop.deliveryAvailable && (
                        <span className="flex items-center gap-1 text-[#7A9E7E]">
                          <Truck size={11} /> Delivery
                        </span>
                      )}
                    </div>
                    <span className="flex items-center gap-1 text-xs text-[#6B6B6B]">
                      <Star size={10} className="fill-[#6B6B6B]" />
                      {shop.reviewCount} reviews
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* CTA banner */}
        <div className="mt-16 bg-gradient-to-r from-[#1A1A1A] to-[#333] rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-white">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Leaf size={16} className="text-[#B8D4BB]" />
              <span className="text-xs font-semibold text-[#B8D4BB] uppercase tracking-wider">For Shop Owners</span>
            </div>
            <h3 className="text-2xl font-bold mb-1">Own a flower shop?</h3>
            <p className="text-white/60 text-sm max-w-sm">
              List your shop for free and reach thousands of flower lovers searching in your city every day.
            </p>
          </div>
          <Link href="/listings/create"
            className="shrink-0 inline-flex items-center gap-2 bg-[#E8705A] hover:bg-[#C95540] text-white font-semibold px-6 py-3.5 rounded-2xl transition-colors">
            <Plus size={16} /> List Your Shop Free
          </Link>
        </div>
      </section>
    </main>
  );
}
