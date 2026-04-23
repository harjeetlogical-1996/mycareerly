import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.GOOGLE_PLACES_API_KEY!;

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get("lat");
  const lng = req.nextUrl.searchParams.get("lng");
  const radius = parseInt(req.nextUrl.searchParams.get("radius") ?? "5000");

  if (!lat || !lng) {
    return NextResponse.json({ error: "Missing lat/lng" }, { status: 400 });
  }

  const res = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": API_KEY,
      "X-Goog-FieldMask": [
        "places.id",
        "places.displayName",
        "places.formattedAddress",
        "places.rating",
        "places.userRatingCount",
        "places.nationalPhoneNumber",
        "places.websiteUri",
        "places.regularOpeningHours",
        "places.photos",
        "places.location",
      ].join(","),
    },
    body: JSON.stringify({
      includedTypes: ["florist"],
      maxResultCount: 10,
      locationRestriction: {
        circle: {
          center: { latitude: parseFloat(lat), longitude: parseFloat(lng) },
          radius,
        },
      },
    }),
  });

  const data = await res.json();

  const shops = (data.places ?? []).map((p: any) => ({
    id: p.id,
    name: p.displayName?.text ?? "Unknown",
    address: p.formattedAddress ?? "",
    rating: p.rating ?? 0,
    reviewCount: p.userRatingCount ?? 0,
    phone: p.nationalPhoneNumber ?? "",
    website: p.websiteUri ?? "",
    isOpen: p.regularOpeningHours?.openNow ?? null,
    photo: p.photos?.[0]?.name
      ? `https://places.googleapis.com/v1/${p.photos[0].name}/media?maxWidthPx=400&key=${API_KEY}`
      : null,
    lat: p.location?.latitude,
    lng: p.location?.longitude,
  }));

  return NextResponse.json({ shops });
}
