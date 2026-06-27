import { updateAccount } from "./actions";
import AccountDashboardContent from "@/components/dashboard/AccountDashboardContent";
import { getDashboardContext } from "@/lib/auth/dashboard-context";

type AccountSearchParams = {
  saved?: string;
  error?: string;
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams?: AccountSearchParams;
}) {
  const { supabase, user } = await getDashboardContext();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,phone,company_name,website,billing_address,gst_number,avatar_url,role")
    .eq("id", user!.id)
    .single();

  const names = (profile?.full_name || "").trim().split(/\s+/);
  const firstName = names.shift() || "";
  const lastName = names.join(" ");

  return (
    <AccountDashboardContent
      profile={profile}
      email={user?.email || ""}
      role={profile?.role || "user"}
      firstName={firstName}
      lastName={lastName}
      saved={searchParams?.saved}
      error={searchParams?.error}
      updateAction={updateAccount}
    />
  );
}
