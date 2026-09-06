/** Customer-facing statements for shared trust surfaces. */
export const customerGuidance = {
  publicLink: "For applicable services, provide the requested public destination link. Never share a social-media password, OTP, or recovery code.",
  ordering: "Review the selected service, quantity, price, delivery estimate, and refill details before checkout.",
  payment: "Use the official SocialRUSH checkout or Add Funds flow. Check payment and wallet status in your account.",
  tracking: "Track the current order status from your SocialRUSH dashboard.",
  support: "For help, use official SocialRUSH support and include the Order ID when relevant.",
  refill: "Refill applies only where the active service or package states that it is eligible.",
} as const;

export const customerGuidanceLinks = [["FAQ", "/faq"], ["Customer Safety", "/trust"], ["Contact Support", "/contact"], ["Refund Policy", "/refund-policy"]] as const;
