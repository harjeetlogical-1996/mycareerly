import { Loader2 } from "lucide-react";

/**
 * Next.js automatically renders this loading UI while any admin page
 * is fetching data or transitioning. Provides instant feedback so users
 * know the click registered.
 */
export default function AdminLoading() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-start justify-center">
      {/* Top progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E8705A] via-[#E60023] to-[#E8705A] animate-pulse" />

      {/* Center loader */}
      <div className="mt-32 bg-white/95 backdrop-blur-sm border border-[#E8E4DF] rounded-2xl px-5 py-3 shadow-lg flex items-center gap-2.5">
        <Loader2 size={16} className="animate-spin text-[#E8705A]" />
        <span className="text-sm font-medium text-[#1A1A1A]">Loading…</span>
      </div>
    </div>
  );
}
