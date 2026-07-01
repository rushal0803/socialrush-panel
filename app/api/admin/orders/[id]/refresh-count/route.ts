import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { detectPublicCount } from "@/lib/orders/count-detector";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdminApi();
  if ("response" in auth) return auth.response;

  const { data: order, error } = await auth.supabase
    .from("orders")
    .select("id,link,platform,service_name")
    .eq("id", params.id)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const result = await detectPublicCount({
    url: order.link,
    platform: order.platform,
    serviceName: order.service_name,
  });

  const update = result.success
    ? {
        current_count: result.count,
        count_detection_message: result.message,
        last_count_checked_at: new Date().toISOString(),
      }
    : {
        count_detection_message: `Could not fetch current count. Update manually. ${result.message}`,
        last_count_checked_at: new Date().toISOString(),
      };
  const { data, error: updateError } = await auth.supabase.from("orders").update(update).eq("id", params.id).select("*").single();
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${params.id}`);
  revalidatePath("/dashboard/orders");
  return NextResponse.json({ data, detection: result });
}

