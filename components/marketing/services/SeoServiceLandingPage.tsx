import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  Headphones,
  Link2,
  ListChecks,
  Lightbulb,
  LockKeyhole,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
  Users,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import PlatformIcon from "@/components/PlatformIcon";
import PublicShell from "@/components/marketing/PublicShell";
import ServiceOrderStickyCta from "@/components/marketing/services/ServiceOrderStickyCta";
import {
  getSeoServiceFaqs,
  getSeoServicePage,
  getSeoServiceStructuredData,
  seoServiceSlugs,
  type SeoServiceSlug,
} from "@/lib/seo/service-landing-pages";

const trustItems = ["Secure checkout", "Public link only", "Order tracking", "WhatsApp help"];

const steps: Array<{ title: string; description: string; icon: LucideIcon }> = [
  { title: "Select package", description: "Compare the available campaign sizes and current prices.", icon: PackageCheck },
  { title: "Enter your link", description: "Provide the public profile, post, video or channel URL.", icon: Link2 },
  { title: "Place order", description: "Review the campaign details and confirm through secure checkout.", icon: WalletCards },
  { title: "Track delivery", description: "Follow the order status from your SocialRUSH dashboard.", icon: BarChart3 },
];

const reasons: Array<{ title: string; description: string; icon: LucideIcon }> = [
  { title: "Transparent pricing", description: "See the current rate and calculated campaign total before checkout.", icon: ListChecks },
  { title: "Secure account flow", description: "Orders and wallet activity are managed within your authenticated account.", icon: LockKeyhole },
  { title: "Clear delivery guidance", description: "Review estimated timing and service requirements before ordering.", icon: Clock3 },
  { title: "Refill information", description: "Eligible refill terms are displayed with the selected campaign service.", icon: RefreshCw },
  { title: "Public-link safety", description: "SocialRUSH never needs your social media account password.", icon: ShieldCheck },
  { title: "Support when needed", description: "Use account support or WhatsApp if you need help choosing a campaign.", icon: Headphones },
];

const audiencesByPlatform: Record<string, string[]> = {
  instagram: [
    "Creators building a recognizable niche",
    "Influencers preparing for brand collaborations",
    "Local businesses strengthening profile credibility",
    "Agencies managing client campaign records",
  ],
  youtube: [
    "New channels establishing an initial audience",
    "Educators and experts publishing useful series",
    "Brands supporting product and campaign videos",
    "Creators testing repeatable content formats",
  ],
  linkedin: [
    "Founders developing professional authority",
    "Consultants improving profile presentation",
    "Company pages building category visibility",
    "B2B teams supporting thought-leadership content",
  ],
  x: [
    "Founders sharing public industry commentary",
    "Creators building topic-led communities",
    "Brands strengthening launch visibility",
    "Public profiles developing a clearer presence",
  ],
  facebook: [
    "Local businesses improving page credibility",
    "Community pages building a visible audience",
    "Creators distributing public video content",
    "Brands supporting ongoing page activity",
  ],
  telegram: [
    "Public channel owners building community presence",
    "Educators organizing topic-based communities",
    "Brands supporting announcement channels",
    "Community managers tracking growth campaigns",
  ],
};

function getDeliveryExplanation(serviceCode: string, destination: string) {
  if (/followers|subscribers|members/.test(serviceCode)) {
    return `This campaign supports public profile or channel discovery. After you submit the ${destination}, the order enters the tracked delivery queue and progresses according to the estimate shown before checkout. Keep the destination public and avoid changing its username while delivery is active.`;
  }
  return `This campaign is attached to one specific piece of public content. Submit the exact ${destination}, review the quantity and total, and keep that content available while the tracked order is processed. Delivery timing remains visible before confirmation.`;
}

function getGrowthTips(platform: string, serviceCode: string) {
  const contentCampaign = /likes|views/.test(serviceCode);
  const platformTips: Record<string, string[]> = {
    instagram: contentCampaign
      ? ["Use a clear reel cover or post thumbnail.", "Strengthen the first line of the caption.", "Pin a useful comment that guides new visitors."]
      : ["Make your bio explain who the account helps.", "Pin three posts that represent your best work.", "Keep highlights current before inviting new profile visits."],
    youtube: contentCampaign
      ? ["Make the title promise one clear outcome.", "Remove slow introductions from the opening seconds.", "Connect the video to a relevant playlist or end screen."]
      : ["Clarify the channel topic in the banner and About section.", "Publish related videos as a series.", "Give new subscribers a clear next video to watch."],
    linkedin: ["Use a headline that states your expertise clearly.", "Feature one strong case study or proof point.", "Publish useful opinions instead of generic motivation."],
    x: ["Keep your bio focused on one or two topics.", "Pin a post that introduces your best work.", "Join relevant conversations with useful replies."],
    facebook: ["Complete page contact and business details.", "Keep recent public posts relevant to your audience.", "Use consistent visuals across page and post campaigns."],
    telegram: ["Write a clear channel description and purpose.", "Pin a welcome message with useful navigation.", "Maintain a consistent posting rhythm after growth campaigns."],
  };
  return platformTips[platform] ?? [
    "Prepare the destination before starting delivery.",
    "Keep public information clear and current.",
    "Track results alongside your normal content activity.",
  ];
}

function getCommonMistakes(destination: string) {
  return [
    `Submitting the wrong or private ${destination}.`,
    "Changing the username, handle, or destination URL during delivery.",
    "Placing overlapping orders for the same destination before the first finishes.",
    "Judging the campaign without improving the profile or content new visitors will see.",
  ];
}

function jsonLd(value: object) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export default function SeoServiceLandingPage({ slug }: { slug: SeoServiceSlug }) {
  const page = getSeoServicePage(slug);
  const faqs = getSeoServiceFaqs(slug);
  const schemas = getSeoServiceStructuredData(slug);
  const packagePlatform = page.service.platform === "x" ? "X" : page.platform.label;
  const packageService = page.service.code.split("-").pop() || "";
  const packagesHref = `/packages?platform=${encodeURIComponent(packagePlatform)}&service=${encodeURIComponent(packageService)}`;
  const whatsappHref =
    "https://wa.me/918860330771?text=Hi%20SocialRUSH%2C%20I%20need%20help%20choosing%20a%20social%20media%20growth%20service";
  const formattedPrice = page.confirmedPrice === null ? null : new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(page.confirmedPrice);
  const audiences = audiencesByPlatform[page.service.platform] ?? audiencesByPlatform.instagram;
  const growthTips = getGrowthTips(page.service.platform, page.service.code);
  const commonMistakes = getCommonMistakes(page.destination);
  const deliveryExplanation = getDeliveryExplanation(page.service.code, page.destination);
  const allServiceLinks = seoServiceSlugs
    .filter((serviceSlug) => serviceSlug !== slug)
    .map((serviceSlug) => {
      const servicePage = getSeoServicePage(serviceSlug);
      return {
        href:
          servicePage.slug === "instagram-followers"
            ? "/buy-instagram-followers-india"
            : `/${servicePage.slug}`,
        label: servicePage.displayName,
        platform: servicePage.platform.icon,
      };
    })
    .sort((left, right) => Number(right.platform === page.service.platform) - Number(left.platform === page.service.platform))
    .slice(0, 5);

  return (
    <PublicShell tone="light3d">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schemas.breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schemas.faq) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schemas.service) }} />

      <section className="relative overflow-hidden px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8 lg:pb-24">
        <div className="pointer-events-none absolute -left-24 top-6 h-72 w-72 rounded-full bg-orange-200/45 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-24 h-80 w-80 rounded-full bg-amber-200/50 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.18fr_.82fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/75 px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#111827] shadow-sm backdrop-blur-xl">
              <span className={`grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br ${page.platform.gradient} text-white`}>
                <PlatformIcon platform={page.platform.icon} className="h-4 w-4" />
              </span>
              {page.platform.label} growth service
            </div>

            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.08] tracking-[-0.04em] text-[#0B0B0F] sm:text-5xl lg:text-6xl">
              {page.keyword}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#111827] sm:text-lg">{page.intro}</p>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#111827]">{page.overview}</p>

            <div className="mt-7 flex flex-wrap gap-2">
              {trustItems.map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5 rounded-full border border-[#FFF8F1] bg-white/75 px-3 py-2 text-[11px] font-bold text-[#FF9F00] shadow-sm">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 min-[420px]:flex-row">
              <Link href={packagesHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-6 py-3 text-sm font-black text-white shadow-[0_14px_30px_-14px_rgba(255, 196, 0, .65)] transition hover:-translate-y-0.5">
                View Packages <ArrowRight className="h-4 w-4" />
              </Link>
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-emerald-200 bg-white/80 px-6 py-3 text-sm font-black text-emerald-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50">
                Need help? Chat on WhatsApp
              </a>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-white/90 bg-white/78 p-5 shadow-[0_30px_70px_-35px_rgba(255, 159, 0, .5)] backdrop-blur-2xl sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <span className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${page.platform.gradient} text-white shadow-lg`}>
                <PlatformIcon platform={page.platform.icon} className="h-7 w-7" />
              </span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-emerald-700">
                Available
              </span>
            </div>
            <p className="mt-6 text-[10px] font-black uppercase tracking-[0.15em] text-[#111827]">Current catalog rate</p>
            {formattedPrice ? (
              <p className="mt-2 text-3xl font-black text-[#0B0B0F]">
                {formattedPrice} <span className="text-sm text-[#111827]">per 1K</span>
              </p>
            ) : (
              <p className="mt-2 text-2xl font-black text-[#0B0B0F]">View latest price</p>
            )}
            <p className="mt-3 text-xs leading-6 text-[#111827]">
              {formattedPrice
                ? "Your exact total is calculated from the quantity selected during checkout."
                : "Open Packages to review the latest confirmed rate and exact checkout total."}
            </p>
            <dl className="mt-6 grid gap-3 border-t border-[#FFF8F1] pt-5 text-xs">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-[#111827]">Delivery estimate</dt>
                <dd className="text-right font-black text-[#0B0B0F]">{page.service.deliveryTime}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-[#111827]">Refill support</dt>
                <dd className="text-right font-black text-[#0B0B0F]">{page.service.refillPolicy}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-[#111827]">Required</dt>
                <dd className="max-w-[60%] text-right font-black text-[#0B0B0F]">{page.destination}</dd>
              </div>
            </dl>
            <Link href={packagesHref} className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-[#FFF3E0] bg-[#FFF8F1] px-5 py-3 text-sm font-black text-[#FF9F00] transition hover:border-[#FF9F00] hover:bg-white">
              View latest price and packages
            </Link>
          </aside>
        </div>
      </section>

      <section className="bg-white/65 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">Campaign benefits</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0B0B0F]">A clear way to support your {page.platform.label} presence</h2>
          </div>
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {page.benefits.map((benefit) => (
              <article key={benefit.title} className="rounded-3xl border border-[#FFF8F1] bg-white p-5 shadow-[0_18px_42px_-30px_rgba(255, 159, 0, .45)] sm:p-6">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                <h3 className="mt-4 text-base font-black text-[#0B0B0F]">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#111827]">{benefit.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
          <article className="rounded-[2rem] border border-white/90 bg-white/78 p-6 shadow-[0_26px_60px_-38px_rgba(255, 159, 0, .5)] backdrop-blur-2xl sm:p-8">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#FFF8F1] to-[#FFF8F1] text-[#FF9F00]">
              <Users className="h-6 w-6" />
            </span>
            <p className="mt-6 text-xs font-black uppercase tracking-[0.16em] text-orange-600">Who this service is for</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0B0B0F]">
              Built for practical {page.platform.label} growth goals
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {audiences.map((audience) => (
                <div key={audience} className="flex items-start gap-3 rounded-2xl border border-[#FFF8F1] bg-white/85 p-4 text-sm font-bold leading-6 text-[#FF9F00]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  {audience}
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[2rem] border border-white/90 bg-[linear-gradient(145deg,#0B0B0F,#111827_55%,#0B0B0F)] p-6 text-white shadow-[0_30px_70px_-38px_rgba(255, 159, 0, .72)] sm:p-8">
            <span className="grid h-12 w-12 place-items-center rounded-2xl border border-white/15 bg-white/10 text-amber-200">
              <BarChart3 className="h-6 w-6" />
            </span>
            <p className="mt-6 text-xs font-black uppercase tracking-[0.16em] text-amber-200">How delivery works</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">A visible process, not a mystery order</h2>
            <p className="mt-5 text-sm leading-8 text-orange-100/80">{deliveryExplanation}</p>
            <div className="mt-6 rounded-2xl border border-white/15 bg-white/[0.07] p-4">
              <p className="flex items-center gap-2 text-xs font-black text-white">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                Safe ordering explanation
              </p>
              <p className="mt-2 text-xs leading-6 text-orange-100/75">
                SocialRUSH needs only the public destination shown above. Never submit a password, recovery code, private key, or account login.
              </p>
            </div>
          </article>
        </div>
      </section>

      <section className="bg-white/55 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">Before you order</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0B0B0F]">
                Avoid the mistakes that delay otherwise simple campaigns
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#111827]">
                Clear inputs matter more than rushed checkout. A correct public destination and stable account details help the campaign follow its expected workflow.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {commonMistakes.map((mistake, index) => (
                <article key={mistake} className="rounded-2xl border border-amber-200/80 bg-amber-50/75 p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700">
                      <AlertTriangle className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.12em] text-amber-700">Mistake {index + 1}</p>
                      <h3 className="mt-1 text-sm font-black leading-6 text-amber-950">{mistake}</h3>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-10 rounded-[2rem] border border-white/90 bg-white/80 p-6 shadow-[0_24px_58px_-38px_rgba(255, 159, 0, .5)] backdrop-blur-xl sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700">
                <Lightbulb className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#111827]">{page.platform.label} growth tips</p>
                <h2 className="mt-1 text-2xl font-black text-[#0B0B0F]">Make new attention more useful</h2>
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {growthTips.map((tip, index) => (
                <article key={tip} className="rounded-2xl border border-[#FFF8F1] bg-[#FFF8F1] p-5">
                  <span className="text-2xl font-black text-orange-100">0{index + 1}</span>
                  <h3 className="mt-2 text-sm font-black leading-6 text-[#0B0B0F]">{tip}</h3>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">Four simple steps</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0B0B0F]">How it works</h2>
            <p className="mt-4 text-sm leading-7 text-[#111827]">Review every important campaign detail before you confirm your order.</p>
          </div>
          <ol className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="relative rounded-3xl border border-white/90 bg-white/80 p-6 shadow-[0_20px_48px_-32px_rgba(255, 159, 0, .5)]">
                  <span className="absolute right-5 top-5 text-3xl font-black text-orange-100">0{index + 1}</span>
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-50 text-orange-600">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-base font-black text-[#0B0B0F]">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#111827]">{step.description}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="bg-[#0B0B0F] px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-300">Why choose SocialRUSH</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">More clarity than a random cheap service listing</h2>
            <p className="mt-4 text-sm leading-7 text-orange-100/70">
              Compare the rate, delivery estimate, refill terms, required link, wallet charge, and order status in one accountable workflow—without unsafe promises or vague checkout steps.
            </p>
          </div>
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reasons.map((reason) => {
              const Icon = reason.icon;
              return (
                <article key={reason.title} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur sm:p-6">
                  <Icon className="h-6 w-6 text-amber-300" />
                  <h3 className="mt-4 text-base font-black">{reason.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-orange-100/65">{reason.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">Related services</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0B0B0F]">Explore another growth campaign</h2>
            </div>
            <Link href="/services" className="text-sm font-black text-orange-600 hover:text-orange-700">View all services →</Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {page.related.map((relatedSlug) => {
              const related = getSeoServicePage(relatedSlug);
              const relatedHref =
                related.slug === "instagram-followers"
                  ? "/buy-instagram-followers-india"
                  : `/${related.slug}`;
              return (
                <Link key={related.slug} href={relatedHref} className="group rounded-3xl border border-white/90 bg-white/80 p-5 shadow-[0_18px_42px_-30px_rgba(255, 159, 0, .45)] transition hover:-translate-y-1 hover:border-[#FFF3E0] sm:p-6">
                  <span className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ${related.platform.gradient} text-white`}>
                    <PlatformIcon platform={related.platform.icon} className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-base font-black text-[#0B0B0F]">{related.displayName}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#111827]">{related.intro}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-black text-orange-600">
                    Explore service <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white/65 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">
            Service directory
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0B0B0F]">
            Compare SocialRUSH service pages
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#111827]">
            Move between related Instagram, YouTube, Facebook, LinkedIn,
            Telegram and Twitter/X service pages to compare requirements and
            campaign options.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {allServiceLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-white/90 bg-white/85 p-4 shadow-[0_16px_36px_-30px_rgba(255,159,0,.5)] transition hover:-translate-y-1 hover:border-[#FFF3E0]"
              >
                <PlatformIcon platform={item.platform} className="h-5 w-5 text-orange-600" />
                <h3 className="mt-3 text-sm font-black text-[#0B0B0F]">
                  {item.label}
                </h3>
                <p className="mt-1 text-xs leading-5 text-[#111827]">
                  Review price guidance, FAQs, delivery notes and package links.
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white/65 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.7fr_1.3fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">Helpful answers</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0B0B0F]">Frequently asked questions</h2>
            <p className="mt-4 text-sm leading-7 text-[#111827]">Review pricing, delivery and ordering details before starting your campaign.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <details key={faq.question} className="group rounded-2xl border border-[#FFF8F1] bg-white p-5 shadow-sm" open={index === 0}>
                <summary className="cursor-pointer list-none pr-8 marker:hidden">
                  <h3 className="inline text-sm font-black text-[#0B0B0F]">{faq.question}</h3>
                  <span className="float-right text-lg font-bold text-orange-600 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 border-t border-[#FFF8F1] pt-3 text-sm leading-7 text-[#111827]">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-5xl rounded-[2rem] bg-gradient-to-br from-[#0B0B0F] via-[#FF9F00] to-[#FF9F00] p-7 text-center text-white shadow-[0_30px_70px_-35px_rgba(255, 159, 0, .7)] sm:p-10">
          <h2 className="text-3xl font-black tracking-tight">Ready to start your {page.displayName} campaign?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-orange-50/80">Compare available packages, review the latest rate and confirm every detail before placing your order.</p>
          <div className="mt-7 flex flex-col justify-center gap-3 min-[420px]:flex-row">
            <Link href={packagesHref} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-black text-[#0B0B0F] transition hover:-translate-y-0.5">
              View Packages
            </Link>
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/25 bg-white/10 px-6 py-3 text-sm font-black text-white transition hover:bg-white/15">
              Need help? Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
      <ServiceOrderStickyCta
        href={packagesHref}
        serviceName={page.displayName}
        startingPrice={page.confirmedPrice}
      />
    </PublicShell>
  );
}
