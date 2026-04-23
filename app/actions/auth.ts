"use server";

import { redirect } from "next/navigation";
import { signAdminToken, setAdminCookie, clearAdminCookie } from "../lib/auth";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@mycareerly.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "mycareerly@admin123";

  if (email !== adminEmail || password !== adminPassword) {
    return { error: "Invalid email or password" };
  }

  const token = await signAdminToken(email);
  await setAdminCookie(token);
  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminCookie();
  redirect("/admin/login");
}
