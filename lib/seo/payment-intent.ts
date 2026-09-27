export const indiaCheckoutMethods = [
  { id: "upi", label: "UPI", detail: "All UPI apps supported by the checkout flow" },
  { id: "bank_transfer", label: "Bank Transfer", detail: "IMPS, NEFT or bank-app transfer" },
  { id: "usdt_trc20", label: "USDT (TRC20)", detail: "Crypto option when a live INR-to-USDT amount is available" },
] as const;

export function paymentIntentKeywords(serviceName: string) {
  const normalized = serviceName.trim();
  return [
    `buy ${normalized} with UPI India`,
    `${normalized} UPI payment India`,
    `${normalized} price INR`,
    `buy ${normalized} without password`,
  ];
}

export function paymentIntentFaq(serviceName: string) {
  return {
    question: `Can I pay for ${serviceName} with UPI in India?`,
    answer:
      "Yes. The SocialRUSH direct checkout includes UPI as a payment option. Review the exact INR amount, complete payment from your UPI app, and submit the transaction reference for verification. Bank Transfer and USDT (TRC20) may also be available in the same checkout. Final payment options shown at checkout are authoritative.",
  };
}
