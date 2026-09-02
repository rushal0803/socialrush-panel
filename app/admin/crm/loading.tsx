export default function CrmLoading() {
  return <main className="mx-auto max-w-[1650px] animate-pulse p-4 sm:p-8"><div className="h-7 w-72 rounded bg-white/10" /><div className="mt-3 h-4 w-96 max-w-full rounded bg-white/5" /><div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-32 rounded-2xl border border-white/5 bg-white/[.03]" />)}</div><div className="mt-6 h-80 rounded-2xl border border-white/5 bg-white/[.03]" /></main>;
}
