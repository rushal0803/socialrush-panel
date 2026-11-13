import AuthShell from "@/components/AuthShell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AuthMessage from "@/components/AuthMessage";
import { resetPassword } from "@/app/auth/actions";

export const metadata = {
  title: "Set new password",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({ searchParams }: { searchParams?: { error?: string } }) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/forgot-password?error=Please%20open%20a%20fresh%20recovery%20link%20first");
  return <AuthShell title="Choose a new password" subtitle="Your new password must be at least eight characters." footerText="Return to" footerLink="/login" footerLabel="login">
    <AuthMessage error={searchParams?.error} />
    <form action={resetPassword} className="mt-8 space-y-5"><div><label htmlFor="password" className="text-sm font-medium text-slate-700">New password</label><input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required className="field" placeholder="At least 8 characters" /></div><div><label htmlFor="confirmation" className="text-sm font-medium text-slate-700">Confirm password</label><input id="confirmation" name="confirmation" type="password" autoComplete="new-password" minLength={8} required className="field" placeholder="Repeat new password" /></div><button type="submit" className="btn-primary w-full">Update password</button></form>
  </AuthShell>;
}
