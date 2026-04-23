import Link from "next/link";
import { prisma } from "../../lib/prisma";
import { getSetting, SETTING_KEYS } from "../../lib/settings";
import { CheckCircle2, XCircle, AlertTriangle, Zap, Clock, Send, AlertCircle, Plus, BookOpen, Users, ListOrdered } from "lucide-react";

export const dynamic = "force-dynamic";

function StatCard({ label, value, hint, color = "#E60023" }: { label: string; value: string | number; hint?: string; color?: string }) {
  return (
    <div className="bg-white border border-[#E8E4DF] rounded-2xl p-5">
      <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-2">{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
      {hint && <p className="text-xs text-[#8A8A8A] mt-1">{hint}</p>}
    </div>
  );
}

export default async function PinterestOverview() {
  const [clientId, autoFlag] = await Promise.all([
    getSetting(SETTING_KEYS.PINTEREST_CLIENT_ID),
    getSetting(SETTING_KEYS.PINTEREST_AUTO_POST_ENABLED),
  ]);
  const credsConfigured = !!clientId;
  const autoOn = autoFlag === "true";

  const [accounts, totalPosted, weekPosted, failed, queued, scheduled, recentPins] = await Promise.all([
    prisma.pinterestAccount.findMany({ where: { active: true }, orderBy: { createdAt: "asc" } }),
    prisma.pinterestPin.count({ where: { status: "posted" } }),
    prisma.pinterestPin.count({ where: { status: "posted", postedAt: { gte: new Date(Date.now() - 7 * 24 * 3600 * 1000) } } }),
    prisma.pinterestPin.count({ where: { status: "failed" } }),
    prisma.pinterestPin.count({ where: { status: "queued" } }),
    prisma.pinterestPin.count({ where: { status: "scheduled" } }),
    prisma.pinterestPin.findMany({
      orderBy: { updatedAt: "desc" },
      take: 10,
      include: { account: true },
    }),
  ]);

  const articleIds = [...new Set(recentPins.map((p) => p.articleId))];
  const articles = articleIds.length
    ? await prisma.article.findMany({ where: { id: { in: articleIds } } })
    : [];
  const articleMap = new Map(articles.map((a) => [a.id, a]));

  return (
    <div className="p-8">
      {/* Setup banner */}
      {!credsConfigured && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
          <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-amber-900">Setup required</p>
            <p className="text-sm text-amber-800 mt-1">Add your Pinterest app credentials (client_id + client_secret) before connecting accounts.</p>
            <Link href="/admin/pinterest/settings" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-amber-900 underline">Go to Settings →</Link>
          </div>
        </div>
      )}

      {credsConfigured && accounts.length === 0 && (
        <div className="mb-6 bg-[#FEF0ED] border border-[#E8705A]/30 rounded-2xl p-5 flex items-start gap-3">
          <AlertCircle size={20} className="text-[#E8705A] shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-[#1A1A1A]">No Pinterest accounts connected yet</p>
            <p className="text-sm text-[#6B6B6B] mt-1">Connect up to 3 Pinterest accounts to start auto-posting pins.</p>
            <Link href="/admin/pinterest/accounts" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#E8705A] underline">Connect an account →</Link>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Pinterest Overview</h1>
          <p className="text-sm text-[#6B6B6B] mt-0.5">Auto-pin your articles, manage accounts, and track performance</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${autoOn ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
            {autoOn ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
            Auto-post {autoOn ? "ON" : "OFF"}
          </span>
          <Link href="/admin/pinterest/settings" className="text-xs font-semibold text-[#6B6B6B] hover:text-[#E60023] underline">configure</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Pins Posted" value={totalPosted} hint={`${weekPosted} this week`} color="#E60023" />
        <StatCard label="Queue Pending" value={queued} hint="Ready to post" color="#E8705A" />
        <StatCard label="Scheduled" value={scheduled} hint="Future posts" color="#7A9E7E" />
        <StatCard label="Failed" value={failed} hint={failed ? "Review in Queue" : "All good"} color={failed ? "#C95540" : "#7A9E7E"} />
      </div>

      {/* Accounts grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-[#1A1A1A]">Connected Accounts ({accounts.length}/3)</h2>
          <Link href="/admin/pinterest/accounts" className="text-sm font-semibold text-[#E60023] hover:underline">Manage →</Link>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {accounts.map((a) => (
            <div key={a.id} className="bg-white border border-[#E8E4DF] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-[#1A1A1A]">@{a.username}</p>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${a.autoPostEnabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                  {a.autoPostEnabled ? "auto" : "manual"}
                </span>
              </div>
              {a.label && <p className="text-xs text-[#6B6B6B]">{a.label}</p>}
              <p className="text-[10px] text-[#8A8A8A] mt-2">Default board: {a.defaultBoardId || "not set"}</p>
            </div>
          ))}
          {accounts.length < 3 && (
            <Link
              href="/admin/pinterest/accounts"
              className="border-2 border-dashed border-[#E8E4DF] rounded-2xl p-5 flex flex-col items-center justify-center text-center hover:border-[#E60023] hover:bg-[#E60023]/5 transition-colors min-h-[110px]"
            >
              <Plus size={20} className="text-[#6B6B6B] mb-1" />
              <p className="text-sm font-semibold text-[#6B6B6B]">Connect account</p>
            </Link>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Link href="/admin/pinterest/articles" className="bg-white border border-[#E8E4DF] rounded-2xl p-5 hover:border-[#E60023] hover:-translate-y-0.5 transition-all group">
          <BookOpen size={22} className="text-[#E60023] mb-2" />
          <p className="font-bold text-[#1A1A1A] group-hover:text-[#E60023]">Articles Library</p>
          <p className="text-xs text-[#6B6B6B] mt-1">Bulk-pin existing articles, create pin variants per article</p>
        </Link>
        <Link href="/admin/pinterest/queue" className="bg-white border border-[#E8E4DF] rounded-2xl p-5 hover:border-[#E60023] hover:-translate-y-0.5 transition-all group">
          <ListOrdered size={22} className="text-[#E60023] mb-2" />
          <p className="font-bold text-[#1A1A1A] group-hover:text-[#E60023]">Pin Queue</p>
          <p className="text-xs text-[#6B6B6B] mt-1">Monitor scheduled pins and retry failed ones</p>
        </Link>
        <Link href="/admin/pinterest/accounts" className="bg-white border border-[#E8E4DF] rounded-2xl p-5 hover:border-[#E60023] hover:-translate-y-0.5 transition-all group">
          <Users size={22} className="text-[#E60023] mb-2" />
          <p className="font-bold text-[#1A1A1A] group-hover:text-[#E60023]">Accounts</p>
          <p className="text-xs text-[#6B6B6B] mt-1">Manage boards, category mapping, auto-post per account</p>
        </Link>
      </div>

      {/* Recent activity */}
      <div>
        <h2 className="text-lg font-bold text-[#1A1A1A] mb-3">Recent Pin Activity</h2>
        <div className="bg-white border border-[#E8E4DF] rounded-2xl overflow-hidden">
          {recentPins.length === 0 ? (
            <div className="py-10 text-center">
              <Send size={24} className="text-[#E8E4DF] mx-auto mb-2" />
              <p className="text-sm text-[#6B6B6B]">No pin activity yet</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-[#FAFAF8] border-b border-[#E8E4DF]">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Article</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Account</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E4DF]">
                {recentPins.map((p) => {
                  const art = articleMap.get(p.articleId);
                  return (
                    <tr key={p.id} className="hover:bg-[#FAFAF8]">
                      <td className="px-5 py-3">
                        <p className="text-sm font-medium text-[#1A1A1A] line-clamp-1 max-w-sm">{art?.title ?? p.title}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#6B6B6B]">@{p.account.username}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-[#8A8A8A]">{new Date(p.updatedAt).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; Icon: any }> = {
    draft:     { cls: "bg-gray-100 text-gray-600", Icon: Clock },
    queued:    { cls: "bg-amber-100 text-amber-700", Icon: Zap },
    scheduled: { cls: "bg-blue-100 text-blue-700", Icon: Clock },
    posted:    { cls: "bg-green-100 text-green-700", Icon: CheckCircle2 },
    failed:    { cls: "bg-red-100 text-red-700", Icon: XCircle },
  };
  const m = map[status] || map.draft;
  const Icon = m.Icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${m.cls}`}>
      <Icon size={10} /> {status}
    </span>
  );
}
