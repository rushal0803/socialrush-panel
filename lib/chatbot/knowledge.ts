export type KnowledgeEntry = { id: string; question: string; keywords: string[]; answer: string };

export const chatbotPolicies = {
  assistantName: "SocialRUSH Assistant",
  welcomeMessage: "Hi! I’m the SocialRUSH Assistant. I can guide you through campaigns, payments, delivery, refills, and account help.",
  accountDisclaimer: "I can help guide you, but for account-specific issues please open a support ticket.",
  escalationMessage: "Please create a support ticket and our team will assist you.",
};

export const chatbotKnowledge: KnowledgeEntry[] = [
  { id: "place-order", question: "How do I place an order?", keywords: ["place order", "create order", "new campaign", "order campaign", "buy service"], answer: "To place an order, log in to your SocialRUSH dashboard, open New Campaign, select your platform and service, paste your profile or content link, enter quantity, review the price, and click Proceed to Checkout." },
  { id: "delivery", question: "How long does delivery take?", keywords: ["delivery", "how long", "delivery time", "when complete", "start time"], answer: "Delivery time depends on the selected service and quantity. Most campaigns begin processing quickly and complete within the estimated delivery time shown on the order page." },
  { id: "add-funds", question: "How do I add funds?", keywords: ["add funds", "fund wallet", "wallet", "deposit", "top up"], answer: "Open Add Funds from your dashboard, choose a supported payment method, select or enter an amount, and continue through secure checkout. Your wallet updates automatically after payment verification." },
  { id: "refill", question: "What is refill support?", keywords: ["refill", "drop", "refill policy", "coverage"], answer: "Refill support means eligible services are covered during the refill period if a drop happens. You can contact support from your dashboard for assistance." },
  { id: "stuck-order", question: "My order is stuck, what should I do?", keywords: ["order stuck", "stuck", "pending too long", "processing too long", "not completed"], answer: "If your order status remains pending or processing longer than expected, open a support ticket with your order ID. Our team will review it and update you." },
  { id: "payment-failed", question: "Payment failed, what now?", keywords: ["payment failed", "money deducted", "payment issue", "wallet not credited", "transaction failed"], answer: "If payment failed but money was deducted, wait a few minutes and check your wallet. If the amount is not credited, create a support ticket with payment proof." },
  { id: "order-status", question: "How can I check my order status?", keywords: ["order status", "track order", "campaign status", "track campaign"], answer: "Open Campaign History from your dashboard to view the latest status, selected service, investment, and campaign updates." },
  { id: "login", question: "I have a login or signup issue", keywords: ["login", "sign in", "signup", "register", "password", "verification email", "account access"], answer: "Check that your email and password are correct. For password issues, use Forgot Password on the login page. New accounts may also need to confirm the verification email before signing in." },
  { id: "quality", question: "How is service quality managed?", keywords: ["quality", "safe service", "premium", "service good", "reliable"], answer: "Each service displays its quality level, delivery estimate, and refill status before checkout. Choose the option that best matches your campaign goals and review all details before submitting." },
  { id: "wrong-link", question: "I submitted the wrong link", keywords: ["wrong link", "incorrect link", "change link", "edit link"], answer: "Please open a support ticket immediately with your order ID and the correct link. Changes are not guaranteed after processing begins, so contact the team as quickly as possible." },
  { id: "support", question: "How can I contact support?", keywords: ["contact support", "support ticket", "talk to support", "human", "agent", "help team"], answer: "Open Support from your SocialRUSH dashboard and select Create Ticket. Include the relevant order or transaction ID and a clear description so the team can assist efficiently." },
];

export const quickQuestions = [
  "How do I place an order?", "How long does delivery take?", "How do I add funds?", "What is refill support?", "My order is stuck, what should I do?", "Payment failed, what now?", "How can I contact support?",
];

export function findChatbotAnswer(input: string) {
  const normalized = input.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  let best: { entry: KnowledgeEntry; score: number } | null = null;
  for (const entry of chatbotKnowledge) {
    const score = entry.keywords.reduce((total, keyword) => total + (normalized.includes(keyword) ? keyword.split(" ").length + 1 : 0), normalized === entry.question.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim() ? 10 : 0);
    if (score > 0 && (!best || score > best.score)) best = { entry, score };
  }
  return best?.entry.answer || `${chatbotPolicies.escalationMessage} ${chatbotPolicies.accountDisclaimer}`;
}
