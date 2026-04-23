"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Upload, Sparkles, Image as ImageIcon, Send, Clock, Check, ArrowLeft, AlertCircle, Loader2, Type, Wand2, RefreshCw, X } from "lucide-react";
import { createPin, generatePinImage, attachUploadedImage, previewPinHook, generateHookOptions } from "../../../../../actions/pinterest";

type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  category: string;
  tags: string[];
};

type Account = {
  id: string;
  username: string;
  label: string;
  defaultBoardId: string;
  mappings: Array<{ category: string; boardId: string; boardName: string }>;
};

type PinImage = { id: string; url: string; source: string };

export default function PinComposer({
  article,
  accounts,
  images: initialImages,
  aiEnabled,
}: {
  article: Article;
  accounts: Account[];
  images: PinImage[];
  aiEnabled: boolean;
}) {
  const router = useRouter();
  const [images, setImages] = useState<PinImage[]>(initialImages);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null); // null = use article cover
  const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0]?.id || "");
  const [boardId, setBoardId] = useState<string>(() => {
    const a = accounts[0];
    if (!a) return "";
    const mapped = a.mappings.find((m) => m.category === article.category);
    return mapped?.boardId || a.defaultBoardId;
  });
  const [title, setTitle] = useState(article.title.slice(0, 100));
  const [description, setDescription] = useState(article.excerpt || article.title);
  const [hashtags, setHashtags] = useState(article.tags.slice(0, 8).map((t) => "#" + t.replace(/\s+/g, "")).join(" "));
  const [scheduleMode, setScheduleMode] = useState<"now" | "later" | "draft">("now");
  const [scheduledFor, setScheduledFor] = useState("");
  const [variantIndex, setVariantIndex] = useState(0);
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const [aiBusy, setAiBusy] = useState(false);
  const [showHookPicker, setShowHookPicker] = useState(false);
  const [hookOptions, setHookOptions] = useState<string[]>([]);
  const [hookBusy, setHookBusy] = useState(false);
  const [editingHookIndex, setEditingHookIndex] = useState<number | null>(null);
  const [generatingForHook, setGeneratingForHook] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);
  const selectedImage = images.find((i) => i.id === selectedImageId);
  const effectiveImageUrl = selectedImage?.url || article.coverImage;

  const descLen = description.length + (hashtags ? hashtags.length + 2 : 0);

  async function handleGenerateClean() {
    if (!aiEnabled) {
      setMsg("Add a Gemini API key in Settings to enable AI image generation");
      return;
    }
    setAiBusy(true);
    setMsg("Generating clean image with Nano Banana… (10-20s)");
    const res = await generatePinImage(article.id, variantIndex, { withOverlay: false });
    setAiBusy(false);
    if (res.ok && res.imageId && res.url) {
      setImages([{ id: res.imageId, url: res.url, source: "ai" }, ...images]);
      setSelectedImageId(res.imageId);
      setVariantIndex((v) => v + 1);
      setMsg("AI clean image generated");
      setTimeout(() => setMsg(""), 3000);
    } else {
      setMsg("Generate failed: " + (res.error || "unknown"));
    }
  }

  async function handleGenerateHookOptions() {
    if (!aiEnabled) {
      setMsg("Add a Gemini API key in Settings");
      return;
    }
    setHookBusy(true);
    setShowHookPicker(true);
    setHookOptions([]);
    setMsg("Writing 6 clickable headline options…");
    const res = await generateHookOptions(article.id, 6);
    setHookBusy(false);
    if (res.ok && res.hooks && res.hooks.length > 0) {
      setHookOptions(res.hooks);
      setMsg("");
    } else {
      setMsg("Hook generation failed: " + (res.error || "unknown"));
      setShowHookPicker(false);
    }
  }

  async function handleRegenerateHooks() {
    setHookBusy(true);
    setMsg("Regenerating headlines…");
    const res = await generateHookOptions(article.id, 6);
    setHookBusy(false);
    if (res.ok && res.hooks) {
      setHookOptions(res.hooks);
      setMsg("");
    } else {
      setMsg("Regenerate failed: " + (res.error || "unknown"));
    }
  }

  async function handlePickHookAndGenerate(hookIndex: number, finalHook: string) {
    setGeneratingForHook(hookIndex);
    setAiBusy(true);
    setMsg(`Generating Pinterest image with: "${finalHook.slice(0, 50)}"…`);
    const res = await generatePinImage(article.id, variantIndex, {
      withOverlay: true,
      customHook: finalHook,
    });
    setAiBusy(false);
    setGeneratingForHook(null);
    if (res.ok && res.imageId && res.url) {
      setImages([{ id: res.imageId, url: res.url, source: "ai-overlay" }, ...images]);
      setSelectedImageId(res.imageId);
      setVariantIndex((v) => v + 1);
      setShowHookPicker(false);
      setEditingHookIndex(null);
      setMsg(`Generated with: "${finalHook.slice(0, 50)}"`);
      setTimeout(() => setMsg(""), 4000);
    } else {
      setMsg("Generate failed: " + (res.error || "unknown"));
    }
  }

  async function handleUpload(file: File) {
    setMsg("Uploading…");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", `pinterest/${article.id}`);
    fd.append("slug", article.slug);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (!res.ok) {
      setMsg("Upload failed");
      return;
    }
    const data = await res.json();
    if (!data.url) { setMsg("Upload returned no URL"); return; }
    const attached = await attachUploadedImage(article.id, data.url);
    const img = { id: attached.id, url: data.url, source: "upload" };
    setImages([img, ...images]);
    setSelectedImageId(attached.id);
    setMsg("Uploaded");
    setTimeout(() => setMsg(""), 2000);
  }

  function handleAccountChange(id: string) {
    setSelectedAccountId(id);
    const a = accounts.find((x) => x.id === id);
    if (a) {
      const mapped = a.mappings.find((m) => m.category === article.category);
      setBoardId(mapped?.boardId || a.defaultBoardId);
    }
  }

  function submit() {
    if (!selectedAccount) { setMsg("Pick an account"); return; }
    if (!boardId) { setMsg("Enter a board ID"); return; }
    if (!title.trim()) { setMsg("Title is required"); return; }

    const payload = {
      accountId: selectedAccount.id,
      articleId: article.id,
      imageId: selectedImageId,
      title,
      description,
      hashtags,
      boardId,
      scheduledFor: scheduleMode === "later" ? scheduledFor : null,
      postNow: scheduleMode === "now",
    };
    start(async () => {
      const res = await createPin(payload);
      if (res.ok) {
        setMsg(scheduleMode === "now" ? "Queued for posting" : scheduleMode === "later" ? "Scheduled" : "Saved as draft");
        setTimeout(() => router.push(`/admin/pinterest/articles/${article.id}`), 800);
      } else {
        setMsg("Error: " + (res.error || "failed"));
      }
    });
  }

  return (
    <div className="p-8">
      <Link href="/admin/pinterest/articles" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B6B6B] hover:text-[#E60023] mb-4">
        <ArrowLeft size={12} /> Back to Articles
      </Link>

      <div className="mb-4">
        <h1 className="text-xl font-bold text-[#1A1A1A]">Create Pin</h1>
        <p className="text-sm text-[#6B6B6B] line-clamp-1">For: {article.title}</p>
      </div>

      {accounts.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-sm text-amber-900 flex items-start gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <div>No active Pinterest accounts. <Link href="/admin/pinterest/accounts" className="font-semibold underline">Connect one</Link> to continue.</div>
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* LEFT: form */}
        <div className="space-y-5">
          {/* Image picker */}
          <div className="bg-white border border-[#E8E4DF] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-[#1A1A1A]">Pin Image</p>
              <div className="flex items-center gap-1">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUpload(f);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#6B6B6B] hover:text-[#E60023] px-2 py-1 rounded-lg"
                >
                  <Upload size={12} /> Upload
                </button>
                <button
                  type="button"
                  disabled={aiBusy || hookBusy}
                  onClick={handleGenerateClean}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#6B6B6B] bg-[#FAFAF8] hover:bg-[#F0EFEC] px-2.5 py-1.5 rounded-lg disabled:opacity-50"
                  title={aiEnabled ? "Generate clean image without overlay text" : "Add Gemini key in Settings"}
                >
                  {aiBusy ? <Loader2 size={12} className="animate-spin" /> : <ImageIcon size={12} />}
                  AI Clean
                </button>
                <button
                  type="button"
                  disabled={aiBusy || hookBusy}
                  onClick={handleGenerateHookOptions}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-gradient-to-r from-[#E60023] to-[#E8705A] hover:from-[#AD081B] hover:to-[#C95540] px-3 py-1.5 rounded-lg disabled:opacity-50"
                  title={aiEnabled ? "Generate 6 clickable headline options, pick one, then generate the image" : "Add Gemini key in Settings"}
                >
                  {hookBusy ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                  AI + Hook
                </button>
              </div>
            </div>

            {/* Hook picker — step 1: pick a hook, step 2: generate image */}
            {showHookPicker && (
              <div className="mb-3 p-4 bg-gradient-to-br from-[#FEF0ED] via-[#FEF6F3] to-[#F9EBE8] border border-[#E8705A]/40 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-bold text-[#1A1A1A] inline-flex items-center gap-2">
                      <Wand2 size={14} className="text-[#E60023]" />
                      Step 1: Pick a Pinterest headline
                    </p>
                    <p className="text-[11px] text-[#6B6B6B] mt-0.5">6 clickable hook ideas written by AI for this article. Pick one and the image will generate with it as overlay.</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={hookBusy || aiBusy}
                      onClick={handleRegenerateHooks}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#6B6B6B] hover:text-[#E60023] px-2 py-1 disabled:opacity-50"
                      title="Get 6 fresh options"
                    >
                      {hookBusy ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
                      Regenerate
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowHookPicker(false); setEditingHookIndex(null); }}
                      className="text-[#6B6B6B] hover:text-[#1A1A1A] p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {hookBusy && hookOptions.length === 0 ? (
                  <div className="py-8 flex flex-col items-center gap-2">
                    <Loader2 size={24} className="animate-spin text-[#E60023]" />
                    <p className="text-xs text-[#6B6B6B]">Writing 6 hook ideas for this article…</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-2">
                    {hookOptions.map((hook, i) => {
                      const isEditing = editingHookIndex === i;
                      const isGenerating = generatingForHook === i;
                      return (
                        <div
                          key={i}
                          className={`bg-white border rounded-xl p-3 transition-all ${
                            isGenerating ? "border-[#E60023] ring-2 ring-[#E60023]/20" : "border-[#E8E4DF] hover:border-[#E8705A]/50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="text-[9px] font-bold text-[#E60023] bg-[#E60023]/10 px-1.5 py-0.5 rounded">#{i + 1}</span>
                            {!isEditing && (
                              <button
                                type="button"
                                onClick={() => setEditingHookIndex(i)}
                                className="text-[10px] text-[#6B6B6B] hover:text-[#E60023] font-semibold"
                                disabled={aiBusy}
                              >
                                Edit
                              </button>
                            )}
                          </div>
                          {isEditing ? (
                            <textarea
                              value={hook}
                              onChange={(e) => {
                                const next = [...hookOptions];
                                next[i] = e.target.value.slice(0, 100);
                                setHookOptions(next);
                              }}
                              rows={2}
                              className="w-full px-2 py-1.5 border border-[#E8E4DF] rounded-lg text-sm focus:border-[#E60023] outline-none resize-none mb-2"
                              autoFocus
                              onBlur={() => setEditingHookIndex(null)}
                            />
                          ) : (
                            <p className="text-sm font-semibold text-[#1A1A1A] leading-snug mb-2 min-h-[2.5rem]">
                              {hook}
                            </p>
                          )}
                          <button
                            type="button"
                            disabled={aiBusy || !hook.trim()}
                            onClick={() => handlePickHookAndGenerate(i, hook.trim())}
                            className={`w-full inline-flex items-center justify-center gap-1 text-xs font-bold px-2 py-1.5 rounded-lg transition-colors ${
                              isGenerating
                                ? "bg-[#E60023] text-white"
                                : "bg-[#FAFAF8] hover:bg-[#E60023] hover:text-white text-[#1A1A1A]"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {isGenerating ? (
                              <><Loader2 size={11} className="animate-spin" /> Generating image…</>
                            ) : (
                              <><Sparkles size={11} /> Use this headline</>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {/* Article cover */}
              <button
                type="button"
                onClick={() => setSelectedImageId(null)}
                className={`relative aspect-[2/3] rounded-xl overflow-hidden border-2 ${
                  selectedImageId === null ? "border-[#E60023] ring-2 ring-[#E60023]/20" : "border-transparent hover:border-[#E8E4DF]"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={article.coverImage} alt="cover" className="w-full h-full object-cover" />
                <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-black/60 text-white px-1 py-0.5 rounded">cover</span>
                {selectedImageId === null && (
                  <div className="absolute top-1 right-1 w-5 h-5 bg-[#E60023] rounded-full flex items-center justify-center">
                    <Check size={11} className="text-white" />
                  </div>
                )}
              </button>

              {images.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setSelectedImageId(img.id)}
                  className={`relative aspect-[2/3] rounded-xl overflow-hidden border-2 ${
                    selectedImageId === img.id ? "border-[#E60023] ring-2 ring-[#E60023]/20" : "border-transparent hover:border-[#E8E4DF]"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <span className={`absolute bottom-1 left-1 text-[9px] font-bold px-1 py-0.5 rounded ${
                    img.source === "ai-overlay"
                      ? "bg-gradient-to-r from-[#E60023] to-[#E8705A] text-white"
                      : "bg-black/60 text-white"
                  }`}>
                    {img.source === "ai-overlay" ? "AI+Hook" : img.source === "ai" ? "AI" : "upload"}
                  </span>
                  {selectedImageId === img.id && (
                    <div className="absolute top-1 right-1 w-5 h-5 bg-[#E60023] rounded-full flex items-center justify-center">
                      <Check size={11} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            {!aiEnabled && (
              <p className="text-[10px] text-[#8A8A8A] mt-2">
                <Link href="/admin/pinterest/settings" className="underline">Add a Gemini API key</Link> to enable AI image generation.
              </p>
            )}
          </div>

          {/* Pin text */}
          <div className="bg-white border border-[#E8E4DF] rounded-2xl p-5 space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Title</label>
                <span className={`text-[10px] ${title.length > 100 ? "text-red-600" : "text-[#8A8A8A]"}`}>{title.length}/100</span>
              </div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 100))}
                className="w-full px-3 py-2 border border-[#E8E4DF] rounded-xl text-sm focus:border-[#E60023] outline-none"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Description</label>
                <span className={`text-[10px] ${descLen > 500 ? "text-red-600" : "text-[#8A8A8A]"}`}>{descLen}/500 (with hashtags)</span>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-[#E8E4DF] rounded-xl text-sm focus:border-[#E60023] outline-none resize-y"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-1">Hashtags</label>
              <input
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="#flowers #bouquet"
                className="w-full px-3 py-2 border border-[#E8E4DF] rounded-xl text-sm font-mono focus:border-[#E60023] outline-none"
              />
            </div>
          </div>

          {/* Account + board */}
          <div className="bg-white border border-[#E8E4DF] rounded-2xl p-5 grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-1">Post From Account</label>
              <select
                value={selectedAccountId}
                onChange={(e) => handleAccountChange(e.target.value)}
                className="w-full px-3 py-2 border border-[#E8E4DF] rounded-xl text-sm focus:border-[#E60023] outline-none"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>@{a.username}{a.label ? ` — ${a.label}` : ""}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-1">Board ID</label>
              <input
                value={boardId}
                onChange={(e) => setBoardId(e.target.value)}
                placeholder="board id"
                className="w-full px-3 py-2 border border-[#E8E4DF] rounded-xl text-sm font-mono focus:border-[#E60023] outline-none"
              />
              <p className="text-[10px] text-[#8A8A8A] mt-1">Defaults resolved via category mapping. Manage in Accounts tab.</p>
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-white border border-[#E8E4DF] rounded-2xl p-5">
            <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-2">When to post</p>
            <div className="flex gap-2 flex-wrap">
              {[
                { key: "now", label: "Post now", icon: <Send size={12} /> },
                { key: "later", label: "Schedule", icon: <Clock size={12} /> },
                { key: "draft", label: "Save as draft", icon: <ImageIcon size={12} /> },
              ].map((o) => (
                <button
                  key={o.key}
                  type="button"
                  onClick={() => setScheduleMode(o.key as any)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    scheduleMode === o.key ? "bg-[#E60023] text-white" : "bg-[#FAFAF8] text-[#6B6B6B] hover:text-[#1A1A1A]"
                  }`}
                >
                  {o.icon} {o.label}
                </button>
              ))}
            </div>
            {scheduleMode === "later" && (
              <input
                type="datetime-local"
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
                className="mt-3 px-3 py-2 border border-[#E8E4DF] rounded-xl text-sm focus:border-[#E60023] outline-none"
              />
            )}
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3">
            <button
              onClick={submit}
              disabled={pending || accounts.length === 0}
              className="inline-flex items-center gap-2 bg-[#E60023] hover:bg-[#AD081B] disabled:bg-gray-300 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
            >
              {pending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {scheduleMode === "now" ? "Queue Pin" : scheduleMode === "later" ? "Schedule Pin" : "Save Draft"}
            </button>
            {msg && <span className="text-xs text-[#6B6B6B]">{msg}</span>}
          </div>
        </div>

        {/* RIGHT: Pinterest preview */}
        <div className="lg:sticky lg:top-[96px] self-start">
          <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-2">Preview</p>
          <div className="bg-white border border-[#E8E4DF] rounded-2xl p-3 shadow-sm">
            <div className="relative rounded-xl overflow-hidden aspect-[2/3] mb-2 bg-[#FAFAF8]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={effectiveImageUrl} alt="" className="w-full h-full object-cover" />
            </div>
            <p className="text-sm font-bold text-[#1A1A1A] line-clamp-2 mb-1">{title}</p>
            <p className="text-[11px] text-[#6B6B6B] line-clamp-3 mb-2">{description}</p>
            {hashtags && <p className="text-[10px] text-[#E60023] font-semibold line-clamp-2">{hashtags}</p>}
          </div>
          <p className="text-[10px] text-[#8A8A8A] mt-2">Approximate Pinterest card layout</p>
        </div>
      </div>
    </div>
  );
}
