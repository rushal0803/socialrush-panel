import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureUserProfile } from "@/lib/auth/ensure-profile";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const isAdminLogin = headers().get("x-socialrush-admin-login") === "1";
  if (isAdminLogin) return <>{children}</>;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const profile = await ensureUserProfile(supabase, user).catch(() => null);
  if (!profile || profile.role !== "admin") redirect("/dashboard");

  return (
    <div className="dashboard-shell relative flex min-h-screen">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <AdminHeader name={profile.full_name} email={user.email || ""} />
        {children}
      </div>
    </div>
  );
}
