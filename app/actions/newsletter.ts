"use server";

import { prisma } from "../lib/prisma";

export async function subscribeNewsletter(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const name = (formData.get("name") as string | null)?.trim() ?? "";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Please enter a valid email address." };
  }

  const existing = await prisma.subscriber.findUnique({ where: { email } });
  if (existing) {
    if (existing.active) return { success: false, error: "You're already subscribed!" };
    await prisma.subscriber.update({ where: { email }, data: { active: true } });
    return { success: true, message: "Welcome back! You've been resubscribed." };
  }

  await prisma.subscriber.create({ data: { email, name, source: "newsletter" } });
  return { success: true, message: "You're subscribed! Welcome to MyCareerly." };
}
