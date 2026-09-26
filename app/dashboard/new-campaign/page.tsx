import { redirect } from "next/navigation";
import { isUuid } from "@/lib/security/request";

export default function NewCampaignPage({ searchParams = {} }: { searchParams?: { client?: string } }) {
  const clientId = String(searchParams.client || "").trim();
  redirect(clientId && isUuid(clientId)
    ? `/dashboard/campaigns?client=${encodeURIComponent(clientId)}`
    : "/dashboard/campaigns");
}
