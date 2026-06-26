import type { Metadata } from "next";
import PolicyPage from "@/components/marketing/PolicyPage";

export const metadata: Metadata = { title: "Terms & Conditions", description: "Terms governing SocialRUSH accounts, wallet funding, campaign orders, delivery, refills, billing, and support." };

const sections = [
  { title: "Acceptance of terms", body: ["By accessing SocialRUSH, creating an account, funding a wallet, or placing a campaign, you agree to these Terms & Conditions and the service details shown before checkout."] },
  { title: "Services", body: ["SocialRUSH provides social media growth services for supported public profiles, pages, channels, posts, and videos across Instagram, YouTube, Facebook, LinkedIn, TikTok, and Twitter/X.", "Availability, rates, quantities, delivery estimates, refill eligibility, and campaign requirements are displayed in the catalog or checkout before an order is confirmed."] },
  { title: "Accounts and customer responsibilities", body: ["You must provide accurate information, protect your credentials, and have lawful authority to submit each public destination."], bullets: ["Do not use services for unlawful, deceptive, infringing, abusive, or unauthorized activity.", "Do not share your social media password with SocialRUSH or submit links you are not authorized to promote.", "Review the selected service, quantity, link, rate, and total before checkout."] },
  { title: "Campaign processing", body: ["Processing may begin soon after checkout. Delivery timing is an estimate and can be affected by platform changes, service availability, destination settings, quantity, and external conditions.", "SocialRUSH does not guarantee revenue, platform ranking, organic engagement, or a specific commercial result."] },
  { title: "Wallet, billing, and transactions", body: ["Verified payments credit the applicable account wallet. Campaign charges are deducted when an order is placed. Transaction and order records remain available in the customer dashboard.", "Customers must report suspected duplicate charges or missing credits promptly through support."] },
  { title: "Refill support", body: ["Only services marked refill eligible receive coverage, and only during the displayed period. Eligibility can depend on the destination remaining public and the customer not changing identifiers or using conflicting services."] },
  { title: "Cancellations and refunds", body: ["Cancellation and refund eligibility follows the Refund Policy. Campaigns already processing or delivered may not be refundable, except for an approved undelivered portion or verified payment error."] },
  { title: "Platform availability", body: ["Social networks and fulfilment systems are operated by third parties. SocialRUSH may pause, replace, or discontinue a service when delivery conditions or platform rules change."] },
  { title: "Support and communication", body: ["Customers can use protected support tickets for order, payment, refill, or account issues. Communications must remain accurate and professional so requests can be investigated effectively."] },
  { title: "Liability", body: ["To the extent permitted by law, SocialRUSH is not liable for indirect or consequential loss, third-party platform actions, account changes, external outages, or issues caused by incorrect customer instructions. Aggregate liability is limited to the amount paid for the affected service."] },
  { title: "Changes and contact", body: ["We may update these terms prospectively as the platform changes. Questions or formal notices may be sent to support@socialrush.in."] },
];

export default function TermsPage() {
  return (
    <PolicyPage
      title="Terms & Conditions"
      subtitle="The operating terms for SocialRUSH accounts, wallets, campaigns, delivery, refills, billing, and support."
      badge="SocialRUSH policy center"
      breadcrumbLabel="Terms & Conditions"
      tone="light3d"
      sections={sections}
    />
  );
}
