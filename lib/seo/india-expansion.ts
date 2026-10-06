export type IndiaRegionalCluster = Readonly<{
  id:
    | "delhi-ncr"
    | "mumbai-pune"
    | "bengaluru-hyderabad"
    | "chennai-south"
    | "kolkata-east"
    | "ahmedabad-surat"
    | "jaipur-rajasthan"
    | "chandigarh-punjab";
  label: string;
  locations: readonly string[];
  primaryPath: "/social-media-growth-india";
  pageDecision: "covered-by-national-hub" | "defer-dedicated-page";
  reason: string;
}>;

export const indiaRegionalClusters: readonly IndiaRegionalCluster[] = [
  {
    id: "delhi-ncr",
    label: "Delhi NCR",
    locations: ["Delhi", "Gurugram", "Noida"],
    primaryPath: "/social-media-growth-india",
    pageDecision: "covered-by-national-hub",
    reason:
      "Keep Delhi NCR discovery on the national India hub until verified query data and unique local information justify a separate regional URL.",
  },
  {
    id: "mumbai-pune",
    label: "Mumbai & Pune",
    locations: ["Mumbai", "Navi Mumbai", "Pune"],
    primaryPath: "/social-media-growth-india",
    pageDecision: "covered-by-national-hub",
    reason:
      "Regional discovery is useful, but a dedicated landing page should not duplicate national service intent without distinct evidence-backed content.",
  },
  {
    id: "bengaluru-hyderabad",
    label: "Bengaluru & Hyderabad",
    locations: ["Bengaluru", "Hyderabad"],
    primaryPath: "/social-media-growth-india",
    pageDecision: "covered-by-national-hub",
    reason:
      "Use the India authority hub as the canonical discovery path until Search Console or other verified demand supports a unique regional page.",
  },
  {
    id: "chennai-south",
    label: "Chennai & South India",
    locations: ["Chennai", "Coimbatore", "Kochi"],
    primaryPath: "/social-media-growth-india",
    pageDecision: "covered-by-national-hub",
    reason:
      "Do not create state or city clones of commercial service pages; keep regional discovery consolidated on the national hub.",
  },
  {
    id: "kolkata-east",
    label: "Kolkata & East India",
    locations: ["Kolkata", "Bhubaneswar", "Guwahati"],
    primaryPath: "/social-media-growth-india",
    pageDecision: "covered-by-national-hub",
    reason:
      "Regional terms can be represented on the India hub without creating thin pages that compete with national canonical owners.",
  },
  {
    id: "ahmedabad-surat",
    label: "Ahmedabad & Surat",
    locations: ["Ahmedabad", "Surat", "Vadodara"],
    primaryPath: "/social-media-growth-india",
    pageDecision: "covered-by-national-hub",
    reason:
      "Keep discovery consolidated until a separate regional page can provide unique, verifiable information beyond city-name substitution.",
  },
  {
    id: "jaipur-rajasthan",
    label: "Jaipur & Rajasthan",
    locations: ["Jaipur", "Jodhpur", "Udaipur"],
    primaryPath: "/social-media-growth-india",
    pageDecision: "covered-by-national-hub",
    reason:
      "The India hub should own broad regional discovery unless verified search data proves a separate intent with enough unique content.",
  },
  {
    id: "chandigarh-punjab",
    label: "Chandigarh & Punjab",
    locations: ["Chandigarh", "Ludhiana", "Amritsar"],
    primaryPath: "/social-media-growth-india",
    pageDecision: "covered-by-national-hub",
    reason:
      "Avoid local doorway pages; use the national hub until a distinct regional question can be answered with evidence-backed content.",
  },
] as const;

export const indiaExpansionPolicy = {
  canonicalRegionalDiscoveryPath: "/social-media-growth-india" as const,
  dedicatedPageRequirements: [
    "Verified query demand from Search Console or another reliable source.",
    "A distinct user intent that is not already owned by a national service or platform hub.",
    "Unique regional information that goes beyond changing a city or state name.",
    "A clear internal-link role that strengthens rather than competes with national canonical pages.",
  ] as const,
  prohibitedPatterns: [
    "City-name clones of national money pages.",
    "Unsupported local-office or local-team claims.",
    "Location pages created only to repeat the same price, delivery, refill, or checkout copy.",
  ] as const,
} as const;

export function hasUniqueIndiaRegionalClusters() {
  const ids = indiaRegionalClusters.map((cluster) => cluster.id);
  return new Set(ids).size === ids.length;
}

export function hasUniqueIndiaRegionalLocations() {
  const locations = indiaRegionalClusters.flatMap((cluster) => cluster.locations.map((location) => location.toLowerCase()));
  return new Set(locations).size === locations.length;
}
