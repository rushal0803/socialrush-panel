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

export async function updateTransactionStatus(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("transactions").update({ status: text(formData, "status") }).eq("id", text(formData, "id"));
  revalidatePath("/admin/transactions");
}

export async function replyToTicket(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const ticketId = text(formData, "ticket_id");
  await supabase.from("support_messages").insert({ ticket_id: ticketId, sender_id: user.id, message: text(formData, "message") });
  await supabase.from("support_tickets").update({ status: "answered" }).eq("id", ticketId);
  revalidatePath("/admin/support");
}

export async function closeTicket(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("support_tickets").update({ status: "closed" }).eq("id", text(formData, "ticket_id"));
  revalidatePath("/admin/support");
}
