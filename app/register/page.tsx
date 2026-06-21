import Link from "next/link";
import AuthShell from "@/components/AuthShell";
import AuthMessage from "@/components/AuthMessage";
import { register } from "@/app/auth/actions";

export const metadata = { title: "Create account" };

export default function RegisterPage({ searchParams }: { searchParams?: { error?: string } }) {
  return <AuthShell title="Create your account" subtitle="Build your social media growth workspace in just a few steps." footerText="Already have an account?" footerLink="/login" footerLabel="Log in">
    <AuthMessage error={searchParams?.error} />
    <form action={register} className="mt-8 space-y-5">
      <div className="grid gap-4 sm:grid-cols-2"><div><label htmlFor="firstName" className="text-sm font-medium text-slate-700">First name</label><input id="firstName" name="firstName" required placeholder="Alex" className="field" /></div><div><label htmlFor="lastName" className="text-sm font-medium text-slate-700">Last name</label><input id="lastName" name="lastName" required placeholder="Morgan" className="field" /></div></div>
      <div><label htmlFor="email" className="text-sm font-medium text-slate-700">Work email</label><input id="email" name="email" type="email" autoComplete="email" required placeholder="you@company.com" className="field" /></div>
      <div><label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label><input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} placeholder="At least 8 characters" className="field" /></div>
      <label className="flex items-start gap-2 text-sm leading-5 text-slate-500"><input type="checkbox" required className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-rush-600" /><span>I agree to the <Link href="#" className="font-medium text-rush-600">Terms</Link> and <Link href="#" className="font-medium text-rush-600">Privacy Policy</Link>.</span></label>
      <button type="submit" className="btn-primary w-full">Create free account</button>
    </form>
  </AuthShell>;
}
