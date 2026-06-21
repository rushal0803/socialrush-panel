import Link from "next/link";
import Logo from "@/components/Logo";

export const metadata = { title: "Verify your email" };

export default function VerifyEmailPage({ searchParams }: { searchParams?: { email?: string } }) {
  return <main className="grid min-h-screen place-items-center bg-slate-50 px-6"><section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-soft"><div className="flex justify-center"><Logo /></div><span className="mx-auto mt-8 grid h-16 w-16 place-items-center rounded-2xl bg-blue-50 text-2xl text-blue-600">✉</span><h1 className="mt-6 text-2xl font-bold">Verify your email</h1><p className="mt-3 text-sm leading-6 text-slate-500">We sent a verification link to <b className="text-slate-700">{searchParams?.email || "your email address"}</b>. Open it to activate your account.</p><Link href="/login" className="btn-primary mt-7 w-full">Return to login</Link></section></main>;
}
