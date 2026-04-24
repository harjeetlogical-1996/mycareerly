"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, XCircle, RefreshCw, Trash2, Save, Settings2 } from "lucide-react";
import {
  updateAccount,
  disconnectAccount,
  deleteAccount,
  fetchAccountBoards,
  saveCategoryBoards,
} from "../../../actions/pinterest";

type Account = {
  id: string;
  username: string;
  label: string;
  defaultBoardId: string;
  autoPostEnabled: boolean;
  active: boolean;
  tokenExpiresAt: Date;
  boardMaps: Array<{ category: string; boardId: string; boardName: string }>;
};

type Board = { id: string; name: string };

export default function AccountCard({
  account,
  categories,
  initialBoards = [],
}: {
  account: Account;
  categories: string[];
  initialBoards?: Board[];
}) {
  const [pending, start] = useTransition();
  const [label, setLabel] = useState(account.label);
  const [defaultBoardId, setDefaultBoardId] = useState(account.defaultBoardId);
  const [autoPost, setAutoPost] = useState(account.autoPostEnabled);
  // Boards are pre-loaded server-side on page render, so the dropdown is ready
  // immediately. Setting to null only when we explicitly want to force a reload.
  const [boards, setBoards] = useState<Board[] | null>(initialBoards.length > 0 ? initialBoards : null);
  const [mappings, setMappings] = useState<Record<string, { boardId: string; boardName: string }>>(
    Object.fromEntries(account.boardMaps.map((m) => [m.category, { boardId: m.boardId, boardName: m.boardName }]))
  );
  const [msg, setMsg] = useState("");
  const [showMappings, setShowMappings] = useState(false);

  const expiresIn = Math.max(0, Math.round((new Date(account.tokenExpiresAt).getTime() - Date.now()) / (24 * 3600 * 1000)));
  const expiryWarn = expiresIn < 3;

  async function loadBoards() {
    setMsg("Loading boards…");
    try {
      const b = await fetchAccountBoards(account.id);
      setBoards(b);
      setMsg("");
    } catch (e: any) {
      setMsg("Error: " + (e?.message || "failed to load boards"));
    }
  }

  function saveSettings() {
    start(async () => {
      try {
        await updateAccount(account.id, { label, defaultBoardId, autoPostEnabled: autoPost });
        setMsg("Saved");
        setTimeout(() => setMsg(""), 2000);
      } catch (e: any) {
        setMsg("Error: " + (e?.message || "save failed"));
      }
    });
  }

  function saveMappings() {
    start(async () => {
      const rows = Object.entries(mappings).map(([category, v]) => ({ category, boardId: v.boardId, boardName: v.boardName }));
      await saveCategoryBoards(account.id, rows);
      setMsg("Mappings saved");
      setTimeout(() => setMsg(""), 2000);
    });
  }

  return (
    <div className={`bg-white border rounded-2xl p-5 ${account.active ? "border-[#E8E4DF]" : "border-gray-200 opacity-60"}`}>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#E60023]/10 rounded-xl flex items-center justify-center">
            <svg width={18} height={18} viewBox="0 0 24 24" fill="#E60023" aria-hidden>
              <path d="M12 0a12 12 0 0 0-4.37 23.17c-.1-.93-.19-2.37.04-3.39.21-.93 1.37-5.94 1.37-5.94s-.35-.7-.35-1.73c0-1.63.94-2.84 2.12-2.84 1 0 1.48.75 1.48 1.65 0 1.01-.64 2.51-.97 3.91-.28 1.17.59 2.13 1.75 2.13 2.1 0 3.72-2.22 3.72-5.42 0-2.83-2.04-4.81-4.95-4.81-3.37 0-5.35 2.53-5.35 5.14 0 1.02.39 2.11.88 2.7.1.12.11.22.08.34-.09.37-.29 1.18-.33 1.35-.05.22-.17.27-.4.16-1.49-.69-2.42-2.87-2.42-4.62 0-3.76 2.73-7.22 7.88-7.22 4.14 0 7.35 2.95 7.35 6.89 0 4.11-2.59 7.42-6.19 7.42-1.21 0-2.34-.63-2.73-1.37l-.74 2.83c-.27 1.03-1 2.33-1.49 3.12A12 12 0 1 0 12 0z" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-[#1A1A1A]">@{account.username}</p>
            <p className={`text-[10px] ${expiryWarn ? "text-red-600" : "text-[#8A8A8A]"}`}>Token expires in {expiresIn} day{expiresIn !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {account.active ? (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 inline-flex items-center gap-1">
              <CheckCircle2 size={10} /> Active
            </span>
          ) : (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 inline-flex items-center gap-1">
              <XCircle size={10} /> Disconnected
            </span>
          )}
          <a
            href={`/api/pinterest/oauth/start?label=${encodeURIComponent(label || account.username)}`}
            className="text-xs font-semibold text-[#6B6B6B] hover:text-[#E60023] inline-flex items-center gap-1"
            title="Re-authorize"
          >
            <RefreshCw size={11} /> Reconnect
          </a>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3 mb-3">
        <div>
          <label className="block text-[10px] font-semibold text-[#6B6B6B] uppercase tracking-wider mb-1">Label</label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full px-2.5 py-1.5 border border-[#E8E4DF] rounded-lg text-sm focus:border-[#E60023] outline-none"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] font-semibold text-[#6B6B6B] uppercase tracking-wider">Default Board</label>
            {boards && boards.length > 0 && (
              <button
                type="button"
                onClick={loadBoards}
                className="text-[10px] font-semibold text-[#6B6B6B] hover:text-[#E60023] inline-flex items-center gap-1"
                title="Reload from Pinterest (after creating a new board)"
              >
                <RefreshCw size={9} /> Refresh
              </button>
            )}
          </div>
          {boards && boards.length > 0 ? (
            <select
              value={defaultBoardId}
              onChange={(e) => setDefaultBoardId(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-[#E8E4DF] rounded-lg text-sm focus:border-[#E60023] outline-none"
            >
              <option value="">— select board —</option>
              {boards.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          ) : boards && boards.length === 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#8A8A8A] italic">No boards on this account yet.</span>
              <a
                href="https://www.pinterest.com/?add-board"
                target="_blank"
                rel="noopener"
                className="text-[10px] font-semibold text-[#E60023] hover:underline whitespace-nowrap"
              >
                Create on Pinterest →
              </a>
              <button
                type="button"
                onClick={loadBoards}
                className="text-[10px] font-semibold text-[#6B6B6B] hover:text-[#E60023] inline-flex items-center gap-1"
              >
                <RefreshCw size={9} /> Reload
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#8A8A8A] italic">Fetching…</span>
              <button
                type="button"
                onClick={loadBoards}
                className="text-[10px] font-semibold text-[#E60023] hover:underline"
              >
                Load now
              </button>
            </div>
          )}
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-[#6B6B6B] uppercase tracking-wider mb-1">Auto-post</label>
          <label className="inline-flex items-center gap-2 py-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={autoPost}
              onChange={(e) => setAutoPost(e.target.checked)}
              className="w-4 h-4 accent-[#E60023]"
            />
            <span className="text-sm text-[#1A1A1A]">{autoPost ? "On" : "Off"}</span>
          </label>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={saveSettings}
          disabled={pending}
          className="inline-flex items-center gap-1.5 bg-[#E60023] hover:bg-[#AD081B] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          <Save size={12} /> Save
        </button>
        <button
          onClick={() => setShowMappings((v) => !v)}
          className="inline-flex items-center gap-1.5 bg-[#FAFAF8] hover:bg-[#F0EFEC] text-[#4A4A4A] text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
        >
          <Settings2 size={12} /> {showMappings ? "Hide" : "Category → Board mapping"}
        </button>
        <form action={async () => {
          const ok = confirm("Disconnect this account? Existing pins remain but auto-posting stops.");
          if (!ok) return;
          await disconnectAccount(account.id);
        }}>
          <button type="submit" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B6B6B] hover:text-red-600 px-3 py-1.5">
            Disconnect
          </button>
        </form>
        <form action={async () => {
          const ok = confirm("Permanently delete this account record and all its pins?");
          if (!ok) return;
          await deleteAccount(account.id);
        }}>
          <button type="submit" className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg">
            <Trash2 size={12} /> Delete
          </button>
        </form>
        {msg && <span className="text-xs text-[#6B6B6B] ml-2">{msg}</span>}
      </div>

      {/* Category → board mappings */}
      {showMappings && (
        <div className="mt-4 pt-4 border-t border-[#E8E4DF]">
          <p className="text-xs font-bold text-[#1A1A1A] mb-2">Category → Board mapping</p>
          <p className="text-[10px] text-[#6B6B6B] mb-3">
            Route article categories to specific boards. Falls back to default board if unmapped.
            {(!boards || boards.length === 0) && <> <button onClick={loadBoards} className="text-[#E60023] underline">Load boards first</button>.</>}
          </p>
          <div className="space-y-2">
            {categories.map((cat) => {
              const current = mappings[cat] ?? { boardId: "", boardName: "" };
              return (
                <div key={cat} className="grid grid-cols-[120px_1fr] gap-2 items-center">
                  <span className="text-xs font-semibold text-[#4A4A4A]">{cat}</span>
                  {boards && boards.length > 0 ? (
                    <select
                      value={current.boardId}
                      onChange={(e) => {
                        const board = boards!.find((b) => b.id === e.target.value);
                        setMappings({ ...mappings, [cat]: { boardId: e.target.value, boardName: board?.name || "" } });
                      }}
                      className="px-2 py-1.5 border border-[#E8E4DF] rounded-lg text-xs focus:border-[#E60023] outline-none"
                    >
                      <option value="">— use default —</option>
                      {boards.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  ) : (
                    <input
                      value={current.boardId}
                      onChange={(e) => setMappings({ ...mappings, [cat]: { boardId: e.target.value, boardName: current.boardName } })}
                      placeholder="board id"
                      className="px-2 py-1.5 border border-[#E8E4DF] rounded-lg text-xs font-mono focus:border-[#E60023] outline-none"
                    />
                  )}
                </div>
              );
            })}
          </div>
          <button
            onClick={saveMappings}
            disabled={pending}
            className="mt-3 inline-flex items-center gap-1.5 bg-[#E60023] hover:bg-[#AD081B] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            <Save size={12} /> Save mappings
          </button>
        </div>
      )}
    </div>
  );
}
