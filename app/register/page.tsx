import type { Metadata } from "next";
import AuthShell from "@/components/AuthShell";
import RegisterForm from "@/components/auth/RegisterForm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Create a SocialRUSH account",
  description: "Create your SocialRUSH account to order services, track campaigns, and manage wallet payments.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/register" },
};
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (session) redirect("/dashboard");

  return (
    <AuthShell
      title="Create your SocialRUSH account"
      subtitle="Start ordering, tracking, and managing your social growth campaigns from one clean dashboard."
      footerText="Already have an account?"
      footerLink="/login"
      footerLabel="Login"
      image="/images/auth/signup-3d.png"
      imageAlt="SocialRUSH sign up visual"
    >
      <RegisterForm />
    </AuthShell>
  );
}
