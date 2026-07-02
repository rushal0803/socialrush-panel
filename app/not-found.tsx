import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#FFF8F1] px-5 py-16 text-[#0B0B0F] sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-2xl flex-col items-center rounded-[32px] border border-white/80 bg-white/85 p-8 text-center shadow-[0_24px_54px_-34px_rgba(15,23,42,.42)] backdrop-blur-xl sm:p-12">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#111827]">404</p>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-[#0B0B0F] sm:text-4xl">Page not found</h1>
        <p className="mt-4 text-sm leading-7 text-[#111827]">
          The page you requested does not exist or has moved. Use the links below to continue.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 py-3 text-sm font-bold text-white">
            Go Home
          </Link>
          <Link href="/services" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#FFF3E0] bg-white px-5 py-3 text-sm font-bold text-[#0B0B0F]">
            Browse Services
          </Link>
        </div>
      </div>
    </main>
  );
}