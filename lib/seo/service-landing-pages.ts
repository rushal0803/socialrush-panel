import type { Metadata } from "next";
import { activeSmmServices, platformMeta, type SmmService } from "@/lib/smm-service-catalog";
import { createPageMetadata, SEO_SITE_URL } from "@/lib/seo/metadata";
import { SERVICE_PRICES } from "@/lib/service-pricing";

export type SeoServiceSlug =
  | "instagram-followers"
  | "instagram-likes"
  | "instagram-views"
  | "youtube-subscribers"
  | "youtube-likes"
  | "youtube-views"
  | "linkedin-followers"
  | "twitter-followers"
  | "facebook-followers"
  | "telegram-members";

type SeoServiceContent = {
  slug: SeoServiceSlug;
  serviceCode: SmmService["code"];
  keyword: string;
  displayName: string;
  intro: string;
  overview: string;
  destination: string;
  benefits: Array<{ title: string; description: string }>;
  related: SeoServiceSlug[];
};

export const seoServiceSlugs: SeoServiceSlug[] = [
  "instagram-followers",
  "instagram-likes",
  "instagram-views",
  "youtube-subscribers",
  "youtube-likes",
  "youtube-views",
  "linkedin-followers",
  "twitter-followers",
  "facebook-followers",
  "telegram-members",
];

const confirmedPublicPrices: Partial<Record<SeoServiceSlug, number>> = {
  "instagram-followers": SERVICE_PRICES["instagram-followers"],
  "linkedin-followers": SERVICE_PRICES["linkedin-followers"],
  "twitter-followers": SERVICE_PRICES["x-followers"],
};

const landingPages: Record<SeoServiceSlug, SeoServiceContent> = {
  "instagram-followers": {
    slug: "instagram-followers",
    serviceCode: "instagram-followers",
    keyword: "Buy Instagram Followers India",
    displayName: "Instagram Followers",
    intro:
      "Build a stronger first impression for your public Instagram profile with a clearly priced growth campaign, gradual delivery guidance and dashboard tracking.",
    overview:
      "SocialRUSH makes it simple for Indian creators, brands and businesses to select a follower campaign, submit a public profile link and monitor progress without sharing an account password.",
    destination: "public Instagram profile link",
    benefits: [
      { title: "Stronger profile presence", description: "Support a more established first impression for people discovering your profile." },
      { title: "Gradual delivery", description: "Campaign delivery follows the timing shown before you confirm the order." },
      { title: "Refill visibility", description: "Eligible refill coverage is clearly displayed with the service details." },
      { title: "Dashboard tracking", description: "Follow order status and keep campaign records in one account." },
    ],
    related: ["instagram-likes", "instagram-views", "youtube-subscribers"],
  },
  "instagram-likes": {
    slug: "instagram-likes",
    serviceCode: "instagram-likes",
    keyword: "Buy Instagram Likes India",
    displayName: "Instagram Likes",
    intro:
      "Support the visible engagement of a public Instagram post or reel through a straightforward campaign with transparent pricing and order tracking.",
    overview:
      "Instagram like campaigns are suited to creators and brands that want selected public content to present stronger social proof. You choose the quantity, review the current total and track delivery from your dashboard.",
    destination: "public Instagram post or reel link",
    benefits: [
      { title: "Content-level support", description: "Choose the exact public post or reel you want to include in the campaign." },
      { title: "Clear campaign total", description: "Review the current rate and calculated order total before checkout." },
      { title: "Simple ordering", description: "A public content link is all that is required—never your password." },
      { title: "Order support", description: "Use dashboard support if you need help with an eligible campaign." },
    ],
    related: ["instagram-followers", "instagram-views", "youtube-likes"],
  },
  "instagram-views": {
    slug: "instagram-views",
    serviceCode: "instagram-views",
    keyword: "Buy Instagram Views India",
    displayName: "Instagram Views",
    intro:
      "Increase the visible reach of eligible public Instagram reels and video posts with affordable campaign options and a clear delivery estimate.",
    overview:
      "SocialRUSH Instagram view campaigns give creators and businesses an organized way to select a quantity, submit a public reel or post URL and monitor the campaign from one dashboard.",
    destination: "public Instagram reel or video post link",
    benefits: [
      { title: "Broader content exposure", description: "Support the visible reach of the reel or video selected for your campaign." },
      { title: "Flexible quantities", description: "Choose the campaign size that fits your content plan and available budget." },
      { title: "Transparent pricing", description: "The exact total is calculated from the current catalog rate." },
      { title: "Trackable progress", description: "See campaign status and order details from your SocialRUSH account." },
    ],
    related: ["instagram-followers", "instagram-likes", "youtube-views"],
  },
  "youtube-subscribers": {
    slug: "youtube-subscribers",
    serviceCode: "youtube-subscribers",
    keyword: "Buy YouTube Subscribers India",
    displayName: "YouTube Subscribers",
    intro:
      "Strengthen the visible audience base of your public YouTube channel with a premium subscriber campaign and clear delivery guidance.",
    overview:
      "YouTube subscriber campaigns help creators, educators and businesses present a more established channel. SocialRUSH provides transparent pricing, public-link ordering and dashboard-based campaign tracking.",
    destination: "public YouTube channel link",
    benefits: [
      { title: "Channel credibility", description: "Support a stronger visible audience base for new channel visitors." },
      { title: "Public-link ordering", description: "Submit your channel URL without sharing YouTube login credentials." },
      { title: "Delivery guidance", description: "Review the estimated campaign timeline before placing your order." },
      { title: "Refill support", description: "Eligible coverage details are shown clearly with the selected service." },
    ],
    related: ["youtube-likes", "youtube-views", "instagram-followers"],
  },
  "youtube-likes": {
    slug: "youtube-likes",
    serviceCode: "youtube-likes",
    keyword: "Buy YouTube Likes India",
    displayName: "YouTube Likes",
    intro:
      "Support visible engagement on a public YouTube video with a quality-focused campaign, transparent rate and easy order tracking.",
    overview:
      "SocialRUSH lets you select the YouTube like quantity that fits your video campaign, confirm the destination URL and review all pricing and delivery information before checkout.",
    destination: "public YouTube video link",
    benefits: [
      { title: "Video social proof", description: "Support a stronger visible engagement signal on selected public videos." },
      { title: "Campaign control", description: "Choose the quantity and destination that align with your content plan." },
      { title: "Secure checkout", description: "Review the calculated total before confirming payment from your account." },
      { title: "Customer assistance", description: "WhatsApp and account support are available when guidance is needed." },
    ],
    related: ["youtube-subscribers", "youtube-views", "instagram-likes"],
  },
  "youtube-views": {
    slug: "youtube-views",
    serviceCode: "youtube-views",
    keyword: "Buy YouTube Views India",
    displayName: "YouTube Views",
    intro:
      "Expand the visible reach of public YouTube videos with a campaign that includes clear pricing, delivery guidance and dashboard tracking.",
    overview:
      "YouTube view campaigns can support content discovery goals for creators, brands and businesses. SocialRUSH keeps the process simple: choose a quantity, provide the public video link and monitor delivery.",
    destination: "public YouTube video link",
    benefits: [
      { title: "Video reach support", description: "Build visible momentum around the public video selected for your campaign." },
      { title: "Current catalog rates", description: "Pricing is sourced directly from the same catalog used at checkout." },
      { title: "No password required", description: "Only the public YouTube video URL is needed to begin." },
      { title: "Centralized tracking", description: "Keep your quantity, charge and campaign status together." },
    ],
    related: ["youtube-subscribers", "youtube-likes", "instagram-views"],
  },
  "linkedin-followers": {
    slug: "linkedin-followers",
    serviceCode: "linkedin-followers",
    keyword: "Buy LinkedIn Followers India",
    displayName: "LinkedIn Followers",
    intro:
      "Develop a stronger visible professional audience for a public LinkedIn profile or company page with transparent campaign pricing.",
    overview:
      "SocialRUSH LinkedIn follower campaigns are built for founders, professionals and businesses that value clear delivery expectations, public-link safety and organized order tracking.",
    destination: "public LinkedIn profile or company page link",
    benefits: [
      { title: "Professional presence", description: "Support a more established first impression for profile or company-page visitors." },
      { title: "Business-friendly workflow", description: "Keep campaign details and status updates organized in one dashboard." },
      { title: "Public URL only", description: "Your LinkedIn password is never required to place an order." },
      { title: "Clear service coverage", description: "Delivery and refill information is visible before checkout." },
    ],
    related: ["twitter-followers", "instagram-followers", "youtube-subscribers"],
  },
  "twitter-followers": {
    slug: "twitter-followers",
    serviceCode: "x-followers",
    keyword: "Buy Twitter Followers India",
    displayName: "Twitter/X Followers",
    intro:
      "Build a stronger visible audience for your public Twitter/X profile with a gradual follower campaign and professional order tracking.",
    overview:
      "Designed for creators, founders and brands, SocialRUSH Twitter/X campaigns combine clear pricing, a public-profile ordering flow and support when you need help selecting a service.",
    destination: "public Twitter/X profile link",
    benefits: [
      { title: "Profile authority", description: "Support a stronger visible presence for people discovering your account." },
      { title: "Gradual campaign delivery", description: "Follow the delivery estimate displayed with the selected service." },
      { title: "Secure ordering", description: "Place the campaign using only your public X profile URL." },
      { title: "Account tracking", description: "Review campaign progress and order details from your dashboard." },
    ],
    related: ["linkedin-followers", "instagram-followers", "facebook-followers"],
  },
  "facebook-followers": {
    slug: "facebook-followers",
    serviceCode: "facebook-followers",
    keyword: "Buy Facebook Followers India",
    displayName: "Facebook Followers",
    intro:
      "Support a stronger visible audience for your public Facebook page or profile with clear rates, delivery guidance and order tracking.",
    overview:
      "Facebook follower campaigns give businesses, creators and community pages a simple way to organize audience-growth orders without sharing account passwords or relying on unclear quotes.",
    destination: "public Facebook page or profile link",
    benefits: [
      { title: "Page presence", description: "Build a more established visible audience for new page visitors." },
      { title: "Flexible campaign size", description: "Choose a quantity that matches your current objective and budget." },
      { title: "Refill information", description: "Eligible coverage is displayed before the order is confirmed." },
      { title: "Simple support access", description: "Reach SocialRUSH through account support or WhatsApp when needed." },
    ],
    related: ["instagram-followers", "twitter-followers", "linkedin-followers"],
  },
  "telegram-members": {
    slug: "telegram-members",
    serviceCode: "telegram-members",
    keyword: "Buy Telegram Members India",
    displayName: "Telegram Members",
    intro:
      "Develop the visible membership of a public Telegram channel or group with a clearly priced community-growth campaign.",
    overview:
      "SocialRUSH Telegram member campaigns help channel owners and community managers choose a campaign size, provide a public destination and track the resulting order through a secure account.",
    destination: "public Telegram channel or group link",
    benefits: [
      { title: "Community presence", description: "Support a stronger visible member base for public channels and groups." },
      { title: "Straightforward setup", description: "Select a campaign and submit the public Telegram destination." },
      { title: "Delivery visibility", description: "Review timing and refill details before you place the order." },
      { title: "Organized records", description: "Keep campaign status and transaction details in your dashboard." },
    ],
    related: ["instagram-followers", "youtube-subscribers", "twitter-followers"],
  },
};

function getCatalogService(content: SeoServiceContent) {
  const service = activeSmmServices.find((item) => item.code === content.serviceCode);
  if (!service) {
    throw new Error(`Active service catalog entry missing for ${content.serviceCode}`);
  }
  return service;
}

export function getSeoServicePage(slug: SeoServiceSlug) {
  const content = landingPages[slug];
  const service = getCatalogService(content);
  return {
    ...content,
    service,
    platform: platformMeta[service.platform],
    confirmedPrice: confirmedPublicPrices[slug] ?? null,
  };
}

export function getSeoServiceMetadata(slug: SeoServiceSlug): Metadata {
  const page = getSeoServicePage(slug);
  const descriptions: Partial<Record<SeoServiceSlug, string>> = {
    "youtube-subscribers":
      "Buy YouTube subscribers in India with SocialRUSH. Public channel-link ordering, transparent pricing, dashboard tracking, delivery guidance and no password required.",
    "facebook-followers":
      "Buy Facebook followers in India with SocialRUSH. Compare public page/profile follower services with transparent pricing, dashboard tracking and WhatsApp support.",
  };

  return createPageMetadata({
    title: page.keyword,
    description:
      descriptions[slug] ??
      `${page.keyword} with SocialRUSH. View transparent pricing, delivery guidance, refill availability, secure checkout and easy order tracking.`,
    path: `/${page.slug}`,
    keywords: [
      page.keyword,
      `${page.displayName} price India`,
      `${page.displayName} service India`,
    ],
  });
}

export function getSeoServiceStructuredData(slug: SeoServiceSlug) {
  const page = getSeoServicePage(slug);
  const url = `${SEO_SITE_URL}/${page.slug}`;
  const faqs = getSeoServiceFaqs(slug);

  return {
    breadcrumbs: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SEO_SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: page.displayName, item: url },
      ],
    },
    faq: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
    service: {
      "@context": "https://schema.org",
      "@type": "Service",
      name: page.displayName,
      description: page.overview,
      url,
      provider: {
        "@type": "Organization",
        name: "SocialRUSH",
        url: SEO_SITE_URL,
      },
      areaServed: "IN",
      ...(page.confirmedPrice !== null
        ? {
            offers: {
              "@type": "Offer",
              priceCurrency: "INR",
              price: page.confirmedPrice,
              url: `${SEO_SITE_URL}/packages`,
              availability: "https://schema.org/InStock",
            },
          }
        : {}),
    },
  };
}

export function getSeoServiceFaqs(slug: SeoServiceSlug) {
  const page = getSeoServicePage(slug);
  return [
    {
      question: `How do I order ${page.displayName} in India?`,
      answer: `Select a package, sign in to SocialRUSH, enter your ${page.destination}, review the current total and place the order from your dashboard.`,
    },
    {
      question: `What information is needed for a ${page.displayName} campaign?`,
      answer: `You only need the ${page.destination}. Keep the destination public during delivery. SocialRUSH will never ask for your social media password.`,
    },
    {
      question: `How much do ${page.displayName} cost?`,
      answer: page.confirmedPrice !== null
        ? `The confirmed public rate starts at ₹${page.confirmedPrice.toLocaleString("en-IN")} per 1,000. Your exact total depends on the selected quantity and is shown before checkout.`
        : "Open the packages page to view the latest confirmed price. Your exact total depends on the selected quantity and is shown before checkout.",
    },
    {
      question: `How long does ${page.displayName} delivery take?`,
      answer: `The current delivery estimate is ${page.service.deliveryTime}. Actual timing can vary by campaign size, platform conditions and destination availability.`,
    },
    {
      question: `Is refill support available for ${page.displayName}?`,
      answer: `${page.service.refillPolicy} is currently listed for this service. Eligibility and the applicable coverage period are shown in the service details when you order.`,
    },
    {
      question: "Can I track my order?",
      answer: "Yes. Sign in to your SocialRUSH dashboard to review the order status, quantity, charge and campaign history.",
    },
  ];
}
