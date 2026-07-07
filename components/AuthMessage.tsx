export default function AuthMessage({ error, success }: { error?: string; success?: string }) {
  if (!error && !success) return null;
  return (
    <div
      className={`mt-6 rounded-xl border p-3 text-xs leading-5 ${
        error
          ? "border-red-400/30 bg-red-500/10 text-red-200"
          : "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
      }`}
    >
      {error || success}
    </div>
  );
}
