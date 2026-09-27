export function deliveryRefillIntentKeywords(serviceName: string) {
  const normalized = serviceName.trim();
  return [
    `${normalized} delivery time India`,
    `how long does ${normalized} delivery take`,
    `${normalized} refill India`,
    `${normalized} refill policy`,
  ];
}

export function buildDeliveryRefillIntentCopy({
  serviceName,
  deliveryTime,
  refillPolicy,
}: {
  serviceName: string;
  deliveryTime: string;
  refillPolicy: string;
}) {
  return {
    heading: `${serviceName} delivery time and refill support in India`,
    delivery:
      `The current catalog estimate is ${deliveryTime}. This is an estimate, not a guaranteed completion time; actual timing can vary with quantity, destination availability, platform conditions and service load.`,
    refill:
      `The current catalog lists ${refillPolicy}. Refill or support eligibility applies only where it is shown for the selected service and order.`,
  };
}
