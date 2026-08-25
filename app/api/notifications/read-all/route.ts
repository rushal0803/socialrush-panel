import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireSameOrigin } from "@/lib/security/request";
export async function POST(request: NextRequest) { const originError = requireSameOrigin(request); if (originError) return originError; const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); const { error } = await supabase.from("customer_notifications").update({ read_at: new Date().toISOString() }).eq("user_id", user.id).is("read_at", null); if (error) return NextResponse.json({ error: "Notifications could not be updated." }, { status: 400 }); return NextResponse.json({ ok: true }); }
