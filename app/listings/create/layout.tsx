import type { Metadata } from "next";

const SITE_URL = "https://mycareerly.com";

export const metadata: Metadata = {
  title: "List Your Flower Shop — Free",
  description: "Add your flower shop to MyCareerly's directory for free. Reach customers looking for local florists in your city. Setup takes less than 5 minutes.",
  keywords: "list flower shop, florist directory submission, add flower business, flower shop listing",
  openGraph: {
    title: "List Your Flower Shop | MyCareerly",
    description: "Join 200+ verified florists on MyCareerly. Free listing, setup in minutes.",
    url: `${SITE_URL}/listings/create`,
    type: "website",
  },
  alternates: { canonical: `${SITE_URL}/listings/create` },
  robots: { index: false, follow: false },
};

export default function CreateListingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
