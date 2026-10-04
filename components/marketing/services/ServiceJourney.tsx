import Link from "next/link";
import { ArrowRight, Link2, ListChecks, PackageCheck } from "lucide-react";
import styles from "./ServiceExperience.module.css";

export default function ServiceJourney() {
  return <section className={styles.journey} aria-label="Your ordering journey">
    <div className={styles.journeyHeading}><div><p className={styles.eyebrow}>Your next step</p><h2>Order with the details in view.</h2><p>Choose a quantity that fits your needs. Review the current service terms before payment.</p></div><Link href="#main-content" className={styles.primary}>Review service options <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
    <ol>{[
      { icon: ListChecks, title: "Choose your quantity", copy: "Compare the rate, quantity limits and calculated total." },
      { icon: Link2, title: "Add the required link", copy: "Use the public destination requested by your service. Never share a social-media password." },
      { icon: PackageCheck, title: "Review, then track", copy: "Continue through your account to review the order. Follow its status from your dashboard." },
    ].map(({ icon: Icon, title, copy }, index) => <li key={title}><span><Icon className="h-5 w-5" aria-hidden="true" />0{index + 1}</span><h3>{title}</h3><p>{copy}</p></li>)}</ol>
    <p className={styles.journeySupport}>Questions about the right service? <Link href="/contact">Contact SocialRUSH support</Link></p>
  </section>;
}
