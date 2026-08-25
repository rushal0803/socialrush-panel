import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/security/request";
import { formatPublicOrderId } from "@/lib/orders/public-reference";

const escapeHtml = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] || character);
const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value);

export async function GET(_: Request, { params }: { params: { id: string } }) {
  if (!isUuid(params.id)) return NextResponse.json({ error: "Invalid order reference." }, { status: 422 });
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: order, error } = await supabase.from("orders").select("id,public_order_id,created_at,platform,service_name,quantity,unit_price,charge,payment_status,status,link,profiles(full_name,email)").eq("id", params.id).eq("user_id", user.id).maybeSingle();
  if (error) return NextResponse.json({ error: "Receipt could not be generated." }, { status: 400 });
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  const confirmed = ["paid", "completed"].includes(String(order.payment_status || "").toLowerCase()) || ["completed", "processing", "in_progress", "partial", "refilling", "refill_requested"].includes(order.status);
  if (!confirmed) return NextResponse.json({ error: "A receipt is available after payment is confirmed." }, { status: 409 });
  const profile = order.profiles as unknown as { full_name?: string; email?: string } | null;
  const reference = formatPublicOrderId(order.public_order_id); const date = new Date(order.created_at).toLocaleString("en-IN");
  const row = (label: string, value: unknown) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`;
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>SocialRUSH receipt ${escapeHtml(reference)}</title><style>body{font-family:Arial,sans-serif;color:#15171c;margin:0;padding:40px;background:#f4f4f5}.receipt{max-width:760px;margin:auto;background:#fff;padding:42px;border-top:7px solid #ff7600;box-shadow:0 8px 30px #0002}h1{margin:0;color:#111;font-size:30px}.brand,.total{color:#ff7600;font-weight:800}.brand{letter-spacing:1px}.muted{color:#64748b}table{width:100%;border-collapse:collapse;margin-top:28px}th,td{text-align:left;padding:13px;border-bottom:1px solid #e5e7eb;font-size:14px}th{color:#64748b;text-transform:uppercase;font-size:11px;letter-spacing:.7px}.total{font-size:20px}.box{background:#fff7ed;padding:15px;margin-top:24px;border-radius:8px;font-size:13px}.print{display:block;margin:0 auto 20px;border:0;border-radius:8px;background:#ff7600;color:#fff;padding:12px 18px;font-weight:700;cursor:pointer}@media print{body{padding:0;background:#fff}.receipt{box-shadow:none}.print{display:none}}</style></head><body><button class="print" onclick="window.print()">Print / Save as PDF</button><main class="receipt"><div style="display:flex;justify-content:space-between;gap:20px"><div><div class="brand">SOCIALRUSH</div><h1>Payment Receipt</h1><p class="muted">getSocialRUSH · Generated ${escapeHtml(new Date().toLocaleString("en-IN"))}</p></div><div class="muted"><b>Order</b><br>${escapeHtml(reference)}<br>${escapeHtml(date)}</div></div><table>${row("Customer", profile?.full_name || "Customer")}<tr><th></th><td class="muted">${escapeHtml(profile?.email || user.email || "")}</td></tr>${row("Platform", order.platform || "Not specified")}${row("Service", order.service_name || "Growth service")}${row("Quantity", Number(order.quantity).toLocaleString("en-IN"))}${order.unit_price !== null ? row("Unit rate", `${order.unit_price} / 1K`) : ""}${row("Payment status", order.payment_status || "Paid")}${row("Order status", order.status)}<tr><th>Campaign link</th><td style="word-break:break-all">${escapeHtml(order.link)}</td></tr><tr><th>Final amount</th><td class="total">${escapeHtml(money(Number(order.charge)))}</td></tr></table><div class="box">This is a payment receipt for your SocialRUSH order. It does not include tax, GST, or company registration information.</div></main></body></html>`;
  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Content-Disposition": `inline; filename="SocialRUSH-${reference}-receipt.html"`, "Cache-Control": "private, no-store" } });
}
