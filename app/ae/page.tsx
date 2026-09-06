import CountryHubPage from "@/components/marketing/CountryHubPage";
import { createCountryHubMetadata, getInternationalMarket } from "@/lib/seo/international";
const market = getInternationalMarket("ae")!;
export const metadata = createCountryHubMetadata(market);
export default function UnitedArabEmiratesPage() { return <CountryHubPage market={market} />; }
