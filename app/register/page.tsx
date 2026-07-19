import type { Metadata } from "next";
import AuthShell from "@/components/AuthShell";
import RegisterForm from "@/components/auth/RegisterForm";
import { createClient } from "@/lib/supabase/server";
import { getSafeCustomerDestination } from "@/lib/auth/destination";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Create a SocialRUSH account",
  description: "Create your SocialRUSH account to order services, track campaigns, and manage wallet payments.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/register" },
};
export const dynamic = "force-dynamic";

type RegisterPageProps = {
  searchParams?: {
    next?: string;
  };
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const safeNext = getSafeCustomerDestination(searchParams?.next);
  const loginHref = `/login?next=${encodeURIComponent(safeNext)}`;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    redirect(profile?.role === "admin" ? "/admin/dashboard" : safeNext);
  }

  return (
    <AuthShell
      title="Create your SocialRUSH account"
      subtitle="Start ordering, tracking, and managing your social growth campaigns from one clean dashboard."
      footerText="Already have an account?"
      footerLink={loginHref}
      footerLabel="Login"
      image="/images/auth/register-onboarding-dark.png"
      imageAlt="SocialRUSH account registration and social media growth onboarding dashboard"
    >
      <RegisterForm />
    </AuthShell>
  );
}
