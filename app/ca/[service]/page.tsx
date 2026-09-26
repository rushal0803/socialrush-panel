import { notFound } from "next/navigation";
import CountryServiceLandingPage from "@/components/marketing/services/CountryServiceLandingPage";
import { createCountryServiceMetadata, getPublishedCountryServicePage, publishedCountryServicePages } from "@/lib/seo/international";
export function generateStaticParams() { return publishedCountryServicePages.filter((page) => page.market.slug === "ca").map((page) => ({ service: page.serviceSlug })); }
export async function generateMetadata({ params }: { params: Promise<{ service: string }> }) {
  const { service } = await params; const page = getPublishedCountryServicePage("ca", service); return page ? createCountryServiceMetadata(page) : {}; }
export default async function Page({ params }: { params: Promise<{ service: string }> }) {
  const { service } = await params; const page = getPublishedCountryServicePage("ca", service); if (!page) notFound(); return <CountryServiceLandingPage page={page} />; }
