"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, XCircle, Zap, Plus, Layers, Users } from "lucide-react";
import { bulkPinArticles } from "../../../actions/pinterest";

type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  category: string;
  stats: { posted: number; queued: number; scheduled: number; failed: number; drafts: number };
};

type Account = { id: string; username: string; label: string; defaultBoardId: string };

export default function ArticlesLibrary({ articles, accounts }: { articles: Article[]; accounts: Account[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pickedAccounts, setPickedAccounts] = useState<Set<string>>(new Set(accounts.map((a) => a.id)));
  const [useCategoryMapping, setUseCategoryMapping] = useState(true);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string>("");

  const toggle = (id: string) => {
    const n = new Set(selected);
    n.has(id) ? n.delete(id) : n.add(id);
    setSelected(n);
  };
  const selectAll = () => setSelected(new Set(articles.map((a) => a.id)));
  const clearSelection = () => setSelected(new Set());

  const toggleAccount = (id: string) => {
    const n = new Set(pickedAccounts);
    n.has(id) ? n.delete(id) : n.add(id);
    setPickedAccounts(n);
  };

  const canBulk = selected.size > 0 && pickedAccounts.size > 0 && accounts.some((a) => pickedAccounts.has(a.id) && a.defaultBoardId);

  const boardIssues = useMemo(() => accounts.filter((a) => pickedAccounts.has(a.id) && !a.defaultBoardId), [accounts, pickedAccounts]);

  function runBulk() {
    start(async () => {
      setMsg("Queueing…");
      const res = await bulkPinArticles({
        articleIds: Array.from(selected),
        accountIds: Array.from(pickedAccounts),
        useCategoryMapping,
      });
      setMsg(`Queued ${res.queued} · skipped ${res.skipped}`);
      setSelected(new Set());
      setTimeout(() => setMsg(""), 4000);
    });
  }

  return (
    <div>
      {/* Bulk action bar */}
      {accounts.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-sm text-amber-900">
          No active Pinterest accounts. <Link href="/admin/pinterest/accounts" className="font-semibold underline">Connect one</Link> before pinning.
        </div>
      ) : (
        <div className="bg-white border border-[#E8E4DF] rounded-2xl p-4 mb-5 sticky top-[88px] z-10">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-[#E60023]" />
              <p className="text-sm font-bold text-[#1A1A1A]">{selected.size} selected</p>
              <button onClick={selectAll} className="text-xs text-[#E60023] font-semibold hover:underline">Select all</button>
              {selected.size > 0 && <button onClick={clearSelection} className="text-xs text-[#6B6B6B] font-semibold hover:underline">Clear</button>}
            </div>

            <div className="h-5 w-px bg-[#E8E4DF]" />

            <div className="flex items-center gap-2 flex-wrap">
              <Users size={14} className="text-[#6B6B6B]" />
              <span className="text-xs font-semibold text-[#6B6B6B]">Post to:</span>
              {accounts.map((a) => (
                <label key={a.id} className="inline-flex items-center gap-1 cursor-pointer text-xs font-medium">
                  <input
                    type="checkbox"
                    checked={pickedAccounts.has(a.id)}
                    onChange={() => toggleAccount(a.id)}
                    className="w-3 h-3 accent-[#E60023]"
                  />
                  @{a.username}
                  {!a.defaultBoardId && <span className="text-amber-600 text-[10px]">⚠ no board</span>}
                </label>
              ))}
            </div>

            <div className="h-5 w-px bg-[#E8E4DF]" />

            <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-medium">
              <input type="checkbox" checked={useCategoryMapping} onChange={(e) => setUseCategoryMapping(e.target.checked)} className="w-3 h-3 accent-[#E60023]" />
              Use category→board mapping
            </label>

            <div className="flex-1" />

            <button
              onClick={runBulk}
              disabled={!canBulk || pending}
              className="inline-flex items-center gap-1.5 bg-[#E60023] hover:bg-[#AD081B] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
            >
              <Zap size={14} /> Bulk Pin
            </button>
            {msg && <span className="text-xs text-[#6B6B6B]">{msg}</span>}
          </div>
          {boardIssues.length > 0 && (
            <p className="text-[10px] text-amber-700 mt-2">
              ⚠ Accounts without a default board will be skipped: {boardIssues.map((a) => `@${a.username}`).join(", ")}.{" "}
              <Link href="/admin/pinterest/accounts" className="font-semibold underline">Set default boards</Link>.
            </p>
          )}
        </div>
      )}

      {/* Articles grid */}
      {articles.length === 0 ? (
        <div className="bg-white border border-[#E8E4DF] rounded-2xl py-16 text-center">
          <p className="text-sm text-[#6B6B6B]">No articles in this filter</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {articles.map((a) => {
            const isSelected = selected.has(a.id);
            const s = a.stats;
            return (
              <div
                key={a.id}
                className={`bg-white border rounded-2xl overflow-hidden transition-all ${
                  isSelected ? "border-[#E60023] ring-2 ring-[#E60023]/20" : "border-[#E8E4DF] hover:border-[#E8E4DF]"
                }`}
              >
                <div className="relative aspect-[16/9] bg-[#FAFAF8] overflow-hidden">
                  {a.coverImage && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={a.coverImage} alt="" className="w-full h-full object-cover" />
                  )}
                  <div className="absolute top-2 left-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggle(a.id)}
                      className="w-5 h-5 accent-[#E60023] rounded cursor-pointer"
                      aria-label={`Select ${a.title}`}
                    />
                  </div>
                  <span className="absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/95 text-[#1A1A1A]">
                    {a.category}
                  </span>
                </div>
                <div className="p-4">
                  <p className="font-bold text-sm text-[#1A1A1A] line-clamp-2 mb-2">{a.title}</p>
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] mb-3">
                    {s.posted > 0 && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold"><CheckCircle2 size={9} /> {s.posted} posted</span>
                    )}
                    {s.queued > 0 && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold"><Zap size={9} /> {s.queued} queued</span>
                    )}
                    {s.scheduled > 0 && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold"><Clock size={9} /> {s.scheduled} scheduled</span>
                    )}
                    {s.failed > 0 && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold"><XCircle size={9} /> {s.failed} failed</span>
                    )}
                    {s.posted + s.queued + s.scheduled + s.failed === 0 && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 font-semibold">Never pinned</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/pinterest/articles/${a.id}/new`}
                      className="inline-flex items-center gap-1 bg-[#E60023] hover:bg-[#AD081B] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Plus size={12} /> Create Pin
                    </Link>
                    <Link
                      href={`/admin/pinterest/articles/${a.id}`}
                      className="text-xs text-[#6B6B6B] hover:text-[#1A1A1A] font-semibold"
                    >
                      View pins →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
