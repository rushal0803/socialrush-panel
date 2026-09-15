import Link from "next/link";
import { ArrowRight, CheckCircle2, RefreshCw, RotateCcw, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./OrderTrackingExperience.module.css";

export default function OrderTrackingExperience({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className={styles.shell}>
      <section className={styles.commandBar} aria-label="Order tracking command center">
        <div className={styles.intro}>
          <span className={styles.eyebrow}><ShieldCheck className="h-3.5 w-3.5" /> Order command center</span>
          <div>
            <h2>Track delivery. Repeat what works.</h2>
            <p>Completed campaigns can be reopened with the service, quantity and public link prefilled. The current live rate is shown again before checkout.</p>
          </div>
        </div>

        <div className={styles.signals} aria-label="Order tools">
          <span><RefreshCw className="h-4 w-4" /><b>Live progress</b><small>Delivery updates stay visible</small></span>
          <span><CheckCircle2 className="h-4 w-4" /><b>Refill status</b><small>Eligibility stays with the order</small></span>
          <span><RotateCcw className="h-4 w-4" /><b>Repeat campaign</b><small>Prefill first, review before paying</small></span>
        </div>

        <nav className={styles.actions} aria-label="Order shortcuts">
          <Link href="/dashboard/orders" className={styles.secondary}>All orders</Link>
          <Link href="/dashboard/new-order" className={styles.primary}>Start campaign <ArrowRight className="h-4 w-4" /></Link>
        </nav>
      </section>
      {children}
    </div>
  );
}
