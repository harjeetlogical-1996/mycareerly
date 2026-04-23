"use client";

import { useState } from "react";
import { ShoppingBag, Heart, Star, ArrowRight, Filter, Leaf } from "lucide-react";

const categories = ["All", "Roses", "Tulips", "Orchids", "Sunflowers", "Lilies", "Bouquets"];

const products = [
  {
    id: 1,
    name: "Crimson Love Roses",
    category: "Roses",
    price: 999,
    originalPrice: 1299,
    image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600&q=80",
    rating: 4.9,
    reviews: 128,
    badge: "Bestseller",
    badgeColor: "#E8705A",
    delivery: "Today",
    organic: true,
  },
  {
    id: 2,
    name: "Pastel Tulip Bunch",
    category: "Tulips",
    price: 649,
    originalPrice: 849,
    image: "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=600&q=80",
    rating: 4.7,
    reviews: 84,
    badge: "New",
    badgeColor: "#7A9E7E",
    delivery: "Tomorrow",
    organic: false,
  },
  {
    id: 3,
    name: "Exotic Purple Orchid",
    category: "Orchids",
    price: 1499,
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1566700571312-9f5a70d09f3c?w=600&q=80",
    rating: 4.8,
    reviews: 61,
    badge: "Premium",
    badgeColor: "#C95540",
    delivery: "Today",
    organic: true,
  },
  {
    id: 4,
    name: "Sunshine Sunflowers",
    category: "Sunflowers",
    price: 549,
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1490750967868-88df5691cc1b?w=600&q=80",
    rating: 4.6,
    reviews: 99,
    badge: null,
    badgeColor: null,
    delivery: "Today",
    organic: false,
  },
  {
    id: 5,
    name: "Pink Lily Elegance",
    category: "Lilies",
    price: 799,
    originalPrice: 999,
    image: "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=600&q=80",
    rating: 4.9,
    reviews: 43,
    badge: "Limited",
    badgeColor: "#E8705A",
    delivery: "Tomorrow",
    organic: true,
  },
  {
    id: 6,
    name: "Rainbow Bouquet",
    category: "Bouquets",
    price: 1299,
    originalPrice: 1699,
    image: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=600&q=80",
    rating: 5.0,
    reviews: 57,
    badge: "Top Rated",
    badgeColor: "#7A9E7E",
    delivery: "Today",
    organic: false,
  },
];

export default function Shop() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [wishlist, setWishlist] = useState<number[]>([]);

  const filtered =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.category === activeCategory);

  const toggleWishlist = (id: number) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <section id="shop" className="py-20 bg-[#FAFAF8]">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#FEF0ED] rounded-full px-3 py-1 mb-3">
              <ShoppingBag size={13} className="text-[#E8705A]" />
              <span className="text-xs font-600 text-[#E8705A] uppercase tracking-wider">
                Shop
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-700 tracking-tight text-[#1A1A1A]">
              Fresh <span className="text-[#E8705A]">Flowers</span> for Every Mood
            </h2>
          </div>
          <button className="hidden md:flex items-center gap-2 border border-[#E8E4DF] bg-white text-sm font-500 px-4 py-2 rounded-xl hover:border-[#E8705A] hover:text-[#E8705A] transition-all">
            <Filter size={14} /> Filter
          </button>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 flex-wrap mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-500 transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-[#E8705A] text-white shadow-[0_4px_14px_rgba(232,112,90,0.35)]"
                  : "bg-white border border-[#E8E4DF] text-[#6B6B6B] hover:border-[#E8705A] hover:text-[#E8705A]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="group card-lift bg-white rounded-3xl overflow-hidden border border-[#E8E4DF]"
            >
              {/* Image */}
              <div className="relative overflow-hidden h-52 md:h-60">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />

                {/* Badge */}
                {product.badge && (
                  <div
                    className="absolute top-3 left-3 pill text-white text-[10px]"
                    style={{ background: product.badgeColor ?? "#E8705A" }}
                  >
                    {product.badge}
                  </div>
                )}

                {/* Wishlist */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`absolute top-3 right-3 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                    wishlist.includes(product.id)
                      ? "bg-[#E8705A] text-white"
                      : "bg-white/80 backdrop-blur-sm text-[#6B6B6B] hover:bg-white"
                  }`}
                >
                  <Heart
                    size={14}
                    className={wishlist.includes(product.id) ? "fill-current" : ""}
                  />
                </button>

                {/* Organic badge */}
                {product.organic && (
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                    <Leaf size={10} className="text-[#7A9E7E]" />
                    <span className="text-[10px] font-600 text-[#7A9E7E]">Organic</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-sm font-600 text-[#1A1A1A] leading-snug">{product.name}</h3>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                  <Star size={12} className="text-amber-400 fill-amber-400" />
                  <span className="text-xs font-600 text-[#1A1A1A]">{product.rating}</span>
                  <span className="text-xs text-[#6B6B6B]">({product.reviews})</span>
                  <span className="ml-auto text-[10px] font-500 text-[#7A9E7E] bg-[#EDF5EE] px-2 py-0.5 rounded-full">
                    {product.delivery === "Today" ? "⚡ Today" : "🕐 Tomorrow"}
                  </span>
                </div>

                {/* Price + CTA */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-base font-700 text-[#1A1A1A]">₹{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-xs text-[#6B6B6B] line-through ml-1.5">
                        ₹{product.originalPrice}
                      </span>
                    )}
                  </div>
                  <button className="flex items-center gap-1.5 bg-[#E8705A] hover:bg-[#C95540] text-white text-xs font-600 px-3 py-2 rounded-xl transition-colors">
                    <ShoppingBag size={12} />
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View all */}
        <div className="mt-10 flex justify-center">
          <a
            href="/shop"
            className="inline-flex items-center gap-2 border-2 border-[#E8705A] text-[#E8705A] font-600 px-8 py-3 rounded-2xl hover:bg-[#E8705A] hover:text-white transition-all duration-200 group"
          >
            View All Flowers
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
}
