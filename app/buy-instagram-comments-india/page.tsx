import type { Metadata } from "next";
import IndiaServiceLandingPage from "@/components/marketing/services/IndiaServiceLandingPage";
import { getIndiaServiceMetadata } from "@/lib/seo/india-service-pages";

export const metadata: Metadata = getIndiaServiceMetadata(
  "buy-instagram-comments-india",
  "/buy-instagram-comments-india",
);

export default function BuyInstagramCommentsIndiaPage() {
  return <IndiaServiceLandingPage slug="buy-instagram-comments-india" canonicalPath="/buy-instagram-comments-india" />;
}
