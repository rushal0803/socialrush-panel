import AuthShell from "@/components/AuthShell";
import AuthMessage from "@/components/AuthMessage";
import { forgotPassword } from "@/app/auth/actions";

export const metadata = { title: "Forgot password" };

export default function ForgotPasswordPage({ searchParams }: { searchParams?: { error?: string; sent?: string } }) {
  return <AuthShell title="Reset your password" subtitle="Enter your email and we’ll send you a secure recovery link." footerText="Remember your password?" footerLink="/login" footerLabel="Back to login">
    <AuthMessage error={searchParams?.error} success={searchParams?.sent ? "Check your inbox for a password recovery link." : undefined} />
    <form action={forgotPassword} className="mt-8 space-y-5"><div><label htmlFor="email" className="text-sm font-medium text-slate-700">Email address</label><input id="email" name="email" type="email" autoComplete="email" required placeholder="you@company.com" className="field" /></div><button type="submit" className="btn-primary w-full">Send recovery link</button></form>
  </AuthShell>;
}
