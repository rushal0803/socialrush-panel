export type VerifiedCustomerReview = {
  customerName: string;
  serviceUsed: string;
  reviewText: string;
  date: string;
  permissionConfirmed: boolean;
  privateOrderReference?: string;
};

export type AnonymizedCaseStudy = {
  customerType: string;
  serviceOrdered: string;
  quantity: string;
  deliveryPeriod: string;
  observedOutcome: string;
  limitations: string;
};

export type SupportResponseExample = {
  question: string;
  responseSummary: string;
  channel: "WhatsApp" | "Email" | "Dashboard support";
};

// Keep these arrays empty until the business provides verified, permissioned proof.
// Do not add fabricated reviews, fake case studies, fake ratings, or fake order IDs.
export const verifiedCustomerReviews: VerifiedCustomerReview[] = [];
export const anonymizedCaseStudies: AnonymizedCaseStudy[] = [];
export const supportResponseExamples: SupportResponseExample[] = [];

export const platformDisclaimer =
  "SocialRUSH is an independent service provider and is not affiliated with Instagram, Meta, YouTube, Google, LinkedIn, X, TikTok or Telegram.";
