import Link from "next/link";
import { ArrowRight, Check, LayoutDashboard, ListOrdered, Wallet } from "lucide-react";
import PlatformIcon from "@/components/PlatformIcon";
import TrackedLink from "@/components/analytics/TrackedLink";
import { platformMeta, type SmmPlatformId } from "@/lib/smm-service-catalog";
import styles from "./PremiumDesign.module.css";

const platforms: SmmPlatformId[] = ["instagram", "youtube", "linkedin", "facebook", "tiktok", "telegram", "x"];

export default function PremiumHomeHero() {
  return <>
    <section className={styles.hero} aria-labelledby="home-heading">
      <div className={styles.heroInner}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}><span /> Social media growth platform</p>
          <h1 id="home-heading">Social media growth,{" "}<br /><em>made simple.</em></h1>
          <p className={styles.intro}>Discover social media growth and engagement services across leading platforms, review transparent pricing, and manage every order from one professional workspace.</p>
          <div className={styles.actions}>
            <TrackedLink href="#order-demo" event="homepage_conversion_path_click" metadata={{ surface: "homepage_hero", step: "order" }} className={styles.primary}>Check Price &amp; Start <ArrowRight size={18} aria-hidden="true" /></TrackedLink>
            <TrackedLink href="#services" event="homepage_conversion_path_click" metadata={{ surface: "homepage_hero", step: "compare" }} className={styles.secondary}>Browse Services <ArrowRight size={18} aria-hidden="true" /></TrackedLink>
          </div>
          <ul className={styles.assurances}>{["Public link only", "No password required", "Price shown first", "Track in dashboard"].map(label => <li key={label}><Check size={15} aria-hidden="true" />{label}</li>)}</ul>
          <div className={styles.guide}><span>Not sure where to start?</span><TrackedLink href="/tools/social-media-growth-audit" event="homepage_conversion_path_click" metadata={{ surface: "homepage_hero", step: "growth_check" }}>Get a Free Growth Check <ArrowRight size={14} aria-hidden="true" /></TrackedLink><TrackedLink href="#how-it-works" event="homepage_conversion_path_click" metadata={{ surface: "homepage_hero", step: "how_it_works" }}>See how ordering works</TrackedLink></div>
        </div>
        <WorkspacePreview />
      </div>
    </section>
    <nav className={styles.platformStrip} aria-label="Explore services by platform">
      <span>YOUR PLATFORM.<br /><strong>YOUR NEXT MOVE.</strong></span>
      <div>{platforms.map(platform => <Link key={platform} href={`/services?platform=${platform}`}><PlatformIcon platform={platform} className="h-5 w-5" /><span>{platformMeta[platform].label}</span></Link>)}</div>
    </nav>
  </>;
}

export function WorkspacePreview() {
  return <aside className={styles.preview} aria-label="SocialRUSH workspace preview with illustrative sample data">
    <div className={styles.previewTop}><span>Social<span>RUSH</span> <small>/ workspace</small></span><span className={styles.sample}>Interface preview · sample data</span></div>
    <div className={styles.previewBody}>
      <div className={styles.previewNav} aria-hidden="true"><LayoutDashboard size={18} /><ListOrdered size={18} /><Wallet size={18} /><span>SR</span></div>
      <div className={styles.previewContent}>
        <div className={styles.previewTitle}><div><p>YOUR WORKSPACE</p><h2>A clearer view.<br />From order to update.</h2></div><span className={styles.workspaceMark} aria-hidden="true">↗</span></div>
        <div className={styles.previewTiles}><div><Wallet size={17} aria-hidden="true" /><span>Wallet balance</span><strong>Visible at checkout</strong></div><div><ListOrdered size={17} aria-hidden="true" /><span>Order tracking</span><strong>Updates in one place</strong></div></div>
        <div className={styles.orderList}><div className={styles.listHeading}><strong>Order activity</strong><span>Sample view</span></div>{([
          ["instagram", "Instagram Followers", "Processing"],
          ["youtube", "YouTube Views", "Completed"],
          ["linkedin", "LinkedIn Followers", "Pending"],
        ] as const).map(([platform, name, status]) => <div key={platform} className={styles.orderRow}><span className={styles.rowIcon} data-platform={platform}><PlatformIcon platform={platform} className="h-4 w-4" /></span><div><strong>{name}</strong><small>Public-link order</small></div><span className={styles.status} data-status={status}>{status}</span></div>)}</div>
        <Link href="/dashboard" className={styles.previewLink}>Explore your dashboard <ArrowRight size={16} aria-hidden="true" /></Link>
      </div>
    </div>
    <div className={styles.previewNote}><Check size={14} aria-hidden="true" /> Review service terms, quantity and total before confirming.</div>
  </aside>;
}
