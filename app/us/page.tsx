import UnitedStatesMarketHub from "@/components/marketing/UnitedStatesMarketHub";
import { createCountryHubMetadata, getInternationalMarket } from "@/lib/seo/international";
const market = getInternationalMarket("us")!;
export const metadata = createCountryHubMetadata(market);
export default function UnitedStatesPage() { return <UnitedStatesMarketHub market={market} />; }
