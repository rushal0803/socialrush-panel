import type { SmmService } from "@/lib/smm-service-catalog";
import type { ServiceHealth } from "@/lib/service-health";

/**
 * Returns only an active service with the same platform and fulfilment intent.
 * The final segment of the catalog code is deliberately used as the intent
 * discriminator: followers cannot be substituted with views, for example.
 */
export function findSafeAlternative(
  selected: SmmService,
  catalog: SmmService[],
  health: Record<string, ServiceHealth>,
): SmmService | null {
  const intent = selected.code.split("-").at(-1);
  if (!intent) return null;

  return catalog.find((candidate) => {
    const candidateHealth = health[candidate.code];
    return candidate.code !== selected.code &&
      candidate.platform === selected.platform &&
      candidate.code.split("-").at(-1) === intent &&
      candidate.isActive &&
      candidateHealth?.acceptsNewOrders !== false &&
      candidateHealth?.status !== "paused" &&
      candidateHealth?.status !== "maintenance";
  }) ?? null;
}
