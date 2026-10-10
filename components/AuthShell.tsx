import Link from "next/link";
import Logo from "@/components/Logo";
import styles from "./AuthShell.module.css";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerText: string;
  footerLink: string;
  footerLabel: string;
  image?: string;
  imageAlt?: string;
}

export default function AuthShell({
  title,
  subtitle,
  children,
  footerText,
  footerLink,
  footerLabel,
}: AuthShellProps) {
  return (
    <main className={`auth-shell sr-page ${styles.shell}`}>
      <div className={styles.layout}>
        <div className={styles.formColumn}>
          <div className={styles.top}>
            <Logo light priority />
            <Link href="/" className={styles.back} aria-label="Back to Home"><svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M19 12H5M12 5l-7 7 7 7" /></svg><span>Back to Home</span></Link>
          </div>
          <div className={styles.form}>
            <p className={styles.eyebrow}>Your SocialRUSH account</p>
            <h1>{title}</h1>
            <p className={styles.subtitle}>{subtitle}</p>
            {children}
            <p className={styles.footer}>{footerText}{" "}<Link href={footerLink}>{footerLabel}</Link></p>
          </div>
        </div>
        <aside className={styles.visual} aria-label="SocialRUSH account features">
          <p>ONE ACCOUNT. A CLEARER WORKSPACE.</p>
          <h2>Your next campaign<br />starts here.</h2>
          <span>Keep your services, wallet and order updates together. Review the details before you commit.</span>
          <ol>{["Compare services and current pricing", "Review your quantity and order total", "Follow updates from your dashboard"].map((label, index) => <li key={label}><span>0{index + 1}</span><strong>{label}</strong></li>)}</ol>
          <p className={styles.footnote}>Public-link orders never require your social account password, OTP or recovery code. Keep those details private.</p>
        </aside>
      </div>
    </main>
  );
}
