"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import BlogShell from "@/components/marketing/blog/BlogShell";
import PlatformIcon from "@/components/PlatformIcon";
import { getPackageById, type BigPackage } from "@/lib/big-packages";
import { formatCurrency, getCurrencyDisclaimer } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";
import { createClient } from "@/lib/supabase/client";

type ApiOrderData = {
  id: string;
  charge: number;
  balance: number;
  duplicate?: boolean;
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

const serviceLabel: Record<BigPackage["service"], string> = {
  followers: "Followers",
  subscribers: "Subscribers",
  likes: "Likes",
  views: "Views",
  members: "Members",
};

const PENDING_CHECKOUT_KEY = "socialrush.package-checkout.pending.v1";

function getServiceCode(pkg: BigPackage) {
  return `${platformCode[pkg.platform]}-${pkg.service}`;
}

export default function PackageCheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packageId = searchParams.get("packageId") || "";
  const pkg = useMemo(() => getPackageById(packageId), [packageId]);
  const { currency } = usePreferredCurrency("INR");

  const [targetLink, setTargetLink] = useState("");
  const [notes, setNotes] = useState("");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const raw = window.localStorage.getItem(PENDING_CHECKOUT_KEY);
    if (!raw) return;
    try {
      const pending = JSON.parse(raw) as { packageId?: string; targetLink?: string; notes?: string };
      if (pending.packageId === packageId) {
        setTargetLink(pending.targetLink || "");
        setNotes(pending.notes || "");
      }
    } catch {
      // Ignore malformed local checkout state.
    }
    window.localStorage.removeItem(PENDING_CHECKOUT_KEY);
  }, [packageId]);

  useEffect(() => {
    const supabase = createClient();

    async function loadSessionAndBalance() {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(Boolean(user));
      if (!user) {
        setWalletBalance(null);
        setIsAuthLoading(false);
        return;
      }
      const { data: profile } = await supabase.from("profiles").select("balance").eq("id", user.id).maybeSingle();
      setWalletBalance(Number(profile?.balance ?? 0));
      setIsAuthLoading(false);
    }

    void loadSessionAndBalance();
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsLoggedIn(Boolean(session?.user));
      if (!session?.user) {
        setWalletBalance(null);
        return;
      }
      const { data: profile } = await supabase.from("profiles").select("balance").eq("id", session.user.id).maybeSingle();
      setWalletBalance(Number(profile?.balance ?? 0));
    });

    const handleBalanceUpdate = (event: Event) => {
      const value = Number((event as CustomEvent<number>).detail);
      if (Number.isFinite(value)) setWalletBalance(value);
    };
    window.addEventListener("wallet-balance-updated", handleBalanceUpdate);

    return () => {
      listener.subscription.unsubscribe();
      window.removeEventListener("wallet-balance-updated", handleBalanceUpdate);
    };
  }, []);

  if (!pkg) {
    return (
      <BlogShell>
        <section className="grid min-h-[60vh] place-items-center px-4 py-16 text-center">
          <div className="w-full max-w-lg rounded-3xl border border-white/85 bg-white/90 p-6 shadow-[0_18px_42px_rgba(86,114,175,.16)] sm:p-8">
            <h1 className="text-2xl font-black text-[#10234f]">Package not found</h1>
            <p className="mt-3 text-sm leading-7 text-[#4f6795]">Choose an available package before continuing to checkout.</p>
            <Link href="/packages" className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] px-5 py-3 text-sm font-bold text-white sm:w-auto">
              Back to Packages
            </Link>
          </div>
        </section>
      </BlogShell>
    );
  }

  const hasEnoughBalance = isLoggedIn && walletBalance !== null && walletBalance + 0.0001 >= pkg.basePriceINR;
  const platformLabel = pkg.platform === "X" ? "X / Twitter" : pkg.platform;
  const checkoutPath = `/packages/checkout?packageId=${encodeURIComponent(pkg.packageId)}`;

  function savePendingCheckout() {
    window.localStorage.setItem(
      PENDING_CHECKOUT_KEY,
      JSON.stringify({
        packageId: pkg.packageId,
        targetLink: targetLink.trim(),
        notes: notes.trim(),
      }),
    );
  }

  async function placeOrder() {
    setError("");
    if (!targetLink.trim()) {
      setError("Campaign link or username is required.");
      return;
    }

    if (!isLoggedIn) {
      savePendingCheckout();
      router.push(`/login?next=${encodeURIComponent(checkoutPath)}`);
      return;
    }

    if (!hasEnoughBalance) {
      setError("Insufficient wallet balance. Add funds to place this order.");
      return;
    }

    const fallbackPrice = Math.round((pkg.basePriceINR / (pkg.quantity / 1000)) * 10000) / 10000;
    const payload = {
      serviceCode: getServiceCode(pkg),
      serviceId: 0,
      quantity: pkg.quantity,
      link: targetLink.trim(),
      requestId: crypto.randomUUID(),
      notes: notes.trim() || null,
      fallbackPrice,
      fallbackName: `${platformLabel} ${serviceLabel[pkg.service]}`,
      fallbackPlatform: platformCode[pkg.platform],
      fallbackMin: pkg.quantity,
      fallbackMax: pkg.quantity,
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

      const updatedBalance = Number(result.data.balance);
      setWalletBalance(updatedBalance);
      window.dispatchEvent(new CustomEvent("wallet-balance-updated", { detail: updatedBalance }));
      router.push("/dashboard/orders");
      router.refresh();
    } catch {
      setError("Unable to place order right now.");
      setPlacingOrder(false);
    }
  }

  return (
    <BlogShell>
      <div className="relative overflow-x-clip pb-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-12 h-72 w-72 rounded-full bg-pink-200/35 blur-3xl" />
          <div className="absolute right-[-5rem] top-32 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl" />
        </div>

        <section className="relative px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">
            <Link href="/packages" className="inline-flex min-h-11 items-center text-sm font-bold text-[#2f56a0] transition hover:text-[#1e3c78]">
              ← Back to packages
            </Link>

            <div className="mt-3 grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
              <article className="min-w-0 rounded-[26px] border border-white/85 bg-white/90 p-5 shadow-[0_18px_42px_rgba(86,114,175,.16)] backdrop-blur-xl sm:p-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#4f6caa]">Package checkout</p>
                <h1 className="mt-2 text-2xl font-black text-[#10234f] sm:text-3xl">Complete your campaign details</h1>
                <p className="mt-3 text-sm leading-7 text-[#4f6795]">
                  Enter the public destination for this campaign, review the package total, and place the order using your wallet.
                </p>

                <div className="mt-6 rounded-2xl border border-[#dce7ff] bg-[#f7faff] p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#5b75ab]"><PlatformIcon platform={platformLabel} className="h-4 w-4" />{platformLabel} · {serviceLabel[pkg.service]}</p>
                      <h2 className="mt-2 text-xl font-black text-[#122a5c]">{pkg.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-[#4f6795]">{pkg.description}</p>
                    </div>
                    {pkg.discountBadge ? (
                      <span className="w-fit shrink-0 rounded-full border border-[#d6e2ff] bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#5670aa]">
                        {pkg.discountBadge}
                      </span>
                    ) : null}
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                    <div className="rounded-xl bg-white p-3">
                      <dt className="text-[#6078ab]">Price</dt>
                      <dd className="mt-1 break-words font-black text-[#355186]">{formatCurrency(pkg.basePriceINR, currency)}</dd>
                    </div>
                    <div className="rounded-xl bg-white p-3">
                      <dt className="text-[#6078ab]">Quantity</dt>
                      <dd className="mt-1 font-black text-[#355186]">{pkg.quantityLabel}</dd>
                    </div>
                    <div className="col-span-2 rounded-xl bg-white p-3 sm:col-span-1">
                      <dt className="text-[#6078ab]">Delivery</dt>
                      <dd className="mt-1 font-black text-[#355186]">{pkg.deliveryTime}</dd>
                    </div>
                  </dl>
                </div>

                <div className="mt-6 grid gap-5">
                  <label className="text-xs font-bold text-[#334f85]">
                    Campaign Link / Username
                    <input
                      value={targetLink}
                      onChange={(event) => setTargetLink(event.target.value)}
                      className="mt-2 min-h-12 w-full rounded-xl border border-[#d2e1ff] bg-white px-4 text-base text-[#16346f] outline-none transition focus:border-[#8aa7ff]"
                      placeholder="Paste the public profile, post, or channel link"
                    />
                  </label>
                  <label className="text-xs font-bold text-[#334f85]">
                    Notes (Optional)
                    <textarea
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      rows={4}
                      className="mt-2 w-full resize-y rounded-xl border border-[#d2e1ff] bg-white px-4 py-3 text-base text-[#16346f] outline-none transition focus:border-[#8aa7ff]"
                      placeholder="Share any delivery instructions..."
                    />
                  </label>
                </div>

                {error ? <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-[#b03361]">{error}</p> : null}

                <div className="mt-6 lg:hidden">
                  <CheckoutSummary
                    pkg={pkg}
                    currency={currency}
                    walletBalance={walletBalance}
                    isAuthLoading={isAuthLoading}
                    isLoggedIn={isLoggedIn}
                    hasEnoughBalance={hasEnoughBalance}
                  />
                </div>

                <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
                  <button
                    type="button"
                    disabled={placingOrder || isAuthLoading}
                    onClick={placeOrder}
                    className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] px-5 py-3 text-sm font-bold text-white shadow-[0_14px_28px_rgba(117,109,255,.3)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {placingOrder ? "Placing Order..." : isLoggedIn ? "Place Order" : "Login to Place Order"}
                  </button>
                  {!hasEnoughBalance && isLoggedIn && !isAuthLoading ? (
                    <Link href="/dashboard/wallet" className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-[#d5e3ff] bg-white px-5 py-3 text-sm font-bold text-[#1f3b75] sm:w-auto">
                      Add Funds
                    </Link>
                  ) : null}
                </div>
                <p className="mt-4 text-xs font-semibold leading-6 text-[#5a72a3]">{getCurrencyDisclaimer()}</p>
              </article>

              <aside className="hidden lg:block">
                <div className="sticky top-28">
                  <CheckoutSummary
                    pkg={pkg}
                    currency={currency}
                    walletBalance={walletBalance}
                    isAuthLoading={isAuthLoading}
                    isLoggedIn={isLoggedIn}
                    hasEnoughBalance={hasEnoughBalance}
                  />
                </div>
              </aside>
            </div>
          </div>
        </section>
      </div>
    </BlogShell>
  );
}

function CheckoutSummary({
  pkg,
  currency,
  walletBalance,
  isAuthLoading,
  isLoggedIn,
  hasEnoughBalance,
}: {
  pkg: BigPackage;
  currency: Parameters<typeof formatCurrency>[1];
  walletBalance: number | null;
  isAuthLoading: boolean;
  isLoggedIn: boolean;
  hasEnoughBalance: boolean;
}) {
  const platformLabel = pkg.platform === "X" ? "X / Twitter" : pkg.platform;
  return (
    <div className="rounded-[24px] border border-white/85 bg-white/92 p-5 shadow-[0_18px_42px_rgba(86,114,175,.16)] backdrop-blur-xl sm:p-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#4f6caa]">Order summary</p>
      <h2 className="mt-2 text-xl font-black text-[#10234f]">{pkg.title}</h2>
      <div className="mt-5 space-y-3 text-sm">
        <SummaryRow label="Platform" value={platformLabel} />
        <SummaryRow label="Service" value={serviceLabel[pkg.service]} />
        <SummaryRow label="Quantity" value={pkg.quantityLabel} />
        <SummaryRow label="Delivery" value={pkg.deliveryTime} />
        <div className="border-t border-[#dce7ff] pt-3">
          <SummaryRow label="Total payable" value={formatCurrency(pkg.basePriceINR, currency)} strong />
        </div>
      </div>
      <div className="mt-5 rounded-2xl border border-[#dce7ff] bg-[#f7faff] p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5c76ac]">Wallet balance</p>
        <p className="mt-1 break-words text-lg font-black text-[#14316a]">
          {isAuthLoading ? "Checking..." : isLoggedIn ? formatCurrency(walletBalance ?? 0, currency) : "Login required"}
        </p>
        {!hasEnoughBalance && isLoggedIn && !isAuthLoading ? (
          <p className="mt-2 text-xs font-semibold leading-5 text-[#b03361]">Your wallet balance is lower than the package total.</p>
        ) : null}
      </div>
    </div>
  );
}

function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[#6078ab]">{label}</span>
      <span className={`max-w-[60%] break-words text-right ${strong ? "text-lg font-black text-[#14316a]" : "font-bold text-[#355186]"}`}>{value}</span>
    </div>
  );
}
