import { activeSmmServices } from "../smm-service-catalog";

type ServiceCopy = {
  summary: string;
  deliverables: string[];
  ideal: string;
};

const serviceCopy: Record<string, ServiceCopy> = {
  "instagram-followers": {
    summary: "Build social proof and strengthen your Instagram presence with premium follower growth services.",
    deliverables: ["Gradual processing", "30-day refill support", "Live order tracking", "Secure wallet checkout"],
    ideal: "Creators, influencers, brands, and businesses",
  },
  "instagram-likes": {
    summary: "Improve engagement and make your content look more active and trustworthy.",
    deliverables: ["Fast processing", "Eligible refill coverage", "Post and reel support", "Dashboard tracking"],
    ideal: "Reels, posts, launches, and brand content",
  },
  "instagram-views": {
    summary: "Boost reel and video visibility with fast, affordable view delivery.",
    deliverables: ["Reels and video support", "Fast activation", "Transparent pricing", "Order history"],
    ideal: "Creators, publishers, and campaign teams",
  },
  "youtube-subscribers": {
    summary: "Grow your channel authority and build a stronger subscriber base.",
    deliverables: ["Gradual processing", "30-day refill support", "Channel-safe ordering", "Status tracking"],
    ideal: "YouTubers, educators, brands, and media teams",
  },
  "youtube-likes": {
    summary: "Increase video engagement and improve social proof on your content.",
    deliverables: ["Video-level campaigns", "Quality checked delivery", "Refill eligibility", "Support access"],
    ideal: "Videos, premieres, and campaign content",
  },
  "youtube-views": {
    summary: "Improve video reach and visibility with high-quality view campaigns.",
    deliverables: ["High-retention options", "Gradual delivery", "Real-time status", "Clear estimates"],
    ideal: "Channels, creators, brands, and agencies",
  },
  "facebook-followers": {
    summary: "Build your page audience and improve brand credibility.",
    deliverables: ["Page campaigns", "Gradual processing", "Refill coverage", "Secure checkout"],
    ideal: "Businesses, communities, and public pages",
  },
  "facebook-likes": {
    summary: "Increase engagement on your Facebook posts and improve audience activity.",
    deliverables: ["Post-specific delivery", "Fast activation", "Order tracking", "Support tickets"],
    ideal: "Business posts, promotions, and content teams",
  },
  "facebook-views": {
    summary: "Expand video reach and improve content performance.",
    deliverables: ["Video campaigns", "Fast processing", "Transparent rates", "Live dashboard"],
    ideal: "Video publishers, businesses, and creators",
  },
  "linkedin-followers": {
    summary: "Strengthen professional profile visibility with a structured follower growth campaign.",
    deliverables: ["Professional profile campaigns", "Gradual processing", "Clear order status", "Support access"],
    ideal: "Founders, consultants, recruiters, and business creators",
  },
  "linkedin-likes": {
    summary: "Improve visible engagement on important professional posts and company updates.",
    deliverables: ["Public post campaigns", "Transparent quantity pricing", "Dashboard tracking", "Support access"],
    ideal: "Thought leadership, hiring, launches, and company news",
  },
  "tiktok-followers": {
    summary: "Build profile social proof with a clear, trackable TikTok follower campaign.",
    deliverables: ["Profile growth campaigns", "Gradual processing", "Order tracking", "Eligible support"],
    ideal: "Creators, artists, brands, and entertainment accounts",
  },
  "tiktok-likes": {
    summary: "Increase visible interaction on selected public TikTok videos.",
    deliverables: ["Video-specific ordering", "Fast processing", "Transparent pricing", "Campaign history"],
    ideal: "Short-form videos, launches, and creator content",
  },
  "tiktok-views": {
    summary: "Support content reach with affordable, trackable TikTok video view campaigns.",
    deliverables: ["Public video links", "Fast activation", "Live status", "Support tickets"],
    ideal: "Creators, musicians, brands, and publishers",
  },
  "twitter-followers": {
    summary: "Grow profile authority and improve visibility on X/Twitter.",
    deliverables: ["Profile growth campaigns", "Gradual processing", "Refill eligibility", "Campaign tracking"],
    ideal: "Founders, creators, brands, and communities",
  },
};

function formatInr(value: number) {
  return `₹${new Intl.NumberFormat("en-IN").format(value)} / 1000`;
}

export const agencyServices = activeSmmServices.map((service) => {
  const copy = serviceCopy[service.code] ?? {
    summary: service.description,
    deliverables: [service.deliveryTime, service.refillPolicy, service.qualityType, service.importantInstruction],
    ideal: service.name,
  };

  return {
    slug: service.code,
    name: service.name,
    platform: service.platform === "x" ? "Twitter/X" : service.platform.charAt(0).toUpperCase() + service.platform.slice(1),
    pricePer1000INR: service.pricePer1000,
    price: formatInr(service.pricePer1000),
    summary: copy.summary,
    deliverables: copy.deliverables,
    ideal: copy.ideal,
  };
});

export const publicFaqs = [
  ["What is SocialRUSH?", "SocialRUSH is a premium social media growth platform for ordering and tracking Instagram, YouTube, Facebook, LinkedIn, TikTok, and Twitter/X services from one secure dashboard."],
  ["Do I need to share my password?", "No. SocialRUSH never asks for your social media password. Customers provide only the public profile, post, reel, channel, or video link required for processing."],
  ["How do I place an order?", "Create an account, add funds through the wallet, open New Campaign, choose a service, paste the public profile or content link, select quantity, and confirm checkout."],
  ["How do payments work?", "Add funds securely through supported Razorpay payment methods. Verified payments credit your wallet, and campaign charges are deducted only when an order is placed."],
  ["How long does delivery take?", "Delivery varies by service and quantity. The estimated processing window is displayed before checkout and progress remains visible in Campaign History."],
  ["What is refill support?", "Eligible services include refill coverage for the displayed period. If qualifying delivery drops during that window, open a support ticket with the order ID."],
  ["Can I track my order?", "Yes. Order status, amount, destination, date, and progress are available inside your protected dashboard."],
  ["Which platforms do you support?", "The public catalog covers Instagram, YouTube, Facebook, LinkedIn, TikTok, and Twitter/X. Live availability is shown inside the campaign dashboard."],
  ["What if my order is delayed?", "Check the delivery estimate first. If processing exceeds that window, create a support ticket and the team will review the order."],
  ["Can agencies use SocialRUSH?", "Yes. The wallet, order history, service catalog, and support workflow are suitable for agencies and social media managers handling multiple campaigns."],
  ["Which link should I submit?", "Submit the exact public destination required by the service: a profile for followers, a post or video for likes and views, or a public channel for subscribers. Review it carefully before checkout."],
  ["Can I order multiple services?", "Yes. You can place separate campaigns for different services or platforms and track every order independently from Campaign History."],
];

export const caseStudies = [
  {type:"Independent creator",category:"Instagram Growth",goal:"Strengthen profile presentation before a product collaboration.",strategy:"A gradual follower campaign supported by selected reel visibility orders and clear delivery tracking.",result:"A more established profile presentation and a simpler repeat-order workflow through the dashboard."},
  {type:"Education channel",category:"YouTube Growth",goal:"Improve channel authority around a new content series.",strategy:"Subscriber growth and selected video reach campaigns scheduled across the launch period.",result:"Stronger channel social proof with every campaign and transaction visible in one workspace."},
  {type:"Local retail brand",category:"Facebook Growth",goal:"Increase visible activity around promotional video content.",strategy:"Page follower, post engagement, and video view services selected according to campaign priorities.",result:"More consistent public presentation and easier campaign management for the internal marketing team."},
  {type:"Boutique agency",category:"Multi-platform",goal:"Manage repeat client requests without scattered payment and status records.",strategy:"Centralized wallet funding, structured orders, campaign history, and support tickets.",result:"A cleaner operational workflow with transparent pricing and searchable order records."},
];

