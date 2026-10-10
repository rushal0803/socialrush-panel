import Link from "next/link";
import PublicCodeLink from "@/components/marketing/PublicCodeLink";
import { ArrowRight, Check, ChevronDown, Search, X } from "lucide-react";
import PlatformIcon from "@/components/PlatformIcon";
import ServiceHealthBadge from "@/components/ServiceHealthBadge";
import { formatCurrency, type Currency } from "@/lib/currency";
import { platformMeta, type SmmPlatformId, type SmmService } from "@/lib/smm-service-catalog";
import type { ServiceHealth } from "@/lib/service-health";
import styles from "./ServicesCatalog.module.css";

export function serviceCategory(code: string) {
  for (const category of ["followers", "subscribers", "likes", "views", "comments", "members", "shares", "saves", "connections", "endorsements", "reposts", "retweets", "reactions", "votes", "watch-hours"]) {
    if (code.includes(category)) return category;
  }
  return "other";
}
export function categoryLabel(category: string) {
  return category === "watch-hours" ? "Watch hours" : category[0].toUpperCase() + category.slice(1);
}
export function ServicesHero() {
  return <header className={styles.hero}>
    <p className={styles.eyebrow}>SOCIALRUSH SERVICES</p>
    <h1>Social Media Growth Services</h1>
    <p className={styles.intro}>Compare live services and current pricing across Instagram, YouTube, LinkedIn, Facebook and more.</p>
    <div className={styles.actions}><a className={styles.primary} href="#discovery-heading">Browse Services <ArrowRight size={16} aria-hidden="true" /></a><Link className={styles.secondary} href="/dashboard/new-order">Start Order</Link></div>
    <ul className={styles.trust}>{["No password required", "Transparent pricing", "Dashboard tracking", "Secure checkout"].map(item => <li key={item}><Check size={15} aria-hidden="true" />{item}</li>)}</ul>
  </header>;
}
export function PlatformSelector({ platforms, platform, counts, onSelect }: { platforms: SmmPlatformId[]; platform: SmmPlatformId; counts: Record<SmmPlatformId, number>; onSelect: (platform: SmmPlatformId) => void }) {
  return <section className={styles.platforms} aria-labelledby="discovery-heading"><h2 id="discovery-heading">Choose a platform</h2><div className={styles.rail} aria-label="Platforms">{platforms.map(id => <button key={id} type="button" aria-pressed={platform === id} className={styles.platform} onClick={() => onSelect(id)}><PlatformIcon platform={platformMeta[id].icon} className="h-5 w-5 shrink-0" /><span><strong>{platformMeta[id].label}</strong><small>{counts[id]} {counts[id] === 1 ? "service" : "services"}</small></span>{platform === id && <Check size={15} aria-hidden="true" />}</button>)}</div></section>;
}
export function ServiceSearch({ query, onQuery }: { query: string; onQuery: (query: string) => void }) {
  return <label className={styles.search}><span className="sr-only">Search services</span><Search size={18} aria-hidden="true" /><input aria-label="Search services" type="search" value={query} onChange={event => onQuery(event.target.value)} placeholder="Search services…" />{query && <button type="button" aria-label="Clear search" onClick={() => onQuery("")}><X size={18} /></button>}</label>;
}
export function ServiceCategoryFilter({ categories, selected, onSelect }: { categories: string[]; selected: string; onSelect: (category: string) => void }) {
  return <div className={styles.categories} aria-label="Service type filters">{categories.map(category => <button key={category} type="button" aria-pressed={selected === category} onClick={() => onSelect(category)}>{selected === category && <Check size={14} aria-hidden="true" />}{categoryLabel(category)}</button>)}</div>;
}
export function ServiceCard({ service, currency, health, detailHref }: { service: SmmService; currency: Currency; health?: ServiceHealth; detailHref: string }) {
  const unavailable = health && (!health.acceptsNewOrders || health.status === "paused" || health.status === "maintenance");
  const orderHref = `/dashboard/new-order?${new URLSearchParams({ platform: service.platform, service: service.code, quantity: String(service.minQuantity), resume: "1" })}`;
  const category = serviceCategory(service.code);
  return <article className={styles.card} data-catalog-service={service.code}>
    <div className={styles.cardHeading}><span className={styles.icon}><PlatformIcon platform={platformMeta[service.platform].icon} className="h-5 w-5" /></span><h3><PublicCodeLink href={detailHref} prefetch={false}>{service.name}</PublicCodeLink></h3></div>
    {health && <div className={styles.health}><ServiceHealthBadge health={health} /></div>}
    <p className={styles.description}>{service.description}</p>
    <div className={styles.price}><span>Starting at</span><p><strong>{formatCurrency(service.pricePer1000, currency)}</strong> / 1K</p><small>Min. {service.minQuantity.toLocaleString("en-IN")} · from {formatCurrency(service.pricePer1000 * service.minQuantity / 1000, currency)} total</small></div>
    <dl className={styles.meta}><div><dt>Delivery</dt><dd>{service.deliveryTime || "Confirm before ordering"}</dd></div><div><dt>Refill / support</dt><dd>{/^no refill$/i.test(service.refillPolicy.trim()) ? "Not included" : service.refillPolicy || "Confirm before ordering"}</dd></div></dl>
    <div className={styles.cardActions}>{unavailable ? <span className={styles.unavailable}>Currently unavailable</span> : <Link className={styles.primary} href={orderHref}>Order {category === "other" ? "service" : categoryLabel(category).toLowerCase()}<ArrowRight size={15} aria-hidden="true" /></Link>}<PublicCodeLink className={styles.detail} href={detailHref} prefetch={false}>View details</PublicCodeLink></div>
    <details className={styles.requirements}><summary>Before you order<ChevronDown size={15} aria-hidden="true" /></summary><p>{service.importantInstruction}</p><p>Quantity: {service.minQuantity.toLocaleString("en-IN")}–{service.maxQuantity.toLocaleString("en-IN")}</p></details>
  </article>;
}
