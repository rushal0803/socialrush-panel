import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { smmServiceCatalog } from "@/lib/smm-service-catalog";

export const dynamic = "force-dynamic";

const databaseNameOverrides: Record<string, string> = {
  "Instagram Real Followers": "instagram-followers",
  "LinkedIn Profile Followers": "linkedin-followers",
  "Telegram Premium Members": "telegram-members",
  "X Followers": "x-followers",
};

const getCachedServiceHealthRows = unstable_cache(
  async () => {
    const { data, error } = await createAdminClient()
      .from("services")
      .select("name,health_status,health_message,accepts_new_orders,health_updated_at")
      .eq("is_active", true);
    if (error) throw new Error("Service health query failed.");
    return data ?? [];
  },
  ["public-service-health"],
  { revalidate: 30 },
);

export async function GET() {
  try {
    const rows = await getCachedServiceHealthRows();
    const health = Object.fromEntries(rows.flatMap((row) => {
      const code = databaseNameOverrides[row.name] || smmServiceCatalog.find((service) => service.name === row.name)?.code;
      return code ? [[code, { status: row.health_status, message: row.health_message, acceptsNewOrders: Boolean(row.accepts_new_orders), updatedAt: row.health_updated_at }]] : [];
    }));
    return NextResponse.json({ data: health }, { headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=60" } });
  } catch {
    return NextResponse.json({ error: "Service health is unavailable." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
