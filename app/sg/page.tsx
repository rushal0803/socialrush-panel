import CountryHubPage from "@/components/marketing/CountryHubPage";
import { createCountryHubMetadata, getInternationalMarket } from "@/lib/seo/international";
const market = getInternationalMarket("sg")!;
export const metadata = createCountryHubMetadata(market);
export default function SingaporePage() { return <CountryHubPage market={market} />; }
