"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import MarketingIcon from "@/components/marketing/MarketingIcon";
import { agencyServices } from "@/lib/marketing/content";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/currency";
export const dynamic = "force-dynamic";
const quantityOptions = [1000, 5000, 10000];

type ServiceDetails = {
  delivery?: string;
  refill?: string;
};

function parseRate(price: string) {
  const digits = price.match(/\d[\d,]*/);
  if (!digits) return 0;
  return Number(digits[0].replace(/,/g, ""));
}

export default function OrderSummaryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceSlug = searchParams.get("service") || "";
  const [quantity, setQuantity] = useState(1000);
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const service = useMemo(
    () => agencyServices.find((item) => item.slug === serviceSlug),
    [serviceSlug],
  );

  useEffect(() => {
    if (!service) return;
    const match = agencyServices.find((item) => item.slug === serviceSlug);
    if (match) {
      setQuantity(1000);
    }
  }, [service, serviceSlug]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const supabase = createClient();
    void supabase.auth.getSession().then(({ data }) => setIsAuthenticated(Boolean(data.session)));
  }, []);

  if (!service) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <MarketingHeader />
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-4xl flex-col items-center justify-center px-5 py-24 text-center">
          <p className="text-sm uppercase tracking-[0.32em] text-cyan-300">Order summary</p>
          <h1 className="mt-4 text-3xl font-bold">Service not found</h1>
          <p className="mt-3 max-w-xl text-sm text-slate-300">
            Select a valid service from the catalog to continue.
          </p>
          <Link href="/services" className="mt-8 inline-flex rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
            Browse Services
          </Link>
        </div>
        <MarketingFooter />
      </main>
    );
  }

  const startingPrice = parseRate(service.price);
  const totalPrice = Math.round((startingPrice / 1000) * quantity * 100) / 100;
  const formattedTotal = formatCurrency(totalPrice, "INR");

  const handleCheckout = async () => {
    if (!link.trim()) {
      setError("Please enter a public profile, post, or content link before checkout.");
      return;
    }

    if (!isAuthenticated) {
      const nextUrl = window.location.pathname + window.location.search;
      router.push(`/login?next=${encodeURIComponent(nextUrl)}`);
      return;
    }

    setError("");
    setIsSubmitting(true);
    router.push(`/dashboard/new-order?service=${service.slug}&quantity=${quantity}&link=${encodeURIComponent(link)}`);
  };

  return (
    <main className="min-h-screen bg-[#030613] text-white">
      <MarketingHeader />
      <section className="px-5 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-[32px] border border-slate-800 bg-slate-950/90 p-6 shadow-2xl shadow-cyan-500/10 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr] lg:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Order summary</p>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Review your campaign before checkout
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                  Confirm the service, destination link, and quantity here before moving to secure checkout in your dashboard.
                </p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Selected service</p>
                <h2 className="mt-3 text-xl font-bold text-white">{service.name}</h2>
                <p className="mt-2 text-sm text-slate-300">{service.summary}</p>
                <div className="mt-6 space-y-3 text-sm text-slate-300">
                  <div className="flex items-center justify-between rounded-2xl bg-slate-900/80 px-4 py-3">
                    <span>Platform</span>
                    <span className="font-semibold text-white">{service.platform}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-slate-900/80 px-4 py-3">
                    <span>Starting price</span>
                    <span className="font-semibold text-white">{service.price}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-slate-900/80 px-4 py-3">
                    <span>Delivery</span>
                    <span className="font-semibold text-white">{(service as ServiceDetails).delivery ?? "1–7 days"}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-slate-900/80 px-4 py-3">
                    <span>Refill support</span>
                    <span className="font-semibold text-white">{(service as ServiceDetails).refill ?? "Available"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
                <div className="grid gap-4">
                  <label className="text-sm font-semibold text-white">Destination profile or content link</label>
                  <input
                    type="url"
                    value={link}
                    onChange={(event) => {
                      setLink(event.target.value);
                      setError("");
                    }}
                    placeholder="https://instagram.com/yourprofile"
                    className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  />
                  <p className="text-sm text-slate-400">
                    Use the exact public destination required by the service: profile for followers, content link for likes and views.
                  </p>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <label className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm">
                      <span className="block text-slate-400">Quantity</span>
                      <input
                        type="number"
                        value={quantity}
                        min={100}
                        step={100}
                        onChange={(event) => setQuantity(Math.max(100, Number(event.target.value) || 100))}
                        className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                      />
                    </label>
                    {quantityOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setQuantity(option)}
                        className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${quantity === option ? "border-cyan-400 bg-cyan-500/15 text-white" : "border-slate-800 bg-slate-900 text-slate-300 hover:border-cyan-400"}`}
                      >
                        {option >= 1000 ? `${option / 1000}K` : option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
                <div className="rounded-3xl bg-slate-900/80 p-5">
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span>Estimated total</span>
                    <span className="font-semibold text-white">{formattedTotal}</span>
                  </div>
                  <div className="mt-6 space-y-3 text-sm text-slate-300">
                    <div className="flex items-center gap-2 text-slate-400">
                      <MarketingIcon name="clock" className="h-4 w-4" />
                      <span>Delivery estimate: 1–7 days</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <MarketingIcon name="shield" className="h-4 w-4" />
                      <span>Refill support: Available</span>
                    </div>
                  </div>
                </div>

                {error ? <p className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-100">{error}</p> : null}

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleCheckout}
                  className="mt-6 w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:shadow-xl disabled:opacity-60"
                >
                  {isAuthenticated === false ? "Sign in to continue" : isSubmitting ? "Continuing…" : "Continue to checkout"}
                </button>

                <p className="mt-4 text-xs text-slate-500">
                  After login, you will return here to continue to the dashboard checkout flow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <MarketingFooter />
    </main>
  );
}
