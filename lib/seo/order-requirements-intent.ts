export function orderRequirementIntentKeywords(serviceName: string) {
  const name = serviceName.trim();
  return [
    `${name} minimum order India`,
    `minimum ${name} order`,
    `${name} quantity limit India`,
    `how many ${name} can I buy`,
    `public link required for ${name}`,
  ];
}

export function buildOrderRequirementCopy({
  serviceName,
  minQuantity,
  maxQuantity,
  quantityStep = 1,
  destination,
}: {
  serviceName: string;
  minQuantity: number;
  maxQuantity: number;
  quantityStep?: number;
  destination: string;
}) {
  const validLimits = Number.isFinite(minQuantity) && minQuantity > 0 && Number.isFinite(maxQuantity) && maxQuantity >= minQuantity;
  return {
    heading: `${serviceName} minimum order and quantity limits in India`,
    validLimits,
    minQuantity: validLimits ? Math.floor(minQuantity) : null,
    maxQuantity: validLimits ? Math.floor(maxQuantity) : null,
    quantityStep: validLimits ? Math.max(1, Math.floor(quantityStep || 1)) : null,
    destination,
  };
}
