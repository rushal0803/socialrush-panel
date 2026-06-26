import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#f4f9ff] px-5 py-16 text-[#17366f] sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-2xl flex-col items-center rounded-[32px] border border-white/80 bg-white/85 p-8 text-center shadow-[0_24px_54px_-34px_rgba(15,23,42,.42)] backdrop-blur-xl sm:p-12">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#5b76aa]">404</p>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-[#102858] sm:text-4xl">Page not found</h1>
        <p className="mt-4 text-sm leading-7 text-[#4d6796]">
          The page you requested does not exist or has moved. Use the links below to continue.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] px-5 py-3 text-sm font-bold text-white">
            Go Home
          </Link>
          <Link href="/services" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#d7e4ff] bg-white px-5 py-3 text-sm font-bold text-[#1f3f77]">
            Browse Services
          </Link>
        </div>
      </div>
    </main>
  );
}