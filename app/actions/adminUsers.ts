"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../lib/prisma";
import { getAdminSession, hashPassword } from "../lib/auth";

async function requireAdmin() {
  const s = await getAdminSession();
  if (!s) throw new Error("Unauthorized");
  if (s.role !== "admin") throw new Error("Forbidden — admin role required");
  return s;
}

function validEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validRole(role: string): boolean {
  return role === "admin" || role === "editor";
}

export async function createAdminUser(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const email = ((formData.get("email") as string) || "").trim().toLowerCase();
  const name = ((formData.get("name") as string) || "").trim();
  const password = (formData.get("password") as string) || "";
  const role = ((formData.get("role") as string) || "editor").trim();

  if (!validEmail(email)) return { ok: false, error: "Invalid email" };
  if (password.length < 8) return { ok: false, error: "Password must be at least 8 characters" };
  if (!validRole(role)) return { ok: false, error: "Invalid role" };

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) return { ok: false, error: "User with this email already exists" };

  await prisma.adminUser.create({
    data: {
      email,
      name,
      role,
      passwordHash: await hashPassword(password),
      active: true,
    },
  });

  revalidatePath("/admin/users");
  return { ok: true };
}

export async function updateAdminUser(
  userId: string,
  data: { name?: string; role?: string; active?: boolean }
): Promise<{ ok: boolean; error?: string }> {
  const session = await requireAdmin();

  if (data.role && !validRole(data.role)) return { ok: false, error: "Invalid role" };

  // Prevent self-demotion / self-deactivation to avoid locking yourself out
  if (session.userId === userId) {
    if (data.role === "editor") return { ok: false, error: "You cannot demote yourself" };
    if (data.active === false) return { ok: false, error: "You cannot deactivate yourself" };
  }

  // Don't let the last active admin be demoted or deactivated
  if (data.role === "editor" || data.active === false) {
    const target = await prisma.adminUser.findUnique({ where: { id: userId } });
    if (target?.role === "admin" && target.active) {
      const otherActiveAdmins = await prisma.adminUser.count({
        where: { role: "admin", active: true, id: { not: userId } },
      });
      if (otherActiveAdmins === 0) {
        return { ok: false, error: "Cannot modify the last active admin" };
      }
    }
  }

  await prisma.adminUser.update({
    where: { id: userId },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.role !== undefined ? { role: data.role } : {}),
      ...(data.active !== undefined ? { active: data.active } : {}),
    },
  });

  revalidatePath("/admin/users");
  return { ok: true };
}

export async function changeAdminUserPassword(
  userId: string,
  newPassword: string
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  if (newPassword.length < 8) return { ok: false, error: "Password must be at least 8 characters" };

  await prisma.adminUser.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(newPassword) },
  });

  revalidatePath("/admin/users");
  return { ok: true };
}

export async function deleteAdminUser(userId: string): Promise<{ ok: boolean; error?: string }> {
  const session = await requireAdmin();
  if (session.userId === userId) return { ok: false, error: "You cannot delete yourself" };

  const target = await prisma.adminUser.findUnique({ where: { id: userId } });
  if (target?.role === "admin") {
    const otherActiveAdmins = await prisma.adminUser.count({
      where: { role: "admin", active: true, id: { not: userId } },
    });
    if (otherActiveAdmins === 0) {
      return { ok: false, error: "Cannot delete the last active admin" };
    }
  }

  await prisma.adminUser.delete({ where: { id: userId } });
  revalidatePath("/admin/users");
  return { ok: true };
}
