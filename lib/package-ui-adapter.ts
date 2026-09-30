import {
  getPackageServiceGroups,
  type PackageServiceGroup,
  type PackageTier,
  type PackageTierId,
} from "./package-engine";
import type { SmmPlatformId } from "./smm-service-catalog";

export type PackageUiPlatform = "Instagram" | "YouTube" | "Facebook" | "LinkedIn" | "Telegram" | "TikTok" | "X";
export type PackageUiService = string;

export type PackageUiSelection = Readonly<{
  id: string;
  platform: PackageUiPlatform;
  platformId: SmmPlatformId;
  service: PackageUiService;
  serviceCode: string;
  serviceName: string;
  tierId: PackageTierId;
  tierLabel: string;
  bestFor: string;
  quantity: number;
  regularPricePaise: number | null;
  pricePaise: number | null;
  savingsPaise: number;
  savingsPercent: number;
  pricePer1000Paise: number | null;
  recommended: boolean;
}>;

const platformToUi: Record<SmmPlatformId, PackageUiPlatform> = {
  instagram: "Instagram",
  youtube: "YouTube",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  telegram: "Telegram",
  tiktok: "TikTok",
  x: "X",
};

function serviceKey(group: PackageServiceGroup): PackageUiService {
  const prefix = `${group.platform}-`;
  return group.service.code.startsWith(prefix)
    ? group.service.code.slice(prefix.length)
    : group.service.code;
}

export function packageSelectionId(serviceCode: string, tier: Pick<PackageTier, "id" | "quantity">) {
  return `${serviceCode}:${tier.id}:${tier.quantity}`;
}

export function adaptPackageTier(group: PackageServiceGroup, tier: PackageTier): PackageUiSelection {
  return {
    id: packageSelectionId(group.service.code, tier),
    platform: platformToUi[group.platform],
    platformId: group.platform,
    service: serviceKey(group),
    serviceCode: group.service.code,
    serviceName: group.service.name,
    tierId: tier.id,
    tierLabel: tier.label,
    bestFor: tier.bestFor,
    quantity: tier.quantity,
    regularPricePaise: tier.regularPricePaise,
    pricePaise: tier.pricePaise,
    savingsPaise: tier.savingsPaise,
    savingsPercent: tier.savingsPercent,
    pricePer1000Paise: tier.pricePer1000Paise,
    recommended: tier.recommended,
  };
}

export function getPackageUiGroups() {
  return getPackageServiceGroups().map((group) => ({
    ...group,
    uiPlatform: platformToUi[group.platform],
    uiService: serviceKey(group),
    packages: group.tiers.map((tier) => adaptPackageTier(group, tier)),
  }));
}

export function getPackageUiSelections(): readonly PackageUiSelection[] {
  return getPackageUiGroups().flatMap((group) => group.packages);
}

export function findPackageUiSelection(id: string | null | undefined) {
  if (!id) return null;
  return getPackageUiSelections().find((selection) => selection.id === id) ?? null;
}

export function findPackageUiSelectionByContext(
  platform: PackageUiPlatform,
  service: PackageUiService,
  id: string | null | undefined,
) {
  if (!id) return null;
  return getPackageUiSelections().find(
    (selection) =>
      selection.platform === platform &&
      selection.service === service &&
      selection.id === id,
  ) ?? null;
}

export function getPackageUiGroup(platform: PackageUiPlatform, service: PackageUiService) {
  return getPackageUiGroups().find(
    (group) => group.uiPlatform === platform && group.uiService === service,
  ) ?? null;
}

export function getPackageUiServices(platform: PackageUiPlatform) {
  return getPackageUiGroups().filter((group) => group.uiPlatform === platform);
}

export function getPackageUiStartingPricePaise(platform: PackageUiPlatform, service: PackageUiService) {
  const prices = getPackageUiGroup(platform, service)?.packages
    .map((selection) => selection.pricePaise)
    .filter((price): price is number => price !== null) ?? [];
  return prices.length ? Math.min(...prices) : null;
}

export function getPackageUiUrl(selection: PackageUiSelection) {
  const params = new URLSearchParams({
    platform: selection.platformId,
    service: selection.serviceCode,
    package: selection.id,
  });
  return `/packages?${params.toString()}`;
}

export function paiseToRupees(paise: number | null) {
  return paise === null ? null : paise / 100;
}
