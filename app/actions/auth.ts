"use server";

import { redirect } from "next/navigation";
import { signAdminToken, setAdminCookie, clearAdminCookie, authenticateUser } from "../lib/auth";

export async function loginAction(formData: FormData) {
  const email = (formData.get("email") as string) || "";
  const password = (formData.get("password") as string) || "";

  const session = await authenticateUser(email, password);
  if (!session) {
    return { error: "Invalid email or password" };
  }

  const token = await signAdminToken(session);
  await setAdminCookie(token);
  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminCookie();
  redirect("/admin/login");
}
