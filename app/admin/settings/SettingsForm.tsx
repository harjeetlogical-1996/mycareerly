"use client";

import { useState, useTransition, useRef } from "react";
import Image from "next/image";
import {
  Save, Loader2, CheckCircle2, Upload, X,
  Mail, Phone, MapPin, Image as ImageIcon,
} from "lucide-react";
import { saveSettings } from "../../actions/settings";
import { SETTING_KEYS } from "../../lib/setting-keys";

// Inline social SVG icons (older lucide-react lacks some)
const socialIconProps = { width: 14, height: 14, viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": true } as const;
const InstagramIcon = ({ size = 14 }: { size?: number }) => (
  <svg {...socialIconProps} width={size} height={size}><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2zm-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6zm9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/></svg>
);
const FacebookIcon = ({ size = 14 }: { size?: number }) => (
  <svg {...socialIconProps} width={size} height={size}><path d="M12 2C6.48 2 2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95 0-5.52-4.48-10-10-10z"/></svg>
);
const YoutubeIcon = ({ size = 14 }: { size?: number }) => (
  <svg {...socialIconProps} width={size} height={size}><path d="M23 12s0-3.66-.46-5.42a2.78 2.78 0 0 0-2-2C18.75 4 12 4 12 4s-6.75 0-8.54.58a2.78 2.78 0 0 0-2 2C1 8.34 1 12 1 12s0 3.66.46 5.42a2.78 2.78 0 0 0 2 2C5.25 20 12 20 12 20s6.75 0 8.54-.58a2.78 2.78 0 0 0 2-2C23 15.66 23 12 23 12zM9.75 15.5v-7l6 3.5-6 3.5z"/></svg>
);
const LinkedinIcon = ({ size = 14 }: { size?: number }) => (
  <svg {...socialIconProps} width={size} height={size}><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46C23.2 24 24 23.23 24 22.28V1.72C24 .77 23.2 0 22.23 0z"/></svg>
);

type Settings = Record<string, string>;

// Pinterest/TikTok inline SVGs since lucide doesn't have them
const PinterestIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0a12 12 0 0 0-4.37 23.17c-.1-.93-.19-2.37.04-3.39.21-.93 1.37-5.94 1.37-5.94s-.35-.7-.35-1.73c0-1.63.94-2.84 2.12-2.84 1 0 1.48.75 1.48 1.65 0 1.01-.64 2.51-.97 3.91-.28 1.17.59 2.13 1.75 2.13 2.1 0 3.72-2.22 3.72-5.42 0-2.83-2.04-4.81-4.95-4.81-3.37 0-5.35 2.53-5.35 5.14 0 1.02.39 2.11.88 2.7.1.12.11.22.08.34-.09.37-.29 1.18-.33 1.35-.05.22-.17.27-.4.16-1.49-.69-2.42-2.87-2.42-4.62 0-3.76 2.73-7.22 7.88-7.22 4.14 0 7.35 2.95 7.35 6.89 0 4.11-2.59 7.42-6.19 7.42-1.21 0-2.34-.63-2.73-1.37l-.74 2.83c-.27 1.03-1 2.33-1.49 3.12A12 12 0 1 0 12 0z"/></svg>
);
const TikTokIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.87a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.3z"/></svg>
);

type Field = {
  key: string;
  label: string;
  type: "text" | "url" | "email" | "phone" | "textarea" | "image" | "toggle";
  placeholder?: string;
  hint?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  folder?: string;
};

export default function SettingsForm({ initial }: { initial: Settings }) {
  const [values, setValues] = useState<Settings>(initial);
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [result, setResult] = useState<{ success: boolean; count?: number } | null>(null);
  const [isPending, startTransition] = useTransition();

  const update = (key: string, v: string) => setValues({ ...values, [key]: v });

  const handleUpload = async (key: string, file: File, folder = "uploads") => {
    setUploading(key);
    setUploadError("");
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("folder", folder);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success && data.url) {
        update(key, data.url);
      } else {
        setUploadError(data.error || "Upload failed");
      }
    } catch (e: any) {
      setUploadError(e.message || "Upload failed");
    } finally {
      setUploading(null);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResult(null);
    const fd = new FormData();
    for (const k of Object.keys(values)) {
      fd.set(k, values[k] ?? "");
    }
    startTransition(async () => {
      const res = await saveSettings(fd);
      setResult(res);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ── Branding ──────────────────────────────────────────────────── */}
      <Section title="🎨 Branding" desc="Site name, tagline, logos, and favicon">
        <Grid2>
          <Input field={{ key: SETTING_KEYS.SITE_NAME, label: "Site Name", type: "text", placeholder: "MyCareerly" }}
                 values={values} onChange={update} />
          <Input field={{ key: SETTING_KEYS.SITE_TAGLINE, label: "Tagline", type: "text", placeholder: "America's Flower Shop Directory" }}
                 values={values} onChange={update} />
        </Grid2>
        <Grid2>
          <ImageUpload
            label="Header Logo (navbar)"
            hint="PNG/SVG. Transparent background. 200x60 recommended."
            value={values[SETTING_KEYS.HEADER_LOGO_URL] ?? ""}
            field={SETTING_KEYS.HEADER_LOGO_URL}
            folder="logos"
            onChange={update}
            onUpload={handleUpload}
            uploading={uploading === SETTING_KEYS.HEADER_LOGO_URL}
          />
          <ImageUpload
            label="Footer Logo"
            hint="Often a white/light version. Same dimensions as header works."
            value={values[SETTING_KEYS.FOOTER_LOGO_URL] ?? ""}
            field={SETTING_KEYS.FOOTER_LOGO_URL}
            folder="logos"
            onChange={update}
            onUpload={handleUpload}
            uploading={uploading === SETTING_KEYS.FOOTER_LOGO_URL}
          />
        </Grid2>
        <ImageUpload
          label="Favicon"
          hint="Browser tab icon. PNG 32x32 or ICO. Auto-served at /favicon.ico."
          value={values[SETTING_KEYS.FAVICON_URL] ?? ""}
          field={SETTING_KEYS.FAVICON_URL}
          folder="logos"
          onChange={update}
          onUpload={handleUpload}
          uploading={uploading === SETTING_KEYS.FAVICON_URL}
        />
        {uploadError && (
          <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl p-3 text-xs">
            {uploadError}
          </div>
        )}
      </Section>

      {/* ── Social Media ──────────────────────────────────────────────── */}
      <Section title="📱 Social Media" desc="Icons appear in site footer. Leave blank to hide.">
        <Grid2>
          <SocialInput icon={InstagramIcon} field={SETTING_KEYS.SOCIAL_INSTAGRAM}
                      label="Instagram URL" placeholder="https://instagram.com/mycareerly"
                      values={values} onChange={update} />
          <SocialInput icon={FacebookIcon} field={SETTING_KEYS.SOCIAL_FACEBOOK}
                      label="Facebook URL" placeholder="https://facebook.com/mycareerly"
                      values={values} onChange={update} />
          <SocialInput icon={PinterestIcon} field={SETTING_KEYS.SOCIAL_PINTEREST}
                      label="Pinterest URL" placeholder="https://pinterest.com/mycareerly"
                      values={values} onChange={update} />
          <SocialInput icon={YoutubeIcon} field={SETTING_KEYS.SOCIAL_YOUTUBE}
                      label="YouTube URL" placeholder="https://youtube.com/@mycareerly"
                      values={values} onChange={update} />
          <SocialInput icon={TikTokIcon} field={SETTING_KEYS.SOCIAL_TIKTOK}
                      label="TikTok URL (optional)" placeholder="https://tiktok.com/@mycareerly"
                      values={values} onChange={update} />
          <SocialInput icon={LinkedinIcon} field={SETTING_KEYS.SOCIAL_LINKEDIN}
                      label="LinkedIn URL (optional)" placeholder="https://linkedin.com/company/mycareerly"
                      values={values} onChange={update} />
        </Grid2>
      </Section>

      {/* ── Contact ───────────────────────────────────────────────────── */}
      <Section title="📞 Contact Info" desc="Shown in footer, contact page, and ContactPoint schema">
        <Grid2>
          <IconInput icon={Mail} field={SETTING_KEYS.CONTACT_EMAIL}
                     label="Contact Email" type="email" placeholder="hello@mycareerly.com"
                     values={values} onChange={update} />
          <IconInput icon={Phone} field={SETTING_KEYS.CONTACT_PHONE}
                     label="Contact Phone (optional)" type="text" placeholder="+1 (555) 123-4567"
                     values={values} onChange={update} />
        </Grid2>
        <div>
          <label className="block text-xs font-semibold text-[#4A4A4A] mb-1.5 flex items-center gap-1">
            <MapPin size={11} className="text-[#E8705A]" /> Address (optional)
          </label>
          <textarea
            value={values[SETTING_KEYS.CONTACT_ADDRESS] ?? ""}
            onChange={(e) => update(SETTING_KEYS.CONTACT_ADDRESS, e.target.value)}
            rows={2}
            placeholder="123 Main St, Suite 4B, Brooklyn, NY 11201"
            className="w-full border border-[#E8E4DF] rounded-xl px-4 py-2.5 text-sm bg-[#FAFAF8] focus:outline-none focus:border-[#E8705A] resize-none"
          />
        </div>
      </Section>

      {/* ── SEO Defaults ──────────────────────────────────────────────── */}
      <Section title="🔎 SEO Defaults" desc="Fallback meta used where pages haven't set their own">
        <div>
          <label className="block text-xs font-semibold text-[#4A4A4A] mb-1.5">Default Meta Description</label>
          <textarea
            value={values[SETTING_KEYS.DEFAULT_META_DESCRIPTION] ?? ""}
            onChange={(e) => update(SETTING_KEYS.DEFAULT_META_DESCRIPTION, e.target.value)}
            rows={2}
            maxLength={160}
            placeholder="America's trusted flower shop directory. 500+ verified florists, expert flower guides, and more."
            className="w-full border border-[#E8E4DF] rounded-xl px-4 py-2.5 text-sm bg-[#FAFAF8] focus:outline-none focus:border-[#E8705A] resize-none"
          />
          <p className="text-[10px] text-[#9A9A9A] mt-1">{(values[SETTING_KEYS.DEFAULT_META_DESCRIPTION] ?? "").length}/160 characters</p>
        </div>
        <ImageUpload
          label="Default OG / Share Image"
          hint="1200x630 recommended. Used when pages don't set their own OG image."
          value={values[SETTING_KEYS.DEFAULT_OG_IMAGE] ?? ""}
          field={SETTING_KEYS.DEFAULT_OG_IMAGE}
          folder="og-images"
          onChange={update}
          onUpload={handleUpload}
          uploading={uploading === SETTING_KEYS.DEFAULT_OG_IMAGE}
        />
      </Section>

      {/* ── Features ──────────────────────────────────────────────────── */}
      <Section title="⚙️ Features" desc="Toggle features on/off site-wide">
        <Toggle
          field={SETTING_KEYS.ENABLE_NEWSLETTER}
          label="Newsletter signup"
          desc="Show newsletter form on homepage + article pages"
          values={values}
          onChange={update}
          defaultOn
        />
        <Toggle
          field={SETTING_KEYS.ENABLE_REVIEWS}
          label="User reviews on listings"
          desc="Allow visitors to submit reviews on florist pages (moderated)"
          values={values}
          onChange={update}
          defaultOn
        />
      </Section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <Section title="📄 Footer" desc="Customize the footer copy">
        <Input field={{ key: SETTING_KEYS.FOOTER_COPYRIGHT, label: "Copyright Line", type: "text", placeholder: "© 2026 MyCareerly. All rights reserved." }}
               values={values} onChange={update} />
      </Section>

      {/* Save */}
      {result?.success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-100 text-green-700 rounded-xl p-3 text-sm">
          <CheckCircle2 size={14} /> Settings saved! Changes are live across the site.
        </div>
      )}

      <div className="flex items-center justify-between gap-3 sticky bottom-4 bg-white border border-[#E8E4DF] rounded-2xl px-5 py-3 shadow-lg z-10">
        <p className="text-xs text-[#6B6B6B]">Changes apply immediately — no code deploy needed.</p>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 bg-[#E8705A] hover:bg-[#C95540] disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl text-sm"
        >
          {isPending ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Save size={13} /> Save All Settings</>}
        </button>
      </div>
    </form>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────
function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-[#E8E4DF] rounded-3xl p-6 space-y-4">
      <div>
        <h2 className="font-bold text-[#1A1A1A]">{title}</h2>
        <p className="text-xs text-[#6B6B6B] mt-0.5">{desc}</p>
      </div>
      {children}
    </section>
  );
}

function Grid2({ children }: { children: React.ReactNode }) {
  return <div className="grid sm:grid-cols-2 gap-4">{children}</div>;
}

function Input({
  field, values, onChange,
}: {
  field: Field; values: Settings; onChange: (k: string, v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#4A4A4A] mb-1.5">{field.label}</label>
      <input
        type={field.type === "phone" ? "tel" : field.type}
        value={values[field.key] ?? ""}
        onChange={(e) => onChange(field.key, e.target.value)}
        placeholder={field.placeholder}
        className="w-full border border-[#E8E4DF] rounded-xl px-4 py-2.5 text-sm bg-[#FAFAF8] focus:outline-none focus:border-[#E8705A]"
      />
      {field.hint && <p className="text-[10px] text-[#9A9A9A] mt-1">{field.hint}</p>}
    </div>
  );
}

function IconInput({
  icon: Icon, field, label, type, placeholder, values, onChange,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  field: string; label: string; type: string; placeholder: string;
  values: Settings; onChange: (k: string, v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#4A4A4A] mb-1.5 flex items-center gap-1">
        <Icon size={11} className="text-[#E8705A]" /> {label}
      </label>
      <input
        type={type === "phone" ? "tel" : type}
        value={values[field] ?? ""}
        onChange={(e) => onChange(field, e.target.value)}
        placeholder={placeholder}
        className="w-full border border-[#E8E4DF] rounded-xl px-4 py-2.5 text-sm bg-[#FAFAF8] focus:outline-none focus:border-[#E8705A]"
      />
    </div>
  );
}

function SocialInput({
  icon: Icon, field, label, placeholder, values, onChange,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  field: string; label: string; placeholder: string;
  values: Settings; onChange: (k: string, v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#4A4A4A] mb-1.5 flex items-center gap-1.5">
        <Icon size={12} className="text-[#E8705A]" /> {label}
      </label>
      <input
        type="url"
        value={values[field] ?? ""}
        onChange={(e) => onChange(field, e.target.value)}
        placeholder={placeholder}
        className="w-full border border-[#E8E4DF] rounded-xl px-4 py-2.5 text-sm bg-[#FAFAF8] focus:outline-none focus:border-[#E8705A]"
      />
    </div>
  );
}

function Toggle({
  field, label, desc, values, onChange, defaultOn,
}: {
  field: string; label: string; desc: string;
  values: Settings; onChange: (k: string, v: string) => void;
  defaultOn?: boolean;
}) {
  const rawValue = values[field];
  // Interpret empty string as default, "true" = on, "false" = off
  const isOn = rawValue === "" ? (defaultOn ?? false) : rawValue === "true";
  return (
    <div className="flex items-center justify-between gap-4 p-3 bg-[#FAFAF8] rounded-xl border border-[#E8E4DF]">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#1A1A1A]">{label}</p>
        <p className="text-xs text-[#6B6B6B]">{desc}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(field, isOn ? "false" : "true")}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
          isOn ? "bg-[#E8705A]" : "bg-[#E8E4DF]"
        }`}
      >
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
          isOn ? "translate-x-5" : "translate-x-0.5"
        }`} />
      </button>
    </div>
  );
}

function ImageUpload({
  label, hint, value, field, folder, onChange, onUpload, uploading,
}: {
  label: string; hint?: string; value: string; field: string; folder: string;
  onChange: (k: string, v: string) => void;
  onUpload: (key: string, file: File, folder: string) => Promise<void>;
  uploading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <label className="block text-xs font-semibold text-[#4A4A4A] mb-1.5 flex items-center gap-1">
        <ImageIcon size={11} className="text-[#E8705A]" /> {label}
      </label>
      <div className="flex items-start gap-3">
        {/* Preview */}
        <div className="relative w-24 h-24 bg-[#FAFAF8] border-2 border-dashed border-[#E8E4DF] rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
          {value ? (
            <>
              <Image src={value} alt={label} fill sizes="96px" className="object-contain" />
              <button
                type="button"
                onClick={() => onChange(field, "")}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                aria-label="Remove"
              >
                <X size={11} />
              </button>
            </>
          ) : (
            <ImageIcon size={20} className="text-[#C0B8B2]" />
          )}
        </div>

        {/* Upload / URL */}
        <div className="flex-1 min-w-0 space-y-2">
          <input
            type="file"
            ref={inputRef}
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(field, file, folder);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E8705A] border border-[#E8705A]/40 hover:bg-[#FEF0ED] px-3 py-2 rounded-lg disabled:opacity-60"
          >
            {uploading ? <><Loader2 size={11} className="animate-spin" /> Uploading…</> : <><Upload size={11} /> Upload image</>}
          </button>
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(field, e.target.value)}
            placeholder="or paste image URL"
            className="w-full border border-[#E8E4DF] rounded-xl px-3 py-1.5 text-xs bg-white focus:outline-none focus:border-[#E8705A]"
          />
          {hint && <p className="text-[10px] text-[#9A9A9A]">{hint}</p>}
        </div>
      </div>
    </div>
  );
}
