import Link from "next/link";
import PlatformServicesLanding from "@/components/marketing/services/PlatformServicesLanding";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import PlatformSmmIntentSection from "@/components/seo/PlatformSmmIntentSection";
import { activeSmmServices } from "@/lib/smm-service-catalog";
import { createPageMetadata, SEO_SITE_URL } from "@/lib/seo/metadata";

const path = "/services/telegram";
const services = activeSmmServices.filter((service) => service.platform === "telegram");

export const metadata = createPageMetadata({
  title: "Telegram Services Catalog | Members, Views, Reactions & Poll Votes | SocialRUSH",
  description: "Browse the SocialRUSH Telegram service catalog, including members, post views, reactions and poll votes with clear public-link requirements and dashboard tracking.",
  path,
  keywords: ["Telegram services catalog", "Telegram service options", "Telegram post views", "Telegram reactions", "Telegram poll votes", "Telegram SMM panel India"],
});

export default function TelegramServicesPage() {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "SocialRUSH Telegram Services",
    numberOfItems: services.length,
    itemListElement: services.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: service.name,
      url: service.code === "telegram-members"
        ? `${SEO_SITE_URL}/telegram-members`
        : `${SEO_SITE_URL}/services/${service.code}`,
    })),
  };

  return <>
    <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "Services", path: "/services" }, { name: "Telegram Services", path }]} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList).replace(/</g, "\\u003c") }} />
    <PlatformServicesLanding platform="telegram" />
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">Telegram service comparison</p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-white">Members, post views, reactions, or poll votes?</h2>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">Pick the Telegram service that matches the visible signal you actually need. Members affect community size; views and reactions apply to eligible public posts; poll votes apply to supported polls.</p>
      <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/telegram-members" className="rounded-2xl border border-orange-400/20 bg-white/[.035] p-5 hover:border-orange-300/40">
          <h3 className="font-black text-white">Telegram Members</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">For visible channel or group audience size.</p>
        </Link>
        <Link href="/services/telegram-post-views" className="rounded-2xl border border-sky-300/20 bg-white/[.035] p-5 hover:border-sky-200/40">
          <h3 className="font-black text-white">Telegram Post Views</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">For visible opens on a supported public post.</p>
        </Link>
        <Link href="/services/telegram-post-reactions" className="rounded-2xl border border-emerald-300/20 bg-white/[.035] p-5 hover:border-emerald-200/40">
          <h3 className="font-black text-white">Telegram Reactions</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">For visible response on an eligible public post.</p>
        </Link>
        <Link href="/services/telegram-poll-votes" className="rounded-2xl border border-violet-300/20 bg-white/[.035] p-5 hover:border-violet-200/40">
          <h3 className="font-black text-white">Telegram Poll Votes</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">For supported Telegram polls, not channel membership.</p>
        </Link>
      </div>
    </section>
    <PlatformSmmIntentSection platform="telegram" />
  </>;
}
