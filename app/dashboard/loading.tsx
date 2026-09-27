export default function DashboardLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading dashboard"
      className="mx-auto w-full max-w-[1800px] animate-pulse px-4 py-6 text-white sm:px-8 lg:px-10"
    >
      <div className="h-7 w-56 rounded-lg bg-white/10" />
      <div className="mt-3 h-4 w-80 max-w-full rounded bg-white/[.06]" />
      <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-28 rounded-2xl border border-white/10 bg-white/[.04]" />
        ))}
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="h-72 rounded-3xl border border-white/10 bg-white/[.04]" />
        <div className="h-72 rounded-3xl border border-white/10 bg-white/[.04]" />
      </div>
    </main>
  );
}
