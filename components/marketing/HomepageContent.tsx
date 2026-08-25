import PublicReviewsSection from "@/components/reviews/PublicReviewsSection";
import PremiumHomepage from "./PremiumHomepage";
import PublicShell from "./PublicShell";

export default function HomepageContent({
  searchParams,
}: {
  searchParams?: { platform?: string; service?: string };
}) {
  return (
    <PublicShell>
      <PremiumHomepage searchParams={searchParams} />
      <PublicReviewsSection limit={4} />
    </PublicShell>
  );
}
