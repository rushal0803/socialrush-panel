"use client";

import Link from "@/components/marketing/PublicCodeLink";
import { servicePaths } from "@/lib/seo/service-detail-paths";
import { useMemo, useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import { activeSmmServices, platformMeta, type SmmPlatformId } from "@/lib/smm-service-catalog";
import { usePreferredCurrency } from "@/lib/currency/use-currency";
import { useServiceHealth } from "@/lib/use-service-health";
import { ServiceCard, serviceCategory, categoryLabel } from "./ServicesCatalog";
import styles from "../PremiumDesign.module.css";

const platforms = Object.keys(platformMeta) as SmmPlatformId[];
const examples = ["instagram-followers", "instagram-likes", "youtube-subscribers", "youtube-views", "linkedin-followers", "facebook-followers"];


/** A local catalog view. No ordering, price authority, or customer state is created here. */
export default function ServiceDiscovery() {
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState("all");
  const [category, setCategory] = useState("all");
  const { currency } = usePreferredCurrency("INR");
  const { health } = useServiceHealth();
  const categories = useMemo(() => Array.from(new Set(activeSmmServices.map(s => serviceCategory(s.code)))), []);
  const filtering = Boolean(query.trim() || platform !== "all" || category !== "all");
  const services = activeSmmServices.filter(service =>
    (filtering || examples.includes(service.code)) &&
    (platform === "all" || service.platform === platform) &&
    (category === "all" || serviceCategory(service.code) === category) &&
    (!query.trim() || `${service.name} ${platformMeta[service.platform].label} ${serviceCategory(service.code)}`.toLowerCase().includes(query.trim().toLowerCase())));
  function reset() { setQuery(""); setPlatform("all"); setCategory("all"); }

  return <section id="services" className={styles.discovery} aria-labelledby="discovery-heading">
    <header className={styles.discoveryHeading}><div><p className={styles.kicker}>THE SERVICE DIRECTORY</p><h2 id="discovery-heading">Find the right starting point.</h2><p>Compare catalog examples by platform, price and requirements. Final availability and INR totals are confirmed in order review.</p></div><Link href="/services">View full directory <ArrowRight size={18} aria-hidden="true" /></Link></header>
    <div className={styles.searchControls} role="search" aria-label="Service discovery">
      <label className={styles.searchField}><span>Search services</span><div><Search size={18} aria-hidden="true" /><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Try YouTube subscribers" aria-controls="discovery-results" /></div></label>
      <label className={styles.categoryField}><span>Service category</span><select aria-label="Service category" value={category} onChange={event => setCategory(event.target.value)} aria-controls="discovery-results"><option value="all">All categories</option>{categories.map(item => <option key={item} value={item}>{categoryLabel(item)}</option>)}</select></label>
    </div>
    <div className={styles.platformFilters} role="group" aria-label="Filter by platform"><button type="button" aria-pressed={platform === "all"} onClick={() => setPlatform("all")}>All platforms</button>{platforms.map(item => <button type="button" key={item} aria-pressed={platform === item} onClick={() => setPlatform(item)}>{platformMeta[item].label}</button>)}</div>
    <div className={styles.resultSummary}><p role="status" aria-live="polite">{services.length} {filtering ? "matching services" : "catalog examples"}</p>{filtering && <button type="button" onClick={reset}>Clear filters</button>}</div>
    <div id="discovery-results" className={styles.discoveryGrid}>{services.map(service => <ServiceCard key={service.code} service={service} currency={currency} health={health[service.code]} detailHref={servicePaths[service.code] ?? `/services/${service.code}`} />)}</div>
    {!services.length && <div className={styles.emptyResults}><h3>No services match these filters.</h3><p>Keep your search and try another platform or category, or clear all filters.</p><button type="button" onClick={reset}>Clear filters</button></div>}
    <p className={styles.directoryNote}>A larger count does not guarantee reach, engagement or sales. <Link href="/trust">Read service limitations</Link> before ordering.</p>
  </section>;
}
