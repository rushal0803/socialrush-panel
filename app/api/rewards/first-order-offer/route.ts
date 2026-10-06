import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildFirstOrderContext } from "@/lib/cro/first-order-conversion";

export async function GET() {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ firstOrder: false, eligible: false }, { status: 401, headers: { "Cache-Control": "no-store" } });

  const [{ data: rules, error: rulesError }, { data: orders, error: ordersError }] = await Promise.all([
    db.from("reward_programme_rules")
      .select("enabled,manual_approval,minimum_order_amount,new_customer_reward")
      .eq("id", true)
      .maybeSingle(),
    db.from("orders")
      .select("status,payment_status")
      .eq("user_id", user.id),
  ]);

  if (rulesError || ordersError) {
    return NextResponse.json({ firstOrder: false, eligible: false }, { status: 200, headers: { "Cache-Control": "no-store" } });
  }

  const context = buildFirstOrderContext(rules, orders || []);

  return NextResponse.json(context, {
    headers: { "Cache-Control": "no-store" },
  });
}
