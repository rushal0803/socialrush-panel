import AuthShell from "@/components/AuthShell";
import AuthMessage from "@/components/AuthMessage";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata = { title: "Create account" };

export default function RegisterPage({ searchParams }: { searchParams?: { error?: string } }) {
  return <AuthShell title="Create your account" subtitle="Build your social media growth workspace in just a few steps." footerText="Already have an account?" footerLink="/login" footerLabel="Log in">
    <AuthMessage error={searchParams?.error} />
    <RegisterForm />
  </AuthShell>;
}
