import type { Metadata } from "next";
import { Suspense } from "react";
import AuthShell from "@/components/AuthShell";
import LoginForm from "@/components/auth/LoginForm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Log in to SocialRUSH",
  description: "Access your SocialRUSH dashboard to manage campaigns, wallet funds, orders, and support.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/login" },
};

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (session) redirect("/dashboard/new-order");

  return (
    <AuthShell
      title="Welcome back to SocialRUSH"
      subtitle="Log in to manage your campaigns, wallet, orders, and growth dashboard."
      footerText="Don't have an account?"
      footerLink="/register"
      footerLabel="Sign up"
      image="/images/auth/login-3d.png"
      imageAlt="SocialRUSH login visual"
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
