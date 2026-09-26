import type { SmmService } from "@/lib/smm-service-catalog";

export type SearchDemandPriceRow = {
  quantity: number;
  total: number | null;
};

const defaultQuantities = [100, 500, 1000, 5000, 10000] as const;

function isValidQuantity(service: SmmService, quantity: number) {
  const step = service.quantityStep ?? 1;
  return quantity >= service.minQuantity
    && quantity <= service.maxQuantity
    && (quantity - service.minQuantity) % step === 0;
}

export function buildSearchDemandPriceRows(service: SmmService): SearchDemandPriceRow[] {
  const quantities = defaultQuantities.filter((quantity) => isValidQuantity(service, quantity));
  const fallback = quantities.length > 0
    ? quantities
    : [service.minQuantity, service.maxQuantity].filter((value, index, values) => value > 0 && values.indexOf(value) === index);

  return fallback.slice(0, 5).map((quantity) => ({
    quantity,
    total: service.requiresLiveCatalogFacts || service.pricePer1000 <= 0
      ? null
      : Math.round((quantity * service.pricePer1000) / 10) / 100,
  }));
}

export function searchDemandPriceHeading(platformLabel: string, unitLabel: string) {
  return `${platformLabel} ${unitLabel} price in India by quantity`;
}
