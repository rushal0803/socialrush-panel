export default function AuthMessage({ error, success }: { error?: string; success?: string }) {
  if (!error && !success) return null;
  return <div className={`mt-6 rounded-xl border p-3 text-xs leading-5 ${error ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{error || success}</div>;
}
