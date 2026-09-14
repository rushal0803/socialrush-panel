import type { SmmService } from "@/lib/smm-service-catalog";

export type QuantityMerchandisingOption = {
  value: number;
  label: "Starter" | "Popular" | "Scale" | null;
  emphasis: "standard" | "popular" | "scale";
};

function validForService(service: SmmService, value: number) {
  const step = service.quantityStep ?? 1;
  return value >= service.minQuantity && value <= service.maxQuantity && (value - service.minQuantity) % step === 0;
}

function closestIndex(values: readonly number[], target: number, blocked = new Set<number>()) {
  let bestIndex = -1;
  let bestDistance = Number.POSITIVE_INFINITY;

  values.forEach((value, index) => {
    if (blocked.has(index)) return;
    const distance = Math.abs(Math.log(value / target));
    if (distance < bestDistance) {
      bestIndex = index;
      bestDistance = distance;
    }
  });

  return bestIndex;
}

/**
 * Builds a compact quantity ladder that deliberately spans the useful service
 * range instead of taking only the five smallest valid quantities. Pricing,
 * service limits and checkout validation remain unchanged.
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
  ];

  const validValues = [...new Set(candidates.filter((value) => validForService(service, value)))].sort((a, b) => a - b);
  if (!validValues.length) return [];
  if (validValues.length <= 5) return labelOptions(validValues);

  const starter = validValues[0];
  const practicalCeiling = Math.min(service.maxQuantity, 25000);
  const scaleTarget = Math.max(starter, practicalCeiling);
  const popularTarget = Math.max(starter, Math.min(5000, scaleTarget / 2));

  const chosen = new Set<number>([0]);
  const popularIndex = closestIndex(validValues, popularTarget, chosen);
  if (popularIndex >= 0) chosen.add(popularIndex);
  const scaleIndex = closestIndex(validValues, scaleTarget, chosen);
  if (scaleIndex >= 0) chosen.add(scaleIndex);

  const desiredCount = Math.min(5, validValues.length);
  while (chosen.size < desiredCount) {
    let bestIndex = -1;
    let bestGap = -1;

    validValues.forEach((value, index) => {
      if (chosen.has(index)) return;
      const nearestGap = Math.min(
        ...[...chosen].map((chosenIndex) => Math.abs(Math.log(value / validValues[chosenIndex]))),
      );
      if (nearestGap > bestGap) {
        bestIndex = index;
        bestGap = nearestGap;
      }
    });

    if (bestIndex < 0) break;
    chosen.add(bestIndex);
  }

  return labelOptions([...chosen].map((index) => validValues[index]).sort((a, b) => a - b));
}

function labelOptions(values: readonly number[]): QuantityMerchandisingOption[] {
  if (!values.length) return [];

  const scaleIndex = values.length >= 2 ? values.length - 1 : -1;
  const popularTarget = Math.min(5000, values[scaleIndex] ?? values[0]);
  const popularIndex = values.length >= 3 ? closestIndex(values, popularTarget, new Set([0, scaleIndex])) : -1;

  return values.map((value, index) => {
    if (index === 0) return { value, label: "Starter", emphasis: "standard" };
    if (index === popularIndex) return { value, label: "Popular", emphasis: "popular" };
    if (index === scaleIndex) return { value, label: "Scale", emphasis: "scale" };
    return { value, label: null, emphasis: "standard" };
  });
}
