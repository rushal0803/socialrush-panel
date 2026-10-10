"use client";

import Link from "next/link";
import { Check, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { formatCurrency } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";
import { platformMeta, type SmmPlatformId, type SmmService } from "@/lib/smm-service-catalog";
import { useBodyScrollLock } from "@/lib/ui/use-body-scroll-lock";
import styles from "./ServicesCatalog.module.css";
import compare from "./ServiceCompare.module.css";

export default function ServiceCompareDialog({ serviceCatalog, open, onClose, selectedCodes, setSelectedCodes }: { serviceCatalog: SmmService[]; open: boolean; onClose: () => void; selectedCodes: string[]; setSelectedCodes: Dispatch<SetStateAction<string[]>> }) {
  const { currency } = usePreferredCurrency("INR");
  const dialog = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState<"all" | SmmPlatformId>("all");
  useBodyScrollLock(open);
  useEffect(() => { if (open) dialog.current?.showModal(); else dialog.current?.close(); }, [open]);
  const selected = useMemo(() => serviceCatalog.filter(service => selectedCodes.includes(service.code)), [selectedCodes, serviceCatalog]);
  const results = useMemo(() => serviceCatalog.filter(service => (platform === "all" || service.platform === platform) && `${service.name} ${service.description} ${service.code}`.toLowerCase().includes(query.trim().toLowerCase())), [serviceCatalog, platform, query]);
  const platforms = Array.from(new Set(serviceCatalog.map(service => service.platform)));
  const toggleService = (code: string) => setSelectedCodes(current => current.includes(code) ? current.filter(item => item !== code) : current.length < 3 ? [...current, code] : current);
  return (
    <dialog ref={dialog} className={compare.dialog} aria-labelledby="service-compare-title" onCancel={() => onClose()} onClose={() => onClose()}>
      {open && <><header className={compare.header}><div><h2 id="service-compare-title">Compare services</h2><p>Select up to 3 services. Review their conditions before ordering.</p></div><button type="button" autoFocus onClick={() => onClose()} aria-label="Close service comparison"><X size={20} /></button></header>
      <div className={compare.body}>
        <div className={compare.picker}>
          <label className={styles.search}><span className="sr-only">Search services to compare</span><Search size={16} aria-hidden="true" /><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search any service…" /></label>
          <label className={compare.platform}>Platform<select value={platform} onChange={event => setPlatform(event.target.value as typeof platform)}><option value="all">All platforms</option>{platforms.map(id => <option key={id} value={id}>{platformMeta[id].label}</option>)}</select></label>
          <p className={compare.count} role="status">{selected.length}/3 selected · {results.length} services</p>
          <div className={compare.choices}>{results.map(service => { const active = selectedCodes.includes(service.code); return <button key={service.code} type="button" aria-pressed={active} disabled={!active && selected.length === 3} onClick={() => toggleService(service.code)}><span><strong>{service.name}</strong><small>{formatCurrency(service.pricePer1000, currency)} / 1K</small></span><span aria-hidden="true">{active ? <Check size={18} /> : "+"}</span></button>; })}{!results.length && <p>No services match your search.</p>}</div>
        </div>
        <section className={compare.shortlist} aria-label="Your shortlist"><div className={compare.shortlistHeading}><h3>Your shortlist</h3>{selected.length > 0 && <button type="button" onClick={() => setSelectedCodes([])}>Clear all</button>}</div>
          {selected.length ? <div className={compare.cards}>{selected.map(service => <article key={service.code}><div className={compare.shortlistHeading}><h4>{service.name}</h4><button type="button" aria-label={`Remove ${service.name} from comparison`} onClick={() => toggleService(service.code)}><X size={18} /></button></div><p className={compare.price}>{formatCurrency(service.pricePer1000, currency)} <small>/ 1K</small></p><dl><div><dt>Minimum</dt><dd>{service.minQuantity.toLocaleString("en-IN")}</dd></div><div><dt>Maximum</dt><dd>{service.maxQuantity.toLocaleString("en-IN")}</dd></div><div><dt>Delivery</dt><dd>{service.deliveryTime}</dd></div><div><dt>Refill / support</dt><dd>{service.refillPolicy}</dd></div><div><dt>Before ordering</dt><dd>{service.importantInstruction}</dd></div></dl><Link className={styles.primary} href={`/dashboard/new-order?platform=${encodeURIComponent(service.platform)}&service=${encodeURIComponent(service.code)}`}>Choose this service</Link></article>)}</div> : <p className={compare.empty}>Select services from the catalogue to compare pricing, delivery, refill and quantity limits here.</p>}
        </section>
      </div></>}
    </dialog>
  );
}
