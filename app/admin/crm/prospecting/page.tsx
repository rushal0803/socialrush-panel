import Link from "next/link";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from "@/lib/supabase/server";
import CsvProspectImport from "@/components/admin/CsvProspectImport";
import {
  addCandidate,
  runDiscoveryNow,
  setCandidateStatus,
} from "./actions";

function formatRunTime(value?: string | null) {
  if (!value) return "Never";

  try {
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default async function ProspectingPage() {
  const s = await createClient();

  const [{ data: rows = [] }, { data: latestRun }] = await Promise.all([
    s
      .from("crm_lead_candidates")
      .select("*")
      .order("fit_score", { ascending: false })
      .limit(200),

    s
      .from("crm_prospect_discovery_runs")
      .select(
        "id,provider,trigger,status,started_at,finished_at,search_count,discovered_count,staged_count,duplicate_count,invalid_count,error_count,error_message",
      )
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const n = (f: (x: any) => boolean) => rows.filter(f).length;

  const apiConfigured = Boolean(
    process.env.BRAVE_SEARCH_API_KEY?.trim(),
  );

  return (
    <main className="mx-auto max-w-[1650px] p-4 pb-20 sm:p-8">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[.2em] text-orange-300">
            SocialRUSH Prospecting
          </p>

          <h1 className="mt-2 text-3xl font-black text-white">
            Lead Intelligence Workbench
          </h1>

          <p className="mt-2 text-sm text-[#9CA3AF]">
            Phase 3 discovers businesses automatically. No
            candidate is contacted or promoted without admin
            approval.
          </p>
        </div>

        <form action={runDiscoveryNow}>
          <button
            type="submit"
            className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-white transition hover:bg-orange-400"
          >
            Run Discovery Now
          </button>
        </form>
      </header>

      <section className="mt-6 rounded-2xl border border-orange-400/20 bg-gradient-to-br from-orange-500/10 to-[#111111] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">
              Automated Discovery
            </p>

            <h2 className="mt-2 text-lg font-black text-white">
              Phase 3 status
            </h2>

            <p className="mt-1 text-xs text-[#9CA3AF]">
              Daily schedule: 08:05 AM IST · Auto Send remains
              OFF.
            </p>
          </div>

          <div
            className={`rounded-full border px-3 py-1 text-xs font-bold ${
              apiConfigured
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                : "border-amber-400/30 bg-amber-400/10 text-amber-300"
            }`}
          >
            Brave API {apiConfigured ? "configured" : "not configured"}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {[
            ["Last run", latestRun?.status || "Not run"],
            ["Searches", latestRun?.search_count ?? 0],
            ["Results", latestRun?.discovered_count ?? 0],
            ["Staged", latestRun?.staged_count ?? 0],
            ["Duplicates", latestRun?.duplicate_count ?? 0],
            ["Invalid", latestRun?.invalid_count ?? 0],
            ["Errors", latestRun?.error_count ?? 0],
          ].map(([label, value]) => (
            <article
              key={String(label)}
              className="rounded-xl border border-white/10 bg-black/20 p-3"
            >
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#9CA3AF]">
                {label}
              </p>

              <b className="mt-2 block text-lg text-white">
                {String(value)}
              </b>
            </article>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-[#9CA3AF]">
          <span>
            Last started: {formatRunTime(latestRun?.started_at)}
          </span>

          {latestRun?.provider ? (
            <span>Provider: {latestRun.provider}</span>
          ) : null}

          {latestRun?.trigger ? (
            <span>Trigger: {latestRun.trigger}</span>
          ) : null}
        </div>

        {latestRun?.error_message ? (
          <p className="mt-4 rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-xs text-red-200">
            {latestRun.error_message}
          </p>
        ) : null}
      </section>

      <div className="mt-6">
        <CsvProspectImport />
      </div>

      <section className="grid gap-3 sm:grid-cols-3 xl:grid-cols-7">
        {[
          ["Candidates", rows.length],
          [
            "Qualified",
            n((x) =>
              ["qualified", "ready"].includes(
                x.qualification_status,
              ),
            ),
          ],
          ["Research", n((x) => x.research_status === "needed")],
          [
            "Suppressed",
            n((x) => x.qualification_status === "blocked"),
          ],
          ["Duplicates", n((x) => x.duplicate_lead_id)],
          ["High fit", n((x) => x.fit_grade === "high_fit")],
          [
            "Ready",
            n((x) => x.qualification_status === "ready"),
          ],
        ].map(([k, v]) => (
          <article
            key={String(k)}
            className="rounded-xl border border-white/10 bg-[#111111] p-4"
          >
            <p className="text-[10px] uppercase text-[#9CA3AF]">
              {k}
            </p>
            <b className="mt-2 block text-2xl text-white">
              {v}
            </b>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[.8fr_2fr]">
        <form
          action={addCandidate}
          className="h-fit rounded-2xl border border-white/10 bg-[#111111] p-5"
        >
          <h2 className="font-bold text-white">
            Manual candidate
          </h2>

          {[
            "business_name",
            "website_url",
            "country",
            "contact_name",
            "contact_role",
            "business_email",
          ].map((k) => (
            <input
              key={k}
              name={k}
              required={k === "business_name"}
              placeholder={k.replaceAll("_", " ")}
              className="mt-3 w-full rounded-lg bg-black/20 p-2 text-xs text-white"
            />
          ))}

          <button className="mt-3 rounded-lg bg-orange-500 px-3 py-2 text-xs font-bold text-white">
            Stage candidate
          </button>
        </form>

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">
          <div className="border-b border-white/10 p-5">
            <h2 className="font-bold text-white">
              Candidate queue
            </h2>
          </div>

          {rows.map((c: any) => (
            <article
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-4"
            >
              <div>
                <b className="text-sm text-white">
                  {c.business_name}
                </b>

                <p className="text-xs text-[#9CA3AF]">
                  {c.domain || "No domain"} · {c.fit_score} ·{" "}
                  {c.fit_grade}
                </p>
              </div>

              <div className="flex gap-3">
                <form action={setCandidateStatus}>
                  <input
                    type="hidden"
                    name="candidate_id"
                    value={c.id}
                  />

                  <select
                    name="status"
                    defaultValue={c.qualification_status}
                    onChange={(e) =>
                      e.currentTarget.form?.requestSubmit()
                    }
                    className="rounded bg-black/20 p-2 text-xs text-white"
                  >
                    <option value="researching">
                      Research
                    </option>
                    <option value="qualified">
                      Qualify
                    </option>
                    <option value="ready">Ready</option>
                    <option value="rejected">Reject</option>
                  </select>
                </form>

                <Link
                  href={`/admin/crm/prospecting/${c.id}`}
                  className="text-xs font-bold text-orange-200"
                >
                  Review
                </Link>
              </div>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}
