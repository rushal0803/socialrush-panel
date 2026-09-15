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
    audience: "Agencies", eyebrow: "FOR AGENCIES & RESELLERS", headline: "Turn repeat client work into", emphasis: "a cleaner operating system.",
    description: "Plan multi-client social campaigns from one workflow: manage clients, prepare bulk jobs, review current catalog pricing, open each verified checkout and keep repeat campaign activity organised in the SocialRUSH dashboard.",
    primaryCta: { label: "Open Agency Workspace", href: "/dashboard/reseller" },
    valuePoints: ["Client & campaign workspace", "Bulk job planner", "Current catalog pricing"],
    useCases: [
      { title: "Repeat client campaigns", text: "Keep recurring client requirements connected to a repeatable workspace instead of rebuilding the process from scratch for every order." },
      { title: "Bulk campaign planning", text: "Prepare several client jobs in the bulk planner, review current estimates and open the normal order flow for each valid destination." },
      { title: "Higher-value requirements", text: "Use campaign stacks or the Bulk / agency enquiry path for larger, recurring or multi-platform requirements that need planning before checkout." },
    ],
    paths: [
      { platform: "Workspace", title: "Agency / Reseller Hub", text: "Manage the repeat-work workflow, client portfolio signals and campaign operations from the authenticated dashboard.", href: "/dashboard/reseller" },
      { platform: "Bulk", title: "Bulk Job Planner", text: "Prepare multiple client jobs and review current catalog estimates before opening each verified checkout.", href: "/dashboard/reseller/bulk-planner" },
      { platform: "Campaigns", title: "Campaign Stacks", text: "Review broader multi-service campaign combinations using current live catalog pricing without hidden bundle discounts.", href: "/dashboard/campaign-stacks" },
      { platform: "Support", title: "Bulk / Agency Enquiry", text: "Discuss a larger, recurring or unusual requirement with support before placing orders.", href: "/contact#support-form" },
    ],
    faqs: [
      { question: "Does SocialRUSH have a separate agency or reseller workspace?", answer: "Yes. Signed-in customers can use the Agency / Reseller Hub to manage repeat-client workflows, access the bulk planner and move into campaign or order tools from one place." },
      { question: "Can we plan several client jobs at once?", answer: "Yes. The Bulk Job Planner lets you prepare multiple client jobs and review current catalog estimates. It does not auto-charge or auto-create all orders; each job still opens the normal verified order and payment flow." },
      { question: "Do agencies receive automatic wholesale discounts?", answer: "No automatic wholesale discount is promised on this page. Use the current live SocialRUSH catalog price as your fulfillment-cost input and keep your own strategy, service fee or client margin separate. Contact support for larger requirements that need review." },
      { question: "Can we build multi-service campaign plans?", answer: "Yes. Campaign Stacks can help you review a broader campaign across supported services. Each service still follows its current live price, eligibility, public-link requirement and normal checkout." },
      { question: "Do agencies need client account credentials?", answer: "No. Eligible services use the relevant public profile, page, post, video or channel link. Never share passwords, OTPs, recovery codes or unnecessary private account access." },
      { question: "How do we discuss a larger recurring requirement?", answer: "Use the Bulk / agency enquiry path on the Contact page so support can review the requirement before you place orders." },
    ],
  },
};
