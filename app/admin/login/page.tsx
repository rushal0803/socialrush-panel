import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminLoginForm from "./AdminLoginForm";

export default async function AdminLoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile, error } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    if (profile?.role === "admin") redirect("/admin/dashboard");
    if (!error && profile) redirect("/dashboard/new-order");
    return <AdminLoginForm initialError="Unable to verify administrator access. Please sign in again." />;
  }
  return <AdminLoginForm />;
}
