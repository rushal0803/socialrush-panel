"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { refundOrderToWalletOnce } from "@/lib/admin/refund-order";

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

const blogSlug = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
function parseBlocks(value: string) {
  let blocks: unknown;
  try { blocks = JSON.parse(value || "[]"); } catch { throw new Error("Content blocks must be valid JSON."); }
  if (!Array.isArray(blocks) || blocks.length > 100) throw new Error("Invalid content blocks.");
  const types = new Set(["paragraph", "heading", "bullet_list", "quote", "tip", "important", "warning", "example", "checklist"]);
  return blocks.map((block) => {
    if (!block || typeof block !== "object" || !types.has((block as { type?: string }).type || "") || typeof (block as { text?: unknown }).text !== "string" || !(block as { text: string }).text.trim()) throw new Error("A content block is invalid.");
    const item = block as { type: string; text: string; items?: unknown };
    if (item.items && (!Array.isArray(item.items) || item.items.some((v) => typeof v !== "string"))) throw new Error("A content list is invalid.");
    return { type: item.type, text: item.text.trim().slice(0, 12000), ...(item.items ? { items: (item.items as string[]).map((v) => v.trim()).filter(Boolean).slice(0, 30) } : {}) };
  });
}

export async function saveBlogArticle(formData: FormData) {
  const { supabase, user } = await requireAdmin(); const id = text(formData, "id"); const status = text(formData, "status") || "draft";
  if (!['draft','published','archived','redirect'].includes(status)) throw new Error("Invalid article status.");
  const title = text(formData, "title"), description = text(formData, "description"), slug = blogSlug(text(formData, "slug"));
  if (title.length < 10 || title.length > 120 || description.length < 50 || description.length > 300 || slug.length < 3 || slug.length > 100) throw new Error("Enter a valid title, description and slug.");
  const content = parseBlocks(text(formData, "content")); const redirectTo = text(formData, "redirect_to") || null;
  if (redirectTo && !/^\/blog\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(redirectTo)) throw new Error("Redirect destination must be an internal blog path.");
  if (status === "redirect" && !redirectTo) throw new Error("Redirect entries need a destination.");
  if (status === "published" && !content.length) throw new Error("Published articles need content.");
  const faq_items = text(formData, "faqs") ? JSON.parse(text(formData, "faqs")) : [];
  if (!Array.isArray(faq_items) || faq_items.some((f) => !f || typeof f.question !== "string" || typeof f.answer !== "string" || f.question.trim().length < 5 || !f.answer.trim())) throw new Error("One or more FAQs are invalid.");
  const related_slugs = text(formData, "related_slugs").split(",").map(blogSlug).filter(Boolean); if (new Set(related_slugs).size !== related_slugs.length || related_slugs.includes(slug)) throw new Error("Related articles must be unique and cannot include this article.");
  const now = new Date().toISOString(); const { data: existing } = id ? await supabase.from("blog_articles").select("published_at").eq("id", id).maybeSingle() : { data: null }; const payload = { slug, title, description, category: text(formData,"category"), status, featured: text(formData,"featured") === "true", author_name: text(formData,"author_name") || null, hero_image_url: text(formData,"hero_image_url") || null, hero_image_alt: text(formData,"hero_image_alt") || null, content, faq_items, related_slugs, seo_title: text(formData,"seo_title") || null, seo_description: text(formData,"seo_description") || null, canonical_path: `/blog/${slug}`, redirect_to: redirectTo, updated_by: user.id, updated_at: now, ...(status === "published" ? { published_at: existing?.published_at || now } : {}) };
  const result = id ? await supabase.from("blog_articles").update(payload).eq("id", id).select("id").single() : await supabase.from("blog_articles").insert({ ...payload, created_by: user.id }).select("id").single();
  if (result.error) throw new Error(result.error.code === "23505" ? "That slug is already in use." : "Unable to save this article.");
  await supabase.from("blog_audit_log").insert({ article_id: result.data.id, actor_id: user.id, action: id ? `article_${status}` : "article_created" });
  revalidateTag("managed-blog"); ["/blog", `/blog/${slug}`, "/sitemap.xml", "/admin/blog"].forEach((path) => revalidatePath(path)); redirect(`/admin/blog/${result.data.id}/edit`);
}

export async function updateRewardRules(formData: FormData) { const {supabase,user}=await requireAdmin();const {error}=await supabase.from("reward_programme_rules").update({enabled:text(formData,"enabled")==="true",manual_approval:text(formData,"manual_approval")==="true",minimum_order_amount:number(formData,"minimum_order_amount"),referrer_reward:number(formData,"referrer_reward"),new_customer_reward:number(formData,"new_customer_reward"),referral_expiry_days:number(formData,"referral_expiry_days"),loyalty_spend_threshold:number(formData,"loyalty_spend_threshold")||null,loyalty_reward:number(formData,"loyalty_reward")||null,updated_by:user.id,updated_at:new Date().toISOString()}).eq("id",true);if(error)throw new Error(error.message);revalidatePath("/admin/rewards");revalidatePath("/dashboard/rewards") }
export async function reviewReward(formData: FormData){const{supabase}=await requireAdmin();const id=text(formData,"id"),decision=text(formData,"decision");if(decision==="credit"){const{error}=await supabase.rpc("admin_credit_reward",{p_event:id});if(error)throw new Error(error.message)}else{await supabase.from("customer_reward_events").update({status:"rejected",internal_note:text(formData,"note"),updated_at:new Date().toISOString()}).eq("id",id)}revalidatePath("/admin/rewards");revalidatePath("/dashboard/rewards")}

export async function moderateReview(formData: FormData) {
  const { supabase, user } = await requireAdmin(); const id=text(formData,"id"); const status=text(formData,"status");
  if(!["pending","approved","rejected"].includes(status)) throw new Error("Invalid review status.");
  const {error}=await supabase.from("customer_reviews").update({moderation_status:status,featured:text(formData,"featured")==="true",published_at:status==="approved"?new Date().toISOString():null,updated_at:new Date().toISOString()}).eq("id",id); if(error)throw new Error(error.message);
  await supabase.from("review_moderation_notes").upsert({review_id:id,note:text(formData,"note"),updated_by:user.id,updated_at:new Date().toISOString()}); revalidatePath("/admin/reviews"); revalidatePath("/reviews");
}

export async function saveCaseStudy(formData: FormData) {
  const {supabase}=await requireAdmin(); const id=text(formData,"id"); const published=text(formData,"published")==="true"; const permission=text(formData,"permission_confirmed")==="true"; if(published&&!permission)throw new Error("Publishing requires confirmed customer permission.");
  const payload={slug:text(formData,"slug").toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-|-$/g,""),title:text(formData,"title"),platform:text(formData,"platform"),service_name:text(formData,"service_name"),customer_type:text(formData,"customer_type"),challenge:text(formData,"challenge"),service_selected:text(formData,"service_selected"),ordered_quantity:number(formData,"ordered_quantity")||null,delivery_timeline:text(formData,"delivery_timeline")||null,outcome:text(formData,"outcome"),customer_quote:text(formData,"customer_quote")||null,permission_confirmed:permission,published,featured:text(formData,"featured")==="true",seo_title:text(formData,"seo_title")||null,seo_description:text(formData,"seo_description")||null,related_service_href:text(formData,"related_service_href")||null,related_packages_href:text(formData,"related_packages_href")||null,published_at:published?new Date().toISOString():null,updated_at:new Date().toISOString()}; const result=id?await supabase.from("case_studies").update(payload).eq("id",id):await supabase.from("case_studies").insert(payload);if(result.error)throw new Error(result.error.message);revalidatePath("/admin/case-studies");revalidatePath("/case-studies");
}

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

export async function updateServiceHealth(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const id = number(formData, "id");
  const healthStatus = text(formData, "health_status");
  const allowed = new Set(["stable", "high_demand", "slower_delivery", "limited", "paused", "maintenance"]);
  if (!Number.isInteger(id) || !allowed.has(healthStatus)) throw new Error("Invalid service health update.");

  const { data: current, error: readError } = await supabase.from("services").select("health_status").eq("id", id).single();
  if (readError || !current) throw new Error("Service health could not be loaded.");
  const acceptsNewOrders = text(formData, "accepts_new_orders") === "true" && healthStatus !== "paused";
  const lastTested = text(formData, "last_tested_at");
  const internalNote = text(formData, "admin_health_note") || null;
  const { error } = await supabase.from("services").update({
    health_status: healthStatus,
    health_message: text(formData, "health_message") || null,
    accepts_new_orders: acceptsNewOrders,
    last_tested_at: lastTested ? new Date(lastTested).toISOString() : null,
    health_updated_at: new Date().toISOString(),
  }).eq("id", id);
  if (error) throw new Error(`Health update failed: ${error.message}`);
  const { error: historyError } = await supabase.from("service_health_history").insert({
    service_id: id,
    previous_status: current.health_status,
    new_status: healthStatus,
    changed_by: user.id,
    internal_reason: internalNote,
  });
  if (historyError) throw new Error(`Health saved, but audit history failed: ${historyError.message}`);
  revalidatePath("/admin/services");
  revalidatePath("/dashboard/new-order");
  revalidatePath("/services");
  revalidatePath("/packages");
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
    await refundOrderToWalletOnce(supabase, currentOrder);
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
  const status = text(formData, "status");
  if (!["open","waiting_for_support","waiting_for_customer","resolved","closed"].includes(status)) throw new Error("Invalid ticket status.");
  await supabase.from("support_tickets").update({ status, updated_at: new Date().toISOString(), resolved_at: status === "resolved" ? new Date().toISOString() : null }).eq("id", text(formData, "ticket_id"));
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
  const { error: statusError } = await supabase.from("support_tickets").update({ status: "waiting_for_customer", updated_at: new Date().toISOString(), last_reply_at: new Date().toISOString() }).eq("id", ticketId);
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

export async function addSupportInternalNote(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const note = text(formData, "note");
  if (!note) return;
  const { error } = await supabase.from("support_internal_notes").insert({ ticket_id: text(formData, "ticket_id"), admin_id: user.id, note });
  if (error) throw new Error(`Internal note could not be saved: ${error.message}`);
  revalidatePath("/admin/support");
}
