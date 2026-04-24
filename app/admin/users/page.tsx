import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import { getAdminSession } from "../../lib/auth";
import { Users, ShieldCheck, PenLine, UserPlus, CheckCircle2, XCircle } from "lucide-react";
import UsersManager from "./UsersManager";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (session.role !== "admin") redirect("/admin?forbidden=users");

  const users = await prisma.adminUser.findMany({
    orderBy: [{ active: "desc" }, { createdAt: "asc" }],
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <Users size={22} className="text-[#E8705A]" /> Admin Users
          </h1>
          <p className="text-sm text-[#6B6B6B] mt-0.5">
            {users.length} user{users.length !== 1 ? "s" : ""} · {users.filter((u) => u.active).length} active · {users.filter((u) => u.role === "admin").length} admin{users.filter((u) => u.role === "admin").length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <UsersManager
        currentUserId={session.userId}
        users={users.map((u) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          active: u.active,
          lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
          createdAt: u.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
