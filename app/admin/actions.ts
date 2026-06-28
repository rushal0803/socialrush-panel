"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/dashboard");
  return { supabase, user };
}

function text(formData: FormData, name: string) { return String(formData.get(name) || "").trim(); }
function number(formData: FormData, name: string) { return Number(formData.get(name)); }

export async function addService(formData: FormData) {
  const { supabase } = await requireAdmin();
  const isActive = text(formData, "is_active") !== "false";
  await supabase.from("services").insert({
    category_id: number(formData, "category_id"),
    name: text(formData, "name"),
    rate: number(formData, "rate"),
    min: number(formData, "min"),
    max: number(formData, "max") || 1000000,
    delivery_time: text(formData, "delivery_time") || "1-7 days",
    refill_policy: text(formData, "refill_policy") || "Refill eligible",
    quality_type: text(formData, "quality_type") || "Premium",
    important_instruction: text(formData, "important_instruction") || "Use a public URL only.",
    platform: text(formData, "platform") || null,
    description: text(formData, "description"),
    is_active: isActive,
    status: isActive ? "active" : "inactive",
  });
  revalidatePath("/admin/services");
}

export async function updateService(formData: FormData) {
  const { supabase } = await requireAdmin();
  const isActive = text(formData, "is_active") !== "false";
  await supabase.from("services").update({
    category_id: number(formData, "category_id"),
    name: text(formData, "name"),
    rate: number(formData, "rate"),
    min: number(formData, "min"),
    max: number(formData, "max") || 1000000,
    delivery_time: text(formData, "delivery_time") || "1-7 days",
    refill_policy: text(formData, "refill_policy") || "Refill eligible",
    quality_type: text(formData, "quality_type") || "Premium",
    important_instruction: text(formData, "important_instruction") || "Use a public URL only.",
    platform: text(formData, "platform") || null,
    description: text(formData, "description"),
    is_active: isActive,
    status: isActive ? "active" : "inactive",
  }).eq("id", number(formData, "id"));
  revalidatePath("/admin/services");
}

export async function deleteService(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("services").delete().eq("id", number(formData, "id"));
  revalidatePath("/admin/services");
}

export async function addCategory(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("categories").insert({ name: text(formData, "name") });
  revalidatePath("/admin/categories"); revalidatePath("/admin/services");
}

export async function updateCategory(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("categories").update({ name: text(formData, "name") }).eq("id", number(formData, "id"));
  revalidatePath("/admin/categories"); revalidatePath("/admin/services");
}

export async function deleteCategory(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("categories").delete().eq("id", number(formData, "id"));
  revalidatePath("/admin/categories");
}

export async function updateOrder(formData: FormData) {
  const { supabase } = await requireAdmin();

  const orderId = text(formData, "id");
  const nextStatus = text(formData, "status");
  const providerOrderId = text(formData, "provider_order_id") || null;
  const adminNotes = text(formData, "admin_notes") || null;
  const startCount = Number(formData.get("start_count") || 0);
  const remains = Number(formData.get("remains") || 0);

  const { data: currentOrder } = await supabase
    .from("orders")
    .select("id, user_id, charge, status")
    .eq("id", orderId)
    .single();

  if (!currentOrder) {
    revalidatePath("/admin/orders");
    return;
  }

  await supabase
    .from("orders")
    .update({
      status: nextStatus,
      provider_order_id: providerOrderId,
      admin_notes: adminNotes,
      start_count: Number.isFinite(startCount) ? Math.max(0, startCount) : 0,
      remains: Number.isFinite(remains) ? Math.max(0, remains) : 0,
    })
    .eq("id", orderId);

  const refundStatuses = new Set(["cancelled", "refunded"]);
  const shouldRefund = refundStatuses.has(nextStatus) && !refundStatuses.has(currentOrder.status);

  if (shouldRefund) {
    const amount = Number(currentOrder.charge ?? 0);
    if (amount > 0) {
      await supabase.rpc("admin_adjust_balance", {
        p_user_id: currentOrder.user_id,
        p_amount: amount,
        p_operation: "add",
      });

      await supabase
        .from("transactions")
        .insert({
          user_id: currentOrder.user_id,
          amount,
          type: "refund",
          status: "completed",
          payment_method: "wallet",
          description: `Refund issued for cancelled order ${orderId}`,
        });
    }
  }

  revalidatePath("/admin/orders"); revalidatePath("/admin");
}

export async function adjustBalance(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.rpc("admin_adjust_balance", { p_user_id: text(formData, "user_id"), p_amount: number(formData, "amount"), p_operation: text(formData, "operation") });
  revalidatePath("/admin/users"); revalidatePath("/admin/transactions"); revalidatePath("/admin");
}

export async function changeUserRole(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const userId = text(formData, "user_id");
  if (userId === user.id && text(formData, "role") !== "admin") return;
  await supabase.from("profiles").update({ role: text(formData, "role") }).eq("id", userId);
  revalidatePath("/admin/users");
}

export async function setUserBlocked(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.rpc("admin_set_user_blocked", {
    p_user_id: text(formData, "user_id"),
    p_blocked: text(formData, "blocked") === "true",
  });
  revalidatePath("/admin/users");
}

export async function addPackage(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("packages").insert({
    name: text(formData, "name"),
    platform: text(formData, "platform"),
    price: number(formData, "price"),
    features: text(formData, "features").split("\n").map((item) => item.trim()).filter(Boolean),
    is_active: text(formData, "is_active") !== "false",
  });
  revalidatePath("/admin/packages");
}

export async function updatePackage(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("packages").update({
    name: text(formData, "name"),
    platform: text(formData, "platform"),
    price: number(formData, "price"),
    features: text(formData, "features").split("\n").map((item) => item.trim()).filter(Boolean),
    is_active: text(formData, "is_active") !== "false",
    updated_at: new Date().toISOString(),
  }).eq("id", number(formData, "id"));
  revalidatePath("/admin/packages");
}

export async function deletePackage(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("packages").delete().eq("id", number(formData, "id"));
  revalidatePath("/admin/packages");
}

export async function reviewPayment(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.rpc("admin_review_payment", {
    p_transaction_id: text(formData, "id"),
    p_decision: text(formData, "decision"),
  });
  revalidatePath("/admin/payments");
  revalidatePath("/admin/users");
  revalidatePath("/admin");
}

export async function setTicketStatus(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("support_tickets").update({ status: text(formData, "status") }).eq("id", text(formData, "ticket_id"));
  revalidatePath("/admin/support");
}

export async function updateWebsiteSettings(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const rates = {
    INR: 1,
    USD: number(formData, "rate_USD"),
    EUR: number(formData, "rate_EUR"),
    GBP: number(formData, "rate_GBP"),
    AED: number(formData, "rate_AED"),
    CAD: number(formData, "rate_CAD"),
    AUD: number(formData, "rate_AUD"),
  };
  await supabase.from("website_settings").upsert({
    key: "general",
    value: {
      whatsapp_number: text(formData, "whatsapp_number"),
      support_email: text(formData, "support_email"),
      currency_rates: rates,
      payment_instructions: text(formData, "payment_instructions"),
      notice_text: text(formData, "notice_text"),
    },
    updated_at: new Date().toISOString(),
    updated_by: user.id,
  });
  revalidatePath("/admin/settings");
}

export async function updateTransactionStatus(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("transactions").update({ status: text(formData, "status") }).eq("id", text(formData, "id"));
  revalidatePath("/admin/transactions");
}

export async function replyToTicket(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const ticketId = text(formData, "ticket_id");
  const message = text(formData, "message");
  if (!ticketId || !message) return;
  const { error } = await supabase.from("support_messages").insert({
    ticket_id: ticketId,
    sender_id: user.id,
    message,
  });
  if (error) throw new Error(`Unable to send support reply: ${error.message}`);
  const { error: statusError } = await supabase.from("support_tickets").update({ status: "answered" }).eq("id", ticketId);
  if (statusError) throw new Error(`Reply sent, but ticket status could not be updated: ${statusError.message}`);
  revalidatePath("/admin/support");
  revalidatePath("/dashboard/support");
  redirect(`/admin/support?ticket=${encodeURIComponent(ticketId)}`);
}

export async function closeTicket(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("support_tickets").update({ status: "closed" }).eq("id", text(formData, "ticket_id"));
  revalidatePath("/admin/support");
}
