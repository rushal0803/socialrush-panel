import type { Metadata } from "next";
import { notFound } from "next/navigation";
import IndiaServiceLandingPage from "@/components/marketing/services/IndiaServiceLandingPage";
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

  return (
    <IndiaServiceLandingPage
      slug={slug}
      canonicalPath={`/${params.service}`}
    />
  );
}
