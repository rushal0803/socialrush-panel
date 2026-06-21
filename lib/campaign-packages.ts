export const campaignPackages = [
  { id: "starter", name: "Starter", price: 999, priceLabel: "₹999", duration: "14 days", audience: "Creators and local businesses", outcome: "Establish a measurable growth baseline", roi: "Foundation", features: ["1 growth campaign", "Campaign dashboard", "Weekly performance summary", "Email support"] },
  { id: "growth", name: "Growth", price: 2999, priceLabel: "₹2,999", duration: "30 days", audience: "Growing brands and professionals", outcome: "Expand reach and improve campaign consistency", roi: "High", features: ["3 coordinated campaigns", "Audience strategy", "Live performance tracking", "Priority support"] },
  { id: "professional", name: "Professional", price: 7999, priceLabel: "₹7,999", duration: "60 days", audience: "Agencies and established brands", outcome: "Build sustained visibility across key channels", roi: "Advanced", features: ["Multi-channel campaigns", "Campaign optimization", "Performance reporting", "Automation API access"] },
  { id: "premium", name: "Premium", price: 14999, priceLabel: "₹14,999", duration: "90 days", audience: "High-growth teams and agencies", outcome: "Accelerate brand visibility with managed execution", roi: "Maximum", features: ["Full growth program", "Cross-channel strategy", "Advanced reporting", "Dedicated campaign support"] },
  { id: "enterprise", name: "Enterprise", price: null, priceLabel: "Custom Quote", duration: "Custom roadmap", audience: "Enterprise teams and large portfolios", outcome: "Create a tailored growth operation at scale", roi: "Strategic", features: ["Custom campaign architecture", "Team workflows", "Expanded API capacity", "Dedicated growth partner"] },
] as const;

export type CampaignPackageId = (typeof campaignPackages)[number]["id"];
