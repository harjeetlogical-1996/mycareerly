import Link from "next/link";
import { headers } from "next/headers";
import { LayoutDashboard, BookOpen, ListOrdered, Users, Images, Settings } from "lucide-react";

const tabs = [
  { label: "Overview",   href: "/admin/pinterest",           icon: LayoutDashboard, match: (p: string) => p === "/admin/pinterest" },
  { label: "Articles",   href: "/admin/pinterest/articles",  icon: BookOpen,        match: (p: string) => p.startsWith("/admin/pinterest/articles") },
  { label: "Queue",      href: "/admin/pinterest/queue",     icon: ListOrdered,     match: (p: string) => p.startsWith("/admin/pinterest/queue") },
  { label: "Accounts",   href: "/admin/pinterest/accounts",  icon: Users,           match: (p: string) => p.startsWith("/admin/pinterest/accounts") },
  { label: "Images",     href: "/admin/pinterest/images",    icon: Images,          match: (p: string) => p.startsWith("/admin/pinterest/images") },
  { label: "Settings",   href: "/admin/pinterest/settings",  icon: Settings,        match: (p: string) => p.startsWith("/admin/pinterest/settings") },
];

export default async function PinterestAdminLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "";

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-white border-b border-[#E8E4DF] sticky top-0 z-20">
        <div className="px-8 pt-4">
          <div className="flex items-center gap-1.5 mb-3">
            <div className="w-6 h-6 bg-[#E60023] rounded-lg flex items-center justify-center">
              <svg width={12} height={12} viewBox="0 0 24 24" fill="white" aria-hidden>
                <path d="M12 0a12 12 0 0 0-4.37 23.17c-.1-.93-.19-2.37.04-3.39.21-.93 1.37-5.94 1.37-5.94s-.35-.7-.35-1.73c0-1.63.94-2.84 2.12-2.84 1 0 1.48.75 1.48 1.65 0 1.01-.64 2.51-.97 3.91-.28 1.17.59 2.13 1.75 2.13 2.1 0 3.72-2.22 3.72-5.42 0-2.83-2.04-4.81-4.95-4.81-3.37 0-5.35 2.53-5.35 5.14 0 1.02.39 2.11.88 2.7.1.12.11.22.08.34-.09.37-.29 1.18-.33 1.35-.05.22-.17.27-.4.16-1.49-.69-2.42-2.87-2.42-4.62 0-3.76 2.73-7.22 7.88-7.22 4.14 0 7.35 2.95 7.35 6.89 0 4.11-2.59 7.42-6.19 7.42-1.21 0-2.34-.63-2.73-1.37l-.74 2.83c-.27 1.03-1 2.33-1.49 3.12A12 12 0 1 0 12 0z" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Pinterest Automation</span>
          </div>
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((t) => {
              const active = t.match(pathname);
              const Icon = t.icon;
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-sm font-medium transition-colors border-b-2 ${
                    active
                      ? "text-[#E60023] border-[#E60023]"
                      : "text-[#6B6B6B] hover:text-[#1A1A1A] border-transparent"
                  }`}
                >
                  <Icon size={14} /> {t.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
