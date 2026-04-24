import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import { getSetting, SETTING_KEYS } from "../../../lib/settings";
import { getValidAccessToken } from "../../../lib/pinterest/tokens";
import { pinterestFetch } from "../../../lib/pinterest/client";
import AccountCard from "./AccountCard";
import ConnectForm from "./ConnectForm";
import { Users, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

/**
 * Fetch a Pinterest account's boards. Returns [] on any auth / API failure
 * so the page still renders — the user can hit "Reload boards" in the card
 * to see the real error, and everything else on the page stays usable.
 */
async function fetchBoardsForAccount(accountId: string): Promise<Array<{ id: string; name: string }>> {
  try {
    const token = await getValidAccessToken(accountId);
    const res: any = await pinterestFetch("/boards?page_size=100", token);
    const items: any[] = res?.items || [];
    return items.map((b) => ({ id: b.id, name: b.name }));
  } catch {
    return [];
  }
}

export default async function PinterestAccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const clientId = await getSetting(SETTING_KEYS.PINTEREST_CLIENT_ID);
  const accounts = await prisma.pinterestAccount.findMany({
    orderBy: { createdAt: "asc" },
    include: { boardMaps: true },
  });

  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });
  const articleCategories = categories.length
    ? categories.map((c) => c.name)
    : ["Care Guide", "Seasonal", "DIY", "Wedding", "Gifting", "Expert Tips", "Stories"];

  // Pre-fetch each active account's Pinterest boards in parallel so the
  // AccountCard can show a real dropdown immediately — no "Load boards" click.
  const activeAccounts = accounts.filter((a) => a.active);
  const boardLists = await Promise.all(
    activeAccounts.map((a) => fetchBoardsForAccount(a.id))
  );
  const boardsByAccount: Record<string, Array<{ id: string; name: string }>> = {};
  activeAccounts.forEach((a, i) => {
    boardsByAccount[a.id] = boardLists[i];
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <Users size={22} className="text-[#E60023]" /> Pinterest Accounts
          </h1>
          <p className="text-sm text-[#6B6B6B] mt-0.5">Connect up to 3 Pinterest accounts. Each can auto-post published articles.</p>
        </div>
      </div>

      {/* Status banners */}
      {sp.connected && (
        <div className="mb-5 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle2 size={18} className="text-green-600 shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">Connected <strong>@{sp.connected}</strong> successfully.</p>
        </div>
      )}
      {sp.error && (
        <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <XCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">Connection failed: <code className="font-mono">{sp.error}</code></p>
        </div>
      )}

      {!clientId && (
        <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900 text-sm">Pinterest app credentials missing</p>
            <p className="text-xs text-amber-800 mt-0.5">Add them in <Link href="/admin/pinterest/settings" className="underline font-semibold">Settings</Link> before connecting an account.</p>
          </div>
        </div>
      )}

      {/* Connect new account */}
      {accounts.filter((a) => a.active).length < 3 && clientId && (
        <ConnectForm />
      )}

      {/* Accounts list */}
      <div className="space-y-5 mt-6">
        {accounts.length === 0 ? (
          <div className="bg-white border border-[#E8E4DF] rounded-2xl py-16 text-center">
            <Users size={32} className="text-[#E8E4DF] mx-auto mb-3" />
            <p className="text-sm text-[#6B6B6B]">No accounts connected yet</p>
          </div>
        ) : (
          accounts.map((a) => (
            <AccountCard
              key={a.id}
              account={a}
              categories={articleCategories}
              initialBoards={boardsByAccount[a.id] ?? []}
            />
          ))
        )}
      </div>
    </div>
  );
}
