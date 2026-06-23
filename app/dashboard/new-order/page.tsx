"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { convertCurrency, formatPrice } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";

type PlatformId = "instagram" | "youtube" | "facebook" | "twitter";
type Service = {
  id: string;
  platform: PlatformId;
  name: string;
  description: string;
  rate: number;
  delivery: string;
  quality: string;
  refill: string;
  minimum: number;
  maximum: number;
  features: string[];
  popular?: boolean;
};

const platforms: { id: PlatformId; name: string; description: string; gradient: string }[] = [
  { id: "instagram", name: "Instagram", description: "Audience, engagement and content visibility", gradient: "from-fuchsia-500 to-rose-500" },
  { id: "youtube", name: "YouTube", description: "Channel growth and video promotion", gradient: "from-red-500 to-rose-600" },
  { id: "facebook", name: "Facebook", description: "Page authority and brand engagement", gradient: "from-blue-500 to-blue-700" },
  { id: "twitter", name: "Twitter / X", description: "Profile authority and conversation reach", gradient: "from-slate-700 to-slate-950" },
];

const services: Service[] = [
  { id: "ig-followers", platform: "instagram", name: "Instagram Real Followers", description: "Increase your Instagram presence with high-quality followers delivered gradually.", rate: 599, delivery: "1-7 days", quality: "Premium", refill: "30 days", minimum: 100, maximum: 100000, features: ["Gradual delivery", "Refill support", "Premium quality", "Safe ordering"], popular: true },
  { id: "ig-likes", platform: "instagram", name: "Instagram Real Likes", description: "Improve engagement and content performance with quality likes.", rate: 299, delivery: "1-3 days", quality: "Quality Checked", refill: "30 days", minimum: 100, maximum: 50000, features: ["Fast delivery", "Higher engagement", "Refill available", "Quality checked"] },
  { id: "ig-views", platform: "instagram", name: "Instagram Video Views", description: "Increase video visibility across reels and video content.", rate: 49, delivery: "1-2 days", quality: "Premium", refill: "15 days", minimum: 500, maximum: 500000, features: ["Fast delivery", "Content exposure", "Safe service", "Quality checked"] },
  { id: "yt-subscribers", platform: "youtube", name: "YouTube Subscribers", description: "Build channel authority with premium subscriber growth.", rate: 3999, delivery: "3-10 days", quality: "Premium", refill: "30 days", minimum: 100, maximum: 50000, features: ["Premium quality", "Gradual delivery", "Refill support", "Long-term growth"], popular: true },
  { id: "yt-likes", platform: "youtube", name: "YouTube Likes", description: "Increase engagement and improve social proof on videos.", rate: 899, delivery: "1-4 days", quality: "High", refill: "30 days", minimum: 100, maximum: 50000, features: ["Fast delivery", "Premium quality", "Refill available", "Safe ordering"] },
  { id: "yt-views", platform: "youtube", name: "YouTube Views", description: "Boost discoverability through increased video exposure.", rate: 499, delivery: "2-7 days", quality: "High Retention", refill: "30 days", minimum: 500, maximum: 500000, features: ["High retention", "Gradual delivery", "Refill support", "Quality checked"] },
  { id: "fb-followers", platform: "facebook", name: "Facebook Followers", description: "Grow page audience and improve brand credibility.", rate: 499, delivery: "2-8 days", quality: "Premium", refill: "30 days", minimum: 100, maximum: 100000, features: ["Premium quality", "Gradual delivery", "Refill support", "Safe service"], popular: true },
  { id: "fb-likes", platform: "facebook", name: "Facebook Post Likes", description: "Increase engagement on Facebook posts.", rate: 299, delivery: "1-5 days", quality: "High", refill: "30 days", minimum: 100, maximum: 50000, features: ["Fast delivery", "Higher engagement", "Refill available", "Quality checked"] },
  { id: "fb-views", platform: "facebook", name: "Facebook Video Views", description: "Expand reach and improve video performance.", rate: 199, delivery: "1-3 days", quality: "Premium", refill: "15 days", minimum: 500, maximum: 500000, features: ["Fast delivery", "Content reach", "Safe service", "Quality checked"] },
  { id: "x-followers", platform: "twitter", name: "Twitter/X Followers", description: "Build authority and profile visibility on X.", rate: 999, delivery: "2-7 days", quality: "Premium", refill: "30 days", minimum: 100, maximum: 100000, features: ["Premium quality", "Gradual delivery", "Refill support", "Safe ordering"], popular: true },
];

function PlatformIcon({ platform, className = "h-5 w-5" }: { platform: PlatformId; className?: string }) {
  const paths = {
    instagram: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <path d="M17.5 6.5h.01" />
      </>
    ),
    youtube: (
      <>
        <path d="M21 12s0-4-1-5-1-1-7-1-7-1-1 0-1 1-1 5-1 5 0 4 1 5 1 1 7 1 7 1s6 0 7-1c1-1 1-5 1-5Z" />
        <path d="m10 9 5 3-5 3Z" />
      </>
    ),
    facebook: <path d="M14 8h3V4h-3c-3 0-5 2-5 5v3H6v4h3v6h4v-6h3l1-4h-4V9c0-.6.4-1 1-1Z" />,
    twitter: <path d="M4 4l16 16M20 4 4 20M9 4l11 16M4 4l11 16" />,
  };

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[platform]}
    </svg>
  );
}

export default function NewCampaignPage() {
  const router = useRouter();
  const { currency: selectedCurrency } = usePreferredCurrency("INR");

  const [platform, setPlatform] = useState<PlatformId>("instagram");
  const [selectedId, setSelectedId] = useState("ig-followers");
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState(1000);
  const [databaseIds, setDatabaseIds] = useState<Record<PlatformId, number>>({ instagram: 0, youtube: 0, facebook: 0, twitter: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [success, setSuccess] = useState(false);

  const checkoutInFlight = useRef(false);
  const checkoutRequestId = useRef<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    void supabase
      .from("services")
      .select("id, categories(name)")
      .eq("status", "active")
      .then(({ data }) => {
        const ids = { instagram: 0, youtube: 0, facebook: 0, twitter: 0 };
        for (const row of data ?? []) {
          const name = ((row.categories as unknown as { name?: string } | null)?.name || "").toLowerCase();
          const key = name.includes("instagram")
            ? "instagram"
            : name.includes("youtube")
              ? "youtube"
              : name.includes("facebook")
                ? "facebook"
                : name.includes("twitter") || name.includes("x/")
                  ? "twitter"
                  : null;
          if (key && !ids[key]) ids[key] = row.id;
        }
        setDatabaseIds(ids);
      });

    void supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase.from("profiles").select("balance").eq("id", user.id).single();
      setWalletBalance(Number(data?.balance ?? 0));
    });
  }, []);

  const visibleServices = useMemo(() => services.filter((service) => service.platform === platform), [platform]);
  const selected = services.find((service) => service.id === selectedId) ?? visibleServices[0];
  const totalINR = Math.max(0, Math.round(((selected.rate / 1000) * quantity) * 100) / 100);
  const hasEnoughBalance = walletBalance !== null && walletBalance + 0.0001 >= totalINR;
  const currentPlatform = platforms.find((item) => item.id === platform)!;

  const displayRate = (inr: number) => formatPrice(convertCurrency(inr, selectedCurrency), selectedCurrency);
  const displayMoney = (inr: number) => formatPrice(convertCurrency(inr, selectedCurrency), selectedCurrency);

  function choosePlatform(id: PlatformId) {
    setPlatform(id);
    const first = services.find((service) => service.platform === id);
    if (first) setSelectedId(first.id);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (checkoutInFlight.current) return;

    setError("");
    setSuccess(false);

    const serviceId = databaseIds[platform];
    if (!serviceId) {
      setError("This platform is still being configured. Please try again shortly.");
      return;
    }

    if (quantity < selected.minimum || quantity > selected.maximum) {
      setError(`Quantity must be between ${selected.minimum.toLocaleString("en-IN")} and ${selected.maximum.toLocaleString("en-IN")}.`);
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    const { data: profile, error: balanceError } = await supabase
      .from("profiles")
      .select("balance")
      .eq("id", user.id)
      .single();

    if (balanceError) {
      setError("Unable to verify your wallet balance. Please refresh and try again.");
      return;
    }

    const currentBalance = Number(profile.balance ?? 0);
    setWalletBalance(currentBalance);

    if (currentBalance + 0.0001 < totalINR) {
      setError("Insufficient campaign budget. Add funds to continue.");
      return;
    }

    checkoutInFlight.current = true;
    setSubmitting(true);
    checkoutRequestId.current ||= crypto.randomUUID();

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          serviceCode: selected.id,
          link,
          quantity,
          requestId: checkoutRequestId.current,
        }),
      });

      const payload = (await response.json()) as {
        data?: { id: string; charge: number; balance: number; duplicate?: boolean };
        error?: string;
      };

      if (!response.ok || !payload.data) {
        setError(payload.error || "Unable to create campaign.");
        setSubmitting(false);
        checkoutInFlight.current = false;
        return;
      }

      const updatedBalance = Number(payload.data.balance);
      setWalletBalance(updatedBalance);
      window.dispatchEvent(new CustomEvent("wallet-balance-updated", { detail: updatedBalance }));
      setSuccess(true);
      router.refresh();
      window.setTimeout(() => router.replace("/dashboard"), 800);
    } catch {
      setError("Checkout could not be completed. Please try again.");
      setSubmitting(false);
      checkoutInFlight.current = false;
    }
  }

  return (
    <main className="min-h-[calc(100vh-5rem)] overflow-hidden bg-[radial-gradient(circle_at_top_right,#dbeafe_0,transparent_24%),linear-gradient(180deg,#f8faff_0%,#f4f7fb_100%)] p-3 sm:p-5 lg:p-6">
      <section className="mx-auto max-w-[1380px]">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <span className="inline-flex rounded-full border border-blue-200 bg-white/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[.16em] text-blue-700 shadow-sm backdrop-blur">Campaign studio</span>
            <h1 className="mt-3 text-2xl font-bold tracking-[-.03em] text-[#07152f] sm:text-3xl">Create a new growth campaign</h1>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">Select a platform, choose a service, and configure your campaign with live pricing.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px] font-semibold text-slate-500">
            {["Premium quality", "Secure checkout", "Live tracking"].map((item) => (
              <span key={item} className="rounded-full border border-white bg-white/70 px-3 py-1.5 shadow-sm">✓ {item}</span>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)_320px]">
          <aside className="rounded-2xl border border-white/80 bg-white/75 p-3 shadow-[0_16px_40px_-28px_rgba(15,45,95,.4)] backdrop-blur-xl">
            <p className="px-2 text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">Choose platform</p>
            <div className="mt-3 space-y-2">
              {platforms.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => choosePlatform(item.id)}
                  className={`w-full rounded-xl border p-3 text-left transition ${platform === item.id ? "border-blue-200 bg-blue-50 shadow-sm" : "border-transparent hover:border-slate-200 hover:bg-white"}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-white shadow-md ${item.gradient}`}>
                      <PlatformIcon platform={item.id} className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className={`text-xs font-bold ${platform === item.id ? "text-blue-700" : "text-slate-700"}`}>{item.name}</p>
                      <p className="mt-0.5 line-clamp-2 text-[9px] leading-4 text-slate-400">{item.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <section className="min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.16em] text-blue-600">{currentPlatform.name} services</p>
                <h2 className="mt-1 text-lg font-bold text-[#07152f]">Choose your growth objective</h2>
              </div>
              <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-400 shadow-sm">{visibleServices.length} services</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={platform}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3"
              >
                {visibleServices.map((service) => (
                  <button
                    type="button"
                    key={service.id}
                    onClick={() => setSelectedId(service.id)}
                    className={`relative overflow-hidden rounded-2xl border bg-white p-4 text-left shadow-sm transition ${selected.id === service.id ? "border-blue-500 ring-2 ring-blue-500/10 shadow-lg shadow-blue-900/10" : "border-slate-200/80 hover:border-blue-200 hover:shadow-lg"}`}
                  >
                    {service.popular && (
                      <span className="absolute right-3 top-3 rounded-full bg-amber-50 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-amber-700">
                        Popular
                      </span>
                    )}
                    <span className={`grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br text-white shadow-md ${currentPlatform.gradient}`}>
                      <PlatformIcon platform={service.platform} className="h-4 w-4" />
                    </span>
                    <h3 className="mt-3 pr-12 text-sm font-bold text-[#07152f]">{service.name}</h3>
                    <p className="mt-1 text-[11px] leading-5 text-slate-500">{service.description}</p>
                    <div className="mt-3 flex items-end justify-between border-t border-slate-100 pt-3">
                      <div>
                        <p className="text-[8px] uppercase tracking-wider text-slate-400">Rate</p>
                        <p className="mt-1 text-sm font-bold text-blue-600">
                          {displayRate(service.rate)} <span className="text-[9px] font-medium text-slate-400">/ 1000</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] uppercase text-slate-400">Delivery</p>
                        <p className="mt-1 text-[10px] font-bold text-slate-600">{service.delivery}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </motion.div>
            </AnimatePresence>

            <div className="mt-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-blue-600">Selected service</p>
                  <h3 className="mt-1 text-sm font-bold">{selected.name}</h3>
                  <p className="mt-1 text-xs text-slate-500">{selected.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[ ["Quality", selected.quality], ["Delivery", selected.delivery], ["Refill", selected.refill] ].map(([label, value]) => (
                    <div key={label} className="rounded-lg bg-slate-50 px-3 py-2">
                      <p className="text-[8px] uppercase text-slate-400">{label}</p>
                      <p className="mt-1 text-[10px] font-bold">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <aside className="h-fit overflow-hidden rounded-2xl border border-white/80 bg-white/85 shadow-[0_22px_65px_-32px_rgba(15,45,95,.45)] backdrop-blur-xl xl:sticky xl:top-20">
            <div className="bg-gradient-to-br from-[#07152f] to-[#123a78] p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[.16em] text-blue-300">Live campaign preview</p>
                  <h2 className="mt-1 text-base font-bold">Order summary</h2>
                </div>
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/10">
                  <PlatformIcon platform={selected.platform} className="h-4 w-4" />
                </span>
              </div>

              <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs font-bold">{selected.name}</p>
                <p className="mt-1 text-[10px] text-slate-300">{currentPlatform.name} · {selected.quality}</p>
              </div>

              <div className="mt-4 space-y-2.5 text-[10px]">
                <div className="flex justify-between"><span className="text-slate-300">Rate</span><span className="font-bold">{displayRate(selected.rate)} / 1000</span></div>
                <div className="flex justify-between"><span className="text-slate-300">Quantity</span><span className="font-bold">{quantity.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between"><span className="text-slate-300">Estimated delivery</span><span className="font-bold">{selected.delivery}</span></div>
                <div className="flex justify-between"><span className="text-slate-300">Refill status</span><span className="font-bold text-blue-300">{selected.refill} available</span></div>
              </div>

              <div className="mt-4 flex items-end justify-between border-t border-white/10 pt-4">
                <span className="text-xs text-slate-300">Total price</span>
                <motion.span key={totalINR} initial={{ scale: 0.94, opacity: 0.6 }} animate={{ scale: 1, opacity: 1 }} className="text-2xl font-bold">
                  {displayMoney(totalINR)}
                </motion.span>
              </div>
            </div>

            <form onSubmit={submit} className="p-5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Profile or content link
                <input
                  type="url"
                  required
                  value={link}
                  onChange={(event) => setLink(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  placeholder="https://social-platform.com/profile"
                />
              </label>

              <label className="mt-4 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Campaign quantity
                <input
                  type="number"
                  required
                  min={selected.minimum}
                  max={selected.maximum}
                  step={100}
                  value={quantity}
                  onChange={(event) => setQuantity(Math.max(0, Number(event.target.value)))}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </label>

              <div className="mt-3 grid grid-cols-5 gap-1.5">
                {[100, 500, 1000, 5000, 10000].map((value) => (
                  <button key={value} type="button" onClick={() => setQuantity(value)} className={`rounded-lg py-1.5 text-[9px] font-bold transition ${quantity === value ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600"}`}>
                    {value >= 1000 ? `${value / 1000}K` : value}
                  </button>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-3 text-[10px]">
                <span className="text-slate-500">Available wallet balance</span>
                <span className="font-bold text-[#07152f]">{walletBalance === null ? "Loading..." : displayMoney(walletBalance)}</span>
              </div>

              {walletBalance !== null && !hasEnoughBalance && (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[10px] leading-5 text-amber-800">
                  Insufficient campaign budget. You need {displayMoney(Math.max(totalINR - walletBalance, 0))} more. <a href="/dashboard/wallet" className="font-bold underline">Add funds</a>
                </div>
              )}

              {error && <p className="mt-3 rounded-xl bg-rose-50 p-3 text-[10px] leading-5 text-rose-700">{error}</p>}
              {success && <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-[10px] font-semibold leading-5 text-emerald-700">Campaign created successfully. Taking you to your dashboard...</p>}

              <button
                disabled={submitting || walletBalance === null || !hasEnoughBalance || success}
                className="mt-4 w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Processing..." : "Proceed to checkout →"}
              </button>
            </form>
          </aside>
        </div>
      </section>
    </main>
  );
}