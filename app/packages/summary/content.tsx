"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import MarketingIcon from "@/components/marketing/MarketingIcon";
import { getPackageById } from "@/lib/big-packages";
import { convertCurrency, formatPrice, type Currency, currencies } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";
import { createClient } from "@/lib/supabase/client";

export default function PackageSummaryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packageId = searchParams.get("packageId");
  const queryCurrency = searchParams.get("currency") as Currency | null;
  const { currency } = usePreferredCurrency(queryCurrency || "INR");

  const [pkg] = useState(getPackageById(packageId || ""));
  const [profileLink, setProfileLink] = useState("");
  const [profileError, setProfileError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  useEffect(() => {
    // Check auth
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("balance")
          .eq("id", data.session.user.id)
          .single();
        setWalletBalance(Number(profile?.balance ?? 0));
      } else {
        router.push(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      }
    });
  }, [router]);

  if (!pkg || pkg.quantity < 5000) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen px-5 py-20 text-center">
        <MarketingHeader />
        <h1 className="text-2xl font-bold text-[#0b1635]">Big package not found</h1>
        <p className="mt-2 text-slate-600">Only high-volume packages are available on this flow.</p>
        <Link href="/packages" className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white">
          Back to Packages
        </Link>
        <MarketingFooter />
      </main>
    );
  }

  const convertedPrice = convertCurrency(pkg.basePriceINR, currency);
  const formattedPrice = formatPrice(convertedPrice, currency);
  const basePrice = formatPrice(pkg.basePriceINR, "INR");
  const lowWalletBalance = walletBalance !== null && walletBalance + 0.0001 < pkg.basePriceINR;

  const handleProceedToCheckout = async () => {
    if (!profileLink.trim()) {
      setProfileError("Please enter your profile or content link before checkout.");
      return;
    }

    setIsLoading(true);

    // Pass to dashboard new-order or checkout flow
    const checkoutParams = new URLSearchParams({
      packageId: pkg.packageId,
      platform: pkg.platform,
      service: pkg.service,
      quantity: String(pkg.quantity),
      basePriceINR: String(pkg.basePriceINR),
      displayedPrice: String(convertedPrice),
      currency,
      profileLink,
    });

    // Navigate to existing checkout/order flow
    router.push(`/dashboard/new-order?${checkoutParams.toString()}`);
  };

  const getProfileLinkHelper = () => {
    if (["followers", "subscribers", "members"].includes(pkg.service)) {
      return "This package is for profile growth. Enter your public profile, channel, or group link before checkout.";
    }
    return "This package is for content engagement. Enter the exact post, reel, video, or content link before checkout.";
  };

  return (
    <main className="overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_50%,#ffffff_100%)] text-slate-900">
      <MarketingHeader />

      <section className="relative px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
            {/* Package Details */}
            <div>
              <Link
                href="/packages"
                className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700"
              >
                <MarketingIcon name="arrow" className="h-4 w-4 rotate-180" />
                Back to Packages
              </Link>

              <div className="mt-6 space-y-6">
                {/* Header */}
                <div>
                  <div className="flex items-center gap-3">
                    <div className="text-4xl font-bold text-white">{pkg.platform}</div>
                    <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold uppercase text-cyan-200">
                      {pkg.service}
                    </span>
                  </div>
                  <h1 className="mt-3 text-3xl font-extrabold text-white">{pkg.title}</h1>
                  {pkg.discountBadge && (
                    <p className="mt-2 text-sm font-bold text-emerald-300">✓ {pkg.discountBadge}</p>
                  )}
                </div>

                {/* Description */}
                <div className="rounded-2xl border border-white/10 bg-[#0A1628] p-5">
                  <p className="text-sm leading-7 text-slate-300">{pkg.description}</p>
                </div>

                {/* Key Info */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/10 bg-[#0A1628] p-4">
                    <p className="text-xs font-bold uppercase text-slate-400">Quantity</p>
                    <p className="mt-2 text-2xl font-extrabold text-white">{pkg.quantityLabel}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-[#0A1628] p-4">
                    <p className="text-xs font-bold uppercase text-slate-400">Delivery</p>
                    <p className="mt-2 text-sm font-bold text-cyan-200">{pkg.deliveryTime}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-[#0A1628] p-4">
                    <p className="text-xs font-bold uppercase text-slate-400">Best for</p>
                    <p className="mt-2 text-xs font-bold text-slate-200">{pkg.bestFor}</p>
                  </div>
                </div>

                {/* Profile Link Input */}
                <div>
                  <label className="block text-sm font-bold text-slate-200">Profile / Post / Video / Channel Link</label>
                  <input
                    type="url"
                    value={profileLink}
                    onChange={(e) => {
                      setProfileLink(e.target.value);
                      setProfileError("");
                    }}
                    placeholder="e.g., https://instagram.com/yourprofile"
                    className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm text-slate-100 transition focus:outline-none ${
                      profileError
                        ? "border-rose-300 bg-[#1E1E2A] text-slate-100 focus:border-rose-500 focus:ring-rose-200"
                        : "border-white/10 bg-[#0A1628] text-slate-100 focus:border-cyan-500 focus:ring-cyan-500/10"
                    }`}
                  />
                  <p className="mt-2 text-xs text-slate-400">Make sure your link is public and correct before continuing.</p>
                  {profileError && <p className="mt-2 text-sm font-bold text-rose-300">{profileError}</p>}
                </div>

                {/* Important Notes */}
                <div className="rounded-xl border border-cyan-400/20 bg-[#0B1628] p-4">
                  <p className="text-xs font-bold uppercase text-cyan-300">Important</p>
                  <p className="mt-2 text-sm text-slate-300">
                    Prices are displayed in {currencies.find((c) => c.code === currency)?.name} for convenience. Final checkout may be processed in INR depending on payment method.
                  </p>
                </div>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:sticky lg:top-24">
              <div className="rounded-3xl border border-white/10 bg-[#0A1628] p-6 shadow-2xl shadow-slate-950/40">
                <h3 className="text-lg font-bold text-white">Order Summary</h3>

                <div className="mt-6 space-y-4 border-t border-white/10 pt-6">
                  {/* Package Line */}
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-200">{pkg.platform} – {pkg.service}</p>
                      <p className="mt-1 text-xs text-slate-400">{pkg.quantityLabel} units</p>
                    </div>
                    <p className="text-right text-lg font-extrabold text-cyan-300">{formattedPrice}</p>
                  </div>

                  {currency !== "INR" && (
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Base price (INR):</span>
                      <span>{basePrice}</span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="mt-6 border-t border-white/10 pt-6">
                  <div className="flex justify-between">
                    <p className="text-sm font-bold text-slate-200">Total Amount</p>
                    <p className="text-2xl font-extrabold text-cyan-300">{formattedPrice}</p>
                  </div>
                </div>

                {/* Wallet Balance Note */}
                {lowWalletBalance && (
                  <div className="mt-6 rounded-lg border border-amber-400/30 bg-amber-500/10 p-3">
                    <p className="text-xs font-bold text-amber-200">Low Wallet Balance</p>
                    <p className="mt-1 text-xs text-amber-100/90">Add funds from your wallet to complete this order.</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 space-y-3">
                  <button
                    onClick={handleProceedToCheckout}
                    disabled={isLoading || !profileLink.trim()}
                    className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition disabled:opacity-50 hover:shadow-xl"
                  >
                    {isLoading ? "Processing..." : "Proceed to Checkout"}
                  </button>

                  {lowWalletBalance && (
                    <Link
                      href="/dashboard/wallet"
                      className="inline-flex w-full items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-6 py-3 text-sm font-bold text-cyan-200 transition hover:bg-cyan-500/15"
                    >
                      Add Funds to Wallet
                    </Link>
                  )}

                  <a
                    href={process.env.NEXT_PUBLIC_WHATSAPP_URL || "https://wa.me/918860330771"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-6 py-3 text-sm font-bold text-emerald-200 transition hover:bg-emerald-500/15"
                  >
                    Chat on WhatsApp
                  </a>
                </div>

                {/* Support Badge */}
                <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-slate-900/80 px-3 py-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <p className="text-xs font-bold text-slate-300">Support Available</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
