"use client";
import { getServiceById } from "@/lib/smm-service-catalog";
import ServiceOrderCard from "@/components/marketing/services/ServiceOrderCard";
const service = getServiceById("instagram-likes");
export default function InstagramLikesOrderPanel({ compact = false }: { compact?: boolean }) {
  if (!service) return null;
  return <section id="packages" className={compact ? "min-w-0 scroll-mt-24" : "mx-auto max-w-3xl scroll-mt-24 px-4 py-12 sm:px-6"}>
    <ServiceOrderCard service={service} title="Build Your Instagram Likes Order" description="Choose your quantity and see your total instantly." />

  </section>;
}
