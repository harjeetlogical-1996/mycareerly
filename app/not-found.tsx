import Link from "next/link";
import Navbar from "./components/NavbarServer";
import Footer from "./components/Footer";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FAFAF8] pt-16 flex flex-col items-center justify-center px-5">
        <div className="text-center max-w-md">
          <div className="text-8xl mb-6">🌸</div>
          <h1 className="text-5xl font-bold text-[#1A1A1A] mb-2">404</h1>
          <h2 className="text-xl font-semibold text-[#4A4A4A] mb-3">Page Not Found</h2>
          <p className="text-[#6B6B6B] text-sm leading-relaxed mb-8">
            Looks like this page has wilted away. The URL might be wrong, or the page may have moved.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-[#E8705A] hover:bg-[#C95540] text-white font-semibold px-6 py-3 rounded-2xl transition-colors text-sm"
            >
              <Home size={15} /> Go Home
            </Link>
            <Link
              href="/listings"
              className="inline-flex items-center justify-center gap-2 border border-[#E8E4DF] bg-white hover:border-[#E8705A] hover:text-[#E8705A] text-[#4A4A4A] font-semibold px-6 py-3 rounded-2xl transition-colors text-sm"
            >
              <Search size={15} /> Find Florists
            </Link>
          </div>

          <div className="mt-10 pt-8 border-t border-[#E8E4DF]">
            <p className="text-xs text-[#8A8A8A] mb-3">Popular pages</p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { label: "Flower Shops", href: "/listings" },
                { label: "Articles", href: "/articles" },
                { label: "Cities", href: "/cities" },
                { label: "List Your Shop", href: "/listings/create" },
              ].map(({ label, href }) => (
                <Link key={href} href={href}
                  className="text-xs px-3 py-1.5 rounded-full border border-[#E8E4DF] bg-white text-[#6B6B6B] hover:border-[#E8705A] hover:text-[#E8705A] transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
