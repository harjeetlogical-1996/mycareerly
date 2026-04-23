"use server";

import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import crypto from "crypto";

const RATE_LIMIT_PER_HOUR = 3;

async function getIpHash(): Promise<string> {
  try {
    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0].trim()
            || h.get("x-real-ip")
            || h.get("cf-connecting-ip")
            || "anonymous";
    return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 32);
  } catch {
    return "anonymous";
  }
}

// ── PUBLIC: Submit a review ────────────────────────────────────────────────
export async function submitReview(formData: FormData) {
  const listingId = (formData.get("listingId") as string)?.trim();
  const authorName = (formData.get("authorName") as string)?.trim();
  const authorEmail = (formData.get("authorEmail") as string)?.trim().toLowerCase();
  const rating = parseInt((formData.get("rating") as string) ?? "0", 10);
  const title = (formData.get("title") as string)?.trim() ?? "";
  const body = (formData.get("body") as string)?.trim();

  // ── Validation ────────────────────────────────────────────────────────────
  if (!listingId) return { success: false, error: "Missing listing reference" };
  if (!authorName || authorName.length < 2) return { success: false, error: "Please enter your name" };
  if (!authorEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authorEmail)) {
    return { success: false, error: "Please enter a valid email address" };
  }
  if (!rating || rating < 1 || rating > 5) return { success: false, error: "Please select a rating (1-5 stars)" };
  if (!body || body.length < 20) return { success: false, error: "Review must be at least 20 characters" };
  if (body.length > 2000) return { success: false, error: "Review must be under 2000 characters" };

  // ── Rate limit (per IP, per hour) ─────────────────────────────────────────
  const ipHash = await getIpHash();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCount = await prisma.review.count({
    where: { ipHash, createdAt: { gte: oneHourAgo } },
  });
  if (recentCount >= RATE_LIMIT_PER_HOUR) {
    return { success: false, error: "Too many reviews submitted recently. Please try again later." };
  }

  // ── Check listing exists ──────────────────────────────────────────────────
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) return { success: false, error: "Listing not found" };

  // ── Spam check: same email + same listing already reviewed ────────────────
  const duplicate = await prisma.review.findFirst({
    where: { listingId, authorEmail },
  });
  if (duplicate) {
    return { success: false, error: "You've already reviewed this shop. Contact us if you need to update your review." };
  }

  // ── Create pending review ─────────────────────────────────────────────────
  await prisma.review.create({
    data: {
      listingId,
      authorName,
      authorEmail,
      rating,
      title,
      body,
      status: "pending",
      ipHash,
    },
  });

  revalidatePath(`/listings/${listingId}`);
  revalidatePath("/admin/reviews");

  return {
    success: true,
    message: "Thank you! Your review has been submitted and will appear after our team approves it (within 24 hours).",
  };
}

// ── ADMIN: Moderation actions ─────────────────────────────────────────────
export async function approveReview(id: string) {
  const review = await prisma.review.update({
    where: { id },
    data: { status: "approved" },
  });
  // Update aggregate rating + reviewCount on listing
  await recalculateListingRating(review.listingId);
  revalidatePath("/admin/reviews");
  revalidatePath(`/listings/${review.listingId}`);
  return { success: true };
}

export async function rejectReview(id: string) {
  await prisma.review.update({ where: { id }, data: { status: "rejected" } });
  revalidatePath("/admin/reviews");
  return { success: true };
}

export async function deleteReview(id: string) {
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) return { success: false };
  await prisma.review.delete({ where: { id } });
  await recalculateListingRating(review.listingId);
  revalidatePath("/admin/reviews");
  revalidatePath(`/listings/${review.listingId}`);
  return { success: true };
}

// ── HELPER: Recalculate listing's combined rating ─────────────────────────
// Combines Google rating (existing field) with approved user reviews.
// Strategy: weighted average — Google reviews count more if their reviewCount is higher.
async function recalculateListingRating(listingId: string) {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) return;

  const userReviews = await prisma.review.findMany({
    where: { listingId, status: "approved" },
    select: { rating: true },
  });

  const userCount = userReviews.length;
  const userSum = userReviews.reduce((s, r) => s + r.rating, 0);

  // Original Google data = listing.rating (avg) × listing.reviewCount (count)
  // We approximate by treating existing rating as Google-only baseline
  const googleCount = Math.max(0, listing.reviewCount - userCount);
  const googleSum = listing.rating * googleCount;

  const combinedCount = googleCount + userCount;
  const combinedAvg = combinedCount > 0 ? (googleSum + userSum) / combinedCount : listing.rating;

  await prisma.listing.update({
    where: { id: listingId },
    data: {
      rating: Math.round(combinedAvg * 10) / 10,
      reviewCount: combinedCount,
    },
  });
}
