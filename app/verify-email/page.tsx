import Link from "next/link";
import Logo from "@/components/Logo";

export const metadata = { title: "Verify your email" };

export default function VerifyEmailPage({ searchParams }: { searchParams?: { email?: string } }) {
  return <main className="grid min-h-screen place-items-center bg-[#07111F] px-6 text-slate-100"><section className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0B1628] p-8 text-center shadow-xl shadow-slate-950/30"><div className="flex justify-center"><Logo /></div><span className="mx-auto mt-8 grid h-16 w-16 place-items-center rounded-2xl bg-blue-600 text-2xl text-white">✉</span><h1 className="mt-6 text-2xl font-bold text-white">Verify your email</h1><p className="mt-3 text-sm leading-6 text-slate-300">We sent a verification link to <b className="text-white">{searchParams?.email || "your email address"}</b>. Open it to activate your account.</p><Link href="/login" className="btn-primary mt-7 w-full">Return to login</Link></section></main>;
}
