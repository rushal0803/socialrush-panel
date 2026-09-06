import CountryHubPage from "@/components/marketing/CountryHubPage";
import { createCountryHubMetadata, getInternationalMarket } from "@/lib/seo/international";
const market = getInternationalMarket("us")!;
export const metadata = createCountryHubMetadata(market);
export default function UnitedStatesPage() { return <CountryHubPage market={market} />; }
