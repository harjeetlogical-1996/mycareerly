import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "fallback-secret-change-me"
);

const COOKIE = "mycareerly_admin_token";

export type SessionPayload = {
  userId: string;
  email: string;
  role: string;
  name: string;
};

export async function signAdminToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyAdminToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

/**
 * True when the current session is an `admin` (can manage users, settings, etc.).
 * Editors cannot access /admin/users and some sensitive pages.
 */
export async function requireAdminRole(): Promise<SessionPayload> {
  const s = await getAdminSession();
  if (!s) throw new Error("Unauthorized");
  if (s.role !== "admin") throw new Error("Forbidden — admin role required");
  return s;
}

export async function setAdminCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function clearAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE);
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Verify email + password against the AdminUser table.
 *
 * Fallback: if no AdminUser row exists yet AND env-var credentials match
 * (ADMIN_EMAIL / ADMIN_PASSWORD), bootstrap the first admin user on the fly.
 * This lets the app migrate from env-only auth to DB auth without manual seeding.
 */
export async function authenticateUser(email: string, password: string): Promise<SessionPayload | null> {
  const normalizedEmail = email.trim().toLowerCase();

  // Try DB first
  try {
    const user = await prisma.adminUser.findUnique({
      where: { email: normalizedEmail },
    });
    if (user && user.active && await verifyPassword(password, user.passwordHash)) {
      // Best-effort last login bump (fire-and-forget)
      prisma.adminUser.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      }).catch(() => {});
      return { userId: user.id, email: user.email, role: user.role, name: user.name };
    }
  } catch {
    // DB unreachable (e.g., during build) — fall through to env-var fallback
  }

  // Bootstrap fallback: env-var credentials
  const envEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const envPassword = process.env.ADMIN_PASSWORD;
  if (envEmail && envPassword && normalizedEmail === envEmail && password === envPassword) {
    // Auto-create the first admin user on successful env-var login so future logins use DB
    try {
      const existing = await prisma.adminUser.findUnique({ where: { email: envEmail } });
      if (!existing) {
        const hashed = await hashPassword(envPassword);
        const created = await prisma.adminUser.create({
          data: {
            email: envEmail,
            passwordHash: hashed,
            name: "Initial Admin",
            role: "admin",
            active: true,
            lastLoginAt: new Date(),
          },
        });
        return { userId: created.id, email: created.email, role: created.role, name: created.name };
      }
      // Row exists but password didn't match it; still accept env-var for initial recovery
      return { userId: existing.id, email: existing.email, role: "admin", name: existing.name || "Initial Admin" };
    } catch {
      // DB unreachable — accept session with a synthetic userId
      return { userId: "env-admin", email: envEmail, role: "admin", name: "Initial Admin" };
    }
  }

  return null;
}

export { COOKIE };
