import { Bookmark, ExternalLink, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteProfile, saveProfile } from "./actions";

const platforms = ["instagram", "youtube", "facebook", "linkedin", "telegram", "tiktok", "x"];

export default async function SavedProfilesPage() {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect("/login");
  const { data = [] } = await db.from("saved_social_profiles").select("*").eq("user_id", user.id).order("last_used_at", { ascending: false, nullsFirst: false });

  return (
    <main className="dashboard-premium-page min-h-[calc(100vh-5rem)] px-4 pb-28 pt-5 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="dashboard-glass rounded-3xl p-5 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#ff9a2e]">Order shortcuts</p>
              <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">Saved profiles</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#a8afbd]">Save public profile links for faster, more accurate future orders.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/[.08] px-3 py-2 text-xs font-semibold text-emerald-200"><ShieldCheck className="h-4 w-4" /> Public links only</div>
          </div>
        </header>

        <section className="dashboard-glass mt-5 rounded-3xl p-5 sm:p-6" aria-labelledby="add-profile">
          <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500/10 text-[#ff9a2e]"><Plus className="h-5 w-5" /></span><div><h2 id="add-profile" className="text-base font-black text-white">Add a profile</h2><p className="text-xs text-[#747b89]">Passwords, OTPs and recovery codes are never needed.</p></div></div>
          <form action={saveProfile} className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-bold text-[#a8afbd]">Profile label<input required name="label" maxLength={80} placeholder="My Instagram profile" className="dashboard-input mt-2 min-h-12" /></label>
            <label className="text-xs font-bold text-[#a8afbd]">Platform<select name="platform" className="dashboard-input mt-2 min-h-12">{platforms.map((platform) => <option key={platform}>{platform}</option>)}</select></label>
            <label className="text-xs font-bold text-[#a8afbd] sm:col-span-2">Public profile URL<input required type="url" name="public_url" placeholder="https://..." className="dashboard-input mt-2 min-h-12" /></label>
            <label className="text-xs font-bold text-[#a8afbd]">Private note <span className="font-normal text-[#747b89]">(optional)</span><input name="note" maxLength={500} placeholder="Creator account, brand page…" className="dashboard-input mt-2 min-h-12" /></label>
            <button className="btn-dashboard-primary mt-auto min-h-12 gap-2 px-5 text-sm"><Bookmark className="h-4 w-4" /> Save public profile</button>
          </form>
        </section>

        <section className="mt-6" aria-labelledby="profile-list">
          <div className="mb-3 flex items-center justify-between"><div><h2 id="profile-list" className="text-lg font-black text-white">Your profiles</h2><p className="mt-1 text-xs text-[#747b89]">{data.length} saved {data.length === 1 ? "destination" : "destinations"}</p></div></div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data.length ? data.map((profile) => (
              <article key={profile.id} className="dashboard-glass group min-w-0 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3"><span className="rounded-lg border border-orange-400/20 bg-orange-500/[.08] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#ff9a2e]">{profile.platform}</span><form action={deleteProfile}><input type="hidden" name="id" value={profile.id} /><button aria-label={`Delete ${profile.label}`} className="grid h-9 w-9 place-items-center rounded-lg border border-white/[.08] text-[#a8afbd] transition hover:border-red-400/40 hover:bg-red-500/[.08] hover:text-red-200"><Trash2 className="h-4 w-4" /></button></form></div>
                <h3 className="mt-4 truncate text-base font-black text-white">{profile.label}</h3>
                <a className="mt-2 flex items-start gap-2 break-all text-xs leading-5 text-[#a8afbd] transition hover:text-[#ffb86b]" href={profile.public_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" />{profile.public_url}</a>
                {profile.note ? <p className="mt-4 border-t border-white/[.08] pt-3 text-xs leading-5 text-[#747b89]">{profile.note}</p> : null}
              </article>
            )) : <div className="dashboard-glass col-span-full rounded-3xl p-10 text-center"><Bookmark className="mx-auto h-7 w-7 text-[#ff9a2e]" /><p className="mt-3 text-sm font-bold text-white">No saved profiles yet</p><p className="mt-1 text-xs text-[#a8afbd]">Add a public destination above to speed up your next order.</p></div>}
          </div>
        </section>
      </div>
    </main>
  );
}
