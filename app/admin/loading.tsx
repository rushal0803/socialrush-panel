export default function AdminLoading() {
  return (
    <main className="mx-auto w-full max-w-[1650px] animate-pulse p-4 sm:p-8">
      <div className="h-7 w-48 rounded-lg bg-slate-200" />
      <div className="mt-3 h-4 w-80 max-w-full rounded bg-slate-100" />
      <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-28 rounded-2xl border border-slate-100 bg-white" />
        ))}
      </div>
      <div className="mt-6 h-80 rounded-3xl border border-slate-100 bg-white" />
    </main>
  );
}
