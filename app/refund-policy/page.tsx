import RefundPolicyView from "@/components/marketing/RefundPolicyPage";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Refund Policy",
  description:
    "Review the SocialRUSH Refund Policy for wallet payments, duplicate charges, cancelled campaigns, partial delivery, refill coverage and approved refunds.",
  path: "/refund-policy",
});

const sections = [
  { title: "Policy overview", body: ["This policy applies to SocialRUSH wallet payments and social media growth campaign orders. Eligibility depends on payment status, campaign status, delivery already completed, refill terms, and the circumstances of the request."] },
  { title: "Wallet funding and payment errors", body: ["Verified duplicate charges, failed credits, or confirmed technical payment errors will be investigated. Where appropriate, an approved amount may be credited to the SocialRUSH wallet or returned to the original payment method."] },
  { title: "Campaigns not yet started", body: ["A campaign that has not begun processing may be eligible for cancellation or wallet credit at our discretion. Processing can begin quickly, so cancellation cannot be guaranteed after an order is confirmed."] },
  { title: "Processing or completed campaigns", body: ["Orders that are processing, partially delivered, or completed are generally not refundable for the delivered portion. If a service becomes unavailable, SocialRUSH may cancel the remaining portion and issue an appropriate wallet credit."] },
  { title: "Refill-backed services", body: ["Eligible services may include refill support for the period displayed at checkout. Refill support is not a cash refund and applies only when the order meets the stated eligibility requirements."] },
  { title: "Incorrect links and customer errors", body: ["Customers must review the selected service, quantity, and public destination link before checkout. Campaigns sent to an incorrect but valid link may be non-refundable once processing begins."] },
  { title: "How to request review", body: ["Open a support ticket or email support@socialrush.in with the account email, payment or order ID, reason, and relevant evidence. Prompt requests are easier to investigate."] },
  { title: "Approved refunds", body: ["Approved payment refunds are normally returned to the original payment method. Bank and payment-provider processing times are outside SocialRUSH control. Approved wallet credits appear in account transactions."] },
  { title: "Disputes", body: ["Please contact support before initiating a payment dispute so we can investigate. Fraudulent or abusive disputes may result in account restrictions and submission of relevant transaction and delivery records to the payment provider."] },
];

export default function RefundPolicyRoute() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "Refund Policy", path: "/refund-policy" }]} />
      <RefundPolicyView
        title="Refund Policy"
        subtitle="Review how refunds, wallet credits, cancellations, and payment issues are handled on SocialRUSH."
        badge="Refund Policy"
        breadcrumbLabel="Refund Policy"
        sections={sections}
      />
    </>
  );
}
