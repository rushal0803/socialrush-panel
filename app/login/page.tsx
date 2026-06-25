import { Suspense } from "react";
import AuthShell from "@/components/AuthShell";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = { title: "Log in" };

export default function LoginPage() {
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
