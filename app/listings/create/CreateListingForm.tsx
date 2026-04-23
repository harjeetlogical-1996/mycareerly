"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, CheckCircle2, Store, MapPin, Clock, Tag, ImagePlus,
  Flower2, Phone, Mail, Globe, Sparkles, Loader2, AlertCircle, Edit3, Download,
} from "lucide-react";
import { fetchGooglePlace } from "../../actions/fetchGooglePlace";
import { createListing } from "../../actions/listings";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const CITIES = ["New York","Los Angeles","Chicago","Houston","Phoenix","Philadelphia","San Antonio","San Diego","Dallas","San Jose","Austin","Jacksonville","Fort Worth","Columbus","Charlotte","Indianapolis","San Francisco","Seattle","Denver","Nashville","Oklahoma City","El Paso","Washington DC","Las Vegas","Louisville","Memphis","Portland","Baltimore","Milwaukee","Albuquerque","Tucson","Fresno","Sacramento","Mesa","Kansas City","Atlanta","Omaha","Colorado Springs","Raleigh","Long Beach","Virginia Beach","Miami","Minneapolis","Tampa","New Orleans","Cleveland","Honolulu","Boston","Detroit","Pittsburgh","Salt Lake City","Other"];
const CATEGORIES = ["Roses","Wedding Flowers","Event Florals","Orchids","Peonies","Tropical Flowers","Succulents","Houseplants","Seasonal Blooms","Sympathy","Corporate","Custom Arrangements"];

type FormState = {
  name: string;
  tagline: string;
  description: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  hours: { day: string; open: string; close: string; closed: boolean }[];
  categories: string[];
  tags: string;
  deliveryAvailable: boolean;
  priceRange: string;
  images: string[];
  rating: number;
  reviewCount: number;
  googlePlaceId: string;
  open: boolean;
};

const emptyForm: FormState = {
  name: "", tagline: "", description: "", phone: "", email: "", website: "",
  address: "", city: "", state: "", pincode: "",
  hours: DAYS.map((day) => ({ day, open: "09:00", close: "20:00", closed: day === "Sunday" })),
  categories: [], tags: "", deliveryAvailable: false, priceRange: "mid",
  images: ["", "", ""], rating: 0, reviewCount: 0, googlePlaceId: "", open: true,
};

export default function CreateListingForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"choose" | "google" | "manual">("choose");
  const [googleUrl, setGoogleUrl] = useState("");
  const [googleError, setGoogleError] = useState("");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submittedBy] = useState<"user">("user");
  const [fetchedFromGoogle, setFetchedFromGoogle] = useState(false);

  const [isFetching, startFetching] = useTransition();
  const [isSubmitting, startSubmitting] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleGoogleFetch = () => {
    setGoogleError("");
    if (!googleUrl.trim()) { setGoogleError("Please paste a Google Maps URL"); return; }
    startFetching(async () => {
      const res = await fetchGooglePlace(googleUrl);
      if (res.success && res.data) {
        setForm({
          ...emptyForm,
          name: res.data.name,
          tagline: res.data.tagline,
          description: res.data.description,
          phone: res.data.phone,
          email: "", // Google never provides email
          website: res.data.website,
          address: res.data.address,
          city: res.data.city,
          state: res.data.state,
          pincode: res.data.pincode,
          hours: res.data.hours,
          categories: res.data.categories as string[],
          tags: "",
          deliveryAvailable: false,
          priceRange: res.data.priceRange,
          images: [...res.data.images, "", ""].slice(0, Math.max(3, res.data.images.length)),
          rating: res.data.rating,
          reviewCount: res.data.reviewCount,
          googlePlaceId: res.data.googlePlaceId,
          open: res.data.open,
        });
        setFetchedFromGoogle(true);
        setMode("manual"); // show editable form
      } else {
        setGoogleError(res.error || "Failed to fetch");
      }
    });
  };

  const toggleCategory = (cat: string) => {
    const has = form.categories.includes(cat);
    update("categories", has ? form.categories.filter((c) => c !== cat) : [...form.categories, cat]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!form.name || !form.address || !form.phone || !form.city) {
      setSubmitError("Please fill all required fields (Name, Address, Phone, City)");
      return;
    }

    const fd = new FormData();
    fd.set("name", form.name);
    fd.set("tagline", form.tagline);
    fd.set("description", form.description);
    fd.set("phone", form.phone);
    fd.set("email", form.email);
    fd.set("website", form.website);
    fd.set("address", form.address);
    fd.set("city", form.city);
    fd.set("state", form.state);
    fd.set("pincode", form.pincode);
    fd.set("hours", JSON.stringify(form.hours));
    fd.set("categories", form.categories.join(","));
    fd.set("tags", form.tags);
    fd.set("images", form.images.filter(Boolean).join(","));
    fd.set("deliveryAvailable", form.deliveryAvailable ? "true" : "false");
    fd.set("priceRange", form.priceRange);
    fd.set("open", form.open ? "true" : "false");
    fd.set("rating", String(form.rating));
    fd.set("reviewCount", String(form.reviewCount));
    fd.set("googlePlaceId", form.googlePlaceId);
    fd.set("submittedBy", submittedBy);
    fd.set("showEmail", form.email ? "true" : "false");
    fd.set("status", "pending");

    startSubmitting(async () => {
      try {
        await createListing(fd);
        setSubmitted(true);
      } catch (err: any) {
        // redirect() throws NEXT_REDIRECT which is actually a success
        if (err?.message?.includes("NEXT_REDIRECT")) {
          setSubmitted(true);
        } else {
          setSubmitError(err?.message || "Submission failed");
        }
      }
    });
  };

  if (submitted) {
    return (
      <>
        <main className="min-h-screen bg-[#FAFAF8] pt-32 pb-20">
          <div className="max-w-md mx-auto text-center px-5">
            <div className="w-16 h-16 bg-[#EDF5EE] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-[#7A9E7E]" />
            </div>
            <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">Listing Submitted!</h1>
            <p className="text-sm text-[#6B6B6B] mb-6">
              Your flower shop has been submitted for review. Our team will approve it within 2 business days.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/listings" className="bg-[#E8705A] hover:bg-[#C95540] text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
                Browse Listings
              </Link>
              <Link href="/" className="border border-[#E8E4DF] bg-white hover:border-[#E8705A] px-5 py-2.5 rounded-xl text-sm font-semibold">
                Go Home
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-[#FAFAF8] pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-5 md:px-8">

          <Link href="/listings" className="inline-flex items-center gap-1.5 text-sm text-[#6B6B6B] hover:text-[#E8705A] mb-4">
            <ArrowLeft size={14} /> Back to listings
          </Link>

          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-[#F9EBE8] text-[#E8705A] text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
              <Flower2 size={12} /> List Your Flower Shop
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-2">
              Get your shop discovered by flower lovers
            </h1>
            <p className="text-[#6B6B6B] text-base">
              Join 500+ verified florists across the USA. Setup takes just a few minutes.
            </p>
          </div>

          {/* Mode selection */}
          {mode === "choose" && (
            <div className="grid md:grid-cols-2 gap-5">
              <button
                onClick={() => setMode("google")}
                className="bg-white border-2 border-[#E8E4DF] hover:border-[#E8705A] rounded-3xl p-8 text-left transition-all group"
              >
                <div className="w-12 h-12 bg-[#F9EBE8] rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#E8705A]/20 transition-colors">
                  <Download size={22} className="text-[#E8705A]" />
                </div>
                <h2 className="text-lg font-bold text-[#1A1A1A] mb-1 flex items-center gap-2">
                  Auto-fetch from Google
                  <span className="text-[10px] font-semibold bg-[#E8705A] text-white px-2 py-0.5 rounded-full">FASTEST</span>
                </h2>
                <p className="text-sm text-[#6B6B6B] leading-relaxed">
                  Paste your Google Maps URL. We'll auto-fetch your business name, address, phone, hours, photos, and reviews. Edit anything before submitting.
                </p>
                <p className="text-xs font-semibold text-[#E8705A] mt-4">
                  Start with Google →
                </p>
              </button>

              <button
                onClick={() => setMode("manual")}
                className="bg-white border-2 border-[#E8E4DF] hover:border-[#E8705A] rounded-3xl p-8 text-left transition-all group"
              >
                <div className="w-12 h-12 bg-[#F9EBE8] rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#E8705A]/20 transition-colors">
                  <Edit3 size={22} className="text-[#E8705A]" />
                </div>
                <h2 className="text-lg font-bold text-[#1A1A1A] mb-1">Enter Manually</h2>
                <p className="text-sm text-[#6B6B6B] leading-relaxed">
                  Prefer to type everything yourself? Fill out our simple form with your business details, photos, and specialties.
                </p>
                <p className="text-xs font-semibold text-[#E8705A] mt-4">
                  Start manual →
                </p>
              </button>
            </div>
          )}

          {/* Google fetch mode */}
          {mode === "google" && (
            <div className="bg-white border border-[#E8E4DF] rounded-3xl p-6 md:p-8">
              <button onClick={() => { setMode("choose"); setGoogleError(""); setGoogleUrl(""); }}
                className="inline-flex items-center gap-1.5 text-xs text-[#6B6B6B] hover:text-[#E8705A] mb-4">
                <ArrowLeft size={12} /> Back to options
              </button>

              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={18} className="text-[#E8705A]" />
                <h2 className="text-xl font-bold text-[#1A1A1A]">Auto-fetch from Google Maps</h2>
              </div>
              <p className="text-sm text-[#6B6B6B] mb-6">
                Paste your Google Maps business URL. We'll pre-fill everything we can find — you can edit anything before submitting.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#4A4A4A] mb-1.5">
                    Google Maps URL
                  </label>
                  <input
                    value={googleUrl}
                    onChange={(e) => setGoogleUrl(e.target.value)}
                    placeholder="https://www.google.com/maps/place/Your+Flower+Shop/..."
                    className="w-full border border-[#E8E4DF] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#E8705A] focus:ring-2 focus:ring-[#E8705A]/10 bg-[#FAFAF8]"
                  />
                  <p className="text-[11px] text-[#9A9A9A] mt-1.5 leading-relaxed">
                    💡 How to get your URL: Open Google Maps → search your business → click on it → copy the URL from the address bar. Shortened <code className="bg-[#F4F3F0] px-1 rounded">maps.app.goo.gl</code> links also work.
                  </p>
                </div>

                {googleError && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 rounded-xl p-3 text-xs">
                    <AlertCircle size={13} className="mt-0.5 shrink-0" /> {googleError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleGoogleFetch}
                    disabled={isFetching || !googleUrl.trim()}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#E8705A] hover:bg-[#C95540] disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-sm"
                  >
                    {isFetching
                      ? <><Loader2 size={14} className="animate-spin" /> Fetching from Google…</>
                      : <><Sparkles size={14} /> Auto-fetch Details</>}
                  </button>
                  <button
                    onClick={() => { setMode("manual"); setFetchedFromGoogle(false); }}
                    className="border border-[#E8E4DF] bg-white hover:border-[#E8705A] px-4 py-3 rounded-xl text-sm font-semibold text-[#4A4A4A]"
                  >
                    Skip, enter manually
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Manual / edit form */}
          {mode === "manual" && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {fetchedFromGoogle && (
                <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-3 flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                  <div className="flex-1 text-sm">
                    <p className="font-semibold text-green-900">Data fetched from Google!</p>
                    <p className="text-xs text-green-700">Review and edit anything below before submitting.</p>
                  </div>
                </div>
              )}

              {!fetchedFromGoogle && (
                <button
                  type="button"
                  onClick={() => setMode("choose")}
                  className="inline-flex items-center gap-1.5 text-xs text-[#6B6B6B] hover:text-[#E8705A]"
                >
                  <ArrowLeft size={12} /> Back to options
                </button>
              )}

              {/* Basic info */}
              <section className="bg-white border border-[#E8E4DF] rounded-3xl p-6 md:p-8">
                <div className="flex items-center gap-2 mb-5">
                  <Store size={17} className="text-[#E8705A]" />
                  <h2 className="font-bold text-[#1A1A1A]">Basic Information</h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Shop Name" required>
                    <input value={form.name} onChange={(e) => update("name", e.target.value)} required
                      className="input" placeholder="Bloom & Petal LA" />
                  </Field>
                  <Field label="Tagline">
                    <input value={form.tagline} onChange={(e) => update("tagline", e.target.value)}
                      className="input" placeholder="Artisan wedding florist since 2010" />
                  </Field>
                </div>

                <Field label="Description" className="mt-4">
                  <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={4}
                    className="input resize-none" placeholder="Tell people what makes your shop special — your story, specialties, and service areas." />
                </Field>
              </section>

              {/* Contact */}
              <section className="bg-white border border-[#E8E4DF] rounded-3xl p-6 md:p-8">
                <div className="flex items-center gap-2 mb-5">
                  <Phone size={17} className="text-[#E8705A]" />
                  <h2 className="font-bold text-[#1A1A1A]">Contact</h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Phone" required>
                    <input value={form.phone} onChange={(e) => update("phone", e.target.value)} type="tel" required
                      className="input" placeholder="(310) 555-0123" />
                  </Field>
                  <Field label="Email">
                    <input value={form.email} onChange={(e) => update("email", e.target.value)} type="email"
                      className="input" placeholder="hello@yourshop.com" />
                    <p className="text-[10px] text-[#9A9A9A] mt-1">Optional — will be shown publicly if provided</p>
                  </Field>
                  <Field label="Website" className="sm:col-span-2">
                    <input value={form.website} onChange={(e) => update("website", e.target.value)} type="url"
                      className="input" placeholder="https://yourshop.com" />
                  </Field>
                </div>
              </section>

              {/* Location */}
              <section className="bg-white border border-[#E8E4DF] rounded-3xl p-6 md:p-8">
                <div className="flex items-center gap-2 mb-5">
                  <MapPin size={17} className="text-[#E8705A]" />
                  <h2 className="font-bold text-[#1A1A1A]">Location</h2>
                </div>

                <Field label="Street Address" required>
                  <input value={form.address} onChange={(e) => update("address", e.target.value)} required
                    className="input" placeholder="123 Main Street, Suite 5" />
                </Field>

                <div className="grid sm:grid-cols-3 gap-4 mt-4">
                  <Field label="City" required>
                    <input value={form.city} onChange={(e) => update("city", e.target.value)} required list="cities"
                      className="input" placeholder="Los Angeles" />
                    <datalist id="cities">
                      {CITIES.map((c) => <option key={c} value={c} />)}
                    </datalist>
                  </Field>
                  <Field label="State">
                    <input value={form.state} onChange={(e) => update("state", e.target.value)}
                      className="input" placeholder="CA" maxLength={2} />
                  </Field>
                  <Field label="Zip Code">
                    <input value={form.pincode} onChange={(e) => update("pincode", e.target.value)}
                      className="input" placeholder="90210" />
                  </Field>
                </div>
              </section>

              {/* Categories */}
              <section className="bg-white border border-[#E8E4DF] rounded-3xl p-6 md:p-8">
                <div className="flex items-center gap-2 mb-5">
                  <Tag size={17} className="text-[#E8705A]" />
                  <h2 className="font-bold text-[#1A1A1A]">Specialties & Tags</h2>
                </div>

                <Field label="Categories">
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {CATEGORIES.map((cat) => {
                      const active = form.categories.includes(cat);
                      return (
                        <button key={cat} type="button" onClick={() => toggleCategory(cat)}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                            active
                              ? "bg-[#E8705A] text-white border-[#E8705A]"
                              : "bg-white text-[#4A4A4A] border-[#E8E4DF] hover:border-[#E8705A]"
                          }`}>
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                <Field label="Tags (comma-separated)" className="mt-4">
                  <input value={form.tags} onChange={(e) => update("tags", e.target.value)}
                    className="input" placeholder="Same-Day Delivery, Family Owned, Wedding Specialist" />
                </Field>

                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <Field label="Price Range">
                    <select value={form.priceRange} onChange={(e) => update("priceRange", e.target.value)} className="input">
                      <option value="budget">$ Budget-Friendly</option>
                      <option value="mid">$$ Mid-Range</option>
                      <option value="premium">$$$ Premium</option>
                    </select>
                  </Field>
                  <Field label="Services">
                    <label className="flex items-center gap-2 py-2 cursor-pointer">
                      <input type="checkbox" checked={form.deliveryAvailable}
                        onChange={(e) => update("deliveryAvailable", e.target.checked)}
                        className="w-4 h-4 accent-[#E8705A]" />
                      <span className="text-sm text-[#4A4A4A]">Offer delivery</span>
                    </label>
                  </Field>
                </div>
              </section>

              {/* Hours */}
              <section className="bg-white border border-[#E8E4DF] rounded-3xl p-6 md:p-8">
                <div className="flex items-center gap-2 mb-5">
                  <Clock size={17} className="text-[#E8705A]" />
                  <h2 className="font-bold text-[#1A1A1A]">Opening Hours</h2>
                </div>

                <div className="space-y-2">
                  {form.hours.map((h, i) => (
                    <div key={h.day} className="grid grid-cols-[100px_1fr_auto] gap-3 items-center">
                      <p className="text-sm font-medium text-[#1A1A1A]">{h.day}</p>
                      {h.closed ? (
                        <p className="text-sm text-[#9A9A9A] italic">Closed</p>
                      ) : (
                        <div className="flex gap-2 items-center">
                          <input type="time" value={h.open}
                            onChange={(e) => {
                              const newHours = [...form.hours];
                              newHours[i] = { ...newHours[i], open: e.target.value };
                              update("hours", newHours);
                            }}
                            className="input py-2 text-xs" />
                          <span className="text-xs text-[#6B6B6B]">to</span>
                          <input type="time" value={h.close}
                            onChange={(e) => {
                              const newHours = [...form.hours];
                              newHours[i] = { ...newHours[i], close: e.target.value };
                              update("hours", newHours);
                            }}
                            className="input py-2 text-xs" />
                        </div>
                      )}
                      <label className="flex items-center gap-1.5 text-xs text-[#6B6B6B] cursor-pointer">
                        <input type="checkbox" checked={h.closed}
                          onChange={(e) => {
                            const newHours = [...form.hours];
                            newHours[i] = { ...newHours[i], closed: e.target.checked };
                            update("hours", newHours);
                          }}
                          className="w-3.5 h-3.5 accent-[#E8705A]" />
                        Closed
                      </label>
                    </div>
                  ))}
                </div>
              </section>

              {/* Photos */}
              <section className="bg-white border border-[#E8E4DF] rounded-3xl p-6 md:p-8">
                <div className="flex items-center gap-2 mb-5">
                  <ImagePlus size={17} className="text-[#E8705A]" />
                  <h2 className="font-bold text-[#1A1A1A]">Photos</h2>
                </div>

                <div className="space-y-3">
                  {form.images.map((url, i) => (
                    <div key={i} className="flex gap-3">
                      <input value={url}
                        onChange={(e) => {
                          const newImgs = [...form.images];
                          newImgs[i] = e.target.value;
                          update("images", newImgs);
                        }}
                        className="input"
                        placeholder={`Image ${i + 1} URL`} />
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-[#9A9A9A] mt-2">Add 3-5 photo URLs. The first photo becomes your cover image.</p>
              </section>

              {/* Submit */}
              {submitError && (
                <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl p-3 text-sm flex items-start gap-2">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" /> {submitError}
                </div>
              )}

              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-xs text-[#6B6B6B]">
                  Your listing will be reviewed by our team within 2 business days.
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#E8705A] hover:bg-[#C95540] disabled:opacity-60 text-white font-semibold px-8 py-3 rounded-xl text-sm flex items-center gap-2"
                >
                  {isSubmitting
                    ? <><Loader2 size={14} className="animate-spin" /> Submitting…</>
                    : <>Submit Listing for Review</>}
                </button>
              </div>
            </form>
          )}

        </div>
      </main>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid #E8E4DF;
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: #1A1A1A;
          background: #FAFAF8;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .input:focus {
          border-color: #E8705A;
          box-shadow: 0 0 0 2px rgba(232,112,90,0.1);
        }
        .input::placeholder { color: #BBBBBB; }
      `}</style>
    </>
  );
}

function Field({ label, required, children, className = "" }: { label: string; required?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-xs font-semibold text-[#4A4A4A] mb-1.5">
        {label} {required && <span className="text-[#E8705A]">*</span>}
      </label>
      {children}
    </div>
  );
}
