import PublicReviewsSection from "@/components/reviews/PublicReviewsSection";
import HomepageExperienceFrame from "./HomepageExperienceFrame";
import InteractiveHomepageShell from "./InteractiveHomepageShell";
import PremiumHomepage from "./PremiumHomepage";
import PublicShell from "./PublicShell";
import PersonalizationShelf from "./cro/PersonalizationShelf";
import { activeSmmServices } from "@/lib/smm-service-catalog";

export default function HomepageContent({
  searchParams,
}: {
  searchParams?: { platform?: string; service?: string };
}) {
  return (
    <PublicShell>
      <InteractiveHomepageShell>
        <HomepageExperienceFrame>
          <PremiumHomepage searchParams={searchParams} />
          <PersonalizationShelf catalog={activeSmmServices} />
          <PublicReviewsSection limit={4} />
        </HomepageExperienceFrame>
      </InteractiveHomepageShell>
    </PublicShell>
  );
}
