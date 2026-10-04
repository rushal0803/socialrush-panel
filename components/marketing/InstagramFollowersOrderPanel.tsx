"use client";

import { getServiceById } from "@/lib/smm-service-catalog";
import ServiceOrderCard from "@/components/marketing/services/ServiceOrderCard";

const service = getServiceById("instagram-followers");

export default function InstagramFollowersOrderPanel({ compact = false }: { compact?: boolean }) {
  if (!service) return null;
  return <section id="packages" className={compact ? "scroll-mt-24 min-w-0" : "mx-auto max-w-3xl scroll-mt-24 px-4 py-12 sm:px-6"}>
    <ServiceOrderCard service={service} title="Build Your Instagram Followers Order" description="Choose your quantity and see your total instantly." />
  </section>;
}
