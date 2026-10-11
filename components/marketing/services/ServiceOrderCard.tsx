"use client";

import Link from "next/link";
import { ArrowRight, Check, Headphones, Minus, Plus } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import PlatformIcon from "@/components/PlatformIcon";
import { formatCurrency } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";
import { track } from "@/lib/analytics/events";
import { linkRules, validateCampaignLink } from "@/lib/order-service-experience";
import { validateQuantity, type ServiceCode } from "@/lib/service-pricing";
import { previewOrderTotal } from "@/lib/cro/service-order-preview";
import { buildQuantityMerchandising } from "@/lib/cro/quantity-merchandising";
import styles from "./ServiceExperience.module.css";

export type OrderCardService = {
  code: ServiceCode; platform: string; name: string; pricePer1000: number;
  minQuantity: number; maxQuantity: number; quantityStep?: number;
  deliveryTime: string; refillPolicy: string; importantInstruction?: string;
};

export default function ServiceOrderCard({ service, title = "Configure your order", summaryName = service.name, description = "Choose your quantity and review the total before continuing." }: {
  service: OrderCardService; title?: string; summaryName?: string; description?: string;
}) {
  const id = useId();
  const quantityRef = useRef<HTMLInputElement>(null);
  const linkRef = useRef<HTMLInputElement>(null);
  const { currency, rates } = usePreferredCurrency("INR");
  const [input, setInput] = useState(String(service.minQuantity));
  const [link, setLink] = useState("");
  const [attempted, setAttempted] = useState(false);
  const quantity = Number(input);
  const qtyError = validateQuantity(quantity, service);
  const rule = linkRules[service.code];
  const linkError = link.trim() ? validateCampaignLink(link, rule) : `Enter your ${rule.label} to continue.`;
  const total = previewOrderTotal(service.pricePer1000, quantity, service);
  const quantityOptions = buildQuantityMerchandising(service);
  const ready = total !== null && !linkError;
  const step = service.quantityStep ?? 1;
  const money = (value: number) => formatCurrency(value, currency, rates);
  const href = `/dashboard/new-order?${new URLSearchParams({ platform: service.platform, service: service.code, resume: "1", quantity: String(quantity), link: link.trim() })}`;

  useEffect(() => {
    track("package_viewed", { service_code: service.code, platform: service.platform, surface: "service_order_card" });
  }, [service.code, service.platform]);

  function selectQuantity(value: number) {
    setInput(String(value));
    track("package_selected", { service_code: service.code, platform: service.platform, quantity: value, surface: "service_order_card" });
  }
  function nudge(direction: number) {
    const base = Number.isFinite(quantity) ? quantity : service.minQuantity;
    const last = service.minQuantity + Math.floor((service.maxQuantity - service.minQuantity) / step) * step;
    selectQuantity(Math.max(service.minQuantity, Math.min(last, service.minQuantity + Math.round((base - service.minQuantity) / step) * step + direction * step)));
  }
  function continueOrder(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!ready) {
      event.preventDefault(); setAttempted(true);
      (qtyError ? quantityRef : linkRef).current?.focus();
      return;
    }
    track("new_order_clicked", { service_code: service.code, platform: service.platform, quantity, surface: "service_order_card" });
  }

  return <div className={styles.orderCard} data-service-order-card data-platform={service.platform}>
    <div className={styles.cardHeader}><span className={styles.platformIcon}><PlatformIcon platform={service.platform} className="h-5 w-5" /></span><div><h2 className={styles.cardTitle}>{title}</h2><p className={styles.eyebrow}>{summaryName}</p></div></div>
    <p className={styles.cardDescription}>{description}</p>
    <div className={styles.orderFlow} aria-label="Order steps"><span><strong>01</strong> Choose quantity</span><span><strong>02</strong> Add link</span><span><strong>03</strong> Review</span></div>
    <div className={styles.total}><div><span>Estimated total</span><strong aria-live="polite" aria-atomic="true">{total === null ? "—" : money(total)}</strong></div><div><span>{qtyError ? "Check quantity" : `${quantity.toLocaleString("en-IN")} units`}</span><small>{money(service.pricePer1000)} / 1,000</small></div></div>
    {currency !== "INR" && <p className={styles.help}>Display estimate · checkout charged in INR{total !== null ? ` (${formatCurrency(total, "INR")})` : ""}.</p>}
    <fieldset className={styles.fieldset}><legend>1. Choose quantity</legend>
      <div className={styles.quantities} data-cro-quantity-grid>{quantityOptions.map(option => <button key={option.value} type="button" data-cro-quantity-option aria-label={`${option.value.toLocaleString("en-IN")} ${service.name}: ${money(previewOrderTotal(service.pricePer1000, option.value, service)!)} estimated total`} aria-pressed={quantity === option.value} onClick={() => selectQuantity(option.value)}><span>{option.value.toLocaleString("en-IN")}</span><small>{option.label ? `${option.label} · ` : ""}{money(previewOrderTotal(service.pricePer1000, option.value, service)!)}</small>{quantity === option.value && <Check className="h-3.5 w-3.5" aria-hidden="true" />}</button>)}</div>
      <label htmlFor={`${id}-quantity`} className={styles.inputLabel}>Custom quantity</label>
      <div className={styles.stepper}><button type="button" aria-label="Decrease quantity" onClick={() => nudge(-1)} disabled={quantity <= service.minQuantity}><Minus className="h-4 w-4" /></button><input ref={quantityRef} id={`${id}-quantity`} value={input} onChange={event => setInput(event.target.value.replace(/\D/g, ""))} inputMode="numeric" aria-invalid={attempted && Boolean(qtyError)} aria-describedby={`${id}-quantity-help`} /><button type="button" aria-label="Increase quantity" onClick={() => nudge(1)} disabled={quantity >= service.maxQuantity}><Plus className="h-4 w-4" /></button></div>
      <p id={`${id}-quantity-help`} className={attempted && qtyError ? styles.error : styles.help} role={attempted && qtyError ? "alert" : undefined}>{attempted && qtyError ? qtyError : `${service.minQuantity.toLocaleString("en-IN")}–${service.maxQuantity.toLocaleString("en-IN")} units${step > 1 ? ` · increments of ${step}` : ""}`}</p>
    </fieldset>
    <label className={styles.linkLabel} htmlFor={`${id}-link`}>2. Enter your {rule.label}</label>
    <input ref={linkRef} className={styles.linkInput} id={`${id}-link`} value={link} onChange={event => setLink(event.target.value)} placeholder={rule.placeholder} autoCapitalize="none" autoCorrect="off" spellCheck={false} inputMode="url" aria-invalid={attempted && Boolean(linkError)} aria-describedby={`${id}-link-help`} />
    <p id={`${id}-link-help`} className={attempted && linkError ? styles.error : styles.help} role={attempted && linkError ? "alert" : undefined}>{attempted && linkError ? linkError : rule.helper}</p>
    <dl className={styles.facts}><div><dt>Delivery estimate</dt><dd>{service.deliveryTime}</dd></div><div><dt>Refill terms</dt><dd>{service.refillPolicy}</dd></div></dl>
    {service.importantInstruction ? <p className={styles.help} data-cro-service-instruction><strong>Before you continue:</strong> {service.importantInstruction}</p> : null}
    <div className={styles.readiness} data-cro-readiness role="status"><Check className="h-3.5 w-3.5" aria-hidden="true" />{ready ? "Details ready · Final price verified at checkout" : "Choose a valid quantity and enter the required public link"}</div>
    <Link href={ready ? href : "#"} onClick={continueOrder} className={styles.primary}>Continue to Secure Order <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
    <p className={styles.nextStep}>No payment is taken on this page. Your selection carries into secure order review, where the current INR total is confirmed.</p>
    <div className={styles.assurance}><span><Check className="h-3.5 w-3.5" aria-hidden="true" />No password required</span><span><Check className="h-3.5 w-3.5" aria-hidden="true" />Dashboard order tracking</span></div>
    <Link href="/contact" className={styles.support}><Headphones className="h-4 w-4" aria-hidden="true" />Need help choosing?</Link>
  </div>;
}
