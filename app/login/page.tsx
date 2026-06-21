import AuthShell from "@/components/AuthShell";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = { title: "Log in" };

export default function LoginPage() {
  return <AuthShell title="Welcome back" subtitle="Enter your details to continue to your workspace." footerText="New to SocialRUSH?" footerLink="/register" footerLabel="Create an account">
    <LoginForm />
  </AuthShell>;
}
