import PublicReviewsSection from "@/components/reviews/PublicReviewsSection";
import TrustEvidencePanel from "@/components/marketing/trust/TrustEvidencePanel";
import PremiumHomepage from "./PremiumHomepage";
import PremiumHomeHero from "./PremiumHomeHero";
import PublicShell from "./PublicShell";
import DeferredPersonalizationShelf from "./cro/DeferredPersonalizationShelf";
import { activeSmmServices } from "@/lib/smm-service-catalog";
import styles from "./PremiumSystem.module.css";

export default function HomepageContent() {
  return (
    <PublicShell>
      <div className={styles.home}>
        <PremiumHomepage hero={<PremiumHomeHero />} />
        <TrustEvidencePanel />
        <DeferredPersonalizationShelf catalog={activeSmmServices} />
        <PublicReviewsSection limit={4} />
      </div>
    </PublicShell>
  );
}
