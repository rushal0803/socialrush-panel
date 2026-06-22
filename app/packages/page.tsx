"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { bigPackages, platforms } from "@/lib/big-packages";
import { currencies, convertCurrency, formatPrice, type Currency } from "@/lib/currency";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import MarketingIcon from "@/components/marketing/MarketingIcon";
import { useAuth } from "@/lib/auth/use-auth";

export default function PackagesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("INR");
  const [selectedPlatform, setSelectedPlatform] = useState<string>(platforms[0]);

  const platformPackages = bigPackages.filter((p) => p.platform === selectedPlatform && p.quantity >= 5000);

  const handleChoosePackage = (packageId: string) => {
    const next = `/packages/summary?packageId=${packageId}&currency=${selectedCurrency}`;
    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    router.push(next);
  };

  const getPlatformColor = (platform: string): string => {
    const colors: Record<string, string> = {
      Instagram: "from-pink-500 to-rose-600",
      YouTube: "from-red-600 to-orange-700",
      LinkedIn: "from-blue-700 to-cyan-600",
      Facebook: "from-blue-600 to-indigo-700",
      Telegram: "from-blue-400 to-cyan-500",
      TikTok: "from-black to-slate-800",
      X: "from-gray-900 to-black",
    };
    return colors[platform] || "from-blue-600 to-indigo-700";
  };

  return (
    <main className="overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_50%,#ffffff_100%)] text-slate-900">
      <MarketingHeader />

      {/* Hero Section */}
      <section className="relative px-5 pb-12 pt-16 sm:px-6 lg:px-8 lg:pb-20 lg:pt-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:gap-10">
            <div>
              <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-[#0b1635] sm:text-5xl lg:text-6xl">
                Big Growth Packages for Serious Campaigns
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                Choose high-volume packages for Instagram, YouTube, LinkedIn, Facebook, Telegram, TikTok, and X. Bigger packages include better value, priority support, and clear order tracking.
              </p>
            </div>

            {/* Currency Selector */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-bold text-slate-700">Select Currency:</label>
              <div className="flex gap-2 flex-wrap">
                {currencies.map((curr) => (
                  <button
                    key={curr.code}
                    onClick={() => setSelectedCurrency(curr.code)}
                    className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
                      selectedCurrency === curr.code
                        ? "bg-blue-600 text-white"
                        : "border border-slate-200 bg-white text-slate-700 hover:border-blue-200"
                    }`}
                  >
                    {curr.symbol} {curr.code}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Tabs */}
      <section className="border-b border-slate-200 px-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex overflow-x-auto gap-2 py-4">
            {platforms.map((platform) => (
              <button
                key={platform}
                onClick={() => setSelectedPlatform(platform)}
                className={`whitespace-nowrap rounded-xl px-6 py-3 text-sm font-bold transition ${
                  selectedPlatform === platform
                    ? "bg-gradient-to-r bg-blue-600 text-white shadow-lg"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200"
                }`}
              >
                {platform}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="px-5 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {platformPackages.map((pkg) => (
              <div
                key={pkg.packageId}
                className="group rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_20px_45px_-28px_rgba(9,35,89,.25)] backdrop-blur transition duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl"
              >
                {/* Platform Badge */}
                <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-r ${getPlatformColor(pkg.platform)} px-4 py-2 text-sm font-bold text-white`}>
                  {pkg.platform}
                </div>

                {/* Title & Discount */}
                <h3 className="mt-2 text-2xl font-bold text-[#0b1635]">{pkg.title}</h3>
                {pkg.discountBadge && (
                  <span className="mt-2 inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    {pkg.discountBadge}
                  </span>
                )}

                {/* Service Type */}
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {pkg.service.charAt(0).toUpperCase() + pkg.service.slice(1)}
                </p>

                {/* Price */}
                <div className="mt-5 space-y-2">
                  {isAuthenticated ? (
                    <>
                      <p className="text-4xl font-extrabold text-blue-600">
                        {formatPrice(convertCurrency(pkg.basePriceINR, selectedCurrency), selectedCurrency)}
                      </p>
                      {selectedCurrency !== "INR" && (
                        <p className="text-xs text-slate-500">Base: {formatPrice(pkg.basePriceINR, "INR")}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-lg font-bold text-slate-700">Login to view price</p>
                  )}
                </div>

                {/* Delivery */}
                <div className="mt-4 space-y-2 rounded-lg border border-blue-100 bg-blue-50 p-3">
                  <div className="flex items-center gap-2">
                    <MarketingIcon name="clock" className="h-4 w-4 text-blue-600" />
                    <p className="text-xs font-bold text-blue-700">Delivery: {pkg.deliveryTime}</p>
                  </div>
                  <p className="text-[11px] text-slate-600">{pkg.description}</p>
                </div>

                {/* Best For */}
                <p className="mt-3 text-[12px] text-slate-600">
                  <span className="font-semibold">Best for:</span> {pkg.bestFor}
                </p>

                {/* CTA */}
                <button
                  onClick={() => handleChoosePackage(pkg.packageId)}
                  className="mt-6 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:shadow-xl"
                >
                  {isAuthenticated ? "Choose Package" : "Login to Continue"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WhatsApp Support Card */}
      <section className="px-5 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-cyan-50 p-8 shadow-lg">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-2xl font-bold text-emerald-900">Need help choosing a package?</h3>
                <p className="mt-2 text-sm text-emerald-700">Contact our support team for custom packages and bulk discounts.</p>
              </div>
              <a
                href={process.env.NEXT_PUBLIC_WHATSAPP_URL || "https://wa.me/918860330771"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-emerald-300 bg-emerald-600 px-8 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-700"
              >
                Contact on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
