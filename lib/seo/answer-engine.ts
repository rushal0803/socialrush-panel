import { SEO_SITE_URL } from "@/lib/seo/metadata";
import { getSeoServicePage, seoServiceSlugs, type SeoServiceSlug } from "@/lib/seo/service-landing-pages";

export type AeoTarget = Readonly<{
  path: string;
  label: string;
  kind: "service" | "authority" | "content";
  answerReady: boolean;
  entityLinked: boolean;
}>;

const privatePaths = [
  "/dashboard",
  "/admin",
  "/api",
  "/auth",
  "/login",
  "/register",
  "/account",
  "/orders",
  "/wallet",
  "/billing",
] as const;

function canonicalServicePath(slug: SeoServiceSlug) {
  return slug === "instagram-followers" ? "/buy-instagram-followers-india" : `/${slug}`;
}

export const aeoTargets: readonly AeoTarget[] = [
  ...seoServiceSlugs.map((slug) => {
    const page = getSeoServicePage(slug);
    return {
      path: canonicalServicePath(slug),
      label: page.displayName,
      kind: "service" as const,
      answerReady: true,
      entityLinked: true,
    };
  }),
  { path: "/faq", label: "SocialRUSH FAQ", kind: "authority", answerReady: true, entityLinked: true },
  { path: "/trust", label: "Customer safety & trust", kind: "authority", answerReady: true, entityLinked: true },
  { path: "/blog", label: "Editorial content hub", kind: "content", answerReady: true, entityLinked: true },
];

export function buildAeoSnapshot() {
  return {
    generatedAt: new Date().toISOString(),
    siteUrl: SEO_SITE_URL,
    organizationId: `${SEO_SITE_URL}/#organization`,
    crawler: {
      name: "OAI-SearchBot",
      explicitlyAllowed: true,
      privatePathsProtected: privatePaths,
    },
    targets: aeoTargets,
    summary: {
      targets: aeoTargets.length,
      serviceTargets: aeoTargets.filter((target) => target.kind === "service").length,
      answerReady: aeoTargets.filter((target) => target.answerReady).length,
      entityLinked: aeoTargets.filter((target) => target.entityLinked).length,
    },
    principles: [
      "Use one canonical owner per search intent.",
      "Give users concise answers before deeper detail.",
      "Keep entity references consistent across Organization, Service and BlogPosting schema.",
      "Allow search crawlers to reach public content while keeping private account and admin routes blocked.",
      "Do not create AI-only doorway pages or unsupported ranking/citation claims.",
    ],
    note:
      "Phase 48 tracks technical AI-search readiness. It does not claim placement, citations, rankings or traffic from Google AI features, ChatGPT Search or other answer engines.",
  };
}
