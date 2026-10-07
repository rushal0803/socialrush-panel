import { activeSmmServices, platformMeta, type SmmPlatformId, type SmmService } from "./smm-service-catalog.ts";
import { calculateServiceTotalPaise, type ServiceCode } from "./service-pricing.ts";
import { PACKAGE_DISCOUNTS } from "./package-discounts.ts";

export type PackageTierId = "starter" | "growth" | "pro" | "scale";

export type PackageTier = Readonly<{
  id: PackageTierId;
  label: string;
  bestFor: string;
  quantity: number;
  regularPricePaise: number | null;
  pricePaise: number | null;
  savingsPaise: number;
  savingsPercent: number;
  pricePer1000Paise: number | null;
  recommended: boolean;
}>;

export type PackageServiceGroup = Readonly<{
  platform: SmmPlatformId;
  platformLabel: string;
  service: SmmService;
  tiers: readonly PackageTier[];
  pricingStatus: "catalog" | "live-required";
}>;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function snapQuantity(value: number, service: SmmService) {
  const min = service.minQuantity;
  const max = service.maxQuantity;
  const step = service.quantityStep ?? 1;
  if (min <= 0 || max <= 0 || max < min) return 0;
  const clamped = clamp(Math.round(value), min, max);
  return min + Math.floor((clamped - min) / step) * step;
}

function niceQuantity(value: number, service: SmmService) {
  const snapped = snapQuantity(value, service);
  if (!snapped) return 0;
  const magnitude = snapped >= 100000 ? 10000 : snapped >= 10000 ? 1000 : snapped >= 1000 ? 500 : snapped >= 100 ? 100 : 1;
  return snapQuantity(Math.max(service.minQuantity, Math.round(snapped / magnitude) * magnitude), service);
}

function tierQuantities(service: SmmService): number[] {
  if (service.pricePer1000 <= 0 || service.minQuantity <= 0 || service.maxQuantity <= 0) return [];
  const min = service.minQuantity;
  const max = service.maxQuantity;
  const candidates = [
    min,
    niceQuantity(min * Math.pow(Math.min(max / min, 500), 1 / 3), service),
    niceQuantity(min * Math.pow(Math.min(max / min, 500), 2 / 3), service),
    niceQuantity(Math.min(max, min * 500), service),
  ].filter((quantity) => quantity >= min && quantity <= max);
  return [...new Set(candidates)].slice(0, 4);
}

export function buildPackageTiers(service: SmmService, useLiveRate = false): readonly PackageTier[] {
  const quantities = tierQuantities(service);
  const recommendedIndex = quantities.length > 1 ? 1 : 0;
  return quantities.map((quantity, index) => {
    const regularPricePaise = useLiveRate ? Math.round(quantity * service.pricePer1000 * 100 / 1000) : calculateServiceTotalPaise(service.code as ServiceCode, quantity);
    const discountPercent = PACKAGE_DISCOUNTS[index].discountPercent;
    const pricePaise = Math.max(1, Math.round(regularPricePaise * (100 - discountPercent) / 100));
    const { savingsPaise, savingsPercent } = calculatePackageSavings(regularPricePaise, pricePaise);
    return {
      id: PACKAGE_DISCOUNTS[index].id,
      label: PACKAGE_DISCOUNTS[index].label,
      bestFor: PACKAGE_DISCOUNTS[index].bestFor,
      quantity,
      regularPricePaise,
      pricePaise,
      savingsPaise,
      savingsPercent,
      pricePer1000Paise: quantity > 0 ? Math.round((pricePaise * 1000) / quantity) : null,
      recommended: index === recommendedIndex,
    };
  });
}

export function getPackageServiceGroups(): readonly PackageServiceGroup[] {
  return activeSmmServices.map((service) => ({
    platform: service.platform,
    platformLabel: platformMeta[service.platform].label,
    service,
    tiers: buildPackageTiers(service),
    pricingStatus: service.requiresLiveCatalogFacts || service.pricePer1000 <= 0 ? "live-required" : "catalog",
  }));
}

export function getPackageGroup(serviceCode: ServiceCode) {
  return getPackageServiceGroups().find((group) => group.service.code === serviceCode) ?? null;
}

export function getPlatformPackageGroups(platform: SmmPlatformId) {
  return getPackageServiceGroups().filter((group) => group.platform === platform);
}

export function calculatePackageSavings(regularPricePaise: number, finalPricePaise: number) {
  if (regularPricePaise <= 0 || finalPricePaise <= 0 || finalPricePaise >= regularPricePaise) {
    return { savingsPaise: 0, savingsPercent: 0 } as const;
  }
  const savingsPaise = regularPricePaise - finalPricePaise;
  return { savingsPaise, savingsPercent: Math.round((savingsPaise / regularPricePaise) * 100) } as const;
}
