import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import Logo from "@/components/Logo";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerText: string;
  footerLink: string;
  footerLabel: string;
  image?: string;
  imageAlt?: string;
}

export default function AuthShell({
  title,
  subtitle,
  children,
  footerText,
  footerLink,
  footerLabel,
  image,
  imageAlt = "SocialRUSH visual",
}: AuthShellProps) {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[linear-gradient(165deg,#f0f9ff_0%,#fdf4ff_30%,#fff1f8_55%,#f5f3ff_80%,#ecfeff_100%)] text-slate-800">
      {/* ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-16 h-96 w-96 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="absolute right-0 top-20 h-[26rem] w-[26rem] rounded-full bg-pink-200/40 blur-3xl" />
        <div className="absolute bottom-20 left-1/3 h-72 w-72 rounded-full bg-violet-200/35 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8">
        {/* form column */}
        <div className="flex flex-col">
          {/* top bar */}
          <div className="flex items-center justify-between">
            <Logo priority />
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur transition hover:text-sky-600"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
              <span className="hidden min-[390px]:inline">Back to Home</span>
            </Link>
          </div>

          {/* card */}
          <div className="my-auto animate-auth-fade-up pt-8 pb-6 lg:pb-0">
            <div className="rounded-3xl border border-white/90 bg-white/80 p-5 shadow-[0_20px_60px_-15px_rgba(15,23,42,.18)] backdrop-blur sm:p-9">
              <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-sky-600">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-500" />
                SocialRUSH Platform
              </span>
              <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                {title}
              </h1>
              <p className="mt-2.5 text-sm leading-7 text-slate-500">{subtitle}</p>

              {children}

              <p className="mt-7 text-center text-sm text-slate-500">
                {footerText}{" "}
                <Link href={footerLink} className="font-bold text-pink-600 transition hover:text-pink-500">
                  {footerLabel}
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* image column */}
        {image && (
          <div className="hidden items-center justify-center lg:flex">
            <div className="animate-auth-float w-full max-w-lg">
              <div className="overflow-hidden rounded-[32px] border border-white/80 bg-gradient-to-br from-fuchsia-50 via-sky-50 to-pink-50 p-5 shadow-[0_40px_80px_-20px_rgba(99,102,241,.30)]">
                <SafeImage
                  src={image}
                  fallbackSrc={image.replace(/\.png$/i, ".webp")}
                  alt={imageAlt}
                  width={600}
                  height={750}
                  sizes="(min-width: 1024px) 42vw, 0px"
                  className="h-auto w-full rounded-3xl object-cover"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
