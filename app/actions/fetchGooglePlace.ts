"use server";

const API_KEY = process.env.GOOGLE_PLACES_API_KEY!;
const BASE = "https://places.googleapis.com/v1";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

function parseHours(regularOpeningHours: any): { day: string; open: string; close: string; closed: boolean }[] {
  const out: { day: string; open: string; close: string; closed: boolean }[] = [];
  const periods = regularOpeningHours?.periods ?? [];
  for (let i = 0; i < 7; i++) {
    const dayName = DAYS[i];
    // Google: 0=Sunday, 1=Monday, ..., 6=Saturday
    const googleDay = i === 6 ? 0 : i + 1;
    const period = periods.find((p: any) => p.open?.day === googleDay);
    if (!period) {
      out.push({ day: dayName, open: "09:00", close: "18:00", closed: true });
    } else {
      const openH = (period.open.hour ?? 9).toString().padStart(2, "0");
      const openM = (period.open.minute ?? 0).toString().padStart(2, "0");
      const closeH = (period.close?.hour ?? 18).toString().padStart(2, "0");
      const closeM = (period.close?.minute ?? 0).toString().padStart(2, "0");
      out.push({ day: dayName, open: `${openH}:${openM}`, close: `${closeH}:${closeM}`, closed: false });
    }
  }
  return out;
}

function priceLevelToRange(level: number | string | undefined): string {
  if (!level) return "mid";
  // New API returns PRICE_LEVEL_INEXPENSIVE, MODERATE, EXPENSIVE, VERY_EXPENSIVE
  if (typeof level === "string") {
    if (level.includes("INEXPENSIVE")) return "budget";
    if (level.includes("MODERATE")) return "mid";
    if (level.includes("EXPENSIVE")) return "premium";
    return "mid";
  }
  if (level === 1) return "budget";
  if (level >= 3) return "premium";
  return "mid";
}

// Internal helper — NOT exported (Server Actions files can only export async fns)
function extractPlaceIdFromUrl(input: string): string | null {
  const s = input.trim();
  if (!s) return null;
  // Raw place ID (ChIJ... or similar)
  if (/^[A-Za-z0-9_-]{20,}$/.test(s)) return s;
  // place_id= in query
  const qMatch = s.match(/place_id=([A-Za-z0-9_-]+)/);
  if (qMatch) return qMatch[1];
  // !1s0x...:0x... pattern (hex place ID — need to resolve via text search)
  const hexMatch = s.match(/!1s(0x[0-9a-f]+:0x[0-9a-f]+)/i);
  if (hexMatch) return `hex:${hexMatch[1]}`;
  return null;
}

/**
 * Fetch place details from a Google Maps URL or Place ID.
 * Works with new Places API v1 (NOT legacy).
 */
export async function fetchGooglePlace(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return { success: false, error: "Please paste a Google Maps URL" };

  let placeId = extractPlaceIdFromUrl(trimmed);

  // If input is a full URL (short link or place URL), try text search using the URL as query
  if (!placeId && trimmed.startsWith("http")) {
    try {
      const searchRes = await fetch(`${BASE}/places:searchText`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": API_KEY,
          "X-Goog-FieldMask": "places.id",
        },
        body: JSON.stringify({ textQuery: trimmed, maxResultCount: 1 }),
      });
      const sdata = await searchRes.json();
      placeId = sdata.places?.[0]?.id ?? null;
    } catch {
      placeId = null;
    }
  }

  if (!placeId) {
    return {
      success: false,
      error: "Could not extract a Place ID. Paste the full Google Maps URL of the business (the long URL after you click on the place).",
    };
  }

  // Hex place IDs need a text search resolution — attempt name from URL if possible
  if (placeId.startsWith("hex:")) {
    // Extract the business name from the URL to resolve a proper place ID
    const nameMatch = trimmed.match(/\/maps\/place\/([^\/]+)\//);
    if (nameMatch) {
      const placeName = decodeURIComponent(nameMatch[1].replace(/\+/g, " "));
      try {
        const searchRes = await fetch(`${BASE}/places:searchText`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": API_KEY,
            "X-Goog-FieldMask": "places.id",
          },
          body: JSON.stringify({ textQuery: placeName, maxResultCount: 1 }),
        });
        const sdata = await searchRes.json();
        placeId = sdata.places?.[0]?.id ?? null;
      } catch {
        placeId = null;
      }
    }
    if (!placeId || placeId.startsWith("hex:")) {
      return { success: false, error: "Could not resolve this URL. Try copying the full Google Maps place URL." };
    }
  }

  // Fetch full details
  try {
    const res = await fetch(`${BASE}/places/${placeId}?languageCode=en`, {
      headers: {
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": [
          "id",
          "displayName",
          "formattedAddress",
          "addressComponents",
          "nationalPhoneNumber",
          "internationalPhoneNumber",
          "websiteUri",
          "rating",
          "userRatingCount",
          "photos",
          "regularOpeningHours",
          "priceLevel",
          "types",
          "editorialSummary",
          "businessStatus",
        ].join(","),
      },
    });

    const data = await res.json();
    if (data.error || !data.id) {
      return { success: false, error: data.error?.message || "Could not fetch place details" };
    }

    // Extract city / state / zip from address components
    let city = "", state = "", pincode = "";
    for (const comp of data.addressComponents ?? []) {
      const types = comp.types ?? [];
      if (types.includes("locality")) city = comp.longText ?? comp.shortText ?? "";
      else if (types.includes("administrative_area_level_1")) state = comp.shortText ?? comp.longText ?? "";
      else if (types.includes("postal_code")) pincode = comp.longText ?? comp.shortText ?? "";
    }

    const photos = (data.photos ?? [])
      .slice(0, 5)
      .map((p: any) => `/api/places/photo?name=${encodeURIComponent(p.name)}`);

    return {
      success: true,
      data: {
        googlePlaceId: data.id,
        name: data.displayName?.text ?? "",
        address: data.formattedAddress ?? "",
        city,
        state,
        pincode,
        phone: data.nationalPhoneNumber ?? data.internationalPhoneNumber ?? "",
        website: data.websiteUri ?? "",
        rating: Math.round((data.rating ?? 0) * 10) / 10,
        reviewCount: data.userRatingCount ?? 0,
        images: photos,
        hours: parseHours(data.regularOpeningHours),
        priceRange: priceLevelToRange(data.priceLevel),
        description: data.editorialSummary?.text ?? "",
        tagline: data.editorialSummary?.text ?? "",
        categories: (data.types ?? []).filter((t: string) =>
          ["florist","flower_shop","store","point_of_interest"].includes(t) === false
        ).slice(0, 5),
        open: data.businessStatus === "OPERATIONAL",
      },
    };
  } catch (e: any) {
    return { success: false, error: e.message || "Fetch failed" };
  }
}
