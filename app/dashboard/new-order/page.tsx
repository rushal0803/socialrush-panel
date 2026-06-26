"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Sparkles, User, Wallet, Layers3, Link as LinkIcon, Hash, StickyNote, BarChart3, ShieldCheck, Clock3, Gem } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";
import { activeSmmServices, platformMeta, type SmmPlatformId } from "@/lib/smm-service-catalog";

type PlatformId = SmmPlatformId;
const platformOrder: PlatformId[] = ["instagram", "youtube", "facebook", "linkedin", "telegram", "tiktok", "x"];

const serviceToLegacyCode: Record<string, string> = {
  "instagram-followers": "ig-followers",
  "instagram-likes": "ig-likes",
  "instagram-views": "ig-views",
  "youtube-subscribers": "yt-subscribers",
  "youtube-likes": "yt-likes",
  "youtube-views": "yt-views",
  "facebook-followers": "fb-followers",
  "facebook-likes": "fb-likes",
  "facebook-views": "fb-views",
  "x-followers": "x-followers",
  "x-likes": "x-likes",
};

type ApiOrderData = {
  id: string;
  charge: number;
  balance: number;
  duplicate?: boolean;
};

const sectionMotion = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 as const },
  transition: { duration: 0.45, ease: "easeOut" as const },
};

function buildReadableOrderId(id: string) {
  const compact = id.replace(/-/g, "");
  const seed = Number.parseInt(compact.slice(0, 8), 16);
  return `SR-${String(Math.abs(seed % 900000) + 1000).padStart(4, "0")}`;
}

export default function NewCampaignPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currency } = usePreferredCurrency("INR");
  const money = (value: number) => formatCurrency(value, currency);

  const initialServiceCode = searchParams.get("service") ?? "instagram-followers";
  const initialService = activeSmmServices.find((service) => service.code === initialServiceCode) ?? activeSmmServices[0];

  const [platform, setPlatform] = useState<PlatformId>(initialService.platform);
  const [serviceCode, setServiceCode] = useState(initialService.code);
  const [targetLink, setTargetLink] = useState(searchParams.get("link") ?? "");
  const [quantity, setQuantity] = useState(Number(searchParams.get("quantity") || initialService.minQuantity));
  const [notes, setNotes] = useState("");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileChip, setProfileChip] = useState("Client Workspace");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmedDetails, setConfirmedDetails] = useState(false);
  const [successOrder, setSuccessOrder] = useState<ApiOrderData | null>(null);

  const inFlight = useRef(false);
  const requestId = useRef<string>("");

  useEffect(() => {
    const supabase = createClient();
    setLoadingProfile(true);
    void supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      setProfileChip(user?.email ? user.email.split("@")[0] : "Client Workspace");
      setLoadingProfile(false);
    });
  }, []);

  const servicesForPlatform = useMemo(
    () => activeSmmServices.filter((service) => service.platform === platform),
    [platform],
  );

  const selectedService = useMemo(
    () => activeSmmServices.find((service) => service.code === serviceCode) ?? servicesForPlatform[0],
    [serviceCode, servicesForPlatform],
  );

  const totalPrice = useMemo(
    () => Math.round(((Math.max(quantity, 0) / 1000) * selectedService.pricePer1000) * 100) / 100,
    [quantity, selectedService.pricePer1000],
  );

  const quantityError = useMemo(() => {
    if (!Number.isFinite(quantity) || quantity <= 0) return "Enter a valid quantity.";
    if (quantity < selectedService.minQuantity) return `Minimum quantity is ${selectedService.minQuantity.toLocaleString("en-IN")}.`;
    if (quantity > selectedService.maxQuantity) return `Maximum quantity is ${selectedService.maxQuantity.toLocaleString("en-IN")}.`;
    return "";
  }, [quantity, selectedService.minQuantity, selectedService.maxQuantity]);

  const hasEnoughWallet = walletBalance !== null && walletBalance + 0.0001 >= totalPrice;

  async function loadWalletBalance() {
    if (loadingBalance) return;
    setLoadingBalance(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("balance")
      .eq("id", user.id)
      .single();

    setWalletBalance(Number(profile?.balance ?? 0));
    setLoadingBalance(false);
  }

  function switchPlatform(nextPlatform: PlatformId) {
    setPlatform(nextPlatform);
    const firstService = activeSmmServices.find((service) => service.platform === nextPlatform);
    if (firstService) {
      setServiceCode(firstService.code);
      setQuantity(Math.max(quantity, firstService.minQuantity));
    }
  }

  function switchService(nextServiceCode: string) {
    setServiceCode(nextServiceCode);
    const nextService = activeSmmServices.find((service) => service.code === nextServiceCode);
    if (nextService) {
      if (quantity < nextService.minQuantity) setQuantity(nextService.minQuantity);
      if (quantity > nextService.maxQuantity) setQuantity(nextService.maxQuantity);
    }
  }

  function resetForm() {
    setTargetLink("");
    setNotes("");
    setQuantity(selectedService.minQuantity);
    setError("");
  }

  async function openConfirmation() {
    setError("");

    if (!targetLink.trim()) {
      setError("Link / username is required.");
      return;
    }

    if (quantityError) {
      setError(quantityError);
      return;
    }

    if (walletBalance === null) {
      await loadWalletBalance();
    }

    setConfirmOpen(true);
    setConfirmedDetails(false);
  }

  async function confirmOrder() {
    if (inFlight.current || submitting) return;
    if (!confirmedDetails) {
      setError("Please confirm all details before placing your order.");
      return;
    }

    if (!hasEnoughWallet) {
      setError("Insufficient balance");
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    inFlight.current = true;
    setSubmitting(true);
    setError("");

    if (!requestId.current) {
      requestId.current = crypto.randomUUID();
    }

    const payload = {
      serviceCode,
      serviceId: 0,
      quantity,
      link: targetLink.trim(),
      requestId: requestId.current,
      notes: notes.trim() || null,
      fallbackPrice: selectedService.pricePer1000,
      fallbackName: selectedService.name,
      fallbackPlatform: selectedService.platform,
      fallbackMin: selectedService.minQuantity,
      fallbackMax: selectedService.maxQuantity,
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as { data?: ApiOrderData; error?: string };

      if (!response.ok || !result.data) {
        setError(result.error || "Unable to place order right now.");
        setSubmitting(false);
        inFlight.current = false;
        return;
      }

      setWalletBalance(Number(result.data.balance));
      window.dispatchEvent(new CustomEvent("wallet-balance-updated", { detail: Number(result.data.balance) }));
      setSuccessOrder(result.data);
      setConfirmOpen(false);
      setSubmitting(false);
      inFlight.current = false;
      requestId.current = "";
    } catch {
      setError("Unable to place order right now.");
      setSubmitting(false);
      inFlight.current = false;
    }
  }

  return (
    <main className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-[radial-gradient(circle_at_0%_0%,#dbe8ff_0%,transparent_34%),radial-gradient(circle_at_100%_0%,#e5f8ff_0%,transparent_36%),radial-gradient(circle_at_50%_100%,#ffe9e2_0%,transparent_30%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_100%)] p-4 sm:p-6 lg:p-8">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          aria-hidden
          animate={{ y: [0, -12, 0], x: [0, 8, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-20 top-8 h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl"
        />
        <motion.div
          aria-hidden
          animate={{ y: [0, 14, 0], x: [0, -10, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[-5rem] top-14 h-80 w-80 rounded-full bg-violet-200/35 blur-3xl"
        />
        <motion.div
          aria-hidden
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-6 left-1/3 h-64 w-64 rounded-full bg-orange-100/45 blur-3xl"
        />
      </div>

      <div className="relative mx-auto max-w-[1550px]">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative rounded-[2rem] border border-white/60 bg-white/55 p-4 shadow-[0_28px_70px_-36px_rgba(15,23,42,.5)] backdrop-blur-xl sm:p-5"
        >
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="inline-flex rounded-full border border-blue-100 bg-white/95 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-blue-700 shadow-sm">
              New Order
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-[-0.03em] text-[#0f2b61]">Professional SMM Order Workspace</h1>
            <p className="mt-2 text-sm text-[#5a6f99]">Premium campaign console with real-time pricing, validation, and wallet-safe checkout.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <motion.div whileHover={{ y: -2 }} className="rounded-xl border border-white/80 bg-white/85 px-4 py-3 text-xs font-semibold text-[#36548f] shadow-[0_10px_22px_-16px_rgba(30,58,138,.6)]">
              <Wallet className="mr-2 inline h-4 w-4" />
              Wallet: {walletBalance === null ? "Not loaded" : money(walletBalance)}
            </motion.div>
            <motion.div whileHover={{ y: -2 }} className="rounded-xl border border-white/80 bg-white/85 px-4 py-3 text-xs font-semibold text-[#36548f] shadow-[0_10px_22px_-16px_rgba(168,85,247,.5)]">
              <Layers3 className="mr-2 inline h-4 w-4" /> New Campaign
            </motion.div>
            <motion.div whileHover={{ y: -2 }} className="rounded-xl border border-white/80 bg-white/85 px-4 py-3 text-xs font-semibold text-[#36548f] shadow-[0_10px_22px_-16px_rgba(6,182,212,.6)]">
              <User className="mr-2 inline h-4 w-4" /> {loadingProfile ? "Loading..." : profileChip}
            </motion.div>
          </div>
        </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.45 }}
            className="pointer-events-none absolute -right-3 -top-5 hidden w-56 rotate-2 rounded-2xl border border-white/70 bg-gradient-to-br from-white/80 via-cyan-50/90 to-violet-50/90 p-4 shadow-[0_22px_44px_-24px_rgba(30,58,138,.55)] backdrop-blur-md xl:block"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#4c63a0]">Live Metrics</span>
              <Gem className="h-4 w-4 text-violet-500" />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <span className="rounded-lg bg-white/70 px-2 py-1 text-center text-[10px] font-bold text-[#3d5893]">95%</span>
              <span className="rounded-lg bg-white/70 px-2 py-1 text-center text-[10px] font-bold text-[#3d5893]">24h</span>
              <span className="rounded-lg bg-white/70 px-2 py-1 text-center text-[10px] font-bold text-[#3d5893]">SLA</span>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-slate-200/70">
              <div className="h-1.5 w-3/4 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500" />
            </div>
            <BarChart3 className="mt-3 h-4 w-4 text-sky-500" />
          </motion.div>
        </motion.div>

        <div className="relative mt-6 grid gap-5 xl:grid-cols-[1fr_360px]">
          <div className="pointer-events-none absolute left-3 top-6 hidden h-[92%] w-[2px] rounded-full bg-gradient-to-b from-cyan-300/20 via-violet-300/35 to-orange-200/25 xl:block" />
          <section className="space-y-5">
            <motion.article
              {...sectionMotion}
              whileHover={{ y: -4, scale: 1.002 }}
              className="group rounded-3xl border border-white/80 bg-white/70 p-5 shadow-[0_24px_56px_-30px_rgba(15,23,42,.55)] backdrop-blur-xl transition sm:p-6"
            >
              <div className="mb-4 flex items-center gap-2 text-[#214184]">
                <Sparkles className="h-4 w-4" />
                <p className="text-xs font-black uppercase tracking-[0.14em]">Campaign Setup</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-xs font-bold text-[#35548d]">
                  Platform
                  <select
                    value={platform}
                    onChange={(event) => switchPlatform(event.target.value as PlatformId)}
                    className="mt-2 w-full rounded-2xl border border-[#d4e1ff] bg-white/95 px-4 py-3.5 text-sm font-semibold text-[#1c3a71] outline-none ring-0 transition focus:border-[#8faeff] focus:shadow-[0_0_0_4px_rgba(143,174,255,.22)]"
                  >
                    {platformOrder.map((platformId) => (
                      <option key={platformId} value={platformId}>
                        {platformMeta[platformId].label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-xs font-bold text-[#35548d]">
                  Service
                  <select
                    value={serviceCode}
                    onChange={(event) => switchService(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-[#d4e1ff] bg-white/95 px-4 py-3.5 text-sm font-semibold text-[#1c3a71] outline-none ring-0 transition focus:border-[#8faeff] focus:shadow-[0_0_0_4px_rgba(143,174,255,.22)]"
                  >
                    {!servicesForPlatform.length && <option value="">No active services</option>}
                    {servicesForPlatform.map((service) => (
                      <option key={service.code} value={service.code}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </motion.article>

            <motion.article
              {...sectionMotion}
              whileHover={{ y: -4, scale: 1.002 }}
              className="rounded-3xl border border-white/80 bg-white/70 p-5 shadow-[0_24px_56px_-30px_rgba(15,23,42,.55)] backdrop-blur-xl sm:p-6"
            >
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#36558f]">Service Details</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <motion.div whileHover={{ y: -3 }} className="rounded-2xl border border-[#dce7ff] bg-[#f8fbff]/95 p-3 shadow-[0_10px_24px_-18px_rgba(30,58,138,.45)]">
                  <p className="text-[10px] uppercase text-[#6d83b2]">Price per 1000</p>
                  <p className="mt-1 text-sm font-black text-[#1f3f77]">{money(selectedService.pricePer1000)}</p>
                </motion.div>
                <motion.div whileHover={{ y: -3 }} className="rounded-2xl border border-[#dce7ff] bg-[#f8fbff]/95 p-3 shadow-[0_10px_24px_-18px_rgba(30,58,138,.45)]">
                  <p className="text-[10px] uppercase text-[#6d83b2]">Quantity Range</p>
                  <p className="mt-1 text-sm font-black text-[#1f3f77]">{selectedService.minQuantity.toLocaleString("en-IN")} - {selectedService.maxQuantity.toLocaleString("en-IN")}</p>
                </motion.div>
                <motion.div whileHover={{ y: -3 }} className="rounded-2xl border border-[#dce7ff] bg-[#f8fbff]/95 p-3 shadow-[0_10px_24px_-18px_rgba(30,58,138,.45)]">
                  <p className="text-[10px] uppercase text-[#6d83b2]">Delivery Time</p>
                  <p className="mt-1 text-sm font-black text-[#1f3f77]">{selectedService.deliveryTime}</p>
                </motion.div>
                <motion.div whileHover={{ y: -3 }} className="rounded-2xl border border-[#dce7ff] bg-[#f8fbff]/95 p-3 shadow-[0_10px_24px_-18px_rgba(30,58,138,.45)]">
                  <p className="text-[10px] uppercase text-[#6d83b2]">Refill Policy</p>
                  <p className="mt-1 text-sm font-black text-[#1f3f77]">{selectedService.refillPolicy}</p>
                </motion.div>
                <motion.div whileHover={{ y: -3 }} className="rounded-2xl border border-[#dce7ff] bg-[#f8fbff]/95 p-3 shadow-[0_10px_24px_-18px_rgba(30,58,138,.45)]">
                  <p className="text-[10px] uppercase text-[#6d83b2]">Quality Type</p>
                  <p className="mt-1 text-sm font-black text-[#1f3f77]">{selectedService.qualityType}</p>
                </motion.div>
                <motion.div whileHover={{ y: -3 }} className="rounded-2xl border border-[#dce7ff] bg-[#f8fbff]/95 p-3 shadow-[0_10px_24px_-18px_rgba(30,58,138,.45)] sm:col-span-2 lg:col-span-1">
                  <p className="text-[10px] uppercase text-[#6d83b2]">Important Instruction</p>
                  <p className="mt-1 text-xs font-semibold text-[#36558f]">{selectedService.importantInstruction}</p>
                </motion.div>
              </div>
            </motion.article>

            <motion.article
              {...sectionMotion}
              whileHover={{ y: -4, scale: 1.002 }}
              className="rounded-3xl border border-white/80 bg-white/70 p-5 shadow-[0_24px_56px_-30px_rgba(15,23,42,.55)] backdrop-blur-xl sm:p-6"
            >
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#36558f]">Order Inputs</p>

              <div className="mt-4 grid gap-4">
                <label className="text-xs font-bold text-[#35548d]">
                  Link / Username
                  <div className="relative mt-2">
                    <span className="pointer-events-none absolute left-3 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg bg-[#eef4ff] text-[#34589b]">
                      <LinkIcon className="h-4 w-4" />
                    </span>
                    <input
                      value={targetLink}
                      onChange={(event) => setTargetLink(event.target.value)}
                      placeholder="https://example.com/profile-or-post"
                      className="w-full rounded-2xl border border-[#d4e1ff] bg-white/95 px-12 py-3.5 text-sm text-[#1c3a71] outline-none transition focus:border-[#8faeff] focus:shadow-[0_0_0_4px_rgba(143,174,255,.22)]"
                    />
                  </div>
                </label>

                <label className="text-xs font-bold text-[#35548d]">
                  Quantity
                  <div className="relative mt-2">
                    <span className="pointer-events-none absolute left-3 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg bg-[#eef4ff] text-[#34589b]">
                      <Hash className="h-4 w-4" />
                    </span>
                    <input
                      type="number"
                      min={selectedService.minQuantity}
                      max={selectedService.maxQuantity}
                      value={Number.isFinite(quantity) ? quantity : ""}
                      onChange={(event) => setQuantity(Number(event.target.value || 0))}
                      className="w-full rounded-2xl border border-[#d4e1ff] bg-white/95 px-12 py-3.5 text-sm text-[#1c3a71] outline-none transition focus:border-[#8faeff] focus:shadow-[0_0_0_4px_rgba(143,174,255,.22)]"
                    />
                  </div>
                  <p className="mt-2 text-[11px] font-semibold text-[#5f76a8]">Allowed range: 100 to 1,000,000</p>
                </label>

                <label className="text-xs font-bold text-[#35548d]">
                  Optional Notes
                  <div className="relative mt-2">
                    <span className="pointer-events-none absolute left-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#eef4ff] text-[#34589b]">
                      <StickyNote className="h-4 w-4" />
                    </span>
                    <textarea
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      placeholder="Any specific instruction for this order"
                      className="min-h-28 w-full resize-none rounded-2xl border border-[#d4e1ff] bg-white/95 px-12 py-3.5 text-sm text-[#1c3a71] outline-none transition focus:border-[#8faeff] focus:shadow-[0_0_0_4px_rgba(143,174,255,.22)]"
                    />
                  </div>
                </label>
              </div>
            </motion.article>

            <motion.article
              {...sectionMotion}
              whileHover={{ y: -4, scale: 1.002 }}
              className="rounded-3xl border border-white/80 bg-white/70 p-5 shadow-[0_24px_56px_-30px_rgba(15,23,42,.55)] backdrop-blur-xl sm:p-6"
            >
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#36558f]">Balance / Payment</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#dce7ff] bg-[#f8fbff]/95 p-4 shadow-[0_10px_24px_-18px_rgba(30,58,138,.45)]">
                  <p className="text-[10px] uppercase text-[#6d83b2]">Wallet Balance</p>
                  <p className="mt-1 text-lg font-black text-[#1f3f77]">{walletBalance === null ? "Not loaded" : money(walletBalance)}</p>
                  <button
                    type="button"
                    onClick={loadWalletBalance}
                    className="mt-2 text-xs font-bold text-blue-700 underline"
                  >
                    {loadingBalance ? "Checking..." : "Refresh balance"}
                  </button>
                </div>
                <div className="rounded-2xl border border-[#dce7ff] bg-[#f8fbff]/95 p-4 shadow-[0_10px_24px_-18px_rgba(30,58,138,.45)]">
                  <p className="text-[10px] uppercase text-[#6d83b2]">Payment Method</p>
                  <p className="mt-1 text-sm font-black text-[#1f3f77]">Wallet Balance</p>
                  {!hasEnoughWallet && walletBalance !== null ? (
                    <p className="mt-2 text-xs font-semibold text-rose-600">Insufficient balance. Add funds to continue.</p>
                  ) : (
                    <p className="mt-2 text-xs font-semibold text-emerald-600">Balance looks good for this order.</p>
                  )}
                </div>
              </div>
            </motion.article>

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</div>
            )}

            {successOrder && (
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-6"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                  <div>
                    <h2 className="text-xl font-black text-emerald-700">Order Placed Successfully</h2>
                    <p className="mt-1 text-sm font-semibold text-emerald-700">Order ID: {buildReadableOrderId(successOrder.id)}</p>
                    <p className="mt-2 text-sm text-emerald-800">Service: {selectedService.name}</p>
                    <p className="text-sm text-emerald-800">Quantity: {quantity.toLocaleString("en-IN")}</p>
                    <p className="text-sm text-emerald-800">Status: Pending</p>
                    <Link href="/dashboard/order-history" className="mt-4 inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white">
                      View Order History
                    </Link>
                  </div>
                </div>
              </motion.section>
            )}

            <motion.div {...sectionMotion} className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={openConfirmation}
                className="inline-flex min-h-12 items-center rounded-xl bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] px-6 py-3 text-sm font-black text-white shadow-[0_18px_36px_-14px_rgba(117,109,255,.55)] transition hover:-translate-y-1 hover:shadow-[0_20px_38px_-12px_rgba(117,109,255,.65)]"
              >
                Review Order
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex min-h-12 items-center rounded-xl border border-[#d6e3ff] bg-white/95 px-6 py-3 text-sm font-bold text-[#1e3d77] shadow-[0_12px_28px_-18px_rgba(30,58,138,.6)] transition hover:-translate-y-0.5 hover:border-[#b8cbff]"
              >
                Reset Form
              </button>
              {!hasEnoughWallet && walletBalance !== null && (
                <button
                  type="button"
                  onClick={() => router.push("/dashboard/add-funds")}
                  className="inline-flex min-h-12 items-center rounded-xl border border-[#d6e3ff] bg-white/95 px-6 py-3 text-sm font-bold text-[#1e3d77] shadow-[0_12px_28px_-18px_rgba(30,58,138,.6)] transition hover:-translate-y-0.5 hover:border-[#b8cbff]"
                >
                  Add Funds
                </button>
              )}
            </motion.div>
          </section>

          <motion.aside
            {...sectionMotion}
            whileHover={{ y: -3 }}
            className="h-fit rounded-3xl border border-transparent bg-[linear-gradient(white,white)_padding-box,linear-gradient(135deg,rgba(56,189,248,.35),rgba(168,85,247,.35),rgba(251,146,60,.35))_border-box] p-5 shadow-[0_26px_62px_-28px_rgba(15,23,42,.55)] xl:sticky xl:top-20"
          >
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#36558f]">Sticky Order Summary</p>
            <h2 className="mt-2 text-lg font-black text-[#15356f]">Current Configuration</h2>

            <div className="mt-4 space-y-2 text-sm text-[#3c5b90]">
              <p><b>Platform:</b> {platformMeta[selectedService.platform].label}</p>
              <p><b>Service:</b> {selectedService.name}</p>
              <p><b>Price / 1000:</b> {money(selectedService.pricePer1000)}</p>
              <p><b>Quantity:</b> {quantity.toLocaleString("en-IN")}</p>
              <p><b>Total:</b> {money(totalPrice)}</p>
              <p><b>Delivery:</b> {selectedService.deliveryTime}</p>
              <p><b>Refill:</b> {selectedService.refillPolicy}</p>
              <p><b>Wallet:</b> {walletBalance === null ? "Not loaded" : money(walletBalance)}</p>
            </div>

            <div className="mt-4 rounded-2xl border border-[#dce7ff] bg-[#f8fbff]/95 p-4 text-xs text-[#5470a3] shadow-[0_12px_24px_-16px_rgba(30,58,138,.45)]">
              <div className="mb-2 flex items-center gap-2 text-[#4f6ea6]">
                <ShieldCheck className="h-3.5 w-3.5" />
                <Clock3 className="h-3.5 w-3.5" />
              </div>
              Total Price Formula: quantity / 1000 * service price
            </div>
          </motion.aside>
        </div>
      </div>

      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="w-full max-w-2xl rounded-3xl border border-white/80 bg-white/95 p-6 shadow-[0_36px_80px_-30px_rgba(15,23,42,.72)] backdrop-blur-md"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-[#17366f]">Confirm Your Order</h2>
                <button type="button" onClick={() => setConfirmOpen(false)} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-black transition hover:bg-slate-200">
                  Close
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <p className="rounded-xl bg-slate-50 p-3 text-xs"><b>Service:</b> {selectedService.name}</p>
                <p className="rounded-xl bg-slate-50 p-3 text-xs"><b>Platform:</b> {platformMeta[selectedService.platform].label}</p>
                <p className="rounded-xl bg-slate-50 p-3 text-xs"><b>Link / Username:</b> {targetLink}</p>
                <p className="rounded-xl bg-slate-50 p-3 text-xs"><b>Quantity:</b> {quantity.toLocaleString("en-IN")}</p>
                <p className="rounded-xl bg-slate-50 p-3 text-xs"><b>Total:</b> {money(totalPrice)}</p>
                <p className="rounded-xl bg-slate-50 p-3 text-xs"><b>Delivery:</b> {selectedService.deliveryTime}</p>
                <p className="rounded-xl bg-slate-50 p-3 text-xs"><b>Refill:</b> {selectedService.refillPolicy}</p>
                <p className="rounded-xl bg-slate-50 p-3 text-xs"><b>Wallet:</b> {walletBalance === null ? "Not loaded" : money(walletBalance)}</p>
              </div>

              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-700">
                Please check your link carefully. Wrong link orders cannot be cancelled.
              </div>

              <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#2f4e84]">
                <input type="checkbox" checked={confirmedDetails} onChange={(event) => setConfirmedDetails(event.target.checked)} />
                I confirm all details are correct.
              </label>

              {!hasEnoughWallet && walletBalance !== null && (
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
                  Insufficient balance
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmOpen(false)}
                  className="inline-flex min-h-11 items-center rounded-xl border border-[#d6e3ff] bg-white px-5 py-2 text-sm font-bold text-[#1e3d77] transition hover:-translate-y-0.5"
                >
                  Back / Edit
                </button>

                {hasEnoughWallet ? (
                  <button
                    type="button"
                    disabled={!confirmedDetails || submitting}
                    onClick={confirmOrder}
                    className="inline-flex min-h-11 items-center rounded-xl bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] px-5 py-2 text-sm font-black text-white shadow-[0_16px_30px_-14px_rgba(117,109,255,.6)] transition hover:-translate-y-0.5 disabled:opacity-60"
                  >
                    {submitting ? "Placing Order..." : "Confirm Order"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard/add-funds")}
                    className="inline-flex min-h-11 items-center rounded-xl bg-blue-600 px-5 py-2 text-sm font-black text-white shadow-[0_16px_30px_-14px_rgba(37,99,235,.6)] transition hover:-translate-y-0.5"
                  >
                    Add Funds
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
