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
  await supabase.from("services").insert({ category_id: number(formData, "category_id"), name: text(formData, "name"), rate: number(formData, "rate"), min: number(formData, "min"), max: number(formData, "max"), delivery_time: text(formData, "delivery_time") || "1-7 days", description: text(formData, "description"), status: text(formData, "status") || "active" });
  revalidatePath("/admin/services");
}

export async function updateService(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("services").update({ category_id: number(formData, "category_id"), name: text(formData, "name"), rate: number(formData, "rate"), min: number(formData, "min"), max: number(formData, "max"), delivery_time: text(formData, "delivery_time") || "1-7 days", description: text(formData, "description"), status: text(formData, "status") }).eq("id", number(formData, "id"));
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
  await supabase.from("orders").update({ status: text(formData, "status"), provider_order_id: text(formData, "provider_order_id") || null, admin_notes: text(formData, "admin_notes") || null }).eq("id", text(formData, "id"));
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
