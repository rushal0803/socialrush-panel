import { createClient } from "@/lib/supabase/server";
import DashboardHeaderBar from "@/components/dashboard/DashboardHeaderBar";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user ? await supabase.from("profiles").select("full_name,role").eq("id", user.id).maybeSingle() : { data: null };

  const name = profile?.full_name || user?.email?.split("@")[0] || "Client";
  const initials = name
    .split(" ")
    .map((part: string) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return <DashboardHeaderBar name={name} role={profile?.role || "user"} initials={initials} />;
}
