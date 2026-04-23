"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "../lib/prisma";

function makeSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

function citySlugFromName(city: string) {
  return city.toLowerCase().trim().replace(/\s+/g, "-");
}

function splitCsv(raw: string): string[] {
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

export async function createListing(formData: FormData) {
  const name = formData.get("name") as string;
  const city = (formData.get("city") as string) ?? "";
  const categories = splitCsv((formData.get("categories") as string) ?? "");
  const tags = splitCsv((formData.get("tags") as string) ?? "");
  const images = splitCsv((formData.get("images") as string) ?? "");
  const hoursRaw = (formData.get("hours") as string) ?? "[]";
  let hours = [];
  try { hours = JSON.parse(hoursRaw); } catch {}

  const submittedBy = (formData.get("submittedBy") as string) ?? "admin";

  await prisma.listing.create({
    data: {
      slug: makeSlug(name) + "-" + Date.now(),
      name,
      tagline: (formData.get("tagline") as string) ?? "",
      description: (formData.get("description") as string) ?? "",
      address: (formData.get("address") as string) ?? "",
      city,
      state: (formData.get("state") as string) ?? "",
      citySlug: citySlugFromName(city),
      pincode: (formData.get("pincode") as string) ?? "",
      phone: (formData.get("phone") as string) ?? "",
      email: (formData.get("email") as string) ?? "",
      website: (formData.get("website") as string) ?? "",
      priceRange: (formData.get("priceRange") as string) ?? "mid",
      established: (formData.get("established") as string) ?? "",
      categories: JSON.stringify(categories),
      tags: JSON.stringify(tags),
      images: JSON.stringify(images),
      hours: JSON.stringify(hours),
      deliveryAvailable: formData.get("deliveryAvailable") === "true",
      open: formData.get("open") !== "false",
      status: (formData.get("status") as string) ?? "pending",
      verified: formData.get("verified") === "true",
      featured: formData.get("featured") === "true",
      sponsored: formData.get("sponsored") === "true",
      sortOrder: parseInt((formData.get("sortOrder") as string) ?? "0", 10) || 0,
      submittedBy,
      showEmail: formData.get("showEmail") === "true",
      googlePlaceId: (formData.get("googlePlaceId") as string) ?? "",
      rating: parseFloat((formData.get("rating") as string) ?? "0") || 0,
      reviewCount: parseInt((formData.get("reviewCount") as string) ?? "0", 10) || 0,
    },
  });

  revalidatePath("/admin/listings");
  revalidatePath("/listings");
  redirect("/admin/listings");
}

export async function updateListing(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const city = (formData.get("city") as string) ?? "";
  const categories = splitCsv((formData.get("categories") as string) ?? "");
  const tags = splitCsv((formData.get("tags") as string) ?? "");
  const images = splitCsv((formData.get("images") as string) ?? "");
  const hoursRaw = (formData.get("hours") as string) ?? "";
  let hoursUpdate: any = undefined;
  if (hoursRaw) {
    try { hoursUpdate = JSON.stringify(JSON.parse(hoursRaw)); } catch {}
  }

  await prisma.listing.update({
    where: { id },
    data: {
      name,
      tagline: (formData.get("tagline") as string) ?? "",
      description: (formData.get("description") as string) ?? "",
      address: (formData.get("address") as string) ?? "",
      city,
      state: (formData.get("state") as string) ?? "",
      citySlug: citySlugFromName(city),
      pincode: (formData.get("pincode") as string) ?? "",
      phone: (formData.get("phone") as string) ?? "",
      email: (formData.get("email") as string) ?? "",
      website: (formData.get("website") as string) ?? "",
      priceRange: (formData.get("priceRange") as string) ?? "mid",
      established: (formData.get("established") as string) ?? "",
      categories: JSON.stringify(categories),
      tags: JSON.stringify(tags),
      ...(images.length > 0 ? { images: JSON.stringify(images) } : {}),
      ...(hoursUpdate ? { hours: hoursUpdate } : {}),
      deliveryAvailable: formData.get("deliveryAvailable") === "true",
      open: formData.get("open") !== "false",
      status: (formData.get("status") as string) ?? "pending",
      verified: formData.get("verified") === "true",
      featured: formData.get("featured") === "true",
      sponsored: formData.get("sponsored") === "true",
      sortOrder: parseInt((formData.get("sortOrder") as string) ?? "0", 10) || 0,
      showEmail: formData.get("showEmail") === "true",
      rating: parseFloat((formData.get("rating") as string) ?? "0") || 0,
      reviewCount: parseInt((formData.get("reviewCount") as string) ?? "0", 10) || 0,
    },
  });

  revalidatePath("/admin/listings");
  revalidatePath("/listings");
  redirect("/admin/listings");
}

export async function deleteListing(id: string) {
  await prisma.listing.delete({ where: { id } });
  revalidatePath("/admin/listings");
  revalidatePath("/listings");
}

export async function setListingStatus(id: string, status: string) {
  await prisma.listing.update({
    where: { id },
    data: {
      status,
      verified: status === "approved",
    },
  });
  revalidatePath("/admin/listings");
  revalidatePath("/listings");
}

export async function toggleListingFeatured(id: string, featured: boolean) {
  await prisma.listing.update({ where: { id }, data: { featured } });
  revalidatePath("/admin/listings");
  revalidatePath("/listings");
}

export async function toggleListingSponsored(id: string, sponsored: boolean) {
  await prisma.listing.update({ where: { id }, data: { sponsored } });
  revalidatePath("/admin/listings");
  revalidatePath("/listings");
}

export async function toggleListingVerified(id: string, verified: boolean) {
  await prisma.listing.update({ where: { id }, data: { verified } });
  revalidatePath("/admin/listings");
  revalidatePath("/listings");
}

export async function updateListingSortOrder(id: string, sortOrder: number) {
  await prisma.listing.update({ where: { id }, data: { sortOrder } });
  revalidatePath("/admin/listings");
  revalidatePath("/listings");
}
