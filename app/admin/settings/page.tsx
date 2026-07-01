import { updateWebsiteSettings } from "@/app/admin/actions";
import { AdminPageHeader, inputClass, primaryButton } from "@/components/admin/AdminUI";
import { createClient } from "@/lib/supabase/server";

type GeneralSettings = {
  whatsapp_number?: string;
  support_email?: string;
  currency_rates?: Record<string, number>;
  payment_instructions?: string;
  notice_text?: string;
};

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const [{ data: profile }, { data: row, error }] = await Promise.all([
    supabase.from("profiles").select("full_name,email,role,created_at").eq("id", user!.id).single(),
    supabase.from("website_settings").select("value,updated_at").eq("key", "general").maybeSingle(),
  ]);
  const settings = (row?.value || {}) as GeneralSettings;
  const rates = settings.currency_rates || {};

  return <main className="mx-auto max-w-[1300px] p-5 sm:p-8"><AdminPageHeader title="Admin settings" description="Manage support contacts, display exchange rates, payment instructions, and the website notice." />{error && <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">Website settings require the latest admin migration.</p>}<div className="mt-7 grid gap-6 lg:grid-cols-[.65fr_1.35fr]"><aside className="space-y-6"><section className="panel-card p-6"><h2 className="text-sm font-bold">Administrator profile</h2><div className="mt-6 flex items-center gap-4"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#0a1b3d] text-sm font-bold text-white">{(profile?.full_name || "AD").slice(0,2).toUpperCase()}</span><div><p className="text-sm font-bold">{profile?.full_name || "Administrator"}</p><p className="mt-1 text-xs text-slate-400">{profile?.email}</p><span className="mt-2 inline-block rounded-full bg-violet-50 px-2 py-1 text-[9px] font-bold uppercase text-violet-700">{profile?.role}</span></div></div></section><section className="panel-card p-6"><h2 className="text-sm font-bold">Security status</h2><div className="mt-5 space-y-3">{["Supabase authentication","Role-based route guard","Row Level Security","Atomic wallet operations"].map((item) => <div key={item} className="flex items-center gap-3 text-xs text-slate-600"><span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-50 text-emerald-600">✓</span>{item}</div>)}</div></section></aside><form action={updateWebsiteSettings} className="panel-card p-6 sm:p-8"><h2 className="text-lg font-bold text-[#112a5c]">Website configuration</h2><p className="mt-1 text-xs text-slate-400">These values are stored in Supabase and can be consumed by public components when connected.</p><div className="mt-6 grid gap-5 sm:grid-cols-2"><label className="text-xs font-semibold">WhatsApp number<input name="whatsapp_number" defaultValue={settings.whatsapp_number || "8860330771"} className={inputClass} /></label><label className="text-xs font-semibold">Support email<input name="support_email" type="email" defaultValue={settings.support_email || "support@getsocialrush.com"} className={inputClass} /></label></div><h3 className="mt-7 text-xs font-bold uppercase tracking-wider text-slate-500">Display currency rates from INR</h3><div className="mt-3 grid gap-4 sm:grid-cols-3">{["USD","EUR","GBP","AED","CAD","AUD"].map((currency) => <label key={currency} className="text-xs font-semibold">{currency}<input name={`rate_${currency}`} type="number" min="0" step="0.0001" defaultValue={rates[currency] ?? ({USD:.012,EUR:.011,GBP:.0093,AED:.044,CAD:.016,AUD:.018} as Record<string,number>)[currency]} className={inputClass} /></label>)}</div><label className="mt-6 block text-xs font-semibold">Payment instructions<textarea name="payment_instructions" defaultValue={settings.payment_instructions || ""} className={`${inputClass} min-h-28 resize-y`} placeholder="Instructions for manual payment review" /></label><label className="mt-5 block text-xs font-semibold">Website notice/banner text<textarea name="notice_text" defaultValue={settings.notice_text || ""} className={`${inputClass} min-h-24 resize-y`} placeholder="Leave empty to hide the notice" /></label><button className={`${primaryButton} mt-6`}>Save website settings</button></form></div></main>;
}
