import type { SmmService } from "../smm-service-catalog";

export const fastDeliveryIndiaKeywords = [
  "fast SMM panel India",
  "instant SMM panel India",
  "SMM panel instant delivery India",
  "fast delivery social media services India",
] as const;

export const fastDeliveryDecisionPoints = [
  {
    id: "estimate",
    title: "Read the service-specific estimate",
    copy: "Delivery speed varies by service, platform and quantity. Use the current delivery estimate shown for the exact service you plan to order.",
  },
  {
    id: "start-vs-finish",
    title: "Separate start time from completion",
    copy: "A fast start does not mean the full quantity completes instantly. The active order status is the best place to follow progress after checkout.",
  },
  {
    id: "quantity",
    title: "Expect larger orders to take longer",
    copy: "Campaign size can affect completion time, so compare quantity limits and delivery guidance before placing a larger order.",
  },
  {
    id: "stability",
    title: "Keep the destination stable",
    copy: "Keep the required public profile, post, video, page, channel or group available while delivery is active and avoid changing its URL or handle.",
  },
] as const;

export type DeliverySpeedExample = Readonly<{
  code: string;
  name: string;
  platform: SmmService["platform"];
  deliveryTime: string;
}>;

export function selectDeliverySpeedExamples(services: readonly SmmService[], limit = 4): DeliverySpeedExample[] {
  const seenPlatforms = new Set<SmmService["platform"]>();
  const examples: DeliverySpeedExample[] = [];

  for (const service of services) {
    const deliveryTime = String(service.deliveryTime || "").trim();
    if (!deliveryTime || seenPlatforms.has(service.platform)) continue;

    seenPlatforms.add(service.platform);
    examples.push({
      code: service.code,
      name: service.name,
      platform: service.platform,
      deliveryTime,
    });

    if (examples.length >= Math.max(0, limit)) break;
  }

  return examples;
}
