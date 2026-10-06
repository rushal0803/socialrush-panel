export function checkoutQuantityOptions(
  minQuantity: number,
  maxQuantity: number,
  presets: readonly number[] = [1000, 5000, 10000],
) {
  const min = Math.max(1, Math.trunc(minQuantity));
  const max = Math.max(min, Math.trunc(maxQuantity));
  const options = new Set<number>([min]);

  for (const preset of presets) {
    if (preset >= min && preset <= max) options.add(preset);
  }

  if (options.size === 1 && max !== min) options.add(max);
  return [...options].sort((a, b) => a - b);
}

export function clampCheckoutQuantity(
  quantity: number,
  minQuantity: number,
  maxQuantity: number,
) {
  const min = Math.max(1, Math.trunc(minQuantity));
  const max = Math.max(min, Math.trunc(maxQuantity));
  if (!Number.isFinite(quantity)) return min;
  return Math.min(max, Math.max(min, Math.trunc(quantity)));
}

export function checkoutFundingMessage({
  walletApplied,
  payableNow,
}: {
  walletApplied: number;
  payableNow: number;
}) {
  if (walletApplied > 0) {
    return {
      eyebrow: "Wallet + payment split",
      title: "Your wallet is used first",
      detail:
        "The wallet amount shown here is the amount checkout expects to apply when you submit your payment reference. Pay only the remaining amount shown below.",
    };
  }

  return {
    eyebrow: "Direct payment",
    title: "Pay only the checkout amount",
    detail:
      "No wallet balance is being applied to this checkout. Use one payment method below and submit its transaction reference once.",
  };
}
