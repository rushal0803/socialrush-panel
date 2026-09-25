import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ eligible: false }, { status: 401, headers: { "Cache-Control": "no-store" } });

  const [{ data: rules, error: rulesError }, { count, error: ordersError }] = await Promise.all([
    db.from("reward_programme_rules")
      .select("enabled,manual_approval,minimum_order_amount,new_customer_reward")
      .eq("id", true)
      .maybeSingle(),
    db.from("orders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .not("status", "in", "(cancelled,refunded,failed)")
      .not("payment_status", "in", "(cancelled,refunded,failed)"),
  ]);

  if (rulesError || ordersError) {
    return NextResponse.json({ eligible: false }, { status: 200, headers: { "Cache-Control": "no-store" } });
  }

  const reward = Number(rules?.new_customer_reward || 0);
  const minimum = Number(rules?.minimum_order_amount || 0);
  const eligible = Boolean(
    rules?.enabled &&
    !rules.manual_approval &&
    reward > 0 &&
    minimum > 0 &&
    (count || 0) === 0
  );

  return NextResponse.json(
    eligible ? { eligible: true, reward, minimum } : { eligible: false },
    { headers: { "Cache-Control": "no-store" } },
  );
}
