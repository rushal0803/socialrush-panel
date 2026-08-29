import type { Metadata } from "next";
import { notFound } from "next/navigation";
import IndiaServiceLandingPage from "@/components/marketing/services/IndiaServiceLandingPage";
import InstagramLikesPage from "@/app/(india-seo-services)/buy-instagram-likes-india/page";
import InstagramViewsPage from "@/app/(india-seo-services)/buy-instagram-views-india/page";
import YouTubeLikesPage from "@/app/(india-seo-services)/buy-youtube-likes-india/page";
import YouTubeSubscribersLanding from "@/components/marketing/YouTubeSubscribersLanding";
import YouTubeViewsLanding from "@/components/marketing/YouTubeViewsLanding";
import FacebookFollowersLanding from "@/components/marketing/FacebookFollowersLanding";
import FacebookViewsLanding from "@/components/marketing/FacebookViewsLanding";
import FacebookLikesLanding from "@/components/marketing/FacebookLikesLanding";
import LinkedInFollowersLanding from "@/components/marketing/LinkedInFollowersLanding";
import LinkedInLikesLanding from "@/components/marketing/LinkedInLikesLanding";
import TikTokFollowersLanding from "@/components/marketing/TikTokFollowersLanding";
import TwitterFollowersLanding from "@/components/marketing/TwitterFollowersLanding";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { linkedInFollowersFaqs } from "@/lib/seo/linkedin-followers";
import { tiktokFollowersFaqs } from "@/lib/seo/tiktok-followers";
import { getServiceById } from "@/lib/smm-service-catalog";
import {
  canonicalIndiaServicePaths,
  getIndiaServiceFaqs,
  getIndiaServiceMetadata,
  type IndiaServiceSlug,
} from "@/lib/seo/india-service-pages";

const serviceRoutes = Object.fromEntries(
  Object.entries(canonicalIndiaServicePaths)
    // This URL has a dedicated route with its own metadata and order panel.
    // Keeping it out of the catch-all prevents a second route implementation
    // from being generated for the same crawlable URL.
    .filter(([slug]) => slug !== "buy-instagram-followers-india")
    .map(([slug, path]) => [path.slice(1), slug as IndiaServiceSlug]),
) as Record<string, IndiaServiceSlug>;

export function generateStaticParams() {
  return Object.keys(serviceRoutes).map((service) => ({ service }));
}

export function generateMetadata({
  params,
}: {
  params: { service: string };
}): Metadata {
  const slug = serviceRoutes[params.service];
  if (!slug) return {};
  return getIndiaServiceMetadata(slug, `/${params.service}`);
}

export default function CanonicalServicePage({
  params,
}: {
  params: { service: string };
}) {
  const slug = serviceRoutes[params.service];
  if (!slug) notFound();

  // Instagram Likes has a purpose-built conversion page. Its order builder reads
  // the exact `instagram-likes` catalog entry used by Services and New Order.
  if (slug === "buy-instagram-likes-india") return <InstagramLikesPage />;
  if (slug === "buy-instagram-views-india") return <InstagramViewsPage />;
  // The canonical route is /youtube-likes; reuse the dedicated visual
  // experience instead of the generic India template.
  if (slug === "buy-youtube-likes-india") return <YouTubeLikesPage />;
  // The canonical route is /youtube-subscribers; this is the only crawlable
  // commercial subscriber page. The legacy keyword URL permanently redirects.
  if (slug === "buy-youtube-subscribers-india") {
    const service = getServiceById("youtube-subscribers");
    const faqs = [
      ["How can I buy YouTube subscribers in India?", "Choose a subscriber package, provide the required public YouTube channel link, review the live INR total, and continue through the SocialRUSH order flow."],
      ["How much do YouTube subscribers cost in India?", "Pricing varies by selected quantity and the active service option. The package selector displays the current catalog rate and your exact total before checkout."],
      ["Do I need to provide my YouTube password?", "No. Only your public YouTube channel link is required. SocialRUSH never needs your Google login or channel credentials."],
      ["Which YouTube channel link should I submit?", "Use a public youtube.com/@handle, /channel/, /c/, or /user/ channel URL supported by the order form."],
      ["How long does delivery take?", `The active service estimate is ${service?.deliveryTime ?? "shown before checkout"}. Timing can vary by order size and channel availability.`],
      ["Is refill/support available?", `The current catalog lists ${service?.refillPolicy ?? "the service terms"}. Check the order summary for the applicable detail.`],
      ["Can I track my order?", "Yes. Continue through the secure SocialRUSH flow and track your order from the dashboard."],
      ["Can this guarantee YouTube monetization?", "No. Subscriber services do not guarantee monetization approval, watch hours, revenue, ranking, or YouTube Partner Program eligibility."],
      ["Is it safe to buy YouTube subscribers?", "Any third-party growth service has platform and retention considerations. SocialRUSH reduces account-access risk by requiring only a public channel link and showing the current service terms before checkout. Never share your YouTube or Google password."],
      ["What should I compare before choosing a YouTube subscriber package?", "Compare the quantity, exact INR total, current delivery estimate, refill or support terms, and the channel URL you plan to submit. Review all of these together before payment."],
      ["What if I submit the wrong channel link?", "Verify the public channel link carefully before payment. Contact support from your dashboard if you need help with an order."],
    ];
    const schema = JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) }).replace(/</g, "\\u003c");
    return <><BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "YouTube Services", path: "/services?platform=youtube" }, { name: "YouTube Subscribers", path: "/youtube-subscribers" }]} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} /><YouTubeSubscribersLanding /></>;
  }
  if (slug === "buy-youtube-views-india") return <YouTubeViewsLanding />;
  if (slug === "buy-facebook-followers-india") return <FacebookFollowersLanding />;
  if (slug === "buy-facebook-views-india") return <FacebookViewsLanding />;
  if (slug === "buy-facebook-likes-india") return <FacebookLikesLanding />;
  if (slug === "buy-linkedin-followers-india") {
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: linkedInFollowersFaqs.map(({ question, answer }) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    };
    return <><BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "LinkedIn Services", path: "/services" }, { name: "LinkedIn Followers", path: "/linkedin-followers" }]} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }} /><LinkedInFollowersLanding /></>;
  }
  if (slug === "buy-linkedin-likes-india") return <LinkedInLikesLanding />;
  if (slug === "buy-tiktok-followers-india") {
    const schema = JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: tiktokFollowersFaqs.map(({ question, answer }) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) }).replace(/</g, "\\u003c");
    return <><BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "TikTok Services", path: "/services?platform=tiktok" }, { name: "TikTok Followers", path: "/tiktok-followers" }]} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} /><TikTokFollowersLanding /></>;
  }
  if (slug === "buy-twitter-followers-india") {
    const faqs = getIndiaServiceFaqs(slug);
    const schema = JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(({ question, answer }) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) }).replace(/</g, "\\u003c");
    return <><BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "X / Twitter Services", path: "/services?platform=twitter" }, { name: "X / Twitter Followers", path: "/twitter-followers" }]} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} /><TwitterFollowersLanding /></>;
  }

  return (
    <IndiaServiceLandingPage
      slug={slug}
      canonicalPath={`/${params.service}`}
    />
  );
}
