export default function AuthMessage({ error, success }: { error?: string; success?: string }) {
  if (!error && !success) return null;
  return <div className={`mt-6 rounded-xl border p-3 text-xs leading-5 ${error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{error || success}</div>;
}
