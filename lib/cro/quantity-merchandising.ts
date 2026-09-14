import type { SmmService } from "@/lib/smm-service-catalog";

export type QuantityMerchandisingOption = {
  value: number;
  label: "Starter" | "Popular" | "Best Value" | null;
  emphasis: "standard" | "popular" | "best-value";
};

function validForService(service: SmmService, value: number) {
  const step = service.quantityStep ?? 1;
  return value >= service.minQuantity && value <= service.maxQuantity && (value - service.minQuantity) % step === 0;
}

/**
 * Builds a compact set of valid quantity choices while giving larger orders
 * clearer merchandising priority. This does not change service pricing,
 * minimums, maximums or checkout validation.
 */
export function buildQuantityMerchandising(service: SmmService): QuantityMerchandisingOption[] {
  const candidates = [
    service.minQuantity,
    500,
    1000,
    2500,
    5000,
    10000,
    25000,
    50000,
    100000,
    service.maxQuantity,
  ];

  const values = [...new Set(candidates.filter((value) => validForService(service, value)))]
    .sort((a, b) => a - b)
    .slice(0, 5);

  if (!values.length) return [];

  const popularIndex = values.length >= 3 ? Math.min(values.length - 2, Math.max(1, Math.floor(values.length / 2))) : values.length - 1;
  const bestValueIndex = values.length >= 2 ? values.length - 1 : -1;

  return values.map((value, index) => {
    if (index === bestValueIndex && index !== 0) {
      return { value, label: "Best Value", emphasis: "best-value" };
    }
    if (index === popularIndex && index !== 0) {
      return { value, label: "Popular", emphasis: "popular" };
    }
    if (index === 0) {
      return { value, label: "Starter", emphasis: "standard" };
    }
    return { value, label: null, emphasis: "standard" };
  });
}
