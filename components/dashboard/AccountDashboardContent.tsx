"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck, Building2, ChevronRight, CreditCard, LifeBuoy,
  LogOut, Mail, Pencil, Save, ShieldCheck, Smartphone, UserRound, Wallet,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ProfileData = {
  full_name: string | null;
  phone: string | null;
  company_name: string | null;
  website: string | null;
  billing_address: string | null;
  gst_number: string | null;
  avatar_url: string | null;
};

type Props = {
  profile: ProfileData | null;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  saved?: string;
  error?: string;
  updateAction: (formData: FormData) => void;
};

const fieldClass = "mt-2 min-h-12 w-full rounded-xl border border-white/10 bg-[#0c0d11] px-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-white/20 focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10";
const empty = (value: string | null | undefined) => value?.trim() || "Not added";

export default function AccountDashboardContent({ profile, email, role, firstName, lastName, saved, error, updateAction }: Props) {
  const router = useRouter();
  const displayName = profile?.full_name?.trim() || "Client account";
  const initials = (profile?.full_name || email || "U").trim().split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  async function handleLogout() {
    await createClient().auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <main className="dashboard-premium-page dashboard-account-page relative min-h-[calc(100vh-5rem)] overflow-x-clip px-4 pb-24 pt-5 text-slate-100 sm:px-6 sm:pt-7 lg:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-36 top-0 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute right-[-9rem] top-36 h-96 w-96 rounded-full bg-amber-400/[.07] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 border-b border-white/[.08] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.2em] text-orange-300">Account</p>
            <h1 className="mt-2 text-3xl font-black tracking-[-.035em] text-white sm:text-4xl">Account settings</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#aeb5c0]">Manage your SocialRUSH profile, security and account preferences.</p>
          </div>
          <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[.035] p-3 sm:max-w-sm">
            <span aria-hidden="true" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 text-sm font-black text-white shadow-lg shadow-orange-500/20">{initials || "U"}</span>
            <div className="min-w-0"><p className="truncate text-sm font-bold text-white">{displayName}</p><p className="truncate text-xs text-[#aeb5c0]">{email}</p></div>
          </div>
        </header>

        {saved && <div role="status" className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100"><BadgeCheck className="h-4 w-4 shrink-0 text-emerald-300" />Profile updated successfully.</div>}
        {error && <div role="alert" className="mt-5 rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">We couldn’t save your profile. Check the details and try again.</div>}

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
          <div className="space-y-6">
            <section aria-labelledby="profile-heading" className="rounded-3xl border border-white/10 bg-[#111217]/95 p-5 shadow-[0_24px_60px_-42px_rgba(0,0,0,.9)] sm:p-7">
              <div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-orange-300"><UserRound className="h-4 w-4" /><p className="text-[10px] font-black uppercase tracking-[.16em]">Profile information</p></div><h2 id="profile-heading" className="mt-2 text-xl font-black text-white">Your account details</h2><p className="mt-1 text-sm text-[#aeb5c0]">Keep your contact and billing information up to date.</p></div><Pencil className="mt-1 h-5 w-5 shrink-0 text-slate-500" /></div>
              <form action={updateAction} className="mt-7">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="text-xs font-bold text-[#d7dbe3]">First name<input required name="first_name" defaultValue={firstName} autoComplete="given-name" className={fieldClass} /></label>
                  <label className="text-xs font-bold text-[#d7dbe3]">Last name<input name="last_name" defaultValue={lastName} autoComplete="family-name" className={fieldClass} /></label>
                  <label className="text-xs font-bold text-[#d7dbe3]">Email address<input value={email} readOnly aria-readonly="true" className={`${fieldClass} cursor-not-allowed text-[#aeb5c0]`} /><span className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-emerald-300"><BadgeCheck className="h-3.5 w-3.5" />Signed-in email</span></label>
                  <label className="text-xs font-bold text-[#d7dbe3]">Phone number<input name="phone" type="tel" defaultValue={profile?.phone || ""} autoComplete="tel" placeholder="Add a phone number" className={fieldClass} /></label>
                  <label className="text-xs font-bold text-[#d7dbe3]">Company name<div className="relative"><Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input name="company_name" defaultValue={profile?.company_name || ""} autoComplete="organization" placeholder="Add a company name" className={`${fieldClass} pl-10`} /></div></label>
                  <label className="text-xs font-bold text-[#d7dbe3]">GST number<input name="gst_number" defaultValue={profile?.gst_number || ""} placeholder="Add GST number" className={fieldClass} /></label>
                  <label className="text-xs font-bold text-[#d7dbe3] sm:col-span-2">Website<span className="ml-1 font-normal text-slate-500">(optional)</span><input name="website" type="url" defaultValue={profile?.website || ""} placeholder="https://example.com" className={fieldClass} /></label>
                  <label className="text-xs font-bold text-[#d7dbe3] sm:col-span-2">Billing address<textarea name="billing_address" defaultValue={profile?.billing_address || ""} rows={3} placeholder="Add a billing address" className={`${fieldClass} min-h-[104px] py-3`} /></label>
                </div>
                <div className="mt-6 flex flex-col gap-3 border-t border-white/[.08] pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs leading-5 text-[#8f98a7]">Only the fields above are stored with your account.</p><button className="btn-dashboard-primary inline-flex min-h-12 items-center justify-center gap-2 px-5 text-sm"><Save className="h-4 w-4" />Save changes</button></div>
              </form>
            </section>

            <section aria-labelledby="security-heading" className="rounded-3xl border border-white/10 bg-[#111217]/95 p-5 shadow-[0_24px_60px_-42px_rgba(0,0,0,.9)] sm:p-7"><div className="flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-400/10 text-orange-300"><ShieldCheck className="h-5 w-5" /></span><div><h2 id="security-heading" className="font-black text-white">Password &amp; Security</h2><p className="mt-1 text-sm text-[#aeb5c0]">Manage your password, email and account security settings.</p></div></div><div className="mt-6 grid gap-3 sm:grid-cols-2"><Link href="/dashboard/settings" className="group flex min-h-[76px] items-center justify-between rounded-2xl border border-white/10 bg-white/[.025] p-4 transition hover:border-orange-400/35 hover:bg-orange-400/[.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"><div><p className="text-sm font-bold text-white">Change password</p><p className="mt-1 text-xs text-[#aeb5c0]">Use your existing secure password flow.</p></div><ChevronRight className="h-4 w-4 text-orange-300 transition group-hover:translate-x-0.5" /></Link><Link href="/dashboard/settings" className="group flex min-h-[76px] items-center justify-between rounded-2xl border border-white/10 bg-white/[.025] p-4 transition hover:border-orange-400/35 hover:bg-orange-400/[.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"><div><p className="text-sm font-bold text-white">Notifications &amp; preferences</p><p className="mt-1 text-xs text-[#aeb5c0]">Control account update emails.</p></div><ChevronRight className="h-4 w-4 text-orange-300 transition group-hover:translate-x-0.5" /></Link></div></section>
          </div>

          <aside className="space-y-5 xl:sticky xl:top-24">
            <section aria-labelledby="overview-heading" className="overflow-hidden rounded-3xl border border-orange-400/20 bg-[#15151a] shadow-[0_24px_60px_-42px_rgba(255,122,0,.55)]"><div className="bg-[radial-gradient(circle_at_100%_0%,rgba(255,158,0,.22),transparent_46%)] p-5"><p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-300">Account overview</p><h2 id="overview-heading" className="mt-2 text-lg font-black text-white">Profile at a glance</h2><div className="mt-5 space-y-3 border-t border-white/10 pt-4 text-sm"><div className="flex gap-3"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-orange-300" /><div className="min-w-0"><p className="text-[11px] text-[#8f98a7]">Email</p><p className="break-all font-medium text-[#e4e7ec]">{email}</p></div></div><div className="flex gap-3"><Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-orange-300" /><div><p className="text-[11px] text-[#8f98a7]">Phone</p><p className="font-medium text-[#e4e7ec]">{empty(profile?.phone)}</p></div></div><div className="flex gap-3"><Building2 className="mt-0.5 h-4 w-4 shrink-0 text-orange-300" /><div><p className="text-[11px] text-[#8f98a7]">Company</p><p className="font-medium text-[#e4e7ec]">{empty(profile?.company_name)}</p></div></div></div></div></section>
            <section aria-labelledby="shortcuts-heading" className="rounded-3xl border border-white/10 bg-[#111217]/95 p-5"><h2 id="shortcuts-heading" className="font-black text-white">Account shortcuts</h2><p className="mt-1 text-xs text-[#aeb5c0]">Continue where you need to.</p><div className="mt-4 divide-y divide-white/[.08]">{[{ href: "/dashboard/wallet", label: "Wallet", text: "Manage your available balance", Icon: Wallet }, { href: "/dashboard/billing", label: "Billing", text: "View payments and invoices", Icon: CreditCard }, { href: "/dashboard/saved-profiles", label: "Saved profiles", text: "Manage saved destinations", Icon: UserRound }, { href: "/dashboard/support", label: "Support", text: "Get help from our team", Icon: LifeBuoy }].map(({ href, label, text, Icon }) => <Link key={href} href={href} className="group flex min-h-[62px] items-center gap-3 py-3 first:pt-0 last:pb-0"><Icon className="h-4 w-4 shrink-0 text-orange-300" /><span className="min-w-0 flex-1"><span className="block text-sm font-bold text-white">{label}</span><span className="block truncate text-[11px] text-[#8f98a7]">{text}</span></span><ChevronRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-orange-300" /></Link>)}</div></section>
            <section className="rounded-3xl border border-white/10 bg-white/[.025] p-5"><p className="font-bold text-white">Signed in securely</p><p className="mt-1 text-xs leading-5 text-[#aeb5c0]">Your account uses {role === "admin" ? "administrator" : "customer"} access.</p><button type="button" onClick={handleLogout} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/15 px-4 text-sm font-bold text-[#d7dbe3] transition hover:border-orange-400/35 hover:bg-white/[.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"><LogOut className="h-4 w-4" />Log out</button></section>
          </aside>
        </div>
      </div>
    </main>
  );
}
