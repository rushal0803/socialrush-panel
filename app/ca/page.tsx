import CountryHubPage from "@/components/marketing/CountryHubPage";
import { createCountryHubMetadata, getInternationalMarket } from "@/lib/seo/international";
const market = getInternationalMarket("ca")!;
export const metadata = createCountryHubMetadata(market);
export default function CanadaPage() { return <CountryHubPage market={market} />; }
