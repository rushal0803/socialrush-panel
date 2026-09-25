import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ eligible: false }, { status: 401, headers: { "Cache-Control": "no-store" } });

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
    return NextResponse.json({ eligible: false }, { status: 200, headers: { "Cache-Control": "no-store" } });
  }

  const hasPriorQualifyingOrder = (orders || []).some((order) =>
    !["cancelled", "refunded", "failed"].includes(String(order.status || "").toLowerCase()) &&
    !["cancelled", "refunded", "failed"].includes(String(order.payment_status || "paid").toLowerCase())
  );
  const reward = Number(rules?.new_customer_reward || 0);
  const minimum = Number(rules?.minimum_order_amount || 0);
  const eligible = Boolean(
    rules?.enabled &&
    !rules.manual_approval &&
    reward > 0 &&
    minimum > 0 &&
    !hasPriorQualifyingOrder
  );

  return NextResponse.json(
    eligible ? { eligible: true, reward, minimum } : { eligible: false },
    { headers: { "Cache-Control": "no-store" } },
  );
}
