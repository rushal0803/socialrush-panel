import { notFound } from "next/navigation";
import CountryServiceLandingPage from "@/components/marketing/services/CountryServiceLandingPage";
import { createCountryServiceMetadata, getPublishedCountryServicePage, publishedCountryServicePages } from "@/lib/seo/international";

export function generateStaticParams() {
  return publishedCountryServicePages
    .filter((page) => page.market.slug === "sg")
    .map((page) => ({ service: page.serviceSlug }));
}

export function generateMetadata({ params }: { params: { service: string } }) {
  const page = getPublishedCountryServicePage("sg", params.service);
  return page ? createCountryServiceMetadata(page) : {};
}

export default function Page({ params }: { params: { service: string } }) {
  const page = getPublishedCountryServicePage("sg", params.service);
  if (!page) notFound();
  return <CountryServiceLandingPage page={page} />;
}
