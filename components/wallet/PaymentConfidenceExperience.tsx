import Link from "next/link";
import styles from "./PaymentConfidenceExperience.module.css";

type Mode = "wallet" | "add-funds";

const flow = [
  { title: "Choose amount", detail: "Use the current Wallet / Add Funds flow and review the amount before paying." },
  { title: "Complete payment", detail: "Follow the payment route shown on screen. Do not repeat a payment while verification is pending." },
  { title: "Verification", detail: "SocialRUSH verifies the payment reference before any wallet credit is applied." },
  { title: "Wallet updated", detail: "Once verified, the updated balance is available for campaign orders." },
] as const;

export default function PaymentConfidenceExperience({ mode }: { mode: Mode }) {
  const isFunding = mode === "add-funds";
  return (
    <section className={styles.shell} aria-label="Payment confidence">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <span className={styles.eyebrow}>{isFunding ? "Secure funding flow" : "Wallet confidence"}</span>
          <h2>{isFunding ? "Know what happens after you pay" : "Your money trail, made clear"}</h2>
          <p>
            {isFunding
              ? "Your wallet is credited only after the payment is verified. If a payment is still pending, avoid paying the same amount again."
              : "Review your balance and transaction history here, then use Add Funds when you need more credit for a campaign."}
          </p>
        </div>
        <div className={styles.actions}>
          <Link href="/dashboard/wallet" className={styles.secondary}>Wallet & transactions</Link>
          <Link href="/dashboard/add-funds" className={styles.primary}>Add funds</Link>
          <Link href="/dashboard/support?category=payment_or_wallet" className={styles.support}>Payment help</Link>
        </div>
      </div>
      <ol className={styles.flow}>
        {flow.map((item, index) => (
          <li key={item.title} className={styles.step}>
            <span className={styles.number}>{index + 1}</span>
            <span className={styles.stepCopy}>
              <strong>{item.title}</strong>
              <small>{item.detail}</small>
            </span>
          </li>
        ))}
      </ol>
      <p className={styles.note}>
        Wallet balance changes only after confirmed payment processing. A submitted payment reference by itself does not guarantee an immediate credit.
      </p>
    </section>
  );
}
