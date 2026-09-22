"use client";

import type { ReactNode } from "react";
import {
  LazyMotion,
  domAnimation,
  m,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const interactiveCardSelector =
  ".service-card, .trust-card, .growth-engine-node, .demo-card, .dashboard-preview";

const revealSelector =
  ".service-card, .trust-card, .growth-engine-node, .demo-card, .dashboard-preview, .final-cta";

export default function InteractiveHomepageShell({
  children,
}: {
  children: ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    mass: 0.28,
  });
  const pointerX = useMotionValue(50);
  const pointerY = useMotionValue(22);
  const glowBackground = useMotionTemplate`radial-gradient(30rem circle at ${pointerX}% ${pointerY}%, rgba(255, 126, 32, 0.10), transparent 70%)`;
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const updateScrollState = () => setShowTop(window.scrollY > 720);
    const updatePointer = (event: PointerEvent) => {
      if (reduceMotion || event.pointerType === "touch") return;
      pointerX.set((event.clientX / window.innerWidth) * 100);
      pointerY.set((event.clientY / window.innerHeight) * 100);
    };
    const tiltCard = (event: PointerEvent) => {
      if (reduceMotion || event.pointerType === "touch") return;
      const card = (event.target as Element).closest(
        interactiveCardSelector,
      ) as HTMLElement | null;
      if (!card || !root?.contains(card)) return;

      const bounds = card.getBoundingClientRect();
      const relativeX = (event.clientX - bounds.left) / bounds.width;
      const relativeY = (event.clientY - bounds.top) / bounds.height;
      card.style.setProperty("--sr-tilt-x", `${(0.5 - relativeY) * 5}deg`);
      card.style.setProperty("--sr-tilt-y", `${(relativeX - 0.5) * 6}deg`);
      card.style.setProperty("--sr-glow-x", `${relativeX * 100}%`);
      card.style.setProperty("--sr-glow-y", `${relativeY * 100}%`);
      card.dataset.srTiltActive = "true";
    };
    const resetCard = (event: PointerEvent) => {
      const card = (event.target as Element).closest(
        interactiveCardSelector,
      ) as HTMLElement | null;
      if (!card) return;
      const nextTarget = event.relatedTarget;
      if (nextTarget instanceof Node && card.contains(nextTarget)) return;

      card.style.removeProperty("--sr-tilt-x");
      card.style.removeProperty("--sr-tilt-y");
      delete card.dataset.srTiltActive;
    };

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("pointermove", updatePointer, { passive: true });
    root?.addEventListener("pointermove", tiltCard, { passive: true });
    root?.addEventListener("pointerout", resetCard, { passive: true });

    const revealItems = root
      ? Array.from(root.querySelectorAll<HTMLElement>(revealSelector))
      : [];
    const observer =
      reduceMotion || revealItems.length === 0
        ? null
        : new IntersectionObserver(
            (entries) => {
              for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                const item = entry.target as HTMLElement;
                const index = Number(item.dataset.srRevealIndex || 0);
                item.animate(
                  [
                    { opacity: 0.72, transform: "translateY(18px) scale(.985)" },
                    { opacity: 1, transform: "translateY(0) scale(1)" },
                  ],
                  {
                    duration: 480,
                    delay: (index % 4) * 45,
                    easing: "cubic-bezier(.22,1,.36,1)",
                    fill: "both",
                  },
                );
                observer?.unobserve(item);
              }
            },
            { threshold: 0.12, rootMargin: "0px 0px -7% 0px" },
          );

    revealItems.forEach((item, index) => {
      item.dataset.srRevealIndex = String(index);
      observer?.observe(item);
    });

    return () => {
      window.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("pointermove", updatePointer);
      root?.removeEventListener("pointermove", tiltCard);
      root?.removeEventListener("pointerout", resetCard);
      observer?.disconnect();
    };
  }, [pointerX, pointerY, reduceMotion]);

  return (
    <LazyMotion features={domAnimation}>
      <div ref={rootRef} className="relative isolate">
        <m.div
          aria-hidden="true"
          className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-[3px] origin-left bg-gradient-to-r from-orange-500 via-amber-300 to-orange-500"
          style={{ scaleX: reduceMotion ? scrollYProgress : progress }}
        />

        {!reduceMotion ? (
          <m.div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 -z-10 hidden opacity-70 lg:block"
            style={{ background: glowBackground }}
          />
        ) : null}

        <m.div
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </m.div>

        <m.button
          type="button"
          aria-label="Back to top"
          title="Back to top"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: reduceMotion ? "auto" : "smooth",
            })
          }
          initial={false}
          animate={{
            opacity: showTop ? 1 : 0,
            scale: showTop ? 1 : 0.86,
            y: showTop ? 0 : 10,
          }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-24 right-4 z-50 grid h-11 w-11 place-items-center rounded-full border border-orange-300/30 bg-[#11131A]/90 text-orange-200 shadow-[0_14px_40px_rgba(0,0,0,.38)] backdrop-blur-md transition-colors hover:border-orange-300/60 hover:bg-[#181B23] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 sm:bottom-6 sm:right-6"
          style={{ pointerEvents: showTop ? "auto" : "none" }}
        >
          <ArrowUp className="h-5 w-5" />
        </m.button>

        <style jsx global>{`
          @media (hover: hover) and (pointer: fine) {
            .premium-homepage :is(
                .service-card,
                .trust-card,
                .growth-engine-node,
                .demo-card,
                .dashboard-preview
              ) {
              transform:
                perspective(900px)
                rotateX(var(--sr-tilt-x, 0deg))
                rotateY(var(--sr-tilt-y, 0deg));
              transform-style: preserve-3d;
              transition:
                transform 220ms cubic-bezier(.22, 1, .36, 1),
                border-color 220ms ease,
                box-shadow 220ms ease;
            }

            .premium-homepage :is(
                .service-card,
                .trust-card,
                .growth-engine-node,
                .demo-card,
                .dashboard-preview
              )[data-sr-tilt-active="true"] {
              border-color: rgba(251, 146, 60, 0.34);
              box-shadow:
                0 22px 55px rgba(0, 0, 0, 0.32),
                0 0 0 1px rgba(251, 146, 60, 0.08),
                inset 0 1px 0 rgba(255, 255, 255, 0.06);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .premium-homepage *,
            .premium-homepage *::before,
            .premium-homepage *::after {
              scroll-behavior: auto !important;
            }
          }
        `}</style>
      </div>
    </LazyMotion>
  );
}
