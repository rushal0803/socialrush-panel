import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { claimReferralForUser } from "@/lib/referrals/claim-referral";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ status: "unauthenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const code = typeof body?.code === "string" ? body.code : null;
  const result = await claimReferralForUser({
    userId: user.id,
    userCreatedAt: user.created_at,
    code,
  });

  const statusCode =
    result.status === "claimed" || result.status === "already_claimed"
      ? 200
      : result.status === "unavailable"
        ? 503
        : 400;

  return NextResponse.json(result, { status: statusCode });
}
