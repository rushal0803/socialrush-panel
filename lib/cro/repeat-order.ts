import type { SmmService } from "@/lib/smm-service-catalog";

export type RepeatOrderInput = {
  serviceName: string;
  platform: string;
  quantity: number;
  link: string;
};

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function normalizePlatform(value: string) {
  const normalized = normalize(value);
  return normalized === "twitter" || normalized === "twitter-x" || normalized === "x-twitter" ? "x" : normalized;
}

export function resolveRepeatOrderService(input: Pick<RepeatOrderInput, "serviceName" | "platform">, services: readonly SmmService[]) {
  const serviceName = normalize(input.serviceName);
  const platform = normalizePlatform(input.platform);

  const exact = services.find((service) =>
    normalize(service.name) === serviceName &&
    normalizePlatform(service.platform) === platform,
  );
  if (exact) return exact;

  const samePlatform = services.filter((service) => normalizePlatform(service.platform) === platform);
  return samePlatform.find((service) => {
    const code = normalize(service.code);
    const type = code.split("-").pop() || "";
    return serviceName === code || serviceName.endsWith(`-${type}`) || serviceName.includes(type);
  }) ?? null;
}

export function buildRepeatOrderHref(input: RepeatOrderInput, services: readonly SmmService[]) {
  if (!input.link.trim() || !Number.isInteger(input.quantity) || input.quantity <= 0) return null;
  const service = resolveRepeatOrderService(input, services);
  if (!service) return null;

  return `/dashboard/new-order?${new URLSearchParams({
    platform: service.platform,
    service: service.code,
    quantity: String(input.quantity),
    link: input.link.trim(),
    resume: "1",
  })}`;
}
