export type AudienceKey = "brands" | "creators" | "agencies";

export type AudiencePageConfig = {
  audience: string;
  eyebrow: string;
  headline: string;
  emphasis: string;
  description: string;
  primaryCta: { label: string; href: string };
  valuePoints: readonly string[];
  useCases: readonly { title: string; text: string }[];
  paths: readonly { platform: string; title: string; text: string; href: string }[];
  faqs: readonly { question: string; answer: string }[];
};

export const audiencePages: Record<AudienceKey, AudiencePageConfig> = {
  brands: {
    audience: "Brands", eyebrow: "FOR BRANDS & BUSINESSES", headline: "Plan a sharper social", emphasis: "campaign path.",
    description: "Explore relevant platform services, review the current details, and coordinate larger or recurring social requirements from one clear starting point.",
    primaryCta: { label: "Explore Services", href: "/services" },
    valuePoints: ["Current service details", "Public-link ordering", "Dashboard order tracking"],
    useCases: [
      { title: "Campaign launches", text: "Build a focused service path around a launch and review each option before you move forward." },
      { title: "Product moments", text: "Compare platform-specific services when a product, promotion or announcement needs coordinated attention." },
      { title: "Recurring social needs", text: "Use the catalog as a repeatable starting point, then contact support for larger or multi-platform requirements." },
    ],
    paths: [
      { platform: "Instagram", title: "Instagram services", text: "Explore profile, post and reel-related service options.", href: "/services?platform=instagram" },
      { platform: "YouTube", title: "YouTube services", text: "Review channel and video service details before ordering.", href: "/services?platform=youtube" },
      { platform: "LinkedIn", title: "LinkedIn services", text: "Find current options relevant to professional social campaigns.", href: "/services?platform=linkedin" },
      { platform: "Multi-platform", title: "Custom campaign", text: "Discuss larger or coordinated requirements with support.", href: "/contact#support-form" },
    ],
    faqs: [
      { question: "Can a brand use more than one platform?", answer: "Yes. Start by reviewing the relevant platform services. For a larger or multi-platform requirement, use the existing Bulk / agency enquiry path on the Contact page." },
      { question: "Can we review service information before ordering?", answer: "Yes. Each service path lets you review the current details, including the information shown before the existing order flow." },
      { question: "Do brands need to share account access?", answer: "No. SocialRUSH uses public-link ordering for the public destination requested by a selected service. Do not share passwords, OTPs or recovery codes." },
      { question: "How can we follow an order?", answer: "Submitted orders can be reviewed from the SocialRUSH dashboard, where order progress and history are available." },
    ],
  },
  creators: {
    audience: "Creators", eyebrow: "FOR CREATORS", headline: "Keep your focus on", emphasis: "the content.",
    description: "Choose a platform, review service-specific details, and use a clear public-link order flow while you keep creating for your audience.",
    primaryCta: { label: "Find Your Platform", href: "/services" },
    valuePoints: ["No passwords or OTPs", "Service-specific details", "Dashboard tracking"],
    useCases: [
      { title: "Content releases", text: "Find the current service path that fits a public profile, post, video or channel you are sharing." },
      { title: "Channel consistency", text: "Review service details first, then place an order with the relevant public destination link." },
      { title: "A simpler workflow", text: "Keep order records and progress in your dashboard instead of losing context across conversations." },
    ],
    paths: [
      { platform: "Instagram", title: "Instagram services", text: "Explore services for public profiles, posts and reels.", href: "/services?platform=instagram" },
      { platform: "YouTube", title: "YouTube services", text: "Review available channel and video options.", href: "/services?platform=youtube" },
      { platform: "TikTok", title: "TikTok services", text: "Choose from current public-link service details.", href: "/services?platform=tiktok" },
      { platform: "X / Twitter", title: "X / Twitter services", text: "Explore the catalog for your public profile or posts.", href: "/services?platform=x" },
    ],
    faqs: [
      { question: "Do I need to share my password?", answer: "No. SocialRUSH uses public-link ordering. Never share passwords, OTPs or recovery codes." },
      { question: "Which creator platforms can I explore?", answer: "This page links to Instagram, YouTube, TikTok and X / Twitter services. The wider catalog includes other supported platforms too." },
      { question: "Where can I check service details?", answer: "Open a service from the catalog to review its current requirements and information before entering the existing order flow." },
      { question: "Can I track my order?", answer: "Yes. Order progress and history are available through the SocialRUSH dashboard." },
    ],
  },
  agencies: {
    audience: "Agencies", eyebrow: "FOR AGENCIES", headline: "A clearer workflow for", emphasis: "repeat campaigns.",
    description: "Use SocialRUSH’s multi-platform catalog, packages, public pricing and dashboard to review services and organize repeat client campaign requirements.",
    primaryCta: { label: "Browse All Services", href: "/services" },
    valuePoints: ["Multi-platform catalog", "Public pricing", "Order history & wallet"],
    useCases: [
      { title: "Repeat client work", text: "Return to a familiar catalog and order history when planning requirements across ongoing client campaigns." },
      { title: "Platform planning", text: "Compare current service information across platforms before selecting the right service path." },
      { title: "Larger requirements", text: "Use the existing Bulk / agency enquiry support path when a requirement needs a conversation." },
    ],
    paths: [
      { platform: "Catalog", title: "All services", text: "Browse current services across supported platforms.", href: "/services" },
      { platform: "Packages", title: "Packages", text: "Compare the available bundled options.", href: "/packages" },
      { platform: "Pricing", title: "Public pricing", text: "Review current pricing information before checkout.", href: "/pricing" },
      { platform: "Support", title: "Bulk / agency enquiry", text: "Discuss a larger or recurring requirement with support.", href: "/contact#support-form" },
    ],
    faqs: [
      { question: "Can an agency review services across platforms?", answer: "Yes. The SocialRUSH catalog groups current services by supported platform, with packages and pricing also available to review." },
      { question: "Where can we review previous orders?", answer: "Signed-in customers can use the dashboard to access order history and wallet information." },
      { question: "How do we discuss a larger requirement?", answer: "Use the existing Contact page and select Bulk / agency enquiry so support can review the request." },
      { question: "Do agencies need account credentials for public links?", answer: "No. Services use the relevant public destination requested in the order flow. Never share passwords, OTPs or recovery codes." },
    ],
  },
};
