"use client";

import Link from "next/link";
import { useEffect } from "react";

const WHATSAPP_URL = "https://wa.me/918860330771?text=Hi%20SocialRUSH%2C%20I%20need%20help%20with%20a%20payment.";

function hideLegacyAddFundsPanel() {
  const headings = Array.from(document.querySelectorAll<HTMLElement>("h1,h2,h3,p"));
  const marker = headings.find((node) => (node.textContent || "").trim().toLowerCase() === "three simple steps");
  if (!marker) return;

  let container: HTMLElement | null = marker.parentElement;
  while (container && container !== document.body) {
    const text = (container.textContent || "").replace(/\s+/g, " ").toLowerCase();
    if (text.includes("select payment method") && text.includes("checkout provider") && text.includes("enter amount")) {
      container.style.display = "none";
      container.dataset.legacyWalletTopupHidden = "true";
      return;
    }
    container = container.parentElement;
  }
}

export default function WalletPaymentUpgradeNotice() {
  useEffect(() => {
    hideLegacyAddFundsPanel();
    const observer = new MutationObserver(() => hideLegacyAddFundsPanel());
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return (
    <section className="mx-auto mb-6 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-3xl border border-orange-400/25 bg-[#101319] shadow-[0_24px_70px_-45px_rgba(255,122,0,.65)]">
        <div className="border-b border-white/10 px-5 py-5 sm:px-7">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400">Payments</p>
          <h2 className="mt-2 text-2xl font-black text-white">Pay directly when you place an order</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Cashfree wallet top-ups are no longer used. Your existing wallet balance is still available, while new orders can be paid directly through UPI at checkout.
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-7">
          <div className="rounded-2xl border border-orange-400/25 bg-orange-500/10 p-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 text-lg font-black text-black">1</div>
            <h3 className="mt-4 font-black text-white">Create your order</h3>
            <p className="mt-1 text-sm leading-5 text-zinc-400">Choose the platform, service, quantity and public link.</p>
          </div>
          <div className="rounded-2xl border border-orange-400/25 bg-orange-500/10 p-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 text-lg font-black text-black">2</div>
            <h3 className="mt-4 font-black text-white">Pay securely with UPI</h3>
            <p className="mt-1 text-sm leading-5 text-zinc-400">The exact order amount is prepared for your UPI payment.</p>
          </div>
          <div className="rounded-2xl border border-orange-400/25 bg-orange-500/10 p-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 text-lg font-black text-black">3</div>
            <h3 className="mt-4 font-black text-white">Confirm your order</h3>
            <p className="mt-1 text-sm leading-5 text-zinc-400">Submit your UTR and we verify the received payment before processing.</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div>
            <p className="text-sm font-bold text-white">Wallet top-ups are temporarily paused.</p>
            <p className="mt-1 text-xs text-zinc-500">Your current wallet balance can still be used where available.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href="/dashboard/new-order" className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-3 text-center text-sm font-black text-black">
              Place New Order
            </Link>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-white/10 px-5 py-3 text-center text-sm font-bold text-zinc-200">
              Payment Help
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
