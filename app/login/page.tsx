import Link from "next/link";
import AuthShell from "@/components/AuthShell";
import AuthMessage from "@/components/AuthMessage";
import { login } from "@/app/auth/actions";

export const metadata = { title: "Log in" };

export default function LoginPage({ searchParams }: { searchParams?: { error?: string; next?: string } }) {
  return <AuthShell title="Welcome back" subtitle="Enter your details to continue to your workspace." footerText="New to SocialRUSH?" footerLink="/register" footerLabel="Create an account">
    <AuthMessage error={searchParams?.error} />
    <form action={login} className="mt-8 space-y-5">
      <input type="hidden" name="next" value={searchParams?.next || "/dashboard"} />
      <div><label htmlFor="email" className="text-sm font-medium text-slate-700">Email address</label><input id="email" name="email" type="email" autoComplete="email" required placeholder="you@company.com" className="field" /></div>
      <div><div className="flex justify-between"><label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label><Link href="/forgot-password" className="text-sm font-semibold text-rush-600">Forgot password?</Link></div><input id="password" name="password" type="password" autoComplete="current-password" required placeholder="Enter your password" className="field" /></div>
      <label className="flex items-center gap-2 text-sm text-slate-500"><input type="checkbox" className="h-4 w-4 rounded border-slate-300 accent-rush-600" /> Keep me signed in</label>
      <button type="submit" className="btn-primary w-full">Log in to SocialRUSH</button>
    </form>
  </AuthShell>;
}
