import type { SmmService } from "@/lib/smm-service-catalog";

export type ServicePageCroMode = "inline-builder" | "live-dashboard";

export type ServicePageCroConfig = {
  mode: ServicePageCroMode;
  primaryHref: string;
  primaryLabel: string;
  canShowStaticPrice: boolean;
};

export function getServicePageCroConfig(service: SmmService): ServicePageCroConfig {
  const requiresLiveOrder =
    Boolean(service.requiresLiveCatalogFacts) ||
    !Number.isFinite(service.pricePer1000) ||
    service.pricePer1000 <= 0 ||
    !Number.isFinite(service.minQuantity) ||
    !Number.isFinite(service.maxQuantity) ||
    service.minQuantity <= 0 ||
    service.maxQuantity < service.minQuantity;

  if (requiresLiveOrder) {
    return {
      mode: "live-dashboard",
      primaryHref: `/dashboard/new-order?${new URLSearchParams({
        platform: service.platform,
        service: service.code,
      })}`,
      primaryLabel: "Open Live Order Builder",
      canShowStaticPrice: false,
    };
  }

  return {
    mode: "inline-builder",
    primaryHref: "#order-builder",
    primaryLabel: "Build Your Order",
    canShowStaticPrice: true,
  };
}
