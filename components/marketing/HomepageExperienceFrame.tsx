"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll } from "framer-motion";
import { ArrowRight, Compass, LayoutDashboard, Search, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./HomepageExperienceFrame.module.css";
import mobileStyles from "./HomepageMobilePolish.module.css";

const quickLinks = [
  { href: "#services", label: "Popular services", icon: Search },
  { href: "#order-demo", label: "Build a campaign", icon: Sparkles },
  { href: "#how-it-works", label: "How it works", icon: Compass },
] as const;

export default function HomepageExperienceFrame({ children }: { children: ReactNode }) {
  const { scrollYProgress } = useScroll();
  const reduceMotion = useReducedMotion();

  const jumpTo = (href: string) => {
    const target = document.querySelector(href);
    if (!target) return;
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  };

  return (
    <div className={`${styles.experience} ${mobileStyles.mobilePolish}`}>
      <div className={`${styles.navigator} ${mobileStyles.mobileNavigator}`} aria-label="Homepage quick navigation">
        <motion.div
          aria-hidden="true"
          className={styles.progress}
          style={{ scaleX: scrollYProgress }}
        />
        <div className={styles.navigatorInner}>
          <div className={styles.navigatorLabel}>
            <span className={styles.navigatorIcon}><Sparkles aria-hidden="true" /></span>
            <span>
              <strong>Explore SocialRUSH</strong>
              <small>Find the right path faster</small>
            </span>
          </div>

          <nav className={styles.quickLinks} aria-label="Jump to homepage section">
            {quickLinks.map(({ href, label, icon: Icon }) => (
              <button key={href} type="button" onClick={() => jumpTo(href)} className={styles.quickLink}>
                <Icon aria-hidden="true" />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <div className={styles.navigatorActions}>
            <Link href="/dashboard" className={styles.dashboardLink}>
              <LayoutDashboard aria-hidden="true" />
              <span>Dashboard</span>
            </Link>
            <button type="button" onClick={() => jumpTo("#order-demo")} className={styles.primaryAction}>
              Start campaign
              <ArrowRight aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}
