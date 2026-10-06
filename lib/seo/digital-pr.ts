export type DigitalPrAssetKind = "tool" | "guide" | "resource";

export type DigitalPrAsset = Readonly<{
  id: string;
  title: string;
  path: string;
  kind: DigitalPrAssetKind;
  audience: readonly string[];
  pitchAngle: string;
  suggestedAnchors: readonly string[];
  evidenceNote: string;
}>;

export type DigitalPrLane = Readonly<{
  id: string;
  label: string;
  audience: string;
  objective: string;
  bestAssetIds: readonly string[];
  qualification: readonly string[];
}>;

export const digitalPrAssets: readonly DigitalPrAsset[] = [
  {
    id: "growth-budget-calculator",
    title: "Social Media Growth Budget Calculator",
    path: "/tools/social-media-growth-budget-calculator",
    kind: "tool",
    audience: ["creator educators", "small-business resources", "marketing course authors"],
    pitchAngle: "A transparent planning tool readers can use to model their own campaign budget without relying on claimed market-rate benchmarks.",
    suggestedAnchors: ["social media budget calculator", "campaign budget planner", "free social-media planning tool", "SocialRUSH budget calculator"],
    evidenceNote: "Uses visitor-entered values; do not describe it as proprietary market-price research.",
  },
  {
    id: "creator-growth-checklist",
    title: "Creator Growth Checklist",
    path: "/tools/creator-growth-checklist",
    kind: "resource",
    audience: ["creator newsletters", "social-media educators", "course resource pages"],
    pitchAngle: "A practical pre-campaign checklist covering profile readiness, content, tracking, budgeting, public URLs and account-safety basics.",
    suggestedAnchors: ["creator growth checklist", "creator planning checklist", "social-media campaign checklist", "SocialRUSH creator checklist"],
    evidenceNote: "Position as a planning resource, not a guarantee of creator growth or revenue.",
  },
  {
    id: "instagram-engagement-calculator",
    title: "Instagram Engagement Rate Calculator",
    path: "/tools/instagram-engagement-rate-calculator",
    kind: "tool",
    audience: ["Instagram educators", "creator analytics guides", "marketing course authors"],
    pitchAngle: "A browser-based calculator that helps readers understand the engagement-rate formula using their own metrics.",
    suggestedAnchors: ["Instagram engagement calculator", "engagement rate calculator", "Instagram analytics tool", "SocialRUSH engagement calculator"],
    evidenceNote: "Explain the formula and user-entered inputs; never present a calculated result as a platform-verified metric.",
  },
  {
    id: "utm-link-builder",
    title: "UTM Link Builder",
    path: "/tools/utm-link-builder",
    kind: "tool",
    audience: ["marketing tutorials", "campaign measurement guides", "small-business resources"],
    pitchAngle: "A free campaign-measurement utility that complements articles teaching source, medium and campaign tagging.",
    suggestedAnchors: ["UTM link builder", "campaign URL builder", "free UTM tool", "SocialRUSH UTM builder"],
    evidenceNote: "Pitch the utility itself; do not claim attribution accuracy beyond the parameters the visitor creates.",
  },
  {
    id: "growth-audit",
    title: "Social Media Growth Audit",
    path: "/tools/social-media-growth-audit",
    kind: "tool",
    audience: ["creator education sites", "small-business guides", "marketing communities"],
    pitchAngle: "A self-assessment resource for reviewing user-entered engagement, reach and posting consistency before planning a campaign.",
    suggestedAnchors: ["social media growth audit", "creator growth audit", "social-media self assessment", "SocialRUSH growth audit"],
    evidenceNote: "Uses user-entered information; do not describe results as an independent account audit performed by SocialRUSH.",
  },
  {
    id: "public-link-safety-guide",
    title: "Why Public-Link Ordering Is Safer",
    path: "/blog/why-public-link-ordering-is-safer",
    kind: "guide",
    audience: ["online-safety resources", "creator education", "digital marketing guides"],
    pitchAngle: "A safety-focused explanation of why public-link workflows should not require social-media passwords, OTPs or recovery codes.",
    suggestedAnchors: ["public-link ordering safety", "social-media account safety guide", "ordering safety guide", "SocialRUSH safety guide"],
    evidenceNote: "Keep the scope to account-access safety and ordering practices; do not claim that any service is risk-free.",
  },
] as const;

export const digitalPrLanes: readonly DigitalPrLane[] = [
  {
    id: "educator-resource-pages",
    label: "Educator & resource pages",
    audience: "Creator educators, course authors and practical resource libraries",
    objective: "Earn contextual citations where a free calculator, checklist or audit genuinely extends the reader's lesson.",
    bestAssetIds: ["growth-budget-calculator", "creator-growth-checklist", "instagram-engagement-calculator", "utm-link-builder"],
    qualification: [
      "The page already teaches a closely related topic.",
      "The resource adds a concrete task the reader can perform.",
      "The placement would make sense without an SEO incentive.",
    ],
  },
  {
    id: "publisher-expert-input",
    label: "Publisher & editorial input",
    audience: "Relevant marketing, creator-economy and small-business publishers",
    objective: "Contribute factual expert context, methods or safety guidance when an editor is covering a matching topic.",
    bestAssetIds: ["public-link-safety-guide", "growth-budget-calculator", "growth-audit"],
    qualification: [
      "The publication has a clear editorial audience fit.",
      "Any quote or contribution is factual and attributable.",
      "A link is requested only when it helps readers verify or use the referenced resource.",
    ],
  },
  {
    id: "newsletter-roundups",
    label: "Newsletter & tool roundups",
    audience: "Creator, marketing and small-business newsletters",
    objective: "Place useful free tools in curated resources where subscribers can apply them immediately.",
    bestAssetIds: ["creator-growth-checklist", "utm-link-builder", "instagram-engagement-calculator", "growth-budget-calculator"],
    qualification: [
      "The newsletter routinely shares relevant practical resources.",
      "The tool is useful to the audience without requiring a purchase.",
      "The pitch is specific to one resource, not a bulk link request.",
    ],
  },
  {
    id: "community-reference",
    label: "Community references",
    audience: "Relevant creator and marketing communities with maintained resource collections",
    objective: "Contribute a genuinely useful reference to a community resource list or educational thread without disguised promotion.",
    bestAssetIds: ["creator-growth-checklist", "growth-audit", "public-link-safety-guide"],
    qualification: [
      "Community rules permit resource sharing.",
      "The contribution answers a real member question.",
      "Affiliation with SocialRUSH is disclosed when relevant.",
    ],
  },
] as const;

export const digitalPrGuardrails = [
  "No paid dofollow placements or link exchanges created primarily to manipulate rankings.",
  "No PBNs, mass directories, automated comment links or irrelevant guest posts.",
  "No fabricated publisher relationships, placements, quotes, awards or media mentions.",
  "No exact-match commercial anchor campaign; prefer descriptive resource anchors or the SocialRUSH brand.",
  "No claim that a backlink, placement or campaign guarantees rankings, traffic, leads or revenue.",
  "Disclose affiliation when contributing on behalf of SocialRUSH.",
] as const;

export function buildDigitalPrSnapshot() {
  const assetIds = new Set(digitalPrAssets.map((asset) => asset.id));
  const missingLaneAssets = digitalPrLanes.flatMap((lane) =>
    lane.bestAssetIds
      .filter((id) => !assetIds.has(id))
      .map((id) => ({ lane: lane.id, assetId: id })),
  );

  const duplicatePaths = digitalPrAssets
    .map((asset) => asset.path)
    .filter((path, index, paths) => paths.indexOf(path) !== index);

  return {
    assets: digitalPrAssets,
    lanes: digitalPrLanes,
    guardrails: digitalPrGuardrails,
    missingLaneAssets,
    duplicatePaths: [...new Set(duplicatePaths)],
    summary: {
      assets: digitalPrAssets.length,
      tools: digitalPrAssets.filter((asset) => asset.kind === "tool").length,
      guides: digitalPrAssets.filter((asset) => asset.kind === "guide").length,
      lanes: digitalPrLanes.length,
      missingLaneAssets: missingLaneAssets.length,
      duplicatePaths: new Set(duplicatePaths).size,
    },
    note:
      "This registry tracks outreach-ready SocialRUSH assets and quality rules. It does not claim any external backlink, media mention, domain metric, ranking lift or publisher relationship unless independently verified.",
  };
}
