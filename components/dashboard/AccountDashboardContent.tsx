"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Building2, Mail, ShieldCheck, UserCircle, Save, Activity } from "lucide-react";
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

export default function AccountDashboardContent({
  profile,
  email,
  role,
  firstName,
  lastName,
  saved,
  error,
  updateAction,
}: Props) {
  const router = useRouter();
  const displayName = profile?.full_name || "Client account";
  const initials = (profile?.full_name || email || "U").slice(0, 2).toUpperCase();

  async function handleLogout() {
    await createClient().auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <main className="relative min-h-[calc(100vh-5rem)] overflow-x-clip px-4 pb-24 pt-5 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 top-10 h-72 w-72 rounded-full bg-orange-200/35 blur-3xl" />
        <div className="absolute right-[-5rem] top-16 h-80 w-80 rounded-full bg-amber-200/35 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-64 w-64 rounded-full bg-amber-200/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-[2rem] border border-white/80 bg-white/72 p-6 shadow-[0_26px_60px_-36px_rgba(15,23,42,.45)] backdrop-blur-2xl sm:p-8"
        >
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
            <div>
              <p className="inline-flex rounded-full border border-white/85 bg-white/85 px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-[#111827]">
                Profile settings
              </p>
              <h1 className="mt-4 text-3xl font-black tracking-[-0.03em] text-[#0B0B0F] sm:text-4xl">Account</h1>
              <p className="mt-2 text-sm leading-7 text-[#111827]">Manage your profile, company, website, and billing identity.</p>
            </div>

            <motion.div whileHover={{ y: -4 }} className="rounded-[1.6rem] border border-white/80 bg-white/80 p-5 shadow-[0_20px_42px_-28px_rgba(15,23,42,.4)]">
              <div className="flex items-center gap-4">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[#FF7A00] to-[#FFB000] text-lg font-black text-white shadow-[0_14px_28px_-18px_rgba(255, 196, 0, .65)]">
                  {initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-[#0B0B0F]">{displayName}</p>
                  <p className="truncate text-xs text-[#111827]">{email}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-[#FFF8F1] px-3 py-2 text-[#111827]">
                  Role
                  <p className="mt-1 font-black text-[#0B0B0F] capitalize">{role || "user"}</p>
                </div>
                <div className="rounded-xl bg-[#FFF8F1] px-3 py-2 text-[#111827]">
                  Status
                  <p className="mt-1 font-black text-emerald-700">Active</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {saved && <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">Account details saved.</p>}
        {error && <p className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            { label: "Profile details", icon: UserCircle },
            { label: "Security settings", icon: ShieldCheck },
            { label: "Login method", icon: Mail },
            { label: "Notification preferences", icon: Bell },
            { label: "Account activity", icon: Activity },
          ].map((item, index) => (
            <motion.article
              key={item.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4 }}
              className="rounded-3xl border border-white/85 bg-white/85 p-4 shadow-[0_20px_44px_-30px_rgba(15,23,42,.35)] backdrop-blur-xl"
            >
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#FFF8F1] text-[#111827]">
                <item.icon className="h-5 w-5" />
              </span>
              <p className="mt-3 text-xs font-black uppercase tracking-[0.11em] text-[#111827]">{item.label}</p>
            </motion.article>
          ))}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="rounded-3xl border border-white/85 bg-white/90 p-6 text-center shadow-[0_22px_52px_-34px_rgba(15,23,42,.4)] backdrop-blur-xl">
            <span className="mx-auto grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br from-[#FF7A00] to-[#FFB000] text-2xl font-black text-white shadow-[0_18px_34px_-20px_rgba(255, 196, 0, .65)]">
              {initials}
            </span>
            <p className="mt-4 font-black text-[#0B0B0F]">{displayName}</p>
            <p className="mt-1 text-xs text-[#111827]">{email}</p>
            <div className="mt-5 rounded-2xl border border-[#FFF8F1] bg-[#FFF8F1] p-3 text-xs text-[#111827]">
              Login method: Email + Password
            </div>
            <Link href="/dashboard/settings" className="btn-dashboard-secondary mt-4 inline-flex w-full px-4 py-2.5 text-sm">
              Password & security
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-[#FFF3E0] bg-white px-4 py-2.5 text-sm font-bold text-[#FF7A00] transition hover:-translate-y-0.5 hover:border-[#FFF3E0] hover:bg-[#FFF8F1]"
            >
              Logout
            </button>
          </aside>

          <form action={updateAction} className="rounded-3xl border border-white/85 bg-white/90 p-6 shadow-[0_22px_52px_-34px_rgba(15,23,42,.4)] backdrop-blur-xl sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-xs font-bold text-[#FF9F00]">
                First name
                <input required name="first_name" defaultValue={firstName} className="dashboard-input mt-2" />
              </label>
              <label className="text-xs font-bold text-[#FF9F00]">
                Last name
                <input name="last_name" defaultValue={lastName} className="dashboard-input mt-2" />
              </label>
              <label className="text-xs font-bold text-[#FF9F00]">
                Phone
                <input name="phone" defaultValue={profile?.phone || ""} className="dashboard-input mt-2" />
              </label>
              <label className="text-xs font-bold text-[#FF9F00]">
                Company name
                <div className="relative mt-2">
                  <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#111827]" />
                  <input name="company_name" defaultValue={profile?.company_name || ""} className="dashboard-input pl-10" />
                </div>
              </label>
              <label className="text-xs font-bold text-[#FF9F00] sm:col-span-2">
                Website
                <input name="website" type="url" placeholder="https://example.com" defaultValue={profile?.website || ""} className="dashboard-input mt-2" />
              </label>
              <label className="text-xs font-bold text-[#FF9F00] sm:col-span-2">
                GST number
                <input name="gst_number" defaultValue={profile?.gst_number || ""} className="dashboard-input mt-2" />
              </label>
            </div>

            <label className="mt-5 block text-xs font-bold text-[#FF9F00]">
              Billing address
              <textarea name="billing_address" defaultValue={profile?.billing_address || ""} rows={4} className="dashboard-input mt-2" />
            </label>

            <div className="mt-6 flex flex-col gap-3 border-t border-[#FFF8F1] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <Link href="/dashboard/settings" className="text-sm font-bold text-[#FF9F00] transition hover:text-[#0B0B0F]">
                Manage security settings
              </Link>
              <button className="btn-dashboard-primary inline-flex items-center justify-center gap-2 px-5 py-3 text-sm">
                <Save className="h-4 w-4" />
                Save account
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
