import type { Metadata } from "next";
import { notFound } from "next/navigation";
import IndiaServiceLandingPage from "@/components/marketing/services/IndiaServiceLandingPage";
import InstagramLikesPage from "@/app/(india-seo-services)/buy-instagram-likes-india/page";
import InstagramViewsPage from "@/app/(india-seo-services)/buy-instagram-views-india/page";
import YouTubeLikesPage from "@/app/(india-seo-services)/buy-youtube-likes-india/page";
import YouTubeSubscribersPage from "@/app/(india-seo-services)/buy-youtube-subscribers-india/page";
import YouTubeViewsLanding from "@/components/marketing/YouTubeViewsLanding";
import {
  canonicalIndiaServicePaths,
  getIndiaServiceMetadata,
  type IndiaServiceSlug,
} from "@/lib/seo/india-service-pages";

const serviceRoutes = Object.fromEntries(
  Object.entries(canonicalIndiaServicePaths).map(([slug, path]) => [
    path.slice(1),
    slug as IndiaServiceSlug,
  ]),
) as Record<string, IndiaServiceSlug>;

export function generateStaticParams() {
  return Object.keys(serviceRoutes).map((service) => ({ service }));
}

export function generateMetadata({
  params,
}: {
  params: { service: string };
}): Metadata {
  const slug = serviceRoutes[params.service];
  if (!slug) return {};
  return getIndiaServiceMetadata(slug, `/${params.service}`);
}

export default function CanonicalServicePage({
  params,
}: {
  params: { service: string };
}) {
  const slug = serviceRoutes[params.service];
  if (!slug) notFound();

  // Instagram Likes has a purpose-built conversion page. Its order builder reads
  // the exact `instagram-likes` catalog entry used by Services and New Order.
  if (slug === "buy-instagram-likes-india") return <InstagramLikesPage />;
  if (slug === "buy-instagram-views-india") return <InstagramViewsPage />;
  // The canonical route is /youtube-likes; reuse the dedicated visual
  // experience instead of the generic India template.
  if (slug === "buy-youtube-likes-india") return <YouTubeLikesPage />;
  // The canonical route is /youtube-subscribers; render the dedicated visual
  // experience here rather than falling back to the generic India template.
  if (slug === "buy-youtube-subscribers-india") return <YouTubeSubscribersPage />;
  if (slug === "buy-youtube-views-india") return <YouTubeViewsLanding />;

  return (
    <IndiaServiceLandingPage
      slug={slug}
      canonicalPath={`/${params.service}`}
    />
  );
}
