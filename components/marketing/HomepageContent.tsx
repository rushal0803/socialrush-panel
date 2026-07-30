import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  CircleDollarSign,
  CreditCard,
  Headphones,
  LayoutDashboard,
  Link2,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import Logo from "@/components/Logo";
import PlatformIcon from "@/components/PlatformIcon";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import PortalCTA from "@/components/marketing/PortalCTA";
import { platformMeta, smmServiceCatalog, type SmmPlatformId } from "@/lib/smm-service-catalog";

const platformDescriptions: Record<SmmPlatformId, string> = {
  instagram: "Profile, post and Reel campaign services.",
  youtube: "Channel and public video campaign services.",
  facebook: "Page, profile and public content services.",
  linkedin: "Professional profile and post services.",
  telegram: "Public channel and community services.",
  tiktok: "Profile and public video campaign services.",
  x: "Public profile audience campaign services.",
};

const platformDetails: Record<SmmPlatformId, string> = {
  instagram: "/buy-instagram-followers-india",
  youtube: "/youtube-subscribers",
  facebook: "/facebook-followers",
  linkedin: "/linkedin-followers",
  telegram: "/telegram-members",
  tiktok: "/tiktok-followers",
  x: "/twitter-followers",
};

const platforms = (Object.keys(platformMeta) as SmmPlatformId[]).map((id) => ({
  id,
  ...platformMeta[id],
  description: platformDescriptions[id],
  detailsHref: platformDetails[id],
}));

const steps = [
  ["Choose a service", "Select the platform and service that matches your campaign."],
  ["Add your public link", "Submit the correct profile, post, page, channel or video link."],
  ["Review and pay", "See the exact current total and securely pay the required amount."],
  ["Track your order", "Follow progress from your dashboard and contact support when needed."],
] as const;

const benefits = [
  { icon: CircleDollarSign, title: "Transparent pricing", text: "See the current rate and exact total before payment." },
  { icon: Link2, title: "Public-link ordering", text: "No account password or OTP is required." },
  { icon: ShieldCheck, title: "Secure payment", text: "Payments are processed and verified through Razorpay." },
  { icon: LayoutDashboard, title: "Managed delivery", text: "Order progress is monitored through the dashboard." },
  { icon: RefreshCw, title: "Refill assistance", text: "Eligible services display their applicable refill support." },
  { icon: Headphones, title: "Human support", text: "Contact SocialRUSH through WhatsApp when you need help." },
] as const;

const featuredCodes = [
  "instagram-followers",
  "instagram-likes",
  "youtube-subscribers",
  "youtube-views",
  "facebook-followers",
  "linkedin-followers",
] as const;

const featuredRoutes: Record<(typeof featuredCodes)[number], string> = {
  "instagram-followers": "/buy-instagram-followers-india",
  "instagram-likes": "/instagram-likes",
  "youtube-subscribers": "/youtube-subscribers",
  "youtube-views": "/youtube-views",
  "facebook-followers": "/facebook-followers",
  "linkedin-followers": "/linkedin-followers",
};

const featuredServices = featuredCodes
  .map((code) => smmServiceCatalog.find((service) => service.code === code))
  .filter((service): service is NonNullable<typeof service> => Boolean(service?.isActive));

const safetyItems = [
  "No password required",
  "Never share an OTP",
  "Public destination links only",
  "Secure payment verification",
  "Clear service terms",
  "Support available",
] as const;

const faqs = [
  ["Do I need to share my password?", "No. SocialRUSH orders use the relevant public profile, post, page, channel or video link. Never share your password or OTP."],
  ["How is the final price calculated?", "The current service rate and selected quantity determine the exact total shown before payment."],
  ["How do I track my order?", "Sign in to your SocialRUSH dashboard to view order status, history and available progress updates."],
  ["Does every service include refill support?", "No. Refill support depends on the selected service. Eligible services show their applicable refill terms before ordering."],
  ["What happens if my wallet balance is insufficient?", "You can securely pay the missing amount. After verification, the order is placed automatically without a separate manual top-up step."],
] as const;

const primaryButton = "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#0B0B0F] px-6 py-3 text-sm font-extrabold text-white shadow-[0_14px_30px_-18px_rgba(11,11,15,.7)] transition hover:-translate-y-0.5 hover:bg-black";
const goldButton = "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF8A00] to-[#FFC400] px-6 py-3 text-sm font-extrabold text-[#0B0B0F] shadow-[0_14px_30px_-18px_rgba(255,159,0,.8)] transition hover:-translate-y-0.5 hover:brightness-105";
const secondaryButton = "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-extrabold text-[#0B0B0F] transition hover:border-amber-300 hover:bg-amber-50";

export default function HomepageContent() {
  return (
    <main className="homepage-light overflow-x-clip bg-white text-[#0B0B0F]">
      <MarketingHeader tone="light3d" />

      <section id="home" className="relative overflow-hidden border-b border-slate-100 bg-[radial-gradient(circle_at_12%_12%,rgba(255,196,0,.16),transparent_28%),radial-gradient(circle_at_90%_18%,rgba(255,138,0,.12),transparent_26%),linear-gradient(180deg,#FFFCF5_0%,#FFFFFF_72%)] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.08fr_.92fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[.16em] text-amber-700 shadow-sm">
              <BadgeCheck className="h-4 w-4" /> Premium Managed Social Media Services
            </p>
            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.04] tracking-[-.045em] text-[#0B0B0F] sm:text-5xl lg:text-[4.2rem]">
              Professional Social Media Growth Services With Transparent Pricing
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Choose your platform and service, submit the correct public link, complete secure payment and track your order from one professional dashboard. No password is required.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <PortalCTA className={primaryButton}>Start Your Order <ArrowRight className="h-4 w-4" /></PortalCTA>
              <Link href="/services" className={secondaryButton}>Compare Services</Link>
            </div>
            <ul className="mt-8 grid gap-3 text-sm font-bold text-slate-700 sm:grid-cols-2 xl:grid-cols-3">
              {["No password required", "Transparent pricing", "Secure Razorpay payment", "Dashboard order tracking", "Human WhatsApp support"].map((item) => (
                <li key={item} className="flex items-center gap-2"><Check className="h-4 w-4 text-amber-600" />{item}</li>
              ))}
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-5 rounded-[2.2rem] bg-gradient-to-br from-amber-200/50 to-orange-100/30 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_32px_80px_-40px_rgba(15,23,42,.35)] sm:p-7">
              <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div><p className="text-[10px] font-black uppercase tracking-[.16em] text-amber-700">Secure order preview</p><p className="mt-1 text-lg font-black">Campaign checkout</p></div>
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#0B0B0F] text-amber-300"><LockKeyhole className="h-5 w-5" /></span>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <PreviewField label="Service" value="Instagram Followers" />
                <PreviewField label="Quantity" value="1,000" />
                <PreviewField label="Public link" value="instagram.com/profile" wide />
              </div>
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex justify-between text-sm text-slate-600"><span>Exact order total</span><strong className="text-[#0B0B0F]">Shown before payment</strong></div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white"><div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[#FF8A00] to-[#FFC400]" /></div>
              </div>
              <div className="mt-5 flex items-center gap-3 rounded-2xl bg-[#0B0B0F] p-4 text-white">
                <ShieldCheck className="h-5 w-5 shrink-0 text-amber-300" />
                <p className="text-sm font-bold leading-6">Verified payment and dashboard order tracking</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section id="platforms" eyebrow="Services by platform" title="Choose Your Platform" description="Compare available services, current starting prices, estimated delivery ranges and eligible refill support.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {platforms.map((platform) => (
            <article key={platform.id} className="flex min-h-[250px] flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_-34px_rgba(15,23,42,.35)]">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#0B0B0F] text-amber-300"><PlatformIcon platform={platform.id} className="h-5 w-5" /></span>
              <h3 className="mt-5 text-xl font-black text-[#0B0B0F]">{platform.label}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{platform.description}</p>
              <div className="mt-auto flex flex-wrap gap-3 pt-5 text-sm font-extrabold">
                <Link href={platform.detailsHref} className="text-slate-700 hover:text-amber-700">View Services</Link>
                <Link href={`/dashboard/new-order?platform=${platform.id}`} className="text-amber-700 hover:text-amber-800">Start Order →</Link>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section id="how-it-works" tone="soft" eyebrow="A clear process" title="How It Works" description="Four straightforward steps from service selection to dashboard tracking.">
        <ol className="grid gap-4 lg:grid-cols-4">
          {steps.map(([title, text], index) => (
            <li key={title} className="relative rounded-3xl border border-slate-200 bg-white p-6">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-sm font-black text-amber-800">0{index + 1}</span>
              <h3 className="mt-5 text-lg font-black text-[#0B0B0F]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="trust" eyebrow="Why SocialRUSH" title="Professional Ordering, Clear Expectations" description="Practical safeguards and clear information at each stage of your order.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_40px_-34px_rgba(15,23,42,.3)]">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-100 text-amber-800"><Icon className="h-5 w-5" /></span>
              <h3 className="mt-5 text-lg font-black text-[#0B0B0F]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </article>
          ))}
        </div>
      </Section>

      <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 overflow-hidden rounded-[2rem] bg-[#0B0B0F] p-6 text-white shadow-[0_35px_80px_-45px_rgba(11,11,15,.8)] sm:p-9 lg:grid-cols-2 lg:items-center lg:p-12">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[.16em] text-amber-300">Simpler secure checkout</p>
            <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">Pay Only What Is Still Required</h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
              Customers do not need to manually calculate or top up the exact wallet amount. When required, they can pay the missing amount and the order is placed automatically after secure verification.
            </p>
            <PortalCTA className={`${goldButton} mt-7`}>Start a Secure Order <ArrowRight className="h-4 w-4" /></PortalCTA>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[.06] p-5 sm:p-6">
            <p className="text-xs font-bold text-slate-400">Illustrative checkout example</p>
            <dl className="mt-5 space-y-4">
              <PaymentRow icon={CreditCard} label="Order total" value="₹599" />
              <PaymentRow icon={Wallet} label="Wallet balance" value="₹200" />
              <PaymentRow icon={LockKeyhole} label="Pay now" value="₹399" highlight />
            </dl>
            <p className="mt-5 border-t border-white/10 pt-5 text-xs leading-6 text-slate-400">Actual totals are calculated from the selected service and quantity.</p>
          </div>
        </div>
      </section>

      <Section id="featured-services" tone="soft" eyebrow="Popular choices" title="Featured Services" description="A focused selection of commonly requested services. Visit Services to compare the complete catalog.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featuredServices.map((service) => (
            <article key={service.code} className="rounded-3xl border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#0B0B0F] text-amber-300"><PlatformIcon platform={service.platform} className="h-5 w-5" /></span>
                <div><p className="text-[10px] font-black uppercase tracking-[.14em] text-slate-500">{platformMeta[service.platform].label}</p><h3 className="mt-1 text-lg font-black text-[#0B0B0F]">{service.name}</h3></div>
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <ServiceDetail label="Starting rate" value={`₹${service.pricePer1000.toLocaleString("en-IN")} / 1K`} />
                <ServiceDetail label="Delivery estimate" value={service.deliveryTime} />
                <div className="col-span-2"><ServiceDetail label="Refill support" value={service.refillPolicy} /></div>
              </dl>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={featuredRoutes[service.code as keyof typeof featuredRoutes]} className={secondaryButton}>View Details</Link>
                <Link href={`/dashboard/new-order?service=${service.code}`} className={primaryButton}>Start Order</Link>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <section aria-label="Ordering safety" className="border-y border-amber-200 bg-amber-50 px-4 py-7 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {safetyItems.map((item) => <div key={item} className="flex items-center gap-2 text-sm font-bold text-slate-700"><ShieldCheck className="h-4 w-4 shrink-0 text-amber-700" />{item}</div>)}
        </div>
      </section>

      <Section id="faq" eyebrow="Helpful answers" title="Frequently Asked Questions" description="Important information before you place a custom-service order.">
        <div className="mx-auto max-w-4xl space-y-3">
          {faqs.map(([question, answer], index) => (
            <details key={question} open={index === 0} className="group rounded-2xl border border-slate-200 bg-white p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-black text-[#0B0B0F] marker:hidden">
                {question}
                <ChevronDown className="h-5 w-5 shrink-0 text-amber-700 transition group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="mt-3 text-sm leading-7 text-slate-600">{answer}</p>
            </details>
          ))}
          <div className="pt-4 text-center"><Link href="/faq" className={secondaryButton}>View Full FAQ</Link></div>
        </div>
      </Section>

      <section className="px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-amber-200 bg-[linear-gradient(135deg,#FFF7DA,#FFFDF7)] px-6 py-12 text-center sm:px-10 sm:py-16">
          <h2 className="text-3xl font-black text-[#0B0B0F] sm:text-4xl">Ready to Start Your SocialRUSH Order?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">Choose your service, review the exact total and track your campaign from one secure dashboard.</p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <PortalCTA className={primaryButton}>Start Order <ArrowRight className="h-4 w-4" /></PortalCTA>
            <Link href="/services" className={secondaryButton}>Explore Services</Link>
          </div>
        </div>
      </section>

      <HomepageFooter />
    </main>
  );
}

function Section({ id, eyebrow, title, description, tone = "white", children }: { id?: string; eyebrow: string; title: string; description: string; tone?: "white" | "soft"; children: ReactNode }) {
  return (
    <section id={id} className={`${tone === "soft" ? "bg-[#FAFAF8]" : "bg-white"} scroll-mt-28 px-4 py-16 sm:px-6 sm:py-20 lg:px-8`}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-9 max-w-3xl">
          <p className="text-[11px] font-black uppercase tracking-[.16em] text-amber-700">{eyebrow}</p>
          <h2 className="mt-3 text-3xl font-black text-[#0B0B0F] sm:text-4xl">{title}</h2>
          <p className="mt-4 text-base leading-7 text-slate-600">{description}</p>
        </div>
        {children}
      </div>
    </section>
  );
}

function PreviewField({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return <div className={`${wide ? "sm:col-span-2" : ""} rounded-2xl border border-slate-200 bg-slate-50 p-4`}><p className="text-[10px] font-black uppercase tracking-[.13em] text-slate-500">{label}</p><p className="mt-2 truncate text-sm font-black text-[#0B0B0F]">{value}</p></div>;
}

function PaymentRow({ icon: Icon, label, value, highlight = false }: { icon: typeof Wallet; label: string; value: string; highlight?: boolean }) {
  return <div className={`flex items-center justify-between gap-3 rounded-2xl p-4 ${highlight ? "bg-amber-300 text-[#0B0B0F]" : "bg-white/[.06] text-white"}`}><span className="flex items-center gap-3 text-sm font-bold"><Icon className="h-5 w-5" />{label}</span><strong className="text-xl">{value}</strong></div>;
}

function ServiceDetail({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-slate-50 p-3"><dt className="text-[10px] font-black uppercase tracking-[.12em] text-slate-500">{label}</dt><dd className="mt-1.5 font-bold text-slate-800">{value}</dd></div>;
}

function HomepageFooter() {
  const whatsappUrl = "https://wa.me/918860330771";
  const columns = [
    ["Services", [["All Services", "/services"], ["Pricing", "/pricing"], ["Packages", "/packages"], ["Start Order", "/dashboard/new-order"]]],
    ["Company", [["About", "/about"], ["Why SocialRUSH", "/#trust"], ["How It Works", "/#how-it-works"], ["Blog", "/blog"]]],
    ["Support", [["FAQ", "/faq"], ["Contact", "/contact"], ["WhatsApp Support", whatsappUrl], ["Customer Dashboard", "/dashboard"]]],
    ["Legal", [["Privacy Policy", "/privacy-policy"], ["Refund Policy", "/refund-policy"], ["Terms & Conditions", "/terms-and-conditions"]]],
  ] as const;
  return (
    <footer className="bg-[#0B0B0F] px-4 pb-24 pt-14 text-white sm:px-6 sm:pb-10 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 border-b border-white/10 pb-12 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <Logo light />
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">Managed social media services with public-link ordering, transparent pricing, secure payment verification, dashboard tracking and human support.</p>
            <p className="mt-4 text-sm font-bold text-slate-300">support@getsocialrush.com</p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {columns.map(([title, links]) => (
              <div key={title}>
                <h3 className="text-xs font-black uppercase tracking-[.14em] text-white">{title}</h3>
                <ul className="mt-4 space-y-3">
                  {links.map(([label, href]) => <li key={label}><Link href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined} className="text-sm text-slate-400 hover:text-amber-300">{label}</Link></li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 SocialRUSH. All rights reserved.</p>
          <p>Public-link ordering · Secure payment · Dashboard tracking</p>
        </div>
      </div>
    </footer>
  );
}
