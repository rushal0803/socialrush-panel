"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { ShieldCheck, PackageOpen, Clock3, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { bigPackages, type BigPackage } from "@/lib/big-packages";
import { formatCurrency } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";

const platformTone: Record<BigPackage["platform"], string> = {
  Instagram: "from-[#ff6fb4] via-[#9a8cff] to-[#57caff]",
  YouTube: "from-[#ff8ea8] via-[#ff6f88] to-[#ff5f67]",
  LinkedIn: "from-[#8cd8ff] via-[#68acff] to-[#4a7ef1]",
  Facebook: "from-[#7ea8ff] via-[#5f90ff] to-[#406de6]",
  Telegram: "from-[#7edfff] via-[#61bcff] to-[#3f90f7]",
  TikTok: "from-[#fd9ac8] via-[#bd7cff] to-[#53c7ff]",
  X: "from-[#95a4cb] via-[#7888b7] to-[#586588]",
};

const platformCode: Record<BigPackage["platform"], string> = {
  Instagram: "instagram",
  YouTube: "youtube",
  LinkedIn: "linkedin",
  Facebook: "facebook",
  Telegram: "telegram",
  TikTok: "tiktok",
  X: "x",
};

type ApiOrderData = {
  id: string;
  charge: number;
  balance: number;
};

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getPackageLinkPlaceholder(pkg: BigPackage): string {
  if (pkg.platform === "Instagram") {
    if (pkg.service === "followers") return "https://instagram.com/yourprofile";
    return "https://instagram.com/p/your-post-id";
  }

  if (pkg.platform === "YouTube") {
    if (pkg.service === "subscribers") return "https://youtube.com/@yourchannel";
    return "https://youtube.com/watch?v=your-video-id";
  }

  if (pkg.platform === "LinkedIn") {
    if (pkg.service === "followers") return "https://linkedin.com/in/your-profile";
    return "https://linkedin.com/posts/your-post-id";
  }

  if (pkg.platform === "Facebook") {
    if (pkg.service === "followers") return "https://facebook.com/yourpage";
    return "https://facebook.com/yourpage/posts/your-post-id";
  }

  if (pkg.platform === "Telegram") {
    return "https://t.me/yourchannel";
  }

  if (pkg.platform === "TikTok") {
    if (pkg.service === "followers") return "https://tiktok.com/@yourprofile";
    return "https://tiktok.com/@username/video/123456789";
  }

  if (pkg.service === "followers") return "https://x.com/yourprofile";
  return "https://x.com/username/status/123456789";
}

function getServiceCode(pkg: BigPackage) {
  return `${platformCode[pkg.platform]}-${pkg.service}`;
}

export default function DashboardPackagesPage() {
  const { currency } = usePreferredCurrency("INR");
  const [selectedPackageId, setSelectedPackageId] = useState<string>(bigPackages[0]?.packageId ?? "");
  const [targetLink, setTargetLink] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedPackage = useMemo(
    () => bigPackages.find((pkg) => pkg.packageId === selectedPackageId) ?? bigPackages[0] ?? null,
    [selectedPackageId],
  );

  const placeholder = selectedPackage ? getPackageLinkPlaceholder(selectedPackage) : "https://instagram.com/yourprofile";

  async function placeOrder() {
    setError("");
    setSuccess("");

    if (!selectedPackage) {
      setError("No package selected.");
      return;
    }

    if (!targetLink.trim()) {
      setError("Please enter your profile/content link or username.");
      return;
    }

    const payload = {
      serviceCode: getServiceCode(selectedPackage),
      serviceId: 0,
      quantity: selectedPackage.quantity,
      link: targetLink.trim(),
      requestId: crypto.randomUUID(),
      notes: null,
      fallbackPrice: Math.round((selectedPackage.basePriceINR / (selectedPackage.quantity / 1000)) * 10000) / 10000,
      fallbackName: `${selectedPackage.platform} ${titleCase(selectedPackage.service)}`,
      fallbackPlatform: platformCode[selectedPackage.platform],
      fallbackMin: selectedPackage.quantity,
      fallbackMax: selectedPackage.quantity,
    };

    try {
      setPlacingOrder(true);
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as { data?: ApiOrderData; error?: string };

      if (!response.ok || !result.data) {
        setError(result.error || "Unable to place order right now.");
        setPlacingOrder(false);
        return;
      }

      window.dispatchEvent(new CustomEvent("wallet-balance-updated", { detail: Number(result.data.balance) }));
      setSuccess("Order placed successfully. Redirecting to your orders...");
      setTargetLink("");
      setPlacingOrder(false);
      window.setTimeout(() => {
        window.location.href = "/dashboard/orders";
      }, 800);
    } catch {
      setError("Unable to place order right now.");
      setPlacingOrder(false);
    }
  }

  return (
    <main className="relative min-h-[calc(100vh-5rem)] overflow-x-hidden bg-[linear-gradient(165deg,#f0f9ff_0%,#fdf4ff_28%,#fff1f8_55%,#f5f3ff_82%,#ecfeff_100%)] px-4 pb-20 pt-4 sm:px-6 lg:px-8 lg:pt-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="absolute right-[-5rem] top-16 h-96 w-96 rounded-full bg-pink-200/40 blur-3xl" />
        <div className="absolute bottom-24 left-1/3 h-80 w-80 rounded-full bg-violet-200/35 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1650px]">
        <section className="rounded-[2rem] border border-white/80 bg-white/70 p-5 shadow-[0_30px_90px_-40px_rgba(15,23,42,.45)] backdrop-blur-2xl sm:p-7">
          <p className="inline-flex rounded-full border border-blue-200/80 bg-white/85 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.18em] text-blue-700">
            Fixed Ready-Made Packages
          </p>
          <h1 className="mt-4 text-[clamp(1.9rem,5vw,3rem)] font-black leading-[1.04] tracking-[-0.03em] text-[#07152f]">
            Dashboard Packages
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#58709c]">
            Pick a package, add your profile or content link, and place your order securely. No quantity editing and no custom builder.
          </p>
        </section>

        {bigPackages.length === 0 ? (
          <section className="mt-6 rounded-[1.7rem] border border-white/85 bg-white/80 p-8 text-center shadow-[0_24px_60px_-35px_rgba(15,23,42,.35)]">
            <h2 className="text-xl font-black text-[#133168]">No packages available</h2>
            <p className="mt-2 text-sm text-[#59719d]">Ready-made packages are currently being updated. Please check back shortly.</p>
          </section>
        ) : (
          <section className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_420px]">
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {bigPackages.map((pkg, index) => {
                const active = selectedPackage?.packageId === pkg.packageId;
                return (
                  <motion.article
                    key={pkg.packageId}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={`relative overflow-hidden rounded-[1.5rem] border p-4 shadow-[0_20px_50px_-30px_rgba(15,23,42,.42)] ${
                      active
                        ? "border-transparent bg-[linear-gradient(white,white)_padding-box,linear-gradient(135deg,rgba(255,102,178,.7),rgba(79,209,255,.7),rgba(139,92,246,.7))_border-box]"
                        : "border-white/85 bg-white/80"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br text-xs font-black text-white ${platformTone[pkg.platform]}`}>
                        {pkg.platform.slice(0, 2).toUpperCase()}
                      </span>
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700">
                        No password required
                      </span>
                    </div>

                    <h3 className="mt-4 text-lg font-black text-[#133168]">{pkg.platform} {pkg.title}</h3>
                    <p className="mt-1 text-xs font-semibold text-[#5e78ab]">{titleCase(pkg.service)} package</p>

                    <div className="mt-4 space-y-2.5 text-sm">
                      <p className="flex items-center justify-between rounded-xl border border-[#e6eeff] bg-white px-3 py-2">
                        <span className="text-[#5e78ab]">Fixed quantity</span>
                        <span className="font-black text-[#17366f]">{pkg.quantityLabel}</span>
                      </p>
                      <p className="flex items-center justify-between rounded-xl border border-[#e6eeff] bg-white px-3 py-2">
                        <span className="text-[#5e78ab]">Price</span>
                        <span className="font-black text-[#17366f]">{formatCurrency(pkg.basePriceINR, currency)}</span>
                      </p>
                      <p className="flex items-center justify-between rounded-xl border border-[#e6eeff] bg-white px-3 py-2">
                        <span className="text-[#5e78ab]">Delivery</span>
                        <span className="font-black text-[#17366f]">{pkg.deliveryTime}</span>
                      </p>
                      <p className="flex items-center justify-between rounded-xl border border-[#e6eeff] bg-white px-3 py-2">
                        <span className="text-[#5e78ab]">Refill</span>
                        <span className="font-black text-[#17366f]">Standard support</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPackageId(pkg.packageId);
                        setError("");
                        setSuccess("");
                      }}
                      className={`mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-black transition ${
                        active
                          ? "bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] text-white shadow-[0_14px_30px_-14px_rgba(117,109,255,.65)]"
                          : "border border-[#d7e4ff] bg-white text-[#1f3f77] hover:bg-[#eef4ff]"
                      }`}
                    >
                      Select Package
                    </button>
                  </motion.article>
                );
              })}
            </div>

            <aside className="xl:sticky xl:top-24 xl:h-fit">
              <div className="rounded-[1.8rem] border border-white/80 bg-[linear-gradient(155deg,rgba(255,255,255,.92),rgba(241,247,255,.84))] p-5 shadow-[0_30px_70px_-40px_rgba(15,23,42,.55)] backdrop-blur-2xl sm:p-6">
                <p className="text-[10px] font-black uppercase tracking-[.18em] text-[#607db4]">Order Summary</p>
                <h2 className="mt-2 text-xl font-black text-[#0f2b61]">Package Checkout</h2>

                {!selectedPackage ? (
                  <div className="mt-5 rounded-2xl border border-[#e6eeff] bg-white p-4 text-sm text-[#5a74a7]">
                    Select any package card to continue.
                  </div>
                ) : (
                  <>
                    <div className="mt-5 space-y-2.5">
                      <div className="rounded-xl border border-[#e6eeff] bg-white px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7290c0]">Package</p>
                        <p className="mt-1 text-sm font-black text-[#17366f]">{selectedPackage.platform} {selectedPackage.title}</p>
                      </div>

                      <div className="rounded-xl border border-[#e6eeff] bg-white px-4 py-3 text-sm text-[#4f6da4]">
                        <p className="flex items-center justify-between"><span>Quantity</span><b className="text-[#17366f]">{selectedPackage.quantityLabel}</b></p>
                        <p className="mt-1 flex items-center justify-between"><span>Price</span><b className="text-[#17366f]">{formatCurrency(selectedPackage.basePriceINR, currency)}</b></p>
                        <p className="mt-1 flex items-center justify-between"><span>Delivery</span><b className="text-[#17366f]">{selectedPackage.deliveryTime}</b></p>
                        <p className="mt-1 flex items-center justify-between"><span>Refill Policy</span><b className="text-[#17366f]">Standard support</b></p>
                        <p className="mt-2 flex items-center justify-between border-t border-[#e8efff] pt-2 text-base"><span className="font-semibold">Total Amount</span><b className="text-[#17366f]">{formatCurrency(selectedPackage.basePriceINR, currency)}</b></p>
                      </div>
                    </div>

                    <label className="mt-4 block text-xs font-bold uppercase tracking-[0.12em] text-[#607db4]">
                      Profile / Post / Video Link or Username
                      <input
                        type="text"
                        value={targetLink}
                        onChange={(event) => {
                          setTargetLink(event.target.value);
                          setError("");
                        }}
                        placeholder={placeholder}
                        className="mt-2 min-h-12 w-full rounded-xl border border-[#d7e4ff] bg-white px-4 py-3 text-sm font-semibold text-[#17366f] outline-none transition focus:border-[#9fbcff] focus:ring-4 focus:ring-[#d9e6ff]"
                      />
                    </label>

                    {error ? <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p> : null}
                    {success ? <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{success}</p> : null}

                    <button
                      type="button"
                      disabled={placingOrder || !targetLink.trim()}
                      onClick={placeOrder}
                      className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] px-5 py-3 text-sm font-black text-white shadow-[0_18px_36px_-14px_rgba(117,109,255,.7)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55"
                    >
                      {placingOrder ? "Placing order..." : "Place Order Securely"}
                    </button>

                    <div className="mt-4 grid gap-2 text-[11px] font-semibold text-[#5d79aa] sm:grid-cols-2">
                      <p className="inline-flex items-center gap-1.5 rounded-lg border border-[#e3ecff] bg-white px-3 py-2"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Wallet-safe checkout</p>
                      <p className="inline-flex items-center gap-1.5 rounded-lg border border-[#e3ecff] bg-white px-3 py-2"><Clock3 className="h-4 w-4 text-blue-600" /> Live delivery tracking</p>
                      <p className="inline-flex items-center gap-1.5 rounded-lg border border-[#e3ecff] bg-white px-3 py-2"><PackageOpen className="h-4 w-4 text-violet-600" /> Fixed package quantities</p>
                      <p className="inline-flex items-center gap-1.5 rounded-lg border border-[#e3ecff] bg-white px-3 py-2"><CheckCircle2 className="h-4 w-4 text-cyan-600" /> No password required</p>
                    </div>

                    <Link href="/dashboard/new-order" className="mt-4 inline-flex text-xs font-bold text-[#2b4f90] hover:text-[#17366f]">
                      Need custom quantity? Use New Order instead.
                    </Link>
                  </>
                )}
              </div>
            </aside>
          </section>
        )}
      </div>
    </main>
  );
}
