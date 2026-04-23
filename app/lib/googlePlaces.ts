const API_KEY = process.env.GOOGLE_PLACES_API_KEY!;
const BASE = "https://places.googleapis.com/v1";

export type GoogleReview = {
  authorName: string;
  authorPhoto: string;
  rating: number;
  text: string;
  relativeTime: string;
  publishTime: string;
};

export async function getPlaceId(name: string, address: string, city: string): Promise<string | null> {
  try {
    const res = await fetch(`${BASE}/places:searchText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "places.id",
      },
      body: JSON.stringify({
        textQuery: `${name} ${address} ${city}`,
        maxResultCount: 1,
      }),
      next: { revalidate: 86400 }, // cache 24h
    });
    const data = await res.json();
    return data.places?.[0]?.id ?? null;
  } catch {
    return null;
  }
}

export async function getPlacePhotos(placeId: string): Promise<string[]> {
  try {
    const res = await fetch(`${BASE}/places/${placeId}`, {
      headers: {
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "photos",
      },
      next: { revalidate: 86400 },
    });
    const data = await res.json();
    // Return proxy URLs so the API key is never exposed in the browser HTML
    return (data.photos ?? [])
      .slice(0, 3)
      .map((p: any) => `/api/places/photo?name=${encodeURIComponent(p.name)}`);
  } catch {
    return [];
  }
}

export async function getPlaceReviews(placeId: string): Promise<GoogleReview[]> {
  try {
    const res = await fetch(`${BASE}/places/${placeId}?languageCode=en`, {
      headers: {
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "reviews",
      },
      next: { revalidate: 3600 }, // cache 1h
    });
    const data = await res.json();
    return (data.reviews ?? []).map((r: any) => ({
      authorName: r.authorAttribution?.displayName ?? "Anonymous",
      authorPhoto: r.authorAttribution?.photoUri ?? "",
      rating: r.rating ?? 5,
      text: r.text?.text ?? "",
      relativeTime: r.relativePublishTimeDescription ?? "",
      publishTime: r.publishTime ?? "",
    }));
  } catch {
    return [];
  }
}
