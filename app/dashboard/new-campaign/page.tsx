import { redirect } from "next/navigation";
import { isUuid } from "@/lib/security/request";

export default async function NewCampaignPage({ searchParams }: { searchParams?: Promise<{ client?: string }> }) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const clientId = String(resolvedSearchParams.client || "").trim();
  redirect(clientId && isUuid(clientId)
    ? `/dashboard/campaigns?client=${encodeURIComponent(clientId)}`
    : "/dashboard/campaigns");
}
