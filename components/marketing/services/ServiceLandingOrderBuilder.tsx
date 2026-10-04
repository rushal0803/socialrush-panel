import ServiceOrderCard, { type OrderCardService } from "./ServiceOrderCard";

export default function ServiceLandingOrderBuilder({ service, compact = false }: { service: OrderCardService; compact?: boolean }) {
  return <section id="order-builder" className={compact ? "scroll-mt-24 min-w-0" : "mx-auto max-w-3xl scroll-mt-24 px-4 py-12 sm:px-6"}>
    <ServiceOrderCard service={service} title="Choose quantity, then add your public link." description="Your live total updates here before you continue. No password is required." />
  </section>;
}
