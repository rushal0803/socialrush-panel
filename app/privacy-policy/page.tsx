import PolicyPage from "@/components/marketing/PolicyPage";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Privacy Policy",
  description:
    "Read the SocialRUSH Privacy Policy covering account information, campaign links, wallet transactions, payments, support records and data security in India.",
  path: "/privacy-policy",
});

const sections = [
  { title: "Scope", body: ["This Privacy Policy explains how SocialRUSH collects, uses, stores, and shares personal information when you visit our website, create an account, fund a wallet, place a campaign, or contact support."] },
  { title: "Information we collect", body: ["We collect information you provide and limited technical information generated when you use the platform."], bullets: ["Name, email address, profile information, and enquiry details.", "Account, wallet, transaction, order, and support records.", "Public profile, page, post, channel, or video links submitted for campaign delivery.", "Device, browser, IP address, access time, and security logs."] },
  { title: "How we use information", body: ["We use information to operate accounts, verify payments, credit wallets, process campaigns, display order status, provide support, prevent abuse, improve security, and meet legal obligations.", "We may use aggregated or de-identified information to understand platform performance and improve the customer experience."] },
  { title: "Payments and service providers", body: ["Payments may be processed by third-party providers such as Razorpay. SocialRUSH does not store complete card details. Payment providers process information under their own privacy and security terms.", "We may use vetted hosting, database, email, analytics, and campaign fulfilment providers where reasonably necessary to operate SocialRUSH."] },
  { title: "Campaign data", body: ["Campaign links and order details are used for delivery, tracking, troubleshooting, refill review, and support. Customers must have lawful authority to submit the public destinations they provide."] },
  { title: "Data sharing", body: ["We do not sell personal information. Information may be shared with authorized personnel, infrastructure and fulfilment providers, advisers, payment providers, or authorities where necessary for service delivery, security, legal compliance, or protection of rights."] },
  { title: "Retention and security", body: ["We retain information for service delivery, accounting, dispute management, fraud prevention, and legal requirements. We use reasonable administrative and technical safeguards, but no online system can be guaranteed completely secure."] },
  { title: "Your choices", body: ["You may request access, correction, or deletion of eligible personal information by emailing support@socialrush.in. Certain transaction, security, or legal records may need to be retained."] },
  { title: "Updates and contact", body: ["We may update this policy as our platform or legal obligations change. Privacy questions may be sent to support@socialrush.in."] },
];

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage
      title="Privacy Policy"
      subtitle="How SocialRUSH handles account, campaign, support, transaction, and technical information."
      badge="SocialRUSH policy center"
      breadcrumbLabel="Privacy Policy"
      tone="light3d"
      sections={sections}
    />
  );
}
