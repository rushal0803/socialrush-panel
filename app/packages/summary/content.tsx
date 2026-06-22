"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import MarketingIcon from "@/components/marketing/MarketingIcon";
import { getPackageById } from "@/lib/big-packages";
import { convertCurrency, formatPrice, type Currency, currencies } from "@/lib/currency";
import { createClient } from "@/lib/supabase/client";

export default function PackageSummaryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packageId = searchParams.get("packageId");
  const currency = (searchParams.get("currency") || "INR") as Currency;

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
                    <div className="text-4xl font-bold text-[#0b1635]">{pkg.platform}</div>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase text-blue-700">
                      {pkg.service}
                    </span>
                  </div>
                  <h1 className="mt-3 text-3xl font-extrabold text-[#0b1635]">{pkg.title}</h1>
                  {pkg.discountBadge && (
                    <p className="mt-2 text-sm font-bold text-emerald-700">✓ {pkg.discountBadge}</p>
                  )}
                </div>

                {/* Description */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm leading-7 text-slate-700">{pkg.description}</p>
                </div>

                {/* Key Info */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-bold uppercase text-slate-500">Quantity</p>
                    <p className="mt-2 text-2xl font-extrabold text-[#0b1635]">{pkg.quantityLabel}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-bold uppercase text-slate-500">Delivery</p>
                    <p className="mt-2 text-sm font-bold text-blue-700">{pkg.deliveryTime}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-bold uppercase text-slate-500">Best for</p>
                    <p className="mt-2 text-xs font-bold text-slate-700">{pkg.bestFor}</p>
                  </div>
                </div>

                {/* Profile Link Input */}
                <div>
                  <label className="block text-sm font-bold text-slate-700">Profile / Post / Video / Channel Link</label>
                  <input
                    type="url"
                    value={profileLink}
                    onChange={(e) => {
                      setProfileLink(e.target.value);
                      setProfileError("");
                    }}
                    placeholder="e.g., https://instagram.com/yourprofile"
                    className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm transition focus:outline-none ${
                      profileError
                        ? "border-rose-300 bg-rose-50 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                        : "border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    }`}
                  />
                  <p className="mt-2 text-xs text-slate-500">Make sure your link is public and correct before continuing.</p>
                  {profileError && <p className="mt-2 text-sm font-bold text-rose-700">{profileError}</p>}
                </div>

                {/* Important Notes */}
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <p className="text-xs font-bold uppercase text-blue-700">Important</p>
                  <p className="mt-2 text-sm text-blue-900">
                    Prices are displayed in {currencies.find((c) => c.code === currency)?.name} for convenience. Final checkout may be processed in INR depending on payment method.
                  </p>
                </div>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:sticky lg:top-24">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
                <h3 className="text-lg font-bold text-[#0b1635]">Order Summary</h3>

                <div className="mt-6 space-y-4 border-t border-slate-200 pt-6">
                  {/* Package Line */}
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-700">{pkg.platform} – {pkg.service}</p>
                      <p className="mt-1 text-xs text-slate-500">{pkg.quantityLabel} units</p>
                    </div>
                    <p className="text-right text-lg font-extrabold text-blue-600">{formattedPrice}</p>
                  </div>

                  {currency !== "INR" && (
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Base price (INR):</span>
                      <span>{basePrice}</span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="mt-6 border-t border-slate-200 pt-6">
                  <div className="flex justify-between">
                    <p className="text-sm font-bold text-slate-700">Total Amount</p>
                    <p className="text-2xl font-extrabold text-blue-600">{formattedPrice}</p>
                  </div>
                </div>

                {/* Wallet Balance Note */}
                {lowWalletBalance && (
                  <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <p className="text-xs font-bold text-amber-700">Low Wallet Balance</p>
                    <p className="mt-1 text-xs text-amber-900">Add funds from your wallet to complete this order.</p>
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
                      className="inline-flex w-full items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-6 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
                    >
                      Add Funds to Wallet
                    </Link>
                  )}

                  <a
                    href={process.env.NEXT_PUBLIC_WHATSAPP_URL || "https://wa.me/918860330771"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100"
                  >
                    Chat on WhatsApp
                  </a>
                </div>

                {/* Support Badge */}
                <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <p className="text-xs font-bold text-slate-600">Support Available</p>
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
