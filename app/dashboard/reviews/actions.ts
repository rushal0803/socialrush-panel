"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
const value=(f:FormData,k:string)=>String(f.get(k)||"").trim();
export async function submitReview(formData:FormData){const db=await createClient();const {data:{user}}=await db.auth.getUser();if(!user)redirect("/login");const rating=Number(value(formData,"rating"));const orderId=value(formData,"order_id");const {error}=await db.rpc("submit_verified_review",{p_order_id:orderId,p_rating:rating,p_title:value(formData,"title"),p_message:value(formData,"message"),p_quality:value(formData,"quality_feedback"),p_delivery:value(formData,"delivery_feedback"),p_permission:formData.get("public_permission")==="on",p_display:value(formData,"display_name_preference")});if(error)redirect(`/dashboard/reviews/new?order=${encodeURIComponent(orderId)}&error=${encodeURIComponent(error.message)}`);revalidatePath("/dashboard/reviews");redirect("/dashboard/reviews?submitted=1")}
export async function requestRemoval(formData:FormData){const db=await createClient();await db.rpc("request_review_removal",{p_id:value(formData,"id")});revalidatePath("/dashboard/reviews")}
