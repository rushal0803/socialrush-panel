import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildFirstOrderContext } from "@/lib/cro/first-order-conversion";

export async function GET() {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ firstOrder: false, eligible: false }, { status: 401, headers: { "Cache-Control": "no-store" } });

  const [
    { data: rules, error: rulesError },
    { data: orders, error: ordersError },
    { data: assignment, error: assignmentError },
  ] = await Promise.all([
    db.from("reward_programme_rules")
      .select("enabled,manual_approval,minimum_order_amount,new_customer_reward")
      .eq("id", true)
      .maybeSingle(),
    db.from("orders")
      .select("status,payment_status")
      .eq("user_id", user.id),
    db.from("first_order_bonus_experiment_assignments")
      .select("variant")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (rulesError || ordersError || assignmentError) {
    return NextResponse.json({ firstOrder: false, eligible: false, variant: "unknown" }, { status: 200, headers: { "Cache-Control": "no-store" } });
  }

  const context = buildFirstOrderContext(rules, orders || []);
  const variant = String(assignment?.variant || "unassigned");

  if (!context.firstOrder) {
    return NextResponse.json({ ...context, variant }, { headers: { "Cache-Control": "no-store" } });
  }

  const offerEligibleVariant = variant === "bonus" || variant === "legacy_bonus";
  const experimentContext = offerEligibleVariant
    ? { ...context, variant }
    : { firstOrder: true, eligible: false as const, variant };

  return NextResponse.json(experimentContext, {
    headers: { "Cache-Control": "no-store" },
  });
}
