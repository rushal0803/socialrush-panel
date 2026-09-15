import type { ReactNode } from "react";
import ServiceDetailSmartPricing from "@/components/marketing/services/ServiceDetailSmartPricing";
import { activeSmmServices } from "@/lib/smm-service-catalog";
import styles from "./phase5-detail.module.css";

const dedicatedExperienceSlugs = new Set([
  "instagram-followers",
  "facebook-views",
  "linkedin-usa-followers",
  "linkedin-usa-connections",
  "linkedin-usa-post-likes",
  "linkedin-usa-custom-comments",
  "linkedin-usa-endorsements",
  "linkedin-usa-reposts",
  "linkedin-usa-group-members",
]);

export default function ServiceDetailLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { slug: string };
}) {
  const service = activeSmmServices.find((candidate) => candidate.code === params.slug) ?? null;
  const showPlanner = Boolean(service && !dedicatedExperienceSlugs.has(params.slug));

  return (
    <div className={styles.phase5Detail}>
      {children}
      {showPlanner && service ? <ServiceDetailSmartPricing service={service} /> : null}
    </div>
  );
}
