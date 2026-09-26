import { notFound } from "next/navigation";
import CountryServiceLandingPage from "@/components/marketing/services/CountryServiceLandingPage";
import { createCountryServiceMetadata, getPublishedCountryServicePage, publishedCountryServicePages } from "@/lib/seo/international";

export function generateStaticParams() {
  return publishedCountryServicePages
    .filter((page) => page.market.slug === "sg")
    .map((page) => ({ service: page.serviceSlug }));
}

export async function generateMetadata({ params }: { params: Promise<{ service: string }> }) {
  const { service } = await params;
  const page = getPublishedCountryServicePage("sg", service);
  return page ? createCountryServiceMetadata(page) : {};
}

export default async function Page({ params }: { params: Promise<{ service: string }> }) {
  const { service } = await params;
  const page = getPublishedCountryServicePage("sg", service);
  if (!page) notFound();
  return <CountryServiceLandingPage page={page} />;
}
