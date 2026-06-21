import { NextResponse, type NextRequest } from "next/server";
import { findChatbotAnswer } from "@/lib/chatbot/knowledge";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as { message?: string } | null;
  const message = String(body?.message || "").trim();
  if (!message) return NextResponse.json({ error: "Message is required" }, { status: 422 });
  if (message.length > 1000) return NextResponse.json({ error: "Message is too long" }, { status: 422 });
  return NextResponse.json({ answer: findChatbotAnswer(message), source: "local-knowledge-base" });
}
