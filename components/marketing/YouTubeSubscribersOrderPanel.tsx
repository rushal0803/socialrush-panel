"use client";
import Link from "next/link";
import { getServiceById } from "@/lib/smm-service-catalog";
import ServiceOrderCard from "@/components/marketing/services/ServiceOrderCard";
const service = getServiceById("youtube-subscribers");
export default function YouTubeSubscribersOrderPanel({ compact = false }: { compact?: boolean }) {
  if (!service) return null;
  return <section id="packages" className={compact ? "min-w-0 scroll-mt-24" : "mx-auto max-w-3xl scroll-mt-24 px-4 py-12 sm:px-6"}>
    <ServiceOrderCard service={service} title="Build Your YouTube Subscribers Order" description="Choose your quantity and review the total before continuing." />
    <div className="mt-3 flex gap-3 text-xs"><Link href="/youtube-views">YouTube Views</Link><Link href="/youtube-likes">YouTube Likes</Link></div>
  </section>;
}
