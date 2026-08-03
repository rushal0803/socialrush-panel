import PublicReviewsSection from "@/components/reviews/PublicReviewsSection";
import PremiumHomepage from "./PremiumHomepage";

export default function HomepageContent({
  searchParams,
}: {
  searchParams?: { platform?: string; service?: string };
}) {
  return <><PremiumHomepage searchParams={searchParams} /><PublicReviewsSection limit={3} /></>;
}
