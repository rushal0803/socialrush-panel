import type { Metadata } from "next";
import FaqPageContent from "@/components/marketing/FaqPageContent";
import type { FaqCategory } from "@/components/marketing/FaqPageContent";
import PublicShell from "@/components/marketing/PublicShell";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Everything you need to know about SocialRUSH services, pricing, payments, delivery, and support.",
  alternates: { canonical: "/faq" },
};

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
    ],
  },
  {
    key: "services",
    label: "Services",
    items: [
      {
        question: "What services do you provide?",
        answer:
          "We provide social media growth services, paid ad support, chatbot workflows, automation setup, and performance-focused campaign assistance for modern digital businesses.",
      },
      {
        question: "Do you offer AI chatbots and WhatsApp automation?",
        answer:
          "Yes. We offer AI chatbot implementation and WhatsApp automation solutions to help businesses capture leads, respond faster, and improve customer communication flows.",
      },
      {
        question: "Do you provide SEO, social media marketing, Meta Ads, and Google Ads?",
        answer:
          "Yes. SocialRUSH supports SEO-focused growth planning, social media marketing, Meta Ads management, and Google Ads strategy depending on your business objectives.",
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
          "Many services have clear baseline pricing for easier decision-making, while advanced or large-scale requirements may vary based on campaign scope and platform needs.",
      },
      {
        question: "Can I get a custom package?",
        answer:
          "Absolutely. We can create custom packages based on your goals, timeline, target platform, and budget to ensure the plan fits your exact growth strategy.",
      },
      {
        question: "Do you offer monthly plans?",
        answer:
          "Yes. Monthly and ongoing plans are available for businesses that need continuous growth support, recurring optimization, and long-term campaign consistency.",
      },
    ],
  },
  {
    key: "payments",
    label: "Payments",
    items: [
      {
        question: "Which payment methods do you accept?",
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
        question: "How long does service delivery take?",
        answer:
          "Delivery timelines depend on service type, order size, and platform dynamics. Estimated windows are visible during ordering and progress can be tracked from your account.",
      },
      {
        question: "How can I track my order?",
        answer:
          "You can track order status directly in your dashboard, including processing stage, updates, and completion details for each campaign request.",
      },
      {
        question: "What happens if my order is delayed?",
        answer:
          "If delivery exceeds the expected window, our support team reviews the campaign status and provides the next action, update timeline, or suitable resolution.",
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <FaqPageContent categories={faqCategories} />
    </PublicShell>
  );
}
