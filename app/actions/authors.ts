"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "../lib/prisma";

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function createAuthor(fd: FormData) {
  const name = (fd.get("name") as string).trim();
  await prisma.author.create({
    data: {
      name,
      slug: toSlug(name),
      bio: (fd.get("bio") as string) || "",
      email: (fd.get("email") as string) || "",
      specialty: (fd.get("specialty") as string) || "",
      twitter: (fd.get("twitter") as string) || "",
      instagram: (fd.get("instagram") as string) || "",
      website: (fd.get("website") as string) || "",
      active: fd.get("active") === "true",
    },
  });
  revalidatePath("/admin/authors");
  redirect("/admin/authors");
}

export async function updateAuthor(id: string, fd: FormData) {
  const name = (fd.get("name") as string).trim();
  await prisma.author.update({
    where: { id },
    data: {
      name,
      slug: toSlug(name),
      bio: (fd.get("bio") as string) || "",
      email: (fd.get("email") as string) || "",
      specialty: (fd.get("specialty") as string) || "",
      twitter: (fd.get("twitter") as string) || "",
      instagram: (fd.get("instagram") as string) || "",
      website: (fd.get("website") as string) || "",
      active: fd.get("active") === "true",
    },
  });
  revalidatePath("/admin/authors");
  redirect("/admin/authors");
}

export async function deleteAuthor(id: string) {
  await prisma.author.delete({ where: { id } });
  revalidatePath("/admin/authors");
}
