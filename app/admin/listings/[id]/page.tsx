import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import { updateListing } from "../../../actions/listings";
import { ArrowLeft, Save } from "lucide-react";
import { CITIES } from "../../../data/listings";

const inputCls = "w-full bg-[#FAFAF8] border border-[#E8E4DF] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] outline-none focus:border-[#E8705A] focus:ring-2 focus:ring-[#E8705A]/10 transition-all placeholder-[#B0A9A4]";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">
        {label}{required && <span className="text-[#E8705A] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) notFound();

  const categories = JSON.parse(listing.categories) as string[];
  const tags = JSON.parse(listing.tags) as string[];

  async function action(fd: FormData) {
    "use server";
    await updateListing(id, fd);
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/listings" className="w-8 h-8 rounded-xl border border-[#E8E4DF] bg-white flex items-center justify-center hover:bg-[#F9EBE8] transition-colors">
          <ArrowLeft size={15} className="text-[#6B6B6B]" />
        </Link>
        <h1 className="text-xl font-bold text-[#1A1A1A]">Edit: {listing.name}</h1>
      </div>

      <form action={action}>
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Main */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white border border-[#E8E4DF] rounded-2xl p-6 space-y-5">
              <h3 className="font-semibold text-[#1A1A1A]">Shop Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Shop Name" required>
                  <input name="name" defaultValue={listing.name} className={inputCls} required />
                </Field>
                <Field label="Tagline">
                  <input name="tagline" defaultValue={listing.tagline} className={inputCls} />
                </Field>
              </div>
              <Field label="Description" required>
                <textarea name="description" defaultValue={listing.description} rows={4} className={`${inputCls} resize-none`} required />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Phone" required>
                  <input name="phone" defaultValue={listing.phone} className={inputCls} required />
                </Field>
                <Field label="Email" required>
                  <input name="email" type="email" defaultValue={listing.email} className={inputCls} required />
                </Field>
              </div>
              <Field label="Website">
                <input name="website" defaultValue={listing.website} placeholder="https://..." className={inputCls} />
              </Field>
            </div>

            <div className="bg-white border border-[#E8E4DF] rounded-2xl p-6 space-y-5">
              <h3 className="font-semibold text-[#1A1A1A]">Location</h3>
              <Field label="Street Address" required>
                <textarea name="address" defaultValue={listing.address} rows={2} className={`${inputCls} resize-none`} required />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="City" required>
                  <select name="city" defaultValue={listing.city} className={inputCls} required>
                    {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Pincode" required>
                  <input name="pincode" defaultValue={listing.pincode} className={inputCls} required />
                </Field>
              </div>
            </div>

            <div className="bg-white border border-[#E8E4DF] rounded-2xl p-6 space-y-5">
              <h3 className="font-semibold text-[#1A1A1A]">Specialities & Tags</h3>
              <Field label="Categories (comma separated)">
                <input name="categories" defaultValue={categories.join(", ")} placeholder="Roses, Bouquets, Wedding" className={inputCls} />
              </Field>
              <Field label="Tags (comma separated)">
                <input name="tags" defaultValue={tags.join(", ")} placeholder="Same-day Delivery, Gift Wrapping" className={inputCls} />
              </Field>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="bg-white border border-[#E8E4DF] rounded-2xl p-5 space-y-4">
              <h3 className="font-semibold text-[#1A1A1A] text-sm">Listing Settings</h3>

              <Field label="Status">
                <select name="status" defaultValue={listing.status} className={inputCls}>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </Field>

              <Field label="Verified">
                <select name="verified" defaultValue={listing.verified ? "true" : "false"} className={inputCls}>
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </Field>

              <Field label="Featured (Editor's pick)">
                <select name="featured" defaultValue={listing.featured ? "true" : "false"} className={inputCls}>
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </Field>

              <Field label="Sponsored (Paid placement)">
                <select name="sponsored" defaultValue={listing.sponsored ? "true" : "false"} className={inputCls}>
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
                <p className="text-[10px] text-[#9A9A9A] mt-1">Sponsored shops appear above featured in all listings.</p>
              </Field>

              <Field label="Sort Order">
                <input
                  name="sortOrder"
                  type="number"
                  defaultValue={listing.sortOrder ?? 0}
                  className={inputCls}
                  placeholder="0"
                />
                <p className="text-[10px] text-[#9A9A9A] mt-1">Higher = shown earlier. Same sponsored/featured status uses this.</p>
              </Field>

              <Field label="Show Email Publicly">
                <select name="showEmail" defaultValue={listing.showEmail ? "true" : "false"} className={inputCls}>
                  <option value="false">No (hidden)</option>
                  <option value="true">Yes (shown on listing page)</option>
                </select>
                <p className="text-[10px] text-[#9A9A9A] mt-1">Only for listings with an email address.</p>
              </Field>

              <Field label="Price Range">
                <select name="priceRange" defaultValue={listing.priceRange} className={inputCls}>
                  <option value="budget">Budget</option>
                  <option value="mid">Mid-range</option>
                  <option value="premium">Premium</option>
                </select>
              </Field>

              <Field label="Delivery Available">
                <select name="deliveryAvailable" defaultValue={listing.deliveryAvailable ? "true" : "false"} className={inputCls}>
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </Field>

              <Field label="Open Now">
                <select name="open" defaultValue={listing.open ? "true" : "false"} className={inputCls}>
                  <option value="true">Open</option>
                  <option value="false">Closed</option>
                </select>
              </Field>

              <Field label="Rating (0-5)">
                <input name="rating" type="number" step="0.1" min="0" max="5"
                  defaultValue={listing.rating} className={inputCls} />
              </Field>

              <Field label="Review Count">
                <input name="reviewCount" type="number" min="0"
                  defaultValue={listing.reviewCount} className={inputCls} />
              </Field>

              <button type="submit" className="w-full flex items-center justify-center gap-2 bg-[#7A9E7E] hover:bg-[#5F8263] text-white font-semibold py-3 rounded-xl transition-colors">
                <Save size={15} /> Save Changes
              </button>

              <div className="pt-3 border-t border-[#E8E4DF] text-[10px] text-[#9A9A9A] space-y-0.5">
                <p>Submitted by: <span className="font-semibold text-[#4A4A4A]">{listing.submittedBy || "admin"}</span></p>
                {listing.googlePlaceId && <p>Google Place ID: <span className="font-mono text-[9px]">{listing.googlePlaceId.slice(0, 24)}…</span></p>}
              </div>
            </div>

            {/* Preview card */}
            <div className="bg-white border border-[#E8E4DF] rounded-2xl p-5">
              <h3 className="font-semibold text-[#1A1A1A] text-sm mb-3">Preview</h3>
              {(JSON.parse(listing.images) as string[])[0] && (
                <div className="w-full h-32 rounded-xl overflow-hidden mb-3">
                  <img src={(JSON.parse(listing.images) as string[])[0]} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <p className="font-bold text-sm text-[#1A1A1A]">{listing.name}</p>
              <p className="text-xs text-[#6B6B6B]">{listing.city} · {listing.phone}</p>
              <Link href={`/listings/${listing.id}`} target="_blank" className="mt-2 text-xs text-[#E8705A] hover:underline block">
                View live listing →
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
