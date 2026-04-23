import Link from "next/link";
import { prisma } from "../../lib/prisma";
import { deleteListing, setListingStatus, toggleListingFeatured, toggleListingSponsored, toggleListingVerified } from "../../actions/listings";
import { Pencil, CheckCircle2, XCircle, Clock, Star, Store, ExternalLink, Plus, Zap, ShieldCheck } from "lucide-react";
import DeleteButton from "../components/DeleteButton";

export const dynamic = "force-dynamic";

const STATUS_TABS = ["all", "pending", "approved", "rejected"];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status === "pending" && <Clock size={10} />}
      {status === "approved" && <CheckCircle2 size={10} />}
      {status === "rejected" && <XCircle size={10} />}
      {status}
    </span>
  );
}

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const filter = sp.status && sp.status !== "all" ? sp.status : undefined;

  const listings = await prisma.listing.findMany({
    where: filter ? { status: filter } : undefined,
    orderBy: [
      { sponsored: "desc" },
      { featured: "desc" },
      { sortOrder: "desc" },
      { createdAt: "desc" },
    ],
  });

  const counts = await prisma.listing.groupBy({ by: ["status"], _count: true });
  const countMap: Record<string, number> = {};
  counts.forEach((c) => { countMap[c.status] = c._count; });
  const total = await prisma.listing.count();
  countMap.all = total;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <Store size={22} className="text-[#7A9E7E]" /> Listings
          </h1>
          <p className="text-sm text-[#6B6B6B] mt-0.5">{total} total flower shop listings</p>
        </div>
        <Link
          href="/admin/listings/new"
          className="inline-flex items-center gap-2 bg-[#7A9E7E] hover:bg-[#5F8263] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={14} /> New Listing
        </Link>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 bg-white border border-[#E8E4DF] rounded-xl p-1 mb-6 w-fit">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab}
            href={`/admin/listings${tab !== "all" ? `?status=${tab}` : ""}`}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
              (sp.status ?? "all") === tab
                ? "bg-[#7A9E7E] text-white shadow-sm"
                : "text-[#6B6B6B] hover:text-[#1A1A1A]"
            }`}
          >
            {tab} <span className="ml-1 opacity-70">({countMap[tab] ?? 0})</span>
          </Link>
        ))}
      </div>

      <div className="bg-white border border-[#E8E4DF] rounded-2xl overflow-hidden">
        {listings.length === 0 ? (
          <div className="py-16 text-center">
            <Store size={32} className="text-[#E8E4DF] mx-auto mb-3" />
            <p className="text-[#6B6B6B] text-sm">No listings found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E8E4DF] bg-[#FAFAF8]">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Shop</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider hidden md:table-cell">City</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider hidden lg:table-cell">Contact</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Status</th>
                <th className="text-center px-3 py-3.5 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider hidden lg:table-cell" title="Sponsored">$</th>
                <th className="text-center px-3 py-3.5 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider hidden lg:table-cell" title="Featured">★</th>
                <th className="text-center px-3 py-3.5 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider hidden lg:table-cell" title="Verified">✓</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E4DF]">
              {listings.map((listing) => {
                const imgs = JSON.parse(listing.images) as string[];
                return (
                  <tr key={listing.id} className="hover:bg-[#FAFAF8] transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {imgs[0] && (
                          <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 hidden sm:block">
                            <img src={imgs[0]} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-[#1A1A1A] line-clamp-1">{listing.name}</p>
                          <p className="text-xs text-[#6B6B6B] italic">{listing.tagline}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[#6B6B6B] text-xs hidden md:table-cell">{listing.city}</td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <p className="text-xs text-[#1A1A1A]">{listing.phone}</p>
                      <p className="text-xs text-[#6B6B6B]">{listing.email}</p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <StatusBadge status={listing.status} />
                    </td>
                    <td className="px-3 py-4 text-center hidden lg:table-cell">
                      <form action={async () => { "use server"; await toggleListingSponsored(listing.id, !listing.sponsored); }}>
                        <button type="submit" title={listing.sponsored ? "Remove sponsored" : "Mark sponsored"}
                          className={`${listing.sponsored ? "text-[#E8705A]" : "text-[#E8E4DF] hover:text-[#E8705A]"} transition-colors`}>
                          <Zap size={16} className={listing.sponsored ? "fill-[#E8705A]" : ""} />
                        </button>
                      </form>
                    </td>
                    <td className="px-3 py-4 text-center hidden lg:table-cell">
                      <form action={async () => { "use server"; await toggleListingFeatured(listing.id, !listing.featured); }}>
                        <button type="submit" title={listing.featured ? "Remove featured" : "Mark featured"}
                          className={`${listing.featured ? "text-amber-400" : "text-[#E8E4DF] hover:text-amber-300"} transition-colors`}>
                          <Star size={16} className={listing.featured ? "fill-amber-400" : ""} />
                        </button>
                      </form>
                    </td>
                    <td className="px-3 py-4 text-center hidden lg:table-cell">
                      <form action={async () => { "use server"; await toggleListingVerified(listing.id, !listing.verified); }}>
                        <button type="submit" title={listing.verified ? "Unverify" : "Verify"}
                          className={`${listing.verified ? "text-[#7A9E7E]" : "text-[#E8E4DF] hover:text-[#7A9E7E]"} transition-colors`}>
                          <ShieldCheck size={16} />
                        </button>
                      </form>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {listing.status === "pending" && (
                          <>
                            <form action={async () => { "use server"; await setListingStatus(listing.id, "approved"); }}>
                              <button type="submit" title="Approve" className="w-7 h-7 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 flex items-center justify-center transition-colors">
                                <CheckCircle2 size={13} />
                              </button>
                            </form>
                            <form action={async () => { "use server"; await setListingStatus(listing.id, "rejected"); }}>
                              <button type="submit" title="Reject" className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors">
                                <XCircle size={13} />
                              </button>
                            </form>
                          </>
                        )}
                        {listing.status === "approved" && (
                          <Link href={`/listings/${listing.id}`} target="_blank" title="View" className="w-7 h-7 rounded-lg bg-[#EDF5EE] hover:bg-[#7A9E7E]/20 text-[#7A9E7E] flex items-center justify-center transition-colors">
                            <ExternalLink size={13} />
                          </Link>
                        )}
                        <Link href={`/admin/listings/${listing.id}`} title="Edit" className="w-7 h-7 rounded-lg bg-[#FAFAF8] hover:bg-[#E8E4DF] text-[#6B6B6B] flex items-center justify-center transition-colors">
                          <Pencil size={13} />
                        </Link>
                        <form action={async () => { "use server"; await deleteListing(listing.id); }}>
                          <DeleteButton message="Delete this listing?" />
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
