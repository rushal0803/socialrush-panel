"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
export async function updateAccount(formData:FormData){const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect("/login");const {error}=await supabase.rpc("update_my_account",{p_first_name:String(formData.get("first_name")||""),p_last_name:String(formData.get("last_name")||""),p_phone:String(formData.get("phone")||""),p_company_name:String(formData.get("company_name")||""),p_website:String(formData.get("website")||""),p_billing_address:String(formData.get("billing_address")||""),p_gst_number:String(formData.get("gst_number")||"")});if(error)redirect(`/dashboard/account?error=${encodeURIComponent(error.message)}`);revalidatePath("/dashboard/account");redirect("/dashboard/account?saved=1")}
