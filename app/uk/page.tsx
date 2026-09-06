import CountryHubPage from "@/components/marketing/CountryHubPage";
import { createCountryHubMetadata, getInternationalMarket } from "@/lib/seo/international";
const market = getInternationalMarket("uk")!;
export const metadata = createCountryHubMetadata(market);
export default function UnitedKingdomPage() { return <CountryHubPage market={market} />; }
