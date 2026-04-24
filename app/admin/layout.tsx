import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getAdminSession } from "../lib/auth";
import { logoutAction } from "../actions/auth";
import {
  Flower2, LayoutDashboard, BookOpen, Store,
  LogOut, ExternalLink, Settings, Tag, Users, MessageSquare, BarChart3,
} from "lucide-react";

// lucide v1.8 doesn't ship UserCog — inline SVG fallback for the Admin Users nav item
const UserCogIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="9" cy="7" r="4" />
    <path d="M3 21v-2a4 4 0 0 1 4-4h4" />
    <circle cx="17.5" cy="14.5" r="2.5" />
    <path d="M17.5 10.5v-1M17.5 19.5v-1M13.5 14.5h1M20.5 14.5h1M14.7 11.7l.7.7M19.6 16.6l.7.7M14.7 17.3l.7-.7M19.6 12.4l.7-.7" />
  </svg>
);

const PinterestIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
    <path d="M12 0a12 12 0 0 0-4.37 23.17c-.1-.93-.19-2.37.04-3.39.21-.93 1.37-5.94 1.37-5.94s-.35-.7-.35-1.73c0-1.63.94-2.84 2.12-2.84 1 0 1.48.75 1.48 1.65 0 1.01-.64 2.51-.97 3.91-.28 1.17.59 2.13 1.75 2.13 2.1 0 3.72-2.22 3.72-5.42 0-2.83-2.04-4.81-4.95-4.81-3.37 0-5.35 2.53-5.35 5.14 0 1.02.39 2.11.88 2.7.1.12.11.22.08.34-.09.37-.29 1.18-.33 1.35-.05.22-.17.27-.4.16-1.49-.69-2.42-2.87-2.42-4.62 0-3.76 2.73-7.22 7.88-7.22 4.14 0 7.35 2.95 7.35 6.89 0 4.11-2.59 7.42-6.19 7.42-1.21 0-2.34-.63-2.73-1.37l-.74 2.83c-.27 1.03-1 2.33-1.49 3.12A12 12 0 1 0 12 0z" />
  </svg>
);

type NavItem = {
  label: string;
  href: string;
  icon: (props: { size?: number; className?: string }) => React.ReactNode;
  adminOnly?: boolean;
};

const navItems: NavItem[] = [
  { label: "Dashboard",  href: "/admin",            icon: LayoutDashboard },
  { label: "Articles",   href: "/admin/articles",   icon: BookOpen },
  { label: "Authors",    href: "/admin/authors",    icon: Users },
  { label: "Categories", href: "/admin/categories", icon: Tag },
  { label: "Listings",   href: "/admin/listings",   icon: Store },
  { label: "Reviews",    href: "/admin/reviews",    icon: MessageSquare },
  { label: "Pinterest",  href: "/admin/pinterest",  icon: PinterestIcon },
  { label: "Analytics",  href: "/admin/analytics",  icon: BarChart3 },
  { label: "Users",      href: "/admin/users",      icon: UserCogIcon,  adminOnly: true },
  { label: "Settings",   href: "/admin/settings",   icon: Settings,     adminOnly: true },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "";
  if (pathname === "/admin/login") return <>{children}</>;

  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-[#F4F3F0] flex">

      {/* Sidebar */}
      <aside className="w-60 bg-[#1A1A1A] text-white flex flex-col fixed inset-y-0 left-0 z-40">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#E8705A] rounded-xl flex items-center justify-center">
              <Flower2 size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold leading-none">MyCareerly</p>
              <p className="text-[10px] text-white/40 mt-0.5">Admin Panel</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider px-3 mb-2">Main</p>
          {navItems
            .filter((item) => !item.adminOnly || session.role === "admin")
            .map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all group"
              >
                <Icon size={16} className="group-hover:text-[#E8705A] transition-colors" />
                {label}
              </Link>
            ))}

          <div className="pt-4">
            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider px-3 mb-2">Site</p>
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all"
            >
              <ExternalLink size={16} />
              View Site
            </Link>
            <Link
              href="/admin/settings"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all"
            >
              <Settings size={16} />
              Settings
            </Link>
          </div>
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-2 px-3 mb-3">
            <div className="w-7 h-7 bg-[#E8705A]/20 rounded-full flex items-center justify-center text-xs font-bold text-[#E8705A]">
              {((session.name || session.email) as string)[0]?.toUpperCase() || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{session.name || session.email}</p>
              <p className="text-[10px] text-white/40 capitalize">{session.role}</p>
            </div>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-red-500/20 hover:text-red-400 transition-all"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}
