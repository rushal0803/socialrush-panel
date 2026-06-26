"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import BlogShell from "@/components/marketing/blog/BlogShell";
import { createClient } from "@/lib/supabase/client";
import { bigPackages, type BigPackage } from "@/lib/big-packages";
import { formatCurrency, getCurrencyDisclaimer } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";

type PlatformFilter = "All" | BigPackage["platform"];

type ApiOrderData = {
  id: string;
  charge: number;
  balance: number;
  duplicate?: boolean;
};

const platformTabs: Array<{ key: PlatformFilter; label: string }> = [
  { key: "All", label: "All" },
  { key: "Instagram", label: "Instagram" },
  { key: "YouTube", label: "YouTube" },
  { key: "Facebook", label: "Facebook" },
  { key: "LinkedIn", label: "LinkedIn" },
  { key: "Telegram", label: "Telegram" },
  { key: "TikTok", label: "TikTok" },
  { key: "X", label: "X / Twitter" },
] as const;

const platformLabel: Record<BigPackage["platform"], string> = {
  Instagram: "Instagram",
  YouTube: "YouTube",
  Facebook: "Facebook",
  LinkedIn: "LinkedIn",
  Telegram: "Telegram",
  TikTok: "TikTok",
  X: "X / Twitter",
};

const platformGradient: Record<BigPackage["platform"], string> = {
  Instagram: "from-[#ff7dbf] via-[#9a96ff] to-[#58cbff]",
  YouTube: "from-[#ff8aa9] via-[#f96d83] to-[#ff5f68]",
  Facebook: "from-[#7ca6ff] via-[#5890ff] to-[#3967ea]",
  LinkedIn: "from-[#86d5ff] via-[#66a9ff] to-[#4a7ef0]",
  Telegram: "from-[#79d9ff] via-[#59b7ff] to-[#3d8cf3]",
  TikTok: "from-[#fc92c3] via-[#bb7cff] to-[#51c6ff]",
  X: "from-[#8fa1cb] via-[#7485b7] to-[#536188]",
};

const platformCode: Record<BigPackage["platform"], string> = {
  Instagram: "instagram",
  YouTube: "youtube",
  Facebook: "facebook",
  LinkedIn: "linkedin",
  Telegram: "telegram",
  TikTok: "tiktok",
  X: "x",
};

const trustBadges = ["Secure Wallet Checkout", "Instant Order Sync", "24x7 Support", "Delivery Tracking"] as const;

const PENDING_ORDER_KEY = "socialrush.packages.pending-order.v1";

function toTitleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getServiceCode(pkg: BigPackage) {
  return `${platformCode[pkg.platform]}-${pkg.service}`;
}

export default function PackagesPageContent() {
  const router = useRouter();
  const { currency } = usePreferredCurrency("INR");

  const [selectedPlatform, setSelectedPlatform] = useState<PlatformFilter>("All");
  const [selectedPackageId, setSelectedPackageId] = useState<string>(bigPackages[0]?.packageId ?? "");
  const [targetLink, setTargetLink] = useState("");
  const [notes, setNotes] = useState("");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const filteredPackages = useMemo(
    () => (selectedPlatform === "All" ? bigPackages : bigPackages.filter((pkg) => pkg.platform === selectedPlatform)),
    [selectedPlatform],
  );

  useEffect(() => {
    if (!filteredPackages.length) return;
    const exists = filteredPackages.some((pkg) => pkg.packageId === selectedPackageId);
    if (!exists) setSelectedPackageId(filteredPackages[0].packageId);
  }, [filteredPackages, selectedPackageId]);

  const selectedPackage = useMemo(
    () => bigPackages.find((pkg) => pkg.packageId === selectedPackageId) ?? filteredPackages[0] ?? null,
    [filteredPackages, selectedPackageId],
  );

  const requiredAmount = selectedPackage?.basePriceINR ?? 0;
  const hasEnoughBalance = walletBalance === null || walletBalance + 0.0001 >= requiredAmount;

  useEffect(() => {
    const supabase = createClient();

    const fetchAuthAndWallet = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setIsLoggedIn(Boolean(user));
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("balance").eq("id", user.id).single();
        setWalletBalance(Number(profile?.balance ?? 0));
      } else {
        setWalletBalance(null);
      }
      setIsAuthLoading(false);
    };

    void fetchAuthAndWallet();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsLoggedIn(Boolean(session));
      if (!session?.user?.id) {
        setWalletBalance(null);
        return;
      }
      const { data: profile } = await supabase.from("profiles").select("balance").eq("id", session.user.id).single();
      setWalletBalance(Number(profile?.balance ?? 0));
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(PENDING_ORDER_KEY);
    if (!raw) return;

    try {
      const pending = JSON.parse(raw) as {
        packageId?: string;
        targetLink?: string;
        notes?: string;
      };

      if (pending.packageId) setSelectedPackageId(pending.packageId);
      if (pending.targetLink) setTargetLink(pending.targetLink);
      if (pending.notes) setNotes(pending.notes);
    } catch {
      // Ignore malformed pending state and continue with defaults.
    }

    window.localStorage.removeItem(PENDING_ORDER_KEY);
  }, []);

  async function placeOrder() {
    setError("");
    setSuccess("");

    if (!selectedPackage) {
      setError("Select a package to continue.");
      return;
    }

    if (!targetLink.trim()) {
      setError("Campaign link or username is required.");
      return;
    }

    if (!isLoggedIn) {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          PENDING_ORDER_KEY,
          JSON.stringify({
            packageId: selectedPackage.packageId,
            targetLink: targetLink.trim(),
            notes: notes.trim(),
            createdAt: Date.now(),
          }),
        );
      }
      router.push(`/login?next=${encodeURIComponent("/packages")}`);
      return;
    }

    if (!hasEnoughBalance) {
      setError("Insufficient wallet balance. Add funds to place this order.");
      return;
    }

    const payload = {
      serviceCode: getServiceCode(selectedPackage),
      serviceId: 0,
      quantity: selectedPackage.quantity,
      link: targetLink.trim(),
      requestId: crypto.randomUUID(),
      notes: notes.trim() || null,
      fallbackPrice: Math.round((selectedPackage.basePriceINR / (selectedPackage.quantity / 1000)) * 10000) / 10000,
      fallbackName: `${selectedPackage.platform} ${toTitleCase(selectedPackage.service)}`,
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

      setWalletBalance(Number(result.data.balance));
      window.dispatchEvent(new CustomEvent("wallet-balance-updated", { detail: Number(result.data.balance) }));
      setSuccess("Order placed successfully. Redirecting to your orders...");
      setPlacingOrder(false);
      router.push("/dashboard/orders");
    } catch {
      setError("Unable to place order right now.");
      setPlacingOrder(false);
    }
  }

  return (
    <BlogShell>
      <div className="relative overflow-x-clip pb-36 lg:pb-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-14 top-16 h-72 w-72 rounded-full bg-pink-200/35 blur-3xl" />
          <div className="absolute right-[-8%] top-44 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl" />
          <div className="absolute left-[34%] top-[39%] h-64 w-64 rounded-full bg-violet-200/35 blur-3xl" />
        </div>

        <section className="relative px-5 pb-8 pt-8 sm:px-6 lg:px-8 lg:pb-10 lg:pt-12">
          <div className="mx-auto w-full max-w-7xl rounded-[34px] border border-white/80 bg-white/78 p-6 shadow-[0_24px_60px_rgba(82,111,172,.22)] backdrop-blur-xl sm:p-8">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
              <p className="inline-flex rounded-full border border-white/85 bg-white/88 px-4 py-2 text-xs font-bold uppercase tracking-[0.13em] text-[#355294]">
                Premium Package Checkout
              </p>
              <h1 className="mt-5 text-4xl font-black leading-tight text-[#112551] sm:text-5xl">Choose Your Package</h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-[#4a6290] sm:text-lg">
                Select a package, review details, and place your order securely.
              </p>
              <p className="mt-3 text-xs font-semibold text-[#5a72a3]">{getCurrencyDisclaimer()}</p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                {trustBadges.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-white/85 bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#2f4a86] shadow-[0_8px_20px_rgba(87,114,173,.12)]"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="relative px-5 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {platformTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSelectedPlatform(tab.key)}
                  className={`whitespace-nowrap rounded-2xl px-5 py-2.5 text-sm font-bold transition ${selectedPlatform === tab.key ? "bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] text-white shadow-[0_10px_24px_rgba(117,109,255,.3)]" : "border border-[#d5e3ff] bg-white/90 text-[#264276]"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="relative px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="mx-auto w-full max-w-7xl">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredPackages.map((pkg, index) => {
                const isSelected = selectedPackage?.packageId === pkg.packageId;
                const serviceLabel = toTitleCase(pkg.service);
                return (
                  <motion.button
                    key={pkg.packageId}
                    type="button"
                    onClick={() => setSelectedPackageId(pkg.packageId)}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.4, delay: index * 0.03 }}
                    whileHover={{ y: -6 }}
                    className={`text-left rounded-3xl border p-5 shadow-[0_16px_36px_rgba(81,108,169,.18)] transition ${isSelected ? "border-transparent bg-gradient-to-br from-white via-white to-[#f4f9ff] ring-2 ring-[#8ea9ff]" : "border-white/85 bg-white/92"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br text-xs font-black text-white shadow-[0_10px_22px_rgba(80,105,167,.28)] ${platformGradient[pkg.platform]}`}
                      >
                        {platformLabel[pkg.platform].slice(0, 2).toUpperCase()}
                      </span>
                      {pkg.discountBadge ? (
                        <span className="rounded-full border border-[#d6e2ff] bg-[#f6f9ff] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#5670aa]">
                          {pkg.discountBadge}
                        </span>
                      ) : null}
                    </div>

                    <h3 className="mt-4 text-xl font-extrabold text-[#122a5c]">{pkg.title}</h3>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.11em] text-[#5b75ab]">
                      {platformLabel[pkg.platform]} • {serviceLabel}
                    </p>

                    <div className="mt-4 rounded-2xl border border-[#d9e5ff] bg-[#f7faff] px-4 py-3">
                      <p className="text-sm font-extrabold text-[#355186]">{formatCurrency(pkg.basePriceINR, currency)}</p>
                      <p className="mt-1 text-xs font-medium text-[#6078ab]">Quantity: {pkg.quantityLabel}</p>
                      <p className="mt-1 text-xs font-medium text-[#6078ab]">Delivery: {pkg.deliveryTime}</p>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-[#4f6795]">{pkg.description}</p>
                    <p className="mt-2 text-xs font-semibold text-[#4a6398]">Best for: {pkg.bestFor}</p>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <article className="rounded-[30px] border border-white/85 bg-white/90 p-6 shadow-[0_18px_42px_rgba(86,114,175,.16)] sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#4f6caa]">Campaign Details</p>
              <h2 className="mt-3 text-3xl font-black text-[#10234f]">Complete Your Checkout</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#4f6795]">
                Add your target link and optional notes. Your selected package quantity and amount will be used for secure wallet checkout.
              </p>

              <div className="mt-6 grid gap-4">
                <label className="text-xs font-bold text-[#334f85]">
                  Campaign Link / Username
                  <input
                    value={targetLink}
                    onChange={(event) => setTargetLink(event.target.value)}
                    className="mt-2 min-h-11 w-full rounded-xl border border-[#d2e1ff] bg-white px-4 text-sm text-[#16346f] outline-none transition focus:border-[#8aa7ff]"
                    placeholder="https://instagram.com/yourprofile"
                  />
                </label>

                <label className="text-xs font-bold text-[#334f85]">
                  Notes (Optional)
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={4}
                    className="mt-2 w-full rounded-xl border border-[#d2e1ff] bg-white px-4 py-3 text-sm text-[#16346f] outline-none transition focus:border-[#8aa7ff]"
                    placeholder="Share any delivery instructions..."
                  />
                </label>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={placingOrder || isAuthLoading}
                  onClick={placeOrder}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] px-5 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {placingOrder ? "Placing Order..." : isLoggedIn ? "Place Order" : "Login to Place Order"}
                </button>
                {!hasEnoughBalance && isLoggedIn ? (
                  <Link
                    href="/dashboard/wallet"
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#d5e3ff] bg-white px-5 py-2 text-sm font-bold text-[#1f3b75]"
                  >
                    Add Funds
                  </Link>
                ) : null}
              </div>

              {error ? <p className="mt-4 text-sm font-semibold text-[#b03361]">{error}</p> : null}
              {success ? <p className="mt-4 text-sm font-semibold text-[#18604d]">{success}</p> : null}
            </article>

            <aside className="hidden lg:block">
              <div className="sticky top-28 rounded-[28px] border border-white/85 bg-white/92 p-6 shadow-[0_18px_42px_rgba(86,114,175,.16)]">
                <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#4f6caa]">Order Summary</p>
                <h3 className="mt-3 text-2xl font-black text-[#10234f]">Selected Package</h3>

                {selectedPackage ? (
                  <div className="mt-5 space-y-3 rounded-2xl border border-[#dce7ff] bg-[#f7faff] p-4 text-sm">
                    <p className="font-bold text-[#1d3b74]">{selectedPackage.title}</p>
                    <p className="text-[#496292]">{platformLabel[selectedPackage.platform]} • {toTitleCase(selectedPackage.service)}</p>
                    <p className="text-[#496292]">Quantity: {selectedPackage.quantityLabel}</p>
                    <p className="text-[#496292]">Delivery: {selectedPackage.deliveryTime}</p>
                    <div className="border-t border-[#dce7ff] pt-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c76ac]">Total Payable</p>
                      <p className="mt-1 text-2xl font-black text-[#14316a]">{formatCurrency(selectedPackage.basePriceINR, currency)}</p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-5 text-sm text-[#4d6696]">Choose a package to view summary.</p>
                )}

                <div className="mt-5 rounded-2xl border border-[#dce7ff] bg-white p-4 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c76ac]">Wallet Balance</p>
                  <p className="mt-1 text-lg font-black text-[#14316a]">
                    {isAuthLoading ? "Checking..." : isLoggedIn ? formatCurrency(walletBalance ?? 0, currency) : "Login required"}
                  </p>
                  {!hasEnoughBalance && isLoggedIn ? (
                    <p className="mt-2 font-semibold text-[#b03361]">Balance is lower than the package total.</p>
                  ) : null}
                </div>
              </div>
            </aside>
          </div>
        </section>

        {selectedPackage ? (
          <section className="fixed bottom-4 left-4 right-4 z-40 lg:hidden">
            <div className="rounded-2xl border border-white/85 bg-white/95 p-4 shadow-[0_22px_40px_rgba(52,78,137,.28)] backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#5c76ac]">Summary</p>
                  <p className="text-sm font-bold text-[#1d3b74]">{selectedPackage.title}</p>
                  <p className="text-xs text-[#4d6696]">{formatCurrency(selectedPackage.basePriceINR, currency)}</p>
                </div>
                <button
                  type="button"
                  onClick={placeOrder}
                  disabled={placingOrder || isAuthLoading}
                  className="inline-flex min-h-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] px-4 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {placingOrder ? "Placing..." : isLoggedIn ? "Place Order" : "Login"}
                </button>
              </div>
              {!hasEnoughBalance && isLoggedIn ? (
                <Link href="/dashboard/wallet" className="mt-3 inline-flex text-xs font-bold text-[#2b4f97] underline underline-offset-4">
                  Balance low. Add funds to continue.
                </Link>
              ) : null}
            </div>
          </section>
        ) : null}
      </div>
    </BlogShell>
  );
}
