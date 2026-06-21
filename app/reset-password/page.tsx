import AuthShell from "@/components/AuthShell";
import AuthMessage from "@/components/AuthMessage";
import { resetPassword } from "@/app/auth/actions";

export const metadata = { title: "Set new password" };

export default function ResetPasswordPage({ searchParams }: { searchParams?: { error?: string } }) {
  return <AuthShell title="Choose a new password" subtitle="Your new password must be at least eight characters." footerText="Return to" footerLink="/login" footerLabel="login">
    <AuthMessage error={searchParams?.error} />
    <form action={resetPassword} className="mt-8 space-y-5"><div><label htmlFor="password" className="text-sm font-medium text-slate-700">New password</label><input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required className="field" placeholder="At least 8 characters" /></div><div><label htmlFor="confirmation" className="text-sm font-medium text-slate-700">Confirm password</label><input id="confirmation" name="confirmation" type="password" autoComplete="new-password" minLength={8} required className="field" placeholder="Repeat new password" /></div><button type="submit" className="btn-primary w-full">Update password</button></form>
  </AuthShell>;
}
