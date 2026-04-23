"use client";

import { useTransition, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

type Category = { id: string; name: string; slug: string; color: string };

type Props = {
  action: (fd: FormData) => Promise<void>;
  defaultValues?: {
    title?: string; excerpt?: string; content?: string; coverImage?: string;
    category?: string; tags?: string; authorName?: string; authorBio?: string;
    authorEmail?: string; status?: string; featured?: boolean;
  };
  heading: string;
};

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

export default function ArticleForm({ action, defaultValues: d = {}, heading }: Props) {
  const [pending, startTransition] = useTransition();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => action(fd));
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/articles" className="w-8 h-8 rounded-xl border border-[#E8E4DF] bg-white flex items-center justify-center hover:bg-[#F9EBE8] transition-colors">
          <ArrowLeft size={15} className="text-[#6B6B6B]" />
        </Link>
        <h1 className="text-xl font-bold text-[#1A1A1A]">{heading}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white border border-[#E8E4DF] rounded-2xl p-6 space-y-5">
              <Field label="Title" required>
                <input name="title" defaultValue={d.title} placeholder="Article title" className={inputCls} required maxLength={120} />
              </Field>
              <Field label="Excerpt" required>
                <textarea name="excerpt" defaultValue={d.excerpt} placeholder="Short summary shown in listings..." rows={2} className={`${inputCls} resize-none`} required />
              </Field>
              <Field label="Cover Image URL">
                <input name="coverImage" defaultValue={d.coverImage} placeholder="https://..." className={inputCls} />
              </Field>
              <Field label="Content" required>
                <div className="text-xs text-[#6B6B6B] mb-1">Use ## for headings, **bold**, - for bullets</div>
                <textarea name="content" defaultValue={d.content} placeholder="Write your article here..." rows={22} className={`${inputCls} resize-y font-mono leading-relaxed`} required />
              </Field>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Publish */}
            <div className="bg-white border border-[#E8E4DF] rounded-2xl p-5 space-y-4">
              <h3 className="font-semibold text-[#1A1A1A] text-sm">Publish Settings</h3>

              <Field label="Status">
                <select name="status" defaultValue={d.status ?? "pending"} className={inputCls}>
                  <option value="pending">Pending</option>
                  <option value="published">Published</option>
                  <option value="rejected">Rejected</option>
                </select>
              </Field>

              <Field label="Featured">
                <select name="featured" defaultValue={d.featured ? "true" : "false"} className={inputCls}>
                  <option value="false">No</option>
                  <option value="true">Yes: show on homepage</option>
                </select>
              </Field>

              <button type="submit" disabled={pending} className="w-full flex items-center justify-center gap-2 bg-[#E8705A] hover:bg-[#C95540] disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all">
                {pending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {pending ? "Saving…" : "Save Article"}
              </button>
            </div>

            {/* Meta */}
            <div className="bg-white border border-[#E8E4DF] rounded-2xl p-5 space-y-4">
              <h3 className="font-semibold text-[#1A1A1A] text-sm">Article Info</h3>

              <Field label="Category" required>
                <select name="category" defaultValue={d.category} className={inputCls} required>
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </Field>

              <Field label="Tags">
                <input name="tags" defaultValue={d.tags} placeholder="Roses, Care, Beginners" className={inputCls} />
                <p className="text-xs text-[#6B6B6B] mt-1">Comma separated</p>
              </Field>
            </div>

            {/* Author */}
            <div className="bg-white border border-[#E8E4DF] rounded-2xl p-5 space-y-4">
              <h3 className="font-semibold text-[#1A1A1A] text-sm">Author</h3>
              <Field label="Name" required>
                <input name="authorName" defaultValue={d.authorName} placeholder="Author name" className={inputCls} required />
              </Field>
              <Field label="Email">
                <input name="authorEmail" type="email" defaultValue={d.authorEmail} placeholder="author@example.com" className={inputCls} />
              </Field>
              <Field label="Bio">
                <textarea name="authorBio" defaultValue={d.authorBio} placeholder="Short bio..." rows={2} className={`${inputCls} resize-none`} />
              </Field>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
