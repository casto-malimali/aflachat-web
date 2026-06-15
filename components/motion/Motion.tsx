"use client";

/**
 * Shared Framer-Motion primitives for the marketing site.
 *
 * Design goals:
 *  - GPU-only properties (opacity / transform) — never animate layout.
 *  - Reduced-motion aware: `useReducedMotion()` collapses every effect to a
 *    plain fade (or nothing), satisfying WCAG 2.3.3 without branching markup.
 *  - Scroll reveals fire once (`useInView({ once: true })`) so they don't
 *    re-run on every scroll pass — cheaper and less distracting.
 */

import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "motion/react";
import { useRef, useEffect, useState, type ReactNode } from "react";

/* ── Easing / transition presets ─────────────────────────────────────────── */
const EASE_OUT = [0.22, 1, 0.36, 1] as const; // soft, "growth"-like deceleration

/* Pre-created motion tags (factory must run at module scope, never in render). */
const MOTION_TAGS = {
  div: motion.div,
  section: motion.section,
  span: motion.span,
  li: motion.li,
  h2: motion.h2,
  p: motion.p,
} as const;
type MotionTagName = keyof typeof MOTION_TAGS;

/* ── Reveal: fade + rise as the element scrolls into view ──────────────────── */
interface RevealProps {
  children: ReactNode;
  /** seconds */
  delay?: number;
  /** travel distance in px before settling */
  y?: number;
  className?: string;
  as?: MotionTagName;
}

export function Reveal({ children, delay = 0, y = 28, className, as = "div" }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-12% 0px" });
  const reduce = useReducedMotion();
  const MotionTag = MOTION_TAGS[as];

  return (
    <MotionTag
      ref={ref as never}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: EASE_OUT }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}

/* ── Stagger: parent orchestrates children entrance ────────────────────────── */
const staggerParent: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
};

interface StaggerProps {
  children: ReactNode;
  className?: string;
}

export function Stagger({ children, className }: StaggerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      variants={reduce ? undefined : staggerParent}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Child of <Stagger>. Renders as <motion.div> with the shared item variant. */
export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div variants={reduce ? undefined : staggerItem} className={className}>
      {children}
    </motion.div>
  );
}

/* ── Counter: animates a number up when scrolled into view ─────────────────── */
interface CounterProps {
  to: number;
  /** text rendered after the number, e.g. "+" or "%" */
  suffix?: string;
  prefix?: string;
  durationMs?: number;
  className?: string;
}

export function Counter({ to, suffix = "", prefix = "", durationMs = 1400, className }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setValue(to);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / durationMs, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(eased * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, to, durationMs]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ── ScrollProgress: thin clay bar pinned to the top of the viewport ───────── */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-[var(--color-clay)]"
    />
  );
}

/* ── Parallax: translates children on scroll (decorative only) ─────────────── */
interface ParallaxProps {
  children: ReactNode;
  /** total px of travel across the scroll range; negative moves up */
  distance?: number;
  className?: string;
}

export function Parallax({ children, distance = 80, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : distance]);

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}
