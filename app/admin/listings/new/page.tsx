import Link from "next/link";
import { createListing } from "../../../actions/listings";
import { ArrowLeft, Store } from "lucide-react";
import { CITIES, CATEGORIES } from "../../../data/listings";

const inputCls = "w-full bg-[#FAFAF8] border border-[#E8E4DF] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] outline-none focus:border-[#E8705A] focus:ring-2 focus:ring-[#E8705A]/10 transition-all placeholder-[#B0A9A4]";

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">
        {label}{required && <span className="text-[#E8705A] ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-[#6B6B6B] mt-1">{hint}</p>}
    </div>
  );
}

export default function NewListingPage() {
  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/listings" className="w-8 h-8 rounded-xl border border-[#E8E4DF] bg-white flex items-center justify-center hover:bg-[#F9EBE8] transition-colors">
          <ArrowLeft size={15} className="text-[#6B6B6B]" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <Store size={18} className="text-[#7A9E7E]" /> Add New Listing
          </h1>
          <p className="text-xs text-[#6B6B6B] mt-0.5">Add a flower shop to the directory</p>
        </div>
      </div>

      <form action={createListing}>
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Main */}
          <div className="lg:col-span-2 space-y-5">

            {/* Shop Info */}
            <div className="bg-white border border-[#E8E4DF] rounded-2xl p-6 space-y-5">
              <h3 className="font-semibold text-[#1A1A1A] flex items-center gap-2">
                <span className="w-6 h-6 bg-[#EDF5EE] rounded-lg flex items-center justify-center text-xs font-bold text-[#7A9E7E]">1</span>
                Shop Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Shop Name" required>
                  <input name="name" className={inputCls} required placeholder="e.g. Petal & Bloom" />
                </Field>
                <Field label="Tagline">
                  <input name="tagline" className={inputCls} placeholder="e.g. Where every petal tells a story" />
                </Field>
              </div>
              <Field label="Description" required>
                <textarea name="description" rows={4} className={`${inputCls} resize-none`} required placeholder="Describe the shop, its specialties, and what makes it unique..." />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Phone" required>
                  <input name="phone" className={inputCls} required placeholder="+91 98765 43210" />
                </Field>
                <Field label="Email" required>
                  <input name="email" type="email" className={inputCls} required placeholder="shop@example.com" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Website">
                  <input name="website" className={inputCls} placeholder="https://..." />
                </Field>
                <Field label="Established Year">
                  <input name="established" className={inputCls} placeholder="e.g. 2010" />
                </Field>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white border border-[#E8E4DF] rounded-2xl p-6 space-y-5">
              <h3 className="font-semibold text-[#1A1A1A] flex items-center gap-2">
                <span className="w-6 h-6 bg-[#EDF5EE] rounded-lg flex items-center justify-center text-xs font-bold text-[#7A9E7E]">2</span>
                Location
              </h3>
              <Field label="Street Address" required>
                <textarea name="address" rows={2} className={`${inputCls} resize-none`} required placeholder="Building, Street, Area..." />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="City" required>
                  <select name="city" className={inputCls} required>
                    <option value="">Select city</option>
                    {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Pincode" required>
                  <input name="pincode" className={inputCls} required placeholder="400001" />
                </Field>
              </div>
            </div>

            {/* Specialities */}
            <div className="bg-white border border-[#E8E4DF] rounded-2xl p-6 space-y-5">
              <h3 className="font-semibold text-[#1A1A1A] flex items-center gap-2">
                <span className="w-6 h-6 bg-[#EDF5EE] rounded-lg flex items-center justify-center text-xs font-bold text-[#7A9E7E]">3</span>
                Specialities & Tags
              </h3>
              <Field label="Categories" hint="Comma separated: e.g. Roses, Bouquets, Wedding Flowers">
                <input name="categories" className={inputCls} placeholder="Roses, Bouquets, Wedding" />
              </Field>
              <Field label="Tags" hint="Comma separated: e.g. Same-day Delivery, Gift Wrapping">
                <input name="tags" className={inputCls} placeholder="Same-day Delivery, Gift Wrapping, Custom Orders" />
              </Field>
            </div>

            {/* Images */}
            <div className="bg-white border border-[#E8E4DF] rounded-2xl p-6 space-y-5">
              <h3 className="font-semibold text-[#1A1A1A] flex items-center gap-2">
                <span className="w-6 h-6 bg-[#EDF5EE] rounded-lg flex items-center justify-center text-xs font-bold text-[#7A9E7E]">4</span>
                Photos
              </h3>
              <Field label="Image URLs" hint="Comma separated image URLs. First image is used as cover.">
                <textarea name="images" rows={3} className={`${inputCls} resize-none`} placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg" />
              </Field>
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="bg-white border border-[#E8E4DF] rounded-2xl p-5 space-y-4">
              <h3 className="font-semibold text-[#1A1A1A] text-sm">Listing Settings</h3>

              <Field label="Status">
                <select name="status" defaultValue="approved" className={inputCls}>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </Field>

              <Field label="Verified">
                <select name="verified" defaultValue="true" className={inputCls}>
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </Field>

              <Field label="Featured">
                <select name="featured" defaultValue="false" className={inputCls}>
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </Field>

              <Field label="Currently Open">
                <select name="open" defaultValue="true" className={inputCls}>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </Field>

              <Field label="Price Range">
                <select name="priceRange" defaultValue="mid" className={inputCls}>
                  <option value="budget">Budget</option>
                  <option value="mid">Mid-range</option>
                  <option value="premium">Premium</option>
                </select>
              </Field>

              <Field label="Delivery Available">
                <select name="deliveryAvailable" defaultValue="false" className={inputCls}>
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </Field>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-[#7A9E7E] hover:bg-[#5F8263] text-white font-semibold py-3 rounded-xl transition-colors"
              >
                <Store size={15} /> Add Listing
              </button>
            </div>

            <div className="bg-[#EDF5EE] border border-[#7A9E7E]/20 rounded-2xl p-5">
              <p className="text-sm font-semibold text-[#3D6B41] mb-1">Tips</p>
              <ul className="text-xs text-[#5F8263] space-y-1.5 list-disc list-inside">
                <li>Add at least one high-quality cover image</li>
                <li>Detailed descriptions rank better in search</li>
                <li>Verify the shop before publishing</li>
                <li>Set status to Approved so it shows on the site</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
