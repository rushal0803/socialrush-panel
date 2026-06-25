import AuthShell from "@/components/AuthShell";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata = { title: "Create account" };
export const dynamic = "force-dynamic";

export default function RegisterPage() {
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
