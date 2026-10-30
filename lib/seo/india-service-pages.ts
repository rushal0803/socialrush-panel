import type { Metadata } from "next";
import { SERVICE_PRICES, type ServiceCode } from "../service-pricing.ts";
import { SEO_SITE_URL } from "./metadata.ts";
import { linkedInFollowersFaqs } from "./linkedin-followers.ts";
import { deliveryRefillIntentKeywords } from "@/lib/seo/delivery-refill-intent";
import { orderRequirementIntentKeywords } from "@/lib/seo/order-requirements-intent";
import { paymentIntentKeywords } from "./payment-intent.ts";
import { buildCommercialSearchDescription } from "./search-snippets.ts";

import {
  canonicalIndiaServicePaths,
  getCanonicalIndiaServicePath,
  indiaServiceSlugs,
  type IndiaServiceSlug,
} from "./canonical-india-services.ts";
export {
  canonicalIndiaServicePaths,
  getCanonicalIndiaServicePath,
  indiaServiceSlugs,
  type IndiaServiceSlug,
} from "./canonical-india-services.ts";

type IndiaServicePage = {
  slug: IndiaServiceSlug;
  serviceCode: ServiceCode;
  platform: string;
  platformKey: string;
  serviceName: string;
  unitName: string;
  destination: string;
  delivery: string;
  refill: string;
  packageService: string;
  intro: string;
  overview: string;
  value: string;
  safety: string;
  deliveryCopy: string;
  metaDescription: string;
  ogDescription: string;
  audiences: string[];
  related: IndiaServiceSlug[];
};

const pages: Record<IndiaServiceSlug, IndiaServicePage> = {
  "buy-instagram-followers-india": {
    slug: "buy-instagram-followers-india",
    serviceCode: "instagram-followers",
    platform: "Instagram",
    platformKey: "instagram",
    serviceName: "Instagram Followers",
    unitName: "followers",
    destination: "public Instagram profile link",
    delivery: "1–7 days",
    refill: "Available on eligible packages",
    packageService: "followers",
    intro:
      "Compare Instagram follower packages for eligible public profiles in India, with live INR pricing, current delivery details and applicable refill terms before checkout.",
    overview:
      "Choose a suitable quantity, submit your public profile URL, review the exact INR total, and follow delivery from your SocialRUSH dashboard.",
    value:
      "Displayed follower counts alone do not establish genuine audience interest, engagement, qualified reach or sales. Review organic account insights and authentic audience feedback separately.",
    safety:
      "SocialRUSH never asks for your Instagram password. Keep the submitted profile public and avoid changing its username while delivery is active.",
    deliveryCopy:
      "Follower delivery starts after confirmation and follows the estimate shown with the selected package. Eligible refill terms are displayed before ordering.",
    metaDescription:
      "Buy Instagram followers in India with SocialRUSH. Public-link ordering, transparent pricing, dashboard tracking and WhatsApp support. No password required.",
    ogDescription:
      "Compare Instagram follower packages in India with clear INR pricing, public-link ordering, refill information and dashboard tracking.",
    audiences: ["Creators", "Influencers", "Local brands", "Agencies"],
    related: [
      "buy-instagram-likes-india",
      "buy-instagram-views-india",
      "buy-instagram-comments-india",
      "buy-instagram-saves-india",
      "buy-instagram-shares-india",
    ],
  },
  "buy-instagram-likes-india": {
    slug: "buy-instagram-likes-india",
    serviceCode: "instagram-likes",
    platform: "Instagram",
    platformKey: "instagram",
    serviceName: "Instagram Likes",
    unitName: "likes",
    destination: "public Instagram post or reel link",
    delivery: "1–3 days",
    refill: "Available on eligible services",
    packageService: "likes",
    intro:
      "Support visible engagement on selected Instagram posts and reels with a clearly priced campaign built for Indian creators and brands.",
    overview:
      "Select the content you want to support, provide its public URL, confirm the campaign quantity, and monitor progress without sharing login credentials.",
    value:
      "Visible likes can strengthen content presentation when new visitors compare posts, reels, launches, portfolios, or brand updates.",
    safety:
      "Only the public post or reel URL is required. SocialRUSH does not need your password, account access, or private profile information.",
    deliveryCopy:
      "Like delivery begins after confirmation and depends on campaign size and content availability. Keep the selected post public throughout delivery.",
    metaDescription:
      "Buy Instagram likes in India for public posts and Reels. Compare INR pricing, delivery and refill eligibility, and confirm the active order terms before payment.",
    ogDescription:
      "Compare Instagram post and Reel like orders with clear INR estimates, public-link requirements and service-specific delivery and refill terms.",
    audiences: ["Reel creators", "Influencers", "Product brands", "Social teams"],
    related: [
      "buy-instagram-followers-india",
      "buy-instagram-views-india",
      "buy-instagram-comments-india",
      "buy-instagram-saves-india",
      "buy-instagram-shares-india",
    ],
  },
  "buy-instagram-views-india": {
    slug: "buy-instagram-views-india",
    serviceCode: "instagram-views",
    platform: "Instagram",
    platformKey: "instagram",
    serviceName: "Instagram Views",
    unitName: "views",
    destination: "public Instagram reel or video link",
    delivery: "1–3 days",
    refill: "Service terms shown before checkout",
    packageService: "views",
    intro:
      "Order displayed views for eligible public Instagram Reels and videos with clear package selection and order tracking. View counts do not guarantee unique reach, watch time or organic discovery.",
    overview:
      "Paste the exact public reel or video URL, choose the campaign size, review the total, and keep every order update organized in one dashboard.",
    value:
      "Displayed view counts are not proof of genuine viewer interest, unique audience reach, engagement, followers or sales. Evaluate audience insights and authentic feedback separately.",
    safety:
      "No password or account access is required. Submit only a public reel or video URL and keep the content available while delivery is underway.",
    deliveryCopy:
      "Delivery timing depends on the active service, quantity, content availability, and platform conditions. Confirm the current estimate during order review.",
    metaDescription:
      "Buy Instagram views in India with live INR pricing, public Reel or video link ordering, no password required and SocialRUSH dashboard tracking.",
    ogDescription:
      "Compare Instagram Reel and video view packages with public-link ordering, current availability and service-specific delivery terms.",
    audiences: ["Reel creators", "Artists", "Small businesses", "Campaign teams"],
    related: [
      "buy-instagram-followers-india",
      "buy-instagram-likes-india",
      "buy-instagram-comments-india",
      "buy-instagram-saves-india",
      "buy-instagram-shares-india",
    ],
  },
  "buy-instagram-comments-india": {
    slug: "buy-instagram-comments-india",
    serviceCode: "instagram-comments",
    platform: "Instagram",
    platformKey: "instagram",
    serviceName: "Instagram Comments",
    unitName: "comments",
    destination: "public Instagram post or reel URL",
    delivery: "1–24 hours",
    refill: "No refill",
    packageService: "comments",
    intro: "Compare Instagram comment packages for public posts and Reels. Check the current INR order total, link requirements and active delivery and no-refill terms before paying.",
    overview: "Choose a quantity, enter the correct public post or Reel URL, review transparent INR pricing, and track the order from your SocialRUSH dashboard.",
    value: "A visible comment count is not proof of genuine audience conversations, Indian commenters, relevance or guaranteed organic reach. Compare current service terms before ordering.",
    safety: "Only a public Instagram post or Reel URL is required. SocialRUSH never asks for your password, login, or OTP.",
    deliveryCopy: "The catalog lists an indicative 1–24 hour delivery estimate and no refill. Confirm live availability, delivery and support terms for your exact order before payment.",
    metaDescription: "Buy Instagram comments in India with live INR pricing, public post or Reel link ordering, no password required and SocialRUSH dashboard tracking.",
    ogDescription: "Review public Instagram comment packages, INR pricing, delivery estimates and no-refill terms before choosing a post or Reel order.",
    audiences: ["Creators", "Reel publishers", "Brands", "Social media teams"],
    related: ["buy-instagram-followers-india", "buy-instagram-likes-india", "buy-instagram-views-india", "buy-instagram-saves-india", "buy-instagram-shares-india"],
  },
  "buy-instagram-saves-india": {
    slug: "buy-instagram-saves-india",
    serviceCode: "instagram-saves",
    platform: "Instagram",
    platformKey: "instagram",
    serviceName: "Instagram Saves",
    unitName: "saves",
    destination: "public Instagram post or reel URL",
    delivery: "Shown with the active service",
    refill: "Shown with the active service",
    packageService: "saves",
    intro: "Compare Instagram Saves packages for eligible public posts and Reels. Review live INR pricing, service terms and the correct destination URL before checkout.",
    overview: "Choose a quantity within the active service limits, submit the exact public post or Reel URL, review the current details, and track the order from your SocialRUSH dashboard.",
    value: "Displayed saves alone do not prove genuine audience interest, increased organic reach, qualified engagement or sales. Evaluate authentic post insights and audience feedback separately.",
    safety: "Only a public Instagram post or Reel URL is required. SocialRUSH never asks for your password, login, or OTP.",
    deliveryCopy: "The active service shows its current delivery estimate and any eligible refill terms before you place an order.",
    metaDescription: "Buy Instagram saves in India with live INR pricing, public post or Reel link ordering, no password required and SocialRUSH dashboard tracking.",
    ogDescription: "Order Instagram saves in India with transparent pricing, public-link ordering, and SocialRUSH dashboard tracking.",
    audiences: ["Creators", "Reel publishers", "Brands", "Social media teams"],
    related: ["buy-instagram-followers-india", "buy-instagram-likes-india", "buy-instagram-views-india", "buy-instagram-comments-india", "buy-instagram-shares-india"],
  },
  "buy-instagram-shares-india": {
    slug: "buy-instagram-shares-india",
    serviceCode: "instagram-shares",
    platform: "Instagram",
    platformKey: "instagram",
    serviceName: "Instagram Shares",
    unitName: "shares",
    destination: "public Instagram post or reel URL",
    delivery: "Shown with the active service",
    refill: "Shown with the active service",
    packageService: "shares",
    intro: "Compare Instagram share activity for public posts and Reels. Review live INR rates, delivery terms and destination requirements before placing an order.",
    overview: "Choose a quantity within the active service limits, submit the exact public post or Reel URL, review the current details, and track the order from your SocialRUSH dashboard.",
    value: "Visible share counts are not proof of organic distribution, Indian viewers or engaged customers. Continue publishing valuable content that real people want to share.",
    safety: "Only a public Instagram post or Reel URL is required. SocialRUSH never asks for your password, login, or OTP.",
    deliveryCopy: "The catalog lists an indicative 1–24 hour delivery window and no refill. Active service terms at checkout remain authoritative.",
    metaDescription: "Buy Instagram shares in India for public posts and Reels. Check live INR pricing, link requirements, delivery and no-refill terms before payment.",
    ogDescription: "Compare Instagram share packages in India, correct post or Reel links, live INR totals, delivery and refill terms.",
    audiences: ["Creators", "Reel publishers", "Brands", "Social media teams"],
    related: ["buy-instagram-followers-india", "buy-instagram-likes-india", "buy-instagram-views-india", "buy-instagram-comments-india", "buy-instagram-saves-india"],
  },
  "buy-youtube-subscribers-india": {
    slug: "buy-youtube-subscribers-india",
    serviceCode: "youtube-subscribers",
    platform: "YouTube",
    platformKey: "youtube",
    serviceName: "YouTube Subscribers",
    unitName: "subscribers",
    destination: "public YouTube channel link",
    delivery: "3–15 days",
    refill: "Available on eligible packages",
    packageService: "subscribers",
    intro:
      "Compare YouTube subscriber packages for eligible public channels, with current INR totals, delivery estimates and applicable refill terms before checkout.",
    overview:
      "Choose a package, submit your public channel URL, review the INR campaign total, and track subscriber delivery from your SocialRUSH account.",
    value:
      "Subscriber counts alone do not establish genuine viewer interest, watch time, monetization eligibility, channel authority or organic reach. Review YouTube Analytics and audience feedback separately.",
    safety:
      "SocialRUSH requires only your public channel link. Never provide a YouTube or Google password to place a subscriber campaign.",
    deliveryCopy:
      "Subscriber campaigns use gradual delivery based on package size. Keep the channel public and avoid changing its handle during processing.",
    metaDescription:
      "Buy YouTube subscribers in India with live INR pricing, public channel-link ordering, no password required, refill details and dashboard tracking.",
    ogDescription:
      "Compare YouTube subscriber packages in India with live INR pricing, public channel-link ordering, delivery and refill details, and dashboard tracking.",
    audiences: ["YouTube creators", "Educators", "Podcasters", "Brand channels"],
    related: [
      "buy-youtube-likes-india",
      "buy-youtube-views-india",
      "buy-youtube-comments-india",
      "buy-instagram-followers-india",
    ],
  },
  "buy-youtube-likes-india": {
    slug: "buy-youtube-likes-india",
    serviceCode: "youtube-likes",
    platform: "YouTube",
    platformKey: "youtube",
    serviceName: "YouTube Likes",
    unitName: "likes",
    destination: "public YouTube video link",
    delivery: "0–48 hours",
    refill: "Available where listed",
    packageService: "likes",
    intro:
      "Support visible engagement on selected YouTube videos with a straightforward like campaign and clear pricing for Indian customers.",
    overview:
      "Submit the exact public video URL, choose a suitable quantity, confirm the displayed total, and monitor delivery from your account.",
    value:
      "Displayed like counts alone do not prove authentic engagement, meaningful watch time, viewer satisfaction or recommendation performance. Review YouTube Analytics and genuine audience feedback separately.",
    safety:
      "Only a public video URL is needed. Your channel password, Google credentials, and private account access are never required.",
    deliveryCopy:
      "Delivery begins after confirmation and varies with quantity and video availability. Keep the selected video public during processing.",
    metaDescription:
      "Buy YouTube likes in India with live INR pricing, public video-link ordering, no password required, delivery details and dashboard tracking.",
    ogDescription:
      "Compare YouTube like packages in India with live INR pricing, public video-link ordering, delivery details and SocialRUSH dashboard tracking.",
    audiences: ["Video creators", "Music channels", "Educators", "Businesses"],
    related: [
      "buy-youtube-subscribers-india",
      "buy-youtube-views-india",
      "buy-youtube-comments-india",
      "buy-instagram-likes-india",
    ],
  },
  "buy-youtube-views-india": {
    slug: "buy-youtube-views-india",
    serviceCode: "youtube-views",
    platform: "YouTube",
    platformKey: "youtube",
    serviceName: "YouTube Views",
    unitName: "views",
    destination: "public YouTube video link",
    delivery: "1–7 days",
    refill: "Service coverage shown before order",
    packageService: "views",
    intro:
      "Compare view-count packages for eligible public YouTube videos with live service terms and order tracking. View counts do not guarantee unique reach, audience retention or recommendations.",
    overview:
      "Choose a campaign quantity, paste the correct video URL, review pricing and delivery, and follow status updates from your dashboard.",
    value:
      "A displayed view count is not proof of authentic interest, meaningful watch time, higher rankings, monetization eligibility or sales. Review YouTube Analytics separately.",
    safety:
      "No channel password is required. Submit only the public video link and keep it available without changing visibility during delivery.",
    deliveryCopy:
      "YouTube view timing depends on campaign size and service conditions. The current estimate is displayed before you confirm the order.",
    metaDescription:
      "Buy YouTube views in India with live INR pricing, public video-link ordering, no password required, delivery details and dashboard tracking.",
    ogDescription:
      "Compare YouTube view packages in India with live INR pricing, public video-link ordering, delivery details and SocialRUSH dashboard tracking.",
    audiences: ["New channels", "Music artists", "Educators", "Product teams"],
    related: [
      "buy-youtube-subscribers-india",
      "buy-youtube-likes-india",
      "buy-youtube-comments-india",
      "buy-instagram-views-india",
    ],
  },
  "buy-youtube-comments-india": {
    slug: "buy-youtube-comments-india",
    serviceCode: "youtube-comments",
    platform: "YouTube",
    platformKey: "youtube",
    serviceName: "YouTube Comments",
    unitName: "comments",
    destination: "public YouTube video URL",
    delivery: "Current estimate shown with the active service",
    refill: "Current terms shown with the active service",
    packageService: "comments",
    intro: "Review YouTube comments packages for eligible public videos and Shorts, with live INR pricing, video-link checks and dashboard tracking.",
    overview: "Select YouTube Comments, enter the correct public video URL, choose an available quantity, then review the exact order details before payment.",
    value: "An added comment count is not verified audience interest. YouTube moderation can change visibility, and comments alone do not guarantee reach, ranking, watch hours or monetization.",
    safety: "Submit only the correct public YouTube video URL. SocialRUSH does not require your Google password or channel access; keep the video public while the order is processing.",
    deliveryCopy: "The live catalog determines delivery estimates and eligible refill or support terms; no delivery speed, custom wording or comment retention is guaranteed without explicit service terms.",
    metaDescription: "Buy YouTube comments in India for eligible videos and Shorts. Check live INR prices, video URL rules, delivery, moderation and support terms before checkout.",
    ogDescription: "Compare YouTube comments in India: live prices, public video or Short links, moderation limits and service terms.",
    audiences: ["Video creators", "Educators", "Music channels", "Businesses"],
    related: ["buy-youtube-subscribers-india", "buy-youtube-likes-india", "buy-youtube-views-india"],
  },
  "buy-linkedin-followers-india": {
    slug: "buy-linkedin-followers-india",
    serviceCode: "linkedin-followers",
    platform: "LinkedIn",
    platformKey: "linkedin",
    serviceName: "LinkedIn Followers",
    unitName: "followers",
    destination: "public LinkedIn profile or company page link",
    delivery: "3–14 days",
    refill: "Available on eligible services",
    packageService: "followers",
    intro:
      "Compare LinkedIn follower packages for eligible public profiles or company pages, with current INR pricing, destination requirements and service terms before checkout.",
    overview:
      "Provide the correct public destination, choose a campaign size, review the exact INR total, and track every status update from SocialRUSH.",
    value:
      "Follower counts alone do not establish authentic professional interest, qualified reach, leads or business credibility. Review engagement and audience analytics separately.",
    safety:
      "No LinkedIn password or private account access is required. Use only the public profile or company page URL requested at checkout.",
    deliveryCopy:
      "LinkedIn follower delivery is gradual and depends on quantity and destination availability. Keep the submitted page public and stable.",
    metaDescription:
      "Buy LinkedIn followers in India with live INR package pricing, gradual delivery, no-password ordering and dashboard tracking from SocialRUSH.",
    ogDescription:
      "Strengthen LinkedIn profile or company-page visibility with clear follower packages and tracked SocialRUSH delivery in India.",
    audiences: ["Founders", "Consultants", "Company pages", "B2B agencies"],
    related: [
      "buy-linkedin-likes-india",
      "buy-twitter-followers-india",
      "buy-instagram-followers-india",
    ],
  },
  "buy-linkedin-likes-india": {
    slug: "buy-linkedin-likes-india",
    serviceCode: "linkedin-likes",
    platform: "LinkedIn",
    platformKey: "linkedin",
    serviceName: "LinkedIn Likes",
    unitName: "likes",
    destination: "public LinkedIn post link",
    delivery: "1–5 days",
    refill: "Service terms shown before checkout",
    packageService: "likes",
    intro:
      "Support visible engagement on selected LinkedIn posts with a professional campaign for Indian founders, experts, and business pages.",
    overview:
      "Submit the exact publicly accessible LinkedIn post URL, select a quantity, check the live INR total and current delivery/refill terms, and monitor order progress. India-focused pricing does not guarantee likes from Indian accounts.",
    value:
      "Displayed likes alone do not establish authentic professional interest, qualified reach, meaningful discussion, leads or sales. Evaluate post analytics and genuine audience feedback separately.",
    safety:
      "Your LinkedIn password is never needed. The service works from the public post URL supplied during checkout.",
    deliveryCopy:
      "Delivery timing varies by quantity and post availability. Keep the post public and avoid deleting or restricting it during processing.",
    metaDescription:
      "Buy LinkedIn likes in India with live INR pricing, public post-link ordering, no password required, delivery details and dashboard tracking.",
    ogDescription:
      "Support LinkedIn post engagement with clear pricing, no-password ordering and tracked delivery for Indian professionals.",
    audiences: ["Founders", "Thought leaders", "Recruiters", "B2B brands"],
    related: [
      "buy-linkedin-followers-india",
      "buy-twitter-followers-india",
      "buy-instagram-likes-india",
    ],
  },
  "buy-twitter-followers-india": {
    slug: "buy-twitter-followers-india",
    serviceCode: "x-followers",
    platform: "Twitter/X",
    platformKey: "twitter",
    serviceName: "Twitter/X Followers",
    unitName: "followers",
    destination: "public Twitter/X profile link",
    delivery: "2–10 days",
    refill: "Available where listed",
    packageService: "followers",
    intro:
      "Buy Twitter followers in India for your X (formerly Twitter) profile through a transparent, trackable follower campaign for creators, founders, and brands.",
    overview:
      "Choose from current X follower packages, submit a public X or Twitter profile URL, review the live INR total, and track the order through your SocialRUSH dashboard.",
    value:
      "Displayed follower counts alone do not demonstrate genuine X/Twitter engagement, qualified reach, trust, leads or sales. Review meaningful replies, audience insights and organic performance separately.",
    safety:
      "No Twitter/X password is required. Keep the submitted profile public and avoid changing its handle while delivery is active.",
    deliveryCopy:
      "Follower delivery is managed gradually and depends on package size. Current timing and refill coverage are shown before confirmation.",
    metaDescription:
      "Buy Twitter/X followers in India with live INR package pricing, public-profile ordering, delivery details and SocialRUSH order tracking.",
    ogDescription:
      "Build visible Twitter/X profile credibility with clear follower packages and tracked delivery from SocialRUSH India.",
    audiences: ["Founders", "Creators", "Public brands", "Community builders"],
    related: [
      "buy-linkedin-followers-india",
      "buy-instagram-followers-india",
      "buy-facebook-followers-india",
    ],
  },
  "buy-facebook-followers-india": {
    slug: "buy-facebook-followers-india",
    serviceCode: "facebook-followers",
    platform: "Facebook",
    platformKey: "facebook",
    serviceName: "Facebook Followers",
    unitName: "followers",
    destination: "public Facebook page or profile link",
    delivery: "1–7 days",
    refill: "Available on eligible packages",
    packageService: "followers",
    intro:
      "Build a stronger visible Facebook audience for a public page or profile with a clear, trackable follower campaign in India.",
    overview:
      "Check that your public Facebook Page or eligible profile URL is correct and accessible, then review the selected quantity, current INR total, delivery estimate and refill terms before checkout. Followers are not guaranteed to be India-based.",
    value:
      "Follower counts alone do not establish authentic community trust, engagement, qualified reach or business results. Evaluate real page interactions and audience feedback separately from purchased follower activity.",
    safety:
      "SocialRUSH never needs your Facebook password. Submit only the public page or profile link requested for the selected service.",
    deliveryCopy:
      "Delivery begins after confirmation and varies by quantity and page availability. Keep the destination public throughout processing.",
    metaDescription:
      "Buy Facebook followers in India with live INR pricing, public-link ordering without a password, order tracking, and refill support where eligible.",
    ogDescription:
      "Support Facebook page credibility with clear follower packages, public-link ordering and tracked delivery from SocialRUSH.",
    audiences: ["Local businesses", "Community pages", "Creators", "Agencies"],
    related: [
      "buy-facebook-likes-india",
      "buy-instagram-followers-india",
      "buy-twitter-followers-india",
    ],
  },
  "buy-facebook-group-members-india": {
    slug: "buy-facebook-group-members-india",
    serviceCode: "facebook-group-members",
    platform: "Facebook",
    platformKey: "facebook",
    serviceName: "Facebook Group Members",
    unitName: "members",
    destination: "public or accessible Facebook Group URL",
    delivery: "Shown with the active service",
    refill: "Shown with the active service",
    packageService: "group-members",
    intro: "Review Facebook Group member packages in India, accessible group-link requirements, current INR pricing and delivery terms before checkout.",
    overview: "Select the active Facebook Group Members service, enter the correct accessible group URL, choose a quantity, and review the live details before checkout.",
    value: "Member totals are different from active community participation. Group membership alone does not guarantee discussion, retention, organic reach, local leads or sales.",
    safety: "Facebook Group must be public or accessible as required by the service. Enter the correct Facebook Group URL and do not change privacy settings while the order is processing.",
    deliveryCopy: "Service timing and refill coverage depend on the active catalog. Group access, admin approval and privacy changes can affect fulfillment; check current terms before ordering.",
    metaDescription: "Buy Facebook Group members in India. Review group URL requirements, admin approvals, live INR pricing, delivery and refill terms before checkout.",
    ogDescription: "Compare Facebook Group members in India with live pricing, group-access requirements, privacy considerations and dashboard tracking.",
    audiences: ["Community builders", "Local groups", "Creators", "Brands"],
    related: ["buy-facebook-followers-india", "buy-facebook-likes-india", "buy-facebook-views-india"],
  },
  "buy-facebook-likes-india": {
    slug: "buy-facebook-likes-india",
    serviceCode: "facebook-likes",
    platform: "Facebook",
    platformKey: "facebook",
    serviceName: "Facebook Likes",
    unitName: "likes",
    destination: "public Facebook post link",
    delivery: "0–48 hours",
    refill: "Service terms shown before order",
    packageService: "likes",
    intro:
      "Support visible engagement on public Facebook posts with an accessible campaign for Indian pages, creators, and businesses.",
    overview:
      "Provide the exact post URL, choose the required quantity, review the INR total, and monitor progress from your dashboard.",
    value:
      "Likes show a reaction count, not verified attention, business results or authentic discussion. Relevance and real community interactions matter more than the displayed number.",
    safety:
      "No Facebook login or password is required. The campaign uses only the public post URL submitted during checkout.",
    deliveryCopy:
      "Like delivery generally starts after confirmation. Timing depends on order size, post visibility, and current service conditions.",
    metaDescription:
      "Buy Facebook Likes in India for eligible public posts. Compare current INR pricing, link requirements, delivery and account-origin limitations.",
    ogDescription:
      "Compare Facebook Likes packages in India with public-post eligibility, transparent prices, delivery guidance and secure ordering.",
    audiences: ["Business pages", "Event teams", "Creators", "Communities"],
    related: [
      "buy-facebook-followers-india",
      "buy-instagram-likes-india",
      "buy-linkedin-likes-india",
    ],
  },
  "buy-facebook-views-india": {
    slug: "buy-facebook-views-india",
    serviceCode: "facebook-views",
    platform: "Facebook",
    platformKey: "facebook",
    serviceName: "Facebook Views",
    unitName: "views",
    destination: "public Facebook video or post link",
    delivery: "1–4 days",
    refill: "Refill eligible",
    packageService: "views",
    intro: "Build a clear Facebook video views order with public-link submission, live catalog pricing, and dashboard tracking.",
    overview: "Use the exact publicly accessible Facebook video permalink or eligible video-post URL, not a Page homepage or private post. Review service compatibility, selected quantity, current INR total and delivery terms before checkout.",
    value: "Displayed Facebook view counts are not proof of unique people reached, sustained watch time, authentic interest or business results. Compare video-level insights and referral outcomes separately from ordered views.",
    safety: "SocialRUSH never asks for your Facebook password, login, or OTP. Submit only the public video or post link required by the service.",
    deliveryCopy: "Delivery and refill eligibility follow the active service terms and can change with video accessibility and quantity. Views are not guaranteed to come from Indian accounts or produce organic reach.",
    metaDescription: "Buy Facebook views in India with live INR pricing, public video-link ordering, no password required and SocialRUSH dashboard tracking.",
    ogDescription: "Order Facebook video views in India with transparent pricing, public-link submission, service details and dashboard tracking.",
    audiences: ["Video creators", "Facebook pages", "Local businesses", "Social media teams"],
    related: ["buy-facebook-followers-india", "buy-facebook-likes-india", "buy-instagram-views-india"],
  },
  "buy-facebook-shares-india": {
    slug: "buy-facebook-shares-india",
    serviceCode: "facebook-shares",
    platform: "Facebook",
    platformKey: "facebook",
    serviceName: "Facebook Shares",
    unitName: "shares",
    destination: "exact publicly accessible Facebook post URL (not a profile, Page homepage or private group link)",
    delivery: "1–5 days",
    refill: "Refill eligible",
    packageService: "shares",
    intro: "Support the visible distribution of an eligible public Facebook post with a clear, trackable shares campaign for India.",
    overview: "Confirm your Facebook post is publicly accessible, copy its exact post permalink (not a profile or Page homepage), and review active service eligibility, quantity, live INR total and delivery terms before ordering. Keep the post public while processing.",
    value: "Share counts show an action, not verified reach, referrals, authentic interest or business results. Compare post-level shares with independent Facebook insights and actual referral traffic when evaluating a campaign.",
    safety: "Only the public Facebook post URL is required. SocialRUSH never asks for your Facebook password, login, OTP or private account access.",
    deliveryCopy: "Delivery speed, eligibility and refill coverage depend on the active service terms and post availability, not a universal guarantee. Keep the exact submitted post public and accessible; sharing activity does not promise organic distribution or Indian accounts.",
    metaDescription: "Buy Facebook shares in India: check eligible public post links, live INR pricing, delivery and refill terms. No password needed; reach is not guaranteed.",
    ogDescription: "Order Facebook shares in India with live INR pricing, public post-link ordering, delivery details and SocialRUSH dashboard tracking.",
    audiences: ["Creators", "Facebook pages", "Local businesses", "Social media teams"],
    related: ["buy-facebook-followers-india", "buy-facebook-likes-india", "buy-facebook-views-india", "buy-facebook-group-members-india"],
  },
  "buy-telegram-members-india": {
    slug: "buy-telegram-members-india",
    serviceCode: "telegram-members",
    platform: "Telegram",
    platformKey: "telegram",
    serviceName: "Telegram Members",
    unitName: "members",
    destination: "public Telegram channel or group link",
    delivery: "1–7 days",
    refill: "Available on eligible packages",
    packageService: "members",
    intro:
      "Build a stronger visible Telegram community with a structured member campaign for Indian channels, groups, educators, and brands.",
    overview:
      "Choose the intended Telegram channel or group, verify that its public link is accessible, review the selected quantity and live INR total, then track delivery through SocialRUSH. India-focused search does not guarantee India-based members.",
    value:
      "A displayed member count alone does not prove an active community, meaningful discussion, audience trust or business results. Compare genuine participation and community feedback separately from promotional member activity.",
    safety:
      "Never share a Telegram password, login code or admin credentials. Submit only an eligible publicly accessible channel or group URL and keep the destination accessible during delivery.",
    deliveryCopy:
      "Member delivery depends on package size and invite availability. Eligible refill details are displayed before you place the order.",
    metaDescription:
      "Buy Telegram members in India with live INR pricing, public channel or group-link ordering, dashboard tracking and no password required.",
    ogDescription:
      "Grow visible Telegram channel or group membership with clear packages and tracked SocialRUSH delivery in India.",
    audiences: ["Channel owners", "Educators", "Communities", "Digital brands"],
    related: [
      "buy-instagram-followers-india",
      "buy-youtube-subscribers-india",
      "buy-twitter-followers-india",
    ],
  },
  "buy-tiktok-followers-india": {
    slug: "buy-tiktok-followers-india",
    serviceCode: "tiktok-followers",
    platform: "TikTok",
    platformKey: "tiktok",
    serviceName: "TikTok Followers",
    unitName: "followers",
    destination: "public TikTok profile link",
    delivery: "1–7 days",
    refill: "Available where listed",
    packageService: "followers",
    intro:
      "Support visible TikTok profile credibility with a follower campaign designed for creators, artists, brands, and Indian businesses.",
    overview:
      "Choose a suitable campaign quantity, paste your public TikTok profile URL, review the total, and follow delivery from your dashboard.",
    value:
      "Displayed follower totals alone do not prove genuine interest, authentic engagement, qualified reach or sales. Check service availability and applicable platform restrictions before ordering.",
    safety:
      "Your TikTok password is never required. Keep the submitted profile public and avoid changing its username during campaign delivery.",
    deliveryCopy:
      "Follower delivery begins after confirmation and varies by quantity and profile availability. Review current refill terms before ordering.",
    metaDescription:
      "Buy TikTok followers in India with live INR pricing, public-profile ordering, no password required, tracked delivery and eligible refill support.",
    ogDescription:
      "Build visible TikTok profile credibility with clear follower packages and no-password SocialRUSH ordering in India.",
    audiences: ["Short-form creators", "Artists", "Product brands", "Agencies"],
    related: [
      "buy-instagram-followers-india",
      "buy-youtube-subscribers-india",
      "buy-twitter-followers-india",
    ],
  },
};

export function getIndiaServicePage(slug: IndiaServiceSlug) {
  return { ...pages[slug], price: SERVICE_PRICES[pages[slug].serviceCode] };
}

export function getIndiaServiceMetadata(
  slug: IndiaServiceSlug,
  canonicalPath = getCanonicalIndiaServicePath(slug),
): Metadata {
  const page = getIndiaServicePage(slug);
  const url = new URL(canonicalPath, `${SEO_SITE_URL}/`).toString();
  const linkedInTitle =
    slug === "buy-linkedin-followers-india"
      ? "Buy LinkedIn Followers India | Live INR Packages | SocialRUSH"
      : slug === "buy-linkedin-likes-india"
        ? "Buy LinkedIn Likes India | Live INR Plans | SocialRUSH"
      : null;
  const instagramLikesTitle =
    slug === "buy-instagram-likes-india"
      ? "Buy Instagram Likes in India | INR Pricing | SocialRUSH"
      : null;
  const instagramEngagementTitle =
    slug === "buy-instagram-views-india"
      ? "Buy Instagram Views India | Live INR Plans | SocialRUSH"
      : slug === "buy-instagram-comments-india"
        ? "Buy Instagram Comments India | Posts & Reels | SocialRUSH"
        : slug === "buy-instagram-saves-india"
          ? "Buy Instagram Saves in India | INR Pricing | SocialRUSH"
          : slug === "buy-instagram-shares-india"
            ? "Buy Instagram Shares in India | INR Pricing | SocialRUSH"
            : null;
  const facebookTitle =
    slug === "buy-facebook-group-members-india"
      ? "Buy Facebook Group Members India | Pricing | SocialRUSH"
      : slug === "buy-facebook-followers-india"
      ? "Buy Facebook Followers India | Plans in ₹ | SocialRUSH"
      : slug === "buy-facebook-likes-india"
        ? "Buy Facebook Likes India | Live INR Plans | SocialRUSH"
        : slug === "buy-facebook-views-india"
          ? "Buy Facebook Views India | Live INR Plans | SocialRUSH"
          : slug === "buy-facebook-shares-india"
            ? "Buy Facebook Shares India | Live INR Plans | SocialRUSH"
      : `Buy ${page.serviceName} India | SocialRUSH`;
  const youtubeTitle = slug === "buy-youtube-subscribers-india"
    ? "Buy YouTube Subscribers India | Live INR Plans | SocialRUSH"
    : slug === "buy-youtube-views-india"
      ? "Buy YouTube Views India | Live INR Plans | SocialRUSH"
      : slug === "buy-youtube-likes-india"
        ? "Buy YouTube Likes India | Live INR Plans | SocialRUSH"
        : slug === "buy-youtube-comments-india"
          ? "Buy YouTube Comments India | Videos & Shorts | SocialRUSH"
          : `Buy ${page.serviceName} India | SocialRUSH`;
  const twitterTitle =
    slug === "buy-twitter-followers-india"
      ? "Buy Twitter Followers India (X) | INR Plans | SocialRUSH"
      : null;

  
  const telegramTitle = slug === "buy-telegram-members-india"
    ? "Buy Telegram Members India | Live INR Plans | SocialRUSH"
    : null;
  const title = telegramTitle ?? instagramLikesTitle ?? instagramEngagementTitle ?? linkedInTitle ?? twitterTitle ?? (slug.startsWith("buy-youtube-") ? youtubeTitle : facebookTitle);
  const tiktokTitle = slug === "buy-tiktok-followers-india" ? "Buy TikTok Followers in India | Live ₹ Plans | SocialRUSH" : title;
  return {
    title: { absolute: tiktokTitle }, 
    description: slug === "buy-twitter-followers-india"
      ? "Buy Twitter/X followers in India with live INR pricing, public-profile ordering and clear delivery and refill details. Check your total before checkout."
      : slug === "buy-linkedin-followers-india"
      ? "Buy LinkedIn followers in India for eligible public profiles. Check company-page support, INR pricing, delivery and refill terms before ordering. No password needed."
      : slug === "buy-instagram-likes-india"
        ? "Buy Instagram likes in India for public posts and Reels. Compare INR prices, delivery and refill eligibility, and review the total before checkout. No password."
        : slug === "buy-instagram-views-india"
        ? "Buy Instagram views in India with live INR pricing when available. Compare public Reel link requirements, delivery and refill terms before checkout."
        : slug === "buy-instagram-comments-india"
          ? "Buy Instagram comments for public posts or Reels in India. Compare INR totals, public links, 1–24 hour delivery estimate and no-refill terms."
          : slug === "buy-instagram-saves-india"
            ? "Buy Instagram saves for public posts or Reels in India. Compare live INR rates, quantity limits and delivery terms before checkout. No password needed."
            : slug === "buy-instagram-shares-india"
              ? "Buy Instagram shares in India for eligible public posts or Reels. Review live INR pricing, link requirements and delivery terms before checkout."
              : slug === "buy-youtube-comments-india"
                ? "Buy YouTube comments in India for public videos or Shorts. Compare quantity limits, live INR pricing and delivery terms before placing your order."
                : slug === "buy-facebook-group-members-india"
                  ? page.metaDescription
                  : buildCommercialSearchDescription({ serviceName: page.serviceName, destination: page.destination }),
    keywords: [
      `Buy ${page.serviceName} India`,
      `Buy ${page.serviceName}`,
      `${page.serviceName} India`,
      ...paymentIntentKeywords(page.serviceName),
      ...deliveryRefillIntentKeywords(page.serviceName),
      ...orderRequirementIntentKeywords(page.serviceName),
      ...(slug === "buy-linkedin-followers-india"
        ? ["LinkedIn followers price India", "LinkedIn follower packages", "Buy followers on LinkedIn"]
        : []),
      ...(slug === "buy-tiktok-followers-india" ? ["TikTok followers price India", "TikTok profile followers", "TikTok followers service"] : []),
      `${page.platform} growth service India`,
      `No password ${page.serviceName}`,
      "Social media growth service India",
    ],
    robots: { index: true, follow: true },
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName: "SocialRUSH",
      title: tiktokTitle,
      description: page.ogDescription,
      url,
      images: [
        {
          url: `${SEO_SITE_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `${page.serviceName} service in India`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: tiktokTitle,
      description: page.ogDescription,
      images: [`${SEO_SITE_URL}/og-image.png`],
    },
  };
}

export function getIndiaServiceFaqs(slug: IndiaServiceSlug) {
  const page = getIndiaServicePage(slug);
  if (slug === "buy-linkedin-followers-india") return [...linkedInFollowersFaqs];
  if (slug === "buy-facebook-views-india") return [
    { question: "Which Facebook video link is eligible?", answer: "Submit the exact publicly accessible Facebook video permalink or eligible public video-post URL. A Page homepage, private post or unrelated profile link is not a valid substitute." },
    { question: "Do Facebook video views guarantee organic reach?", answer: "No. Displayed views do not verify unique reach, meaningful watch time, authentic interest, website visits or sales. Review independent video insights." },
    { question: "How much do Facebook views cost in India?", answer: "Review the current service rate, supported quantity and INR total in the order builder before paying. Example prices may be outdated." },
    { question: "What determines delivery time and refill support?", answer: "The active service terms, selected quantity and video accessibility govern delivery and refill eligibility. No universal delivery deadline is guaranteed." },
    { question: "Will all views come from Indian accounts?", answer: "India-origin viewers are not guaranteed unless the chosen live service specifically supports that targeting." },
    { question: "Do I need to provide a Facebook password?", answer: "No. Submit only the eligible public video link. Never share passwords, recovery codes or OTPs." },
  ];
  if (slug === "buy-facebook-shares-india") return [
    { question: "Which Facebook link should I submit for shares?", answer: "Submit the exact publicly accessible Facebook post permalink, not a Page homepage, profile link or private group. Check active service eligibility before ordering." },
    { question: "Will Facebook shares guarantee more reach or website visitors?", answer: "No. A visible share count does not verify distribution, genuine interest, referrals, conversions or algorithmic recommendations." },
    { question: "How much do Facebook shares cost in India?", answer: "Check the active service rate, quantity limits and INR total at checkout. Do not rely on a fixed example price." },
    { question: "How long does Facebook share delivery take?", answer: "Delivery timing depends on the active service terms, quantity and whether the post remains publicly accessible. No universal timeframe is guaranteed." },
    { question: "Do shares come from Indian Facebook accounts?", answer: "Indian account origin is not guaranteed unless the specific live service explicitly provides and supports that targeting." },
    { question: "Is a Facebook password needed?", answer: "No. Only the eligible public post link is required. Never share passwords, login details or one-time codes." },
  ];

  if (slug === "buy-twitter-followers-india") {
    return [
      { question: "How can I buy Twitter/X followers in India?", answer: "Choose a Twitter/X follower package, provide the correct public profile link, review the current INR total, and complete the order through your SocialRUSH account." },
      { question: "How much do Twitter/X followers cost in India?", answer: "The current rate and exact INR total depend on the selected quantity and service availability. SocialRUSH shows the live price before you confirm the order." },
      { question: "Should I provide a Twitter or X profile link?", answer: "Either a public twitter.com or x.com profile link can be used when it points to the correct public profile. Keep the profile public and avoid changing the handle while delivery is active." },
      { question: "Is my Twitter/X password required?", answer: "No. SocialRUSH only needs the public profile link required for the campaign. Never share a password, recovery code, OTP, or private account access." },
      { question: "How long does Twitter/X follower delivery take?", answer: "The current delivery estimate is shown with the selected service before confirmation. Timing can vary with quantity, profile availability, and platform conditions." },
      { question: "Can I track my Twitter/X follower order?", answer: "Yes. Your SocialRUSH dashboard keeps the order status, quantity, charge, and campaign record together after you place an order." },
      { question: "What if followers drop after delivery?", answer: "Review the live service details before ordering. Refill or support coverage applies only where it is listed for the selected campaign." },
      { question: "Does buying Twitter/X followers guarantee engagement or reach?", answer: "No. A follower campaign does not guarantee engagement, organic reach, trending posts, leads, sales, or platform rankings. Continue to use useful content and responsible account management." },
    ];
  }
  const related = getIndiaServicePage(page.related[0]);
  return [
    {
      question: `Can I buy ${page.serviceName} in India?`,
      answer: `Yes. SocialRUSH offers ${page.serviceName.toLowerCase()} campaigns priced in INR for Indian creators, businesses, agencies, and brands.`,
    },
    {
      question: `Do I need to share my ${page.platform} password?`,
      answer: `No. You only submit the ${page.destination}. SocialRUSH never needs your ${page.platform} password or private account access.`,
    },
    {
      question: `What is the price for ${page.serviceName}?`,
      answer: `The current rate is ₹${page.price.toLocaleString("en-IN")} per 1,000 ${page.unitName}. Your exact total depends on the selected quantity and is shown before confirmation.`,
    },
    {
      question: "How long does delivery take?",
      answer: `The current estimate is ${page.delivery}. Actual timing can vary with campaign size, destination availability, and platform conditions.`,
    },
    {
      question: "Is refill support available?",
      answer: `${page.refill}. Review the selected service details before ordering to confirm eligibility and coverage.`,
    },
    {
      question: `Can businesses use ${page.serviceName}?`,
      answer: `Yes. Businesses can use this campaign to support visible ${page.platform} presentation while continuing their normal content and customer-acquisition work.`,
    },
    {
      question: `Can creators use this ${page.platform} service?`,
      answer: `Yes. Creators can choose a campaign size aligned with their publishing plan, profile goals, and available budget.`,
    },
    {
      question: "What should I do if delivery is delayed?",
      answer:
        "Check that the submitted destination is still public, then contact SocialRUSH support with your order ID if processing exceeds the displayed estimate.",
    },
    {
      question: `Can I also order ${related.serviceName}?`,
      answer: `Yes. SocialRUSH also offers ${related.serviceName.toLowerCase()} and other supported social media growth services with separate pricing and delivery terms.`,
    },
    {
      question: "How do I contact SocialRUSH support?",
      answer:
        "Use the contact page, your account support area, or the SocialRUSH WhatsApp help link before or after ordering.",
    },
  ];
}
