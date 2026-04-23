import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MyCareerly — America's Flower Shop Directory",
    short_name: "MyCareerly",
    description: "Find verified local flower shops across 50+ US cities. Expert flower guides, 1900+ flower reference, and trusted florist recommendations.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAFAF8",
    theme_color: "#E8705A",
    icons: [
      {
        src: "/icon.png",
        sizes: "any",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "any",
        type: "image/png",
        purpose: "any",
      },
    ],
    orientation: "portrait",
    lang: "en-US",
    categories: ["lifestyle", "shopping", "business"],
  };
}
