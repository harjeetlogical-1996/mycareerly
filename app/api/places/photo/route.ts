import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.GOOGLE_PLACES_API_KEY!;
const BASE = "https://places.googleapis.com/v1";

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");
  if (!name) return new NextResponse("Missing name", { status: 400 });

  try {
    // Fetch the photo from Google, following the redirect to the actual CDN image
    const res = await fetch(
      `${BASE}/${name}/media?maxWidthPx=800&key=${API_KEY}`,
      { redirect: "follow" }
    );

    if (!res.ok) return new NextResponse("Photo not found", { status: 404 });

    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") ?? "image/jpeg";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch {
    return new NextResponse("Error fetching photo", { status: 500 });
  }
}
