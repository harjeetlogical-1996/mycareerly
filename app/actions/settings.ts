"use server";

import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveSettings(formData: FormData) {
  // Accept any fields from the form, save each as a key-value pair
  const updates: { key: string; value: string }[] = [];

  for (const [key, rawValue] of formData.entries()) {
    if (!key) continue;
    const value = typeof rawValue === "string" ? rawValue.trim() : "";

    updates.push({ key, value });
  }

  for (const u of updates) {
    await prisma.setting.upsert({
      where: { key: u.key },
      create: { key: u.key, value: u.value },
      update: { value: u.value },
    });
  }

  revalidatePath("/admin/analytics");
  revalidatePath("/");
  return { success: true, count: updates.length };
}
