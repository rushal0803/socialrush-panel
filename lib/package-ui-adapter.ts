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

export type PackagePurchaseFacts = Readonly<{
  packageId: string;
  serviceCode: string;
  quantity: number;
  totalPriceINR: number;
  fallbackPricePer1000INR: number;
  fallbackName: string;
  fallbackPlatform: SmmPlatformId;
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

const uiToPlatform = Object.fromEntries(
  Object.entries(platformToUi).map(([id, label]) => [label, id]),
) as Record<PackageUiPlatform, SmmPlatformId>;

function normalize(value: string | null | undefined) {
  return String(value ?? "").trim().toLowerCase().replace(/\s+/g, "-");
}

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

export function getPackageUiPlatformCount() {
  return new Set(getPackageUiGroups().map((group) => group.platform)).size;
}

export function getPackageUiServiceCount() {
  return getPackageUiGroups().length;
}

export function getPackageUiPlatformServices(platform: PackageUiPlatform) {
  return getPackageUiGroups().filter((group) => group.uiPlatform === platform);
}

export function getFirstPackageUiService(platform: PackageUiPlatform): PackageUiService | null {
  return getPackageUiPlatformServices(platform)[0]?.uiService ?? null;
}

export function getPackageUiServiceLabel(platform: PackageUiPlatform, service: PackageUiService) {
  const group = getPackageUiGroup(platform, service);
  if (!group) return service.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
  const platformPattern = /^(Instagram|YouTube|Facebook|LinkedIn|Telegram|TikTok|Twitter \/ X|X)\s+/i;
  return group.service.name.replace(platformPattern, "");
}

export function getPackageUiServiceDescription(platform: PackageUiPlatform, service: PackageUiService) {
  return getPackageUiGroup(platform, service)?.service.description
    ?? "Compare supported quantities, current pricing and service details.";
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

export function resolvePackageUiSelection(params: {
  platform?: string | null;
  service?: string | null;
  packageId?: string | null;
  quantity?: number | null;
}) {
  const platform = normalize(params.platform);
  const service = normalize(params.service);
  const packageId = String(params.packageId ?? "").trim();
  const quantity = Number(params.quantity ?? 0);

  return getPackageUiSelections().find((selection) => {
    const platformMatches = !platform || normalize(selection.platformId) === platform || normalize(selection.platform) === platform || (platform === "twitter" && selection.platformId === "x");
    const serviceMatches = !service || normalize(selection.service) === service || normalize(selection.serviceCode) === service || normalize(selection.serviceCode).endsWith(`-${service}`);
    const packageMatches = !packageId || selection.id === packageId;
    const quantityMatches = !quantity || selection.quantity === quantity;
    return platformMatches && serviceMatches && packageMatches && quantityMatches;
  }) ?? null;
}

export function getPackageUiGroup(platform: PackageUiPlatform, service: PackageUiService) {
  return getPackageUiGroups().find(
    (group) => group.uiPlatform === platform && group.uiService === service,
  ) ?? null;
}

export function getPackageUiServices(platform: PackageUiPlatform) {
  return getPackageUiPlatformServices(platform);
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

export function getPackageServiceUrl(platform: PackageUiPlatform, service?: PackageUiService) {
  const params = new URLSearchParams({ platform: uiToPlatform[platform] });
  if (service) {
    const group = getPackageUiGroup(platform, service);
    params.set("service", group?.service.code ?? service);
  }
  return `/packages?${params.toString()}`;
}

export function paiseToRupees(paise: number | null) {
  return paise === null ? null : paise / 100;
}

export function getPackagePurchaseFacts(selection: PackageUiSelection): PackagePurchaseFacts | null {
  if (selection.pricePaise === null || selection.pricePaise <= 0 || selection.quantity <= 0) return null;
  const totalPriceINR = paiseToRupees(selection.pricePaise);
  if (totalPriceINR === null) return null;
  const fallbackPricePer1000INR = Math.round((totalPriceINR / (selection.quantity / 1000)) * 10000) / 10000;
  return {
    packageId: selection.id,
    serviceCode: selection.serviceCode,
    quantity: selection.quantity,
    totalPriceINR,
    fallbackPricePer1000INR,
    fallbackName: `${selection.platform === "X" ? "X / Twitter" : selection.platform} ${selection.serviceName}`,
    fallbackPlatform: selection.platformId,
  };
}

export function getWalletPackageState(selection: PackageUiSelection | null, walletBalance: number | null) {
  const facts = selection ? getPackagePurchaseFacts(selection) : null;
  if (!facts || walletBalance === null) {
    return { hasEnoughBalance: false, amountNeeded: 0 } as const;
  }
  const amountNeeded = Math.max(0, Math.round((facts.totalPriceINR - walletBalance) * 100) / 100);
  return {
    hasEnoughBalance: walletBalance + 0.0001 >= facts.totalPriceINR,
    amountNeeded,
  } as const;
}
