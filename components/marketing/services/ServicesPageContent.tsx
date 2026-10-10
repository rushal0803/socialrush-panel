"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import BlogShell from "@/components/marketing/blog/BlogShell";
import ServiceCompareStudio from "./ServiceCompareStudio";
import { ServicesHero, PlatformSelector, ServiceSearch, ServiceCategoryFilter, ServiceCard, serviceCategory } from "./ServicesCatalog";
import styles from "./ServicesCatalog.module.css";
import PlatformIcon from "@/components/PlatformIcon";
import { usePreferredCurrency } from "@/lib/currency/use-currency";
import { platformMeta, type SmmPlatformId, type SmmService } from "@/lib/smm-service-catalog";
import { useServiceHealth } from "@/lib/use-service-health";
import PersonalizationShelf from "@/components/marketing/cro/PersonalizationShelf";

const platforms: SmmPlatformId[] = ["instagram", "youtube", "facebook", "linkedin", "telegram", "tiktok", "x"];



const servicePaths: Record<string, string> = {
  "instagram-followers": "/buy-instagram-followers-india", "instagram-likes": "/instagram-likes", "instagram-views": "/instagram-views", "instagram-comments": "/buy-instagram-comments-india",
  "instagram-saves": "/buy-instagram-saves-india",
  "instagram-shares": "/buy-instagram-shares-india",
  "youtube-subscribers": "/youtube-subscribers", "youtube-likes": "/youtube-likes", "youtube-views": "/youtube-views",
  "youtube-comments": "/buy-youtube-comments-india",
  "youtube-watch-hours": "/buy-youtube-watch-hours-india",
  "facebook-followers": "/buy-facebook-followers-india", "facebook-group-members": "/buy-facebook-group-members-india", "facebook-likes": "/facebook-likes", "facebook-views": "/facebook-views", "facebook-shares": "/buy-facebook-shares-india", "linkedin-followers": "/linkedin-followers",
  "linkedin-likes": "/linkedin-likes", "telegram-members": "/telegram-members", "tiktok-followers": "/tiktok-followers", "x-followers": "/twitter-followers",
};

const aliases: Record<string, SmmPlatformId> = { instagram: "instagram", youtube: "youtube", facebook: "facebook", linkedin: "linkedin", telegram: "telegram", tiktok: "tiktok", twitter: "x", x: "x", "twitter-x": "x" };




function platformFrom(value?: string): SmmPlatformId { return aliases[String(value ?? "").toLowerCase().trim()] ?? "instagram"; }
function platformFromServiceType(value?: string): SmmPlatformId | undefined {
  const prefix = String(value ?? "").toLowerCase().trim().split("-")[0];
  return aliases[prefix];
}
type Props = { initialPlatformParam?: string; initialTypeParam?: string; initialSearchParam?: string; serviceCatalog: SmmService[]; staticSections: ReactNode; children?: ReactNode };

export default function ServicesPageContent({ initialPlatformParam, initialTypeParam, initialSearchParam, serviceCatalog, staticSections, children }: Props) {
  // Freeze the serialized RSC catalog for the hydration render. Every derived
  // view below uses this same server-provided collection.
  const [catalogServices] = useState<SmmService[]>(() => serviceCatalog);
  const { currency } = usePreferredCurrency("INR");
  const { health: healthByService } = useServiceHealth();
  const inferredSearchPlatform = useMemo(() => {
    if (initialPlatformParam) return platformFrom(initialPlatformParam);
    const term = (initialSearchParam ?? "").toLowerCase();
    return platforms.find((id) => {
      const label = platformMeta[id].label.toLowerCase();
      if (id === "x") return /(^|\s|[-_/])x($|\s|[-_/])/.test(term) || term.includes("twitter") || term.includes(label);
      return term.includes(id) || term.includes(label);
    });
  }, [initialPlatformParam, initialSearchParam]);
  const [platform, setPlatform] = useState<SmmPlatformId>(() => inferredSearchPlatform ?? platformFromServiceType(initialTypeParam) ?? "instagram");
  const [type, setType] = useState(initialTypeParam && initialTypeParam !== "all" ? serviceCategory(initialTypeParam) : "all");
  const [query, setQuery] = useState(initialSearchParam?.trim() ?? "");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setPlatform(inferredSearchPlatform ?? platformFromServiceType(initialTypeParam) ?? "instagram");
    setQuery(initialSearchParam?.trim() ?? "");
    setType(initialTypeParam && initialTypeParam !== "all" ? serviceCategory(initialTypeParam) : "all");
    setShowAll(false);
  }, [inferredSearchPlatform, initialSearchParam, initialTypeParam]);

  const types = useMemo(() => ["all", ...Array.from(new Set(catalogServices.filter((item) => item.platform === platform).map((item) => serviceCategory(item.code))))], [catalogServices, platform]);
  const services = useMemo(() => {
    const term = query.trim().toLowerCase();
    return catalogServices.filter((item) => item.platform === platform && (type === "all" || serviceCategory(item.code) === type) && (!term || `${item.name} ${item.description} ${item.code} ${platformMeta[item.platform].label}`.toLowerCase().includes(term)));
  }, [catalogServices, platform, query, type]);

  const clearFilters = () => { setQuery(""); setType("all"); setShowAll(false); };
  const switchPlatform = (id: SmmPlatformId) => {
    setPlatform(id);
    setType("all");
    setQuery("");
    setShowAll(false);
  };
  const matchingPlatforms = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return platforms.filter((id) => id !== platform && catalogServices.some((item) =>
      item.platform === id && `${item.name} ${item.description} ${item.code} ${platformMeta[item.platform].label}`.toLowerCase().includes(term)
    ));
  }, [catalogServices, platform, query]);
  const visibleServices = showAll || query || type !== "all" ? services : services.slice(0, 6);
  const platformServiceCounts = useMemo(() => Object.fromEntries(platforms.map((id) => [id, catalogServices.filter((item) => item.platform === id).length])) as Record<SmmPlatformId, number>, [catalogServices]);

  return <BlogShell><div className={styles.catalog}>
    <div className={styles.container}>
      <ServicesHero />
      <PersonalizationShelf catalog={catalogServices} compact />
      <PlatformSelector platforms={platforms.filter(id => platformServiceCounts[id] > 0)} platform={platform} counts={platformServiceCounts} onSelect={switchPlatform} />
      <section className={styles.filters} aria-label="Find a service">
        <div className={styles.searchRow}><ServiceSearch query={query} onQuery={setQuery} /><ServiceCompareStudio serviceCatalog={catalogServices} /></div>
        <ServiceCategoryFilter categories={types} selected={type} onSelect={setType} />
      </section>
      <section id="service-catalog" aria-labelledby="catalog-heading" className="scroll-mt-24">
        <div className={styles.results}><h2 id="catalog-heading">{platformMeta[platform].label} services</h2><div className="flex flex-wrap items-center gap-2"><p role="status">{services.length} {services.length === 1 ? "service" : "services"} found</p>{(query || type !== "all") && <button type="button" onClick={clearFilters}>Clear filters</button>}</div></div>
        {services.length ? <><div className={styles.grid}>{visibleServices.map(service => <ServiceCard key={service.code} service={service} currency={currency} health={healthByService[service.code]} detailHref={servicePaths[service.code] ?? ("/services/" + service.code)} />)}</div>{services.length > visibleServices.length && <div className={styles.more}><button type="button" className={styles.secondary} onClick={() => setShowAll(true)}>View all {platformMeta[platform].label} services <ArrowRight size={16} aria-hidden="true" /></button></div>}</> : <div className={styles.empty}><h3>No services match your filters.</h3><p>Try another service type, search term or platform.</p>{matchingPlatforms.length > 0 && <div className="mt-3 flex flex-wrap justify-center gap-2">{matchingPlatforms.map(id => <button key={id} type="button" className={styles.secondary} onClick={() => switchPlatform(id)}>See {platformMeta[id].label} results</button>)}</div>}<button type="button" className={styles.secondary} onClick={clearFilters}>Reset filters</button></div>}
      </section>
    </div>

    {platform === "instagram" && <section className="relative px-4 pt-5 sm:px-6 lg:px-8"><div className="mx-auto grid max-w-7xl gap-4 rounded-[1.5rem] border border-white/10 bg-[#101010] p-5 sm:grid-cols-2 sm:p-6"><div><p className="text-[10px] font-black tracking-[.16em] text-orange-300">INSTAGRAM SAVES</p><h3 className="mt-2 text-xl font-black">Strengthen post and Reel engagement signals with Instagram save activity.</h3><Link href="/buy-instagram-saves-india" className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#ff9b36] text-[#171008] px-4 text-xs font-black">Buy Instagram Saves <ArrowRight className="h-4 w-4" /></Link></div><div><p className="text-[10px] font-black tracking-[.16em] text-orange-300">INSTAGRAM SHARES</p><h3 className="mt-2 text-xl font-black">Expand post and Reel engagement with Instagram share activity.</h3><Link href="/buy-instagram-shares-india" className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#ff9b36] text-[#171008] px-4 text-xs font-black">Buy Instagram Shares <ArrowRight className="h-4 w-4" /></Link></div></div></section>}

    {platform === "youtube" && <section className="relative px-4 pt-5 sm:px-6 lg:px-8"><div className="mx-auto grid max-w-7xl gap-4 rounded-[1.5rem] border border-white/10 bg-[#101010] p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6"><div><p className="text-[10px] font-black tracking-[.16em] text-orange-300">YOUTUBE COMMENTS</p><h3 className="mt-2 text-xl font-black">Build visible conversation and engagement around your YouTube videos with comment activity.</h3><p className="mt-2 text-sm leading-6 text-[#C7CBD3]">Live pricing and availability are shown only when this service is active in the catalog.</p></div><Link href="/buy-youtube-comments-india" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#ff9b36] text-[#171008] px-4 text-xs font-black">Buy YouTube Comments <ArrowRight className="h-4 w-4" /></Link></div></section>}

    <section className="relative px-4 pt-5 sm:px-6 lg:px-8"><div className="mx-auto grid max-w-7xl gap-4 rounded-[1.5rem] border border-white/10 bg-[#101010] p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6"><div><p className="text-[10px] font-black tracking-[.16em] text-orange-300">NEED MULTIPLE SERVICES?</p><h2 className="mt-2 text-xl font-black">Explore SocialRUSH Packages</h2><p className="mt-2 text-sm leading-6 text-[#C7CBD3]">Compare bundled options without interrupting a single-service order.</p></div><Link href={`/packages?platform=${platform === "x" ? "twitter" : platform}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[.06] px-4 text-xs font-black hover:border-orange-400/50">Explore Packages <ArrowRight className="h-4 w-4" /></Link></div></section>

    {staticSections}
    <div className={styles.supporting}>{children}</div>
  </div></BlogShell>;
}
