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
import { useEffect, useState } from "react";

export default function InteractiveHomepageShell({
  children,
}: {
  children: ReactNode;
}) {
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
    const updateScrollState = () => setShowTop(window.scrollY > 720);
    const updatePointer = (event: PointerEvent) => {
      if (reduceMotion || event.pointerType === "touch") return;
      pointerX.set((event.clientX / window.innerWidth) * 100);
      pointerY.set((event.clientY / window.innerHeight) * 100);
    };

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("pointermove", updatePointer, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("pointermove", updatePointer);
    };
  }, [pointerX, pointerY, reduceMotion]);

  return (
    <LazyMotion features={domAnimation}>
      <div className="relative isolate">
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
      </div>
    </LazyMotion>
  );
}
