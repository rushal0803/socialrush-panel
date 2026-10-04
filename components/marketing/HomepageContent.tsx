import PublicReviewsSection from "@/components/reviews/PublicReviewsSection";
import HomepageExperienceFrame from "./HomepageExperienceFrame";
import InteractiveHomepageShell from "./InteractiveHomepageShell";
import PremiumHomepage from "./PremiumHomepage";
import PublicShell from "./PublicShell";
import DeferredPersonalizationShelf from "./cro/DeferredPersonalizationShelf";
import { activeSmmServices } from "@/lib/smm-service-catalog";

export default function HomepageContent() {
  return (
    <PublicShell>
      <InteractiveHomepageShell>
        <HomepageExperienceFrame>
          <PremiumHomepage />
          <DeferredPersonalizationShelf catalog={activeSmmServices} />
          <PublicReviewsSection limit={4} />
        </HomepageExperienceFrame>
      </InteractiveHomepageShell>
    </PublicShell>
  );
}
