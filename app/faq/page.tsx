import FaqPageContent from "@/components/marketing/FaqPageContent";
import type { FaqCategory } from "@/components/marketing/FaqPageContent";
import PublicShell from "@/components/marketing/PublicShell";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Social Media Growth Services FAQ",
  description:
    "Find answers about SocialRUSH service pricing, delivery, refill support, wallet payments, order tracking and social media growth services in India.",
  path: "/faq",
  keywords: ["social media growth FAQ", "SocialRUSH service support"],
});

const faqCategories: FaqCategory[] = [
  {
    key: "general",
    label: "General",
    items: [
      {
        question: "What is SocialRUSH?",
        answer:
          "SocialRUSH is a growth platform that helps businesses run social media campaigns, manage services from one dashboard, and keep ordering, payment, and support in one place.",
      },
      {
        question: "Who can use SocialRUSH?",
        answer:
          "Creators, startups, agencies, local businesses, ecommerce brands, and marketing teams can use SocialRUSH to improve social visibility and manage growth operations efficiently.",
      },
      {
        question: "Is SocialRUSH suitable for small businesses?",
        answer:
          "Yes. SocialRUSH is built for both small and large teams, with flexible service options, transparent pricing, and support guidance so smaller businesses can scale at their own pace.",
      },
      {
        question: "Is SocialRUSH safe?",
        answer:
          "SocialRUSH uses public-link ordering, secure wallet payments, visible order tracking, and clearly stated delivery and refill terms. You never need to share a social media password.",
      },
    ],
  },
  {
    key: "services",
    label: "Services",
    items: [
      {
        question: "What services do you provide?",
        answer:
          "SocialRUSH provides trackable social media growth services for Instagram, YouTube, Facebook, LinkedIn, TikTok, Telegram, and Twitter/X. Current availability, pricing, delivery estimates, and refill terms are shown before checkout.",
      },
      {
        question: "Do you need my password?",
        answer:
          "No. SocialRUSH uses public-link ordering. You submit only the public profile, post, reel, video, page, channel, or group required for the selected service.",
      },
      {
        question: "Which link should I submit?",
        answer:
          "Use the exact destination requested on the order page: a profile or channel for follower, subscriber, or member services, and the specific post, reel, or video for engagement and view services. Keep it public during delivery.",
      },
    ],
  },
  {
    key: "pricing",
    label: "Pricing",
    items: [
      {
        question: "Do you have fixed pricing?",
        answer:
          "Every active service displays a current rate. Entering a valid quantity calculates the exact campaign total before confirmation, so you can review the charge before your wallet is used.",
      },
      {
        question: "Are there hidden campaign charges?",
        answer:
          "No hidden campaign charge is added after confirmation. Review the service rate, quantity, total, wallet balance, delivery estimate, and refill information before placing the order.",
      },
      {
        question: "Where can I compare the latest prices?",
        answer:
          "Use the Pricing page for public starting rates and the Packages or New Order flow for the latest confirmed availability and exact total.",
      },
    ],
  },
  {
    key: "payments",
    label: "Payments",
    items: [
      {
        question: "How do payments work?",
        answer:
          "We support secure online payment options via integrated gateways including UPI, cards, net banking, and other supported digital payment modes.",
      },
      {
        question: "Is online payment secure?",
        answer:
          "Yes. Payments are processed through secure channels with industry-standard safeguards, and wallet transactions are reflected in your account for transparency.",
      },
      {
        question: "Can I add funds to my wallet?",
        answer:
          "Yes. You can add funds to your wallet and use that balance for faster checkout on campaigns and services whenever you place new orders.",
      },
    ],
  },
  {
    key: "delivery",
    label: "Delivery",
    items: [
      {
        question: "How does delivery work?",
        answer:
          "Delivery timelines depend on service type, order size, and platform dynamics. Estimated windows are visible during ordering and progress can be tracked from your account.",
      },
      {
        question: "Can I track my order?",
        answer:
          "You can track order status directly in your dashboard, including processing stage, updates, and completion details for each campaign request.",
      },
      {
        question: "What if my order is delayed?",
        answer:
          "If delivery exceeds the expected window, our support team reviews the campaign status and provides the next action, update timeline, or suitable resolution.",
      },
      {
        question: "What is refill support?",
        answer:
          "Eligible services include refill coverage for the period shown before checkout. If a qualifying delivery drops during that period, contact support with the order ID for review.",
      },
    ],
  },
  {
    key: "support",
    label: "Support",
    items: [
      {
        question: "How can I contact support?",
        answer:
          "You can contact support via the support page, dashboard support section, or direct contact channels listed on SocialRUSH for quick assistance.",
      },
      {
        question: "Do you provide support after service delivery?",
        answer:
          "Yes. Post-delivery support is available to help with campaign follow-up, clarifications, and recommendations for your next growth steps.",
      },
      {
        question: "Can I request changes after placing an order?",
        answer:
          "Depending on order stage and service type, modifications may be possible. Contact support promptly with your order details to check available change options.",
      },
      {
        question: "Do you provide refunds?",
        answer:
          "Refund eligibility depends on the service status and the published refund policy. Approved refunds are returned through the applicable wallet or payment process after review.",
      },
      {
        question: "Can I contact support before ordering?",
        answer:
          "Yes. You can contact SocialRUSH through the contact page or WhatsApp before ordering if you need help choosing a service or confirming link requirements.",
      },
    ],
  },
];

export default function FaqPage() {
  const allFaqs = faqCategories.flatMap((category) => category.items);
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allFaqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <PublicShell tone="light3d">
      <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "FAQ", path: "/faq" }]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <FaqPageContent categories={faqCategories} />
    </PublicShell>
  );
}
