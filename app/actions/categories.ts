"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "../lib/prisma";

function makeSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}

export async function createCategory(formData: FormData) {
  const name = (formData.get("name") as string).trim();
  await prisma.category.create({
    data: {
      name,
      slug: makeSlug(name),
      description: (formData.get("description") as string) ?? "",
      color: (formData.get("color") as string) ?? "#E8705A",
      order: parseInt(formData.get("order") as string) || 99,
      active: formData.get("active") === "true",
    },
  });
  revalidatePath("/admin/categories");
  revalidatePath("/api/categories");
  redirect("/admin/categories");
}

export async function updateCategory(id: string, formData: FormData) {
  const name = (formData.get("name") as string).trim();
  await prisma.category.update({
    where: { id },
    data: {
      name,
      slug: makeSlug(name),
      description: (formData.get("description") as string) ?? "",
      color: (formData.get("color") as string) ?? "#E8705A",
      order: parseInt(formData.get("order") as string) || 99,
      active: formData.get("active") === "true",
    },
  });
  revalidatePath("/admin/categories");
  revalidatePath("/api/categories");
  redirect("/admin/categories");
}

export async function deleteCategory(id: string) {
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/api/categories");
}

export async function toggleCategory(id: string, active: boolean) {
  await prisma.category.update({ where: { id }, data: { active } });
  revalidatePath("/admin/categories");
  revalidatePath("/api/categories");
}
