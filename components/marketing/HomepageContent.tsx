import PublicReviewsSection from "@/components/reviews/PublicReviewsSection";
import { Suspense } from "react";
import PremiumHomepage from "./PremiumHomepage";

export default function HomepageContent() {
  return <><Suspense fallback={<main className="min-h-screen bg-[#07080D]" />}><PremiumHomepage /></Suspense><PublicReviewsSection limit={3} /></>;
}
