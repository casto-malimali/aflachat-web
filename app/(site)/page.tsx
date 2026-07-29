"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useReducedMotion, AnimatePresence } from "motion/react";
import { useLanguage } from "@/components/LanguageContext";
import PlayStoreButton from "@/components/PlayStoreButton";
import { FeatureCard } from "@/components/ui/FeatureCard";
import FaqSection from "@/components/FaqSection";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Motion";
import {
  Shield, Zap, MessageCircle, ArrowRight, CheckCircle2,
  Tractor, Sprout, GraduationCap, HeartPulse, Store, Leaf,
} from "lucide-react";

const HERO_IMAGES = [
  "/images/2148761810.jpg",
  "/images/2149142834.jpg",
  "/images/41468.jpg",
];

export default function Home() {
  const { t } = useLanguage();
  const reduce = useReducedMotion();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Hero parallax: the photo drifts slower than the page for depth.
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const photoY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 140]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -40]);
  const heroFade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const features = [
    { icon: <MessageCircle className="w-6 h-6" />, title: t.howItWorks.step1.title, desc: t.howItWorks.step1.desc, num: "01" },
    { icon: <Zap           className="w-6 h-6" />, title: t.howItWorks.step2.title, desc: t.howItWorks.step2.desc, num: "02" },
    { icon: <Shield        className="w-6 h-6" />, title: t.howItWorks.step3.title, desc: t.howItWorks.step3.desc, num: "03" },
  ];

  const benefits = [t.benefits.item1, t.benefits.item2, t.benefits.item3, t.benefits.item4];

  const stats = [
    { val: "24/7", label: t.hero.statAi },
    { val: "🇬🇧🇹🇿", label: t.hero.statLanguage },
    { val: t.hero.statFree, label: t.hero.statFreeLabel },
  ];

  return (
    <div className="flex flex-col">
      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-[94vh] flex items-center overflow-hidden">
        {/* Parallax photo slider + layered earthy scrim */}
        <motion.div style={{ y: photoY }} className="absolute inset-0 -z-20 h-[118%] w-full">
          <AnimatePresence mode="popLayout">
            <motion.img
              key={currentImageIndex}
              src={HERO_IMAGES[currentImageIndex]}
              alt=""
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </AnimatePresence>
        </motion.div>
        <div className="absolute inset-0 -z-10 hero-scrim" />
        {/* Ambient drifting leaf orbs (decorative) */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="animate-drift absolute -left-24 top-24 h-72 w-72 rounded-full bg-[var(--color-leaf)]/20 blur-3xl" />
          <div className="animate-drift absolute right-[-6rem] bottom-10 h-80 w-80 rounded-full bg-[var(--color-wheat)]/15 blur-3xl" style={{ animationDelay: "2.5s" }} />
        </div>

        <motion.div style={{ y: contentY, opacity: heroFade }} className="max-w-7xl mx-auto px-6 py-28 w-full">
          <Stagger className="max-w-2xl">
            <StaggerItem>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[var(--color-wheat)] backdrop-blur-sm">
                <Leaf className="h-3.5 w-3.5" />
                {t.hero.welcome}
              </span>
            </StaggerItem>
            <StaggerItem>
              <h1 className="display mt-7 text-balance text-white text-5xl leading-[1.03] sm:text-6xl md:text-7xl">
                {t.hero.headline}
              </h1>
            </StaggerItem>
            <StaggerItem>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-100/90">
                {t.hero.description}
              </p>
            </StaggerItem>
            <StaggerItem>
              <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new Event("aflachat:open"))}
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-clay)] px-6 py-3 font-semibold text-[var(--color-clay-foreground)] shadow-md transition-colors hover:bg-[var(--color-clay-hover)] active:scale-95 cursor-pointer h-14"
                >
                  <MessageCircle className="h-5 w-5" aria-hidden />
                  {t.hero.openAflachat}
                </button>
                <PlayStoreButton />
              </div>
            </StaggerItem>

            {/* Mobile/tablet proof row */}
            <dl className="mt-12 grid grid-cols-3 gap-3 lg:hidden">
              {stats.map((s, i) => (
                <div key={i} className="rounded-2xl border border-white/15 bg-white/10 px-3 py-3 text-center backdrop-blur-sm">
                  <dt className="font-display text-xl font-semibold text-white">{s.val}</dt>
                  <dd className="mt-1 text-xs text-zinc-200">{s.label}</dd>
                </div>
              ))}
            </dl>
          </Stagger>
        </motion.div>

        {/* Floating stat cards (desktop) */}
        <Stagger className="absolute right-12 top-1/2 hidden -translate-y-1/2 flex-col gap-4 lg:flex">
          {stats.map((s, i) => (
            <StaggerItem key={i}>
              <motion.div
                whileHover={reduce ? undefined : { y: -4, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/95 px-6 py-4 shadow-xl backdrop-blur"
              >
                <p className="font-display text-3xl font-semibold text-[var(--color-primary)]">{s.val}</p>
                <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{s.label}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </Stagger>


      </section>

      {/* ── How It Works ───────────────────────────────────────────────────── */}
      <section id="how" className="texture-grain bg-paper scroll-mt-24 px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-16 max-w-2xl">
            <div className="rule-accent mb-5" />
            <h2 className="display text-4xl text-[var(--color-soil)] md:text-5xl">
              {t.howItWorks.title}
            </h2>
          </Reveal>
          <Stagger className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {features.map((f, i) => (
              <StaggerItem key={i}>
                <motion.div
                  whileHover={reduce ? undefined : { y: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="h-full"
                >
                  <FeatureCard icon={f.icon} title={f.title} desc={f.desc} num={f.num} className="h-full" />
                </motion.div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ── Quote Banner ───────────────────────────────────────────────────── */}
      <section className="relative h-96 overflow-hidden">
        <motion.img
          src="/images/2149142834.jpg"
          alt=""
          aria-hidden
          initial={reduce ? undefined : { scale: 1.12 }}
          whileInView={reduce ? undefined : { scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-primary)]/75">
          <Reveal className="px-6 text-center">
            <Leaf className="mx-auto mb-5 h-8 w-8 text-[var(--color-wheat)]" />
            <p className="display mx-auto max-w-3xl text-3xl text-white md:text-4xl">{t.quote.text}</p>
            <p className="mt-4 text-sm uppercase tracking-[0.25em] text-emerald-200">— {t.quote.author}</p>
          </Reveal>
        </div>
      </section>

      {/* ── Benefits ───────────────────────────────────────────────────────── */}
      <section className="texture-grain bg-paper-2 px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-20">
            <Reveal>
              <div className="rule-accent mb-5 bg-[var(--color-clay)]" />
              <h2 className="display mb-10 text-4xl text-[var(--color-soil)] md:text-5xl">
                {t.benefits.title}
              </h2>
              <Stagger className="space-y-4">
                {benefits.map((b, i) => (
                  <StaggerItem key={i}>
                    <div className="group flex items-start gap-4 rounded-2xl border border-transparent p-3 transition-colors hover:border-[var(--color-border)] hover:bg-white/60">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 ring-1 ring-[var(--color-primary)]/20 transition-colors group-hover:bg-[var(--color-primary)] group-hover:ring-[var(--color-primary)]">
                        <CheckCircle2 className="h-4 w-4 text-[var(--color-primary)] transition-colors group-hover:text-white" />
                      </span>
                      <p className="font-medium leading-relaxed text-[var(--color-foreground)]/85">{b}</p>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="relative">
                <motion.div
                  whileHover={reduce ? undefined : { y: -6 }}
                  transition={{ type: "spring", stiffness: 250, damping: 22 }}
                  className="relative overflow-hidden rounded-[2rem] shadow-2xl"
                >
                  <img src="/images/41468.jpg" alt="Farmer using the AflaChat app on a mobile phone" className="h-[26rem] w-full object-cover" />
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[var(--color-soil)]/90 via-[var(--color-soil)]/30 to-transparent p-8">
                    <h3 className="font-display text-2xl font-semibold text-white">{t.benefits.cta}</h3>
                    <p className="mb-6 mt-2 text-sm text-emerald-50/90">{t.benefits.ctaDesc}</p>
                    <PlayStoreButton />
                  </div>
                </motion.div>
                {/* offset earthy shadow plate */}
                <div aria-hidden className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-[2rem] bg-[var(--color-clay)]/10 ring-1 ring-[var(--color-clay)]/15" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <FaqSection />

      {/* ── Trust / sectors ────────────────────────────────────────────────── */}
      <section className="texture-grain bg-paper px-6 py-24">
        <div className="mx-auto max-w-7xl text-center">
          <Reveal>
            <p className="mb-12 text-sm font-bold uppercase tracking-[0.2em] text-[var(--color-muted-foreground)]">
              {t.trustBar.label}
            </p>
          </Reveal>
          <Stagger className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-5">
            {t.trustBar.items.map((item, i) => {
              const icons = [
                <Tractor key="agri" className="h-7 w-7" />,
                <Sprout key="farm" className="h-7 w-7" />,
                <GraduationCap key="edu" className="h-7 w-7" />,
                <HeartPulse key="health" className="h-7 w-7" />,
                <Store key="trade" className="h-7 w-7" />,
              ];
              return (
                <StaggerItem key={i}>
                  <motion.div
                    whileHover={reduce ? undefined : { y: -6 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="flex h-full flex-col items-center justify-center gap-4 rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-7 shadow-sm transition-colors hover:border-[var(--color-primary)]/30"
                  >
                    <span className="rounded-2xl bg-[var(--color-accent)] p-4 text-[var(--color-primary)]">
                      {icons[i]}
                    </span>
                    <span className="text-center text-base font-bold leading-tight tracking-tight text-[var(--color-soil)]">
                      {item}
                    </span>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>
    </div>
  );
}
