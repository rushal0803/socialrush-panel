/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";
import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export type PublicReview = { id:string; rating:number; title:string; message:string; platform:string|null; service_name:string|null; display_name:string; published_at:string|null };

const getCachedPublicReviews = unstable_cache(
  async (limit: number): Promise<PublicReview[]> => {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return [];

    const db = createAdminClient();
    const { data, error } = await db
      .from("customer_reviews")
      .select("id,rating,title,message,display_name,published_at,orders(platform,service_name)")
      .eq("moderation_status", "approved")
      .eq("public_permission", true)
      .is("removal_requested_at", null)
      .order("featured", { ascending: false })
      .order("published_at", { ascending: false })
      .limit(limit);

    if (error) return [];

    return (data || []).map((row: any) => ({
      id: row.id,
      rating: row.rating,
      title: row.title,
      message: row.message,
      platform: row.orders?.platform || null,
      service_name: row.orders?.service_name || null,
      display_name: row.display_name || "Verified customer",
      published_at: row.published_at,
    }));
  },
  ["public-reviews"],
  { revalidate: 300, tags: ["public-reviews"] },
);

export async function getPublicReviews(limit = 24): Promise<PublicReview[]> {
  return getCachedPublicReviews(limit);
}
