import Link from "next/link";
import PublicShell from "@/components/marketing/PublicShell";

export default function NotFound() {
  return (
    <PublicShell><main className="sr-page min-h-[70vh] px-5 py-16 text-white sm:px-6 lg:px-8 lg:py-24">
      <div className="sr-surface mx-auto flex max-w-2xl flex-col items-center rounded-[32px] p-8 text-center sm:p-12">
        <p className="sr-eyebrow">404 · Page not found</p>
        <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">That page is not available.</h1>
        <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
          The page you requested does not exist or has moved. Use the links below to continue.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 py-3 text-sm font-bold text-white">
            Go Home
          </Link>
          <Link href="/services" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/15 bg-white/[.04] px-5 py-3 text-sm font-bold text-white">
            Browse Services
          </Link>
          <Link href="/support" className="inline-flex min-h-11 items-center justify-center text-sm font-bold text-orange-200 hover:text-orange-100">Get support</Link>
        </div>
      </div>
    </main></PublicShell>
  );
}
