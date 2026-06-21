import Link from "next/link";
import Logo from "./Logo";

export default function AuthShell({ title, subtitle, children, footerText, footerLink, footerLabel }: { title: string; subtitle: string; children: React.ReactNode; footerText: string; footerLink: string; footerLabel: string }) {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="flex flex-col bg-white px-6 py-8 sm:px-12 lg:px-20">
        <Logo />
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
          <h1 className="text-3xl font-bold tracking-tight text-ink">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">{subtitle}</p>
          {children}
          <p className="mt-8 text-center text-sm text-slate-500">{footerText} <Link href={footerLink} className="font-semibold text-rush-600 hover:text-rush-700">{footerLabel}</Link></p>
        </div>
      </section>
      <aside className="relative hidden overflow-hidden bg-ink p-16 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-28 -top-28 h-96 w-96 rounded-full bg-rush-500/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <p className="relative z-10 text-sm font-semibold uppercase tracking-[0.2em] text-rush-100">Work smarter. Grow faster.</p>
        <div className="relative z-10 max-w-lg"><blockquote className="text-4xl font-semibold leading-tight tracking-tight">“SocialRUSH turned our scattered workflow into one clear rhythm.”</blockquote><div className="mt-8 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-full bg-rush-500 font-bold">MK</span><div><p className="font-semibold">Maya Kapoor</p><p className="text-sm text-slate-400">Head of Social, Northstar</p></div></div></div>
      </aside>
    </main>
  );
}
