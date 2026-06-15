"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useLanguage } from "./LanguageContext";
import { Menu, X, Globe, ChevronDown } from "lucide-react";

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close the language menu on outside-click or Escape.
  useEffect(() => {
    if (!isLangOpen) return;
    const onClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setIsLangOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsLangOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [isLangOpen]);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    if (!isMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMenuOpen]);

  const navLinks = [
    { name: t.nav.home, href: "/" },
    { name: t.nav.services, href: "/services" },
    { name: t.nav.blog, href: "/blog" },
    { name: t.nav.contact, href: "/contact" },
  ];

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <motion.nav
      aria-label="Primary"
      initial={{ y: reduce ? 0 : -100, opacity: reduce ? 1 : 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[var(--color-cream)]/90 backdrop-blur-lg shadow-sm border-b border-[var(--color-border)] py-2.5"
          : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand — full lockup (icon + wordmark). A contrast plate appears while
            the bar is transparent over the dark hero so the maroon wordmark
            always reads; once scrolled onto the cream bar the plate fades out. */}
        <Link href="/" aria-label="AflaChat — home" className="group inline-flex shrink-0">
          <span
            className={`inline-flex items-center rounded-xl transition-all duration-300 ${
              isScrolled
                ? "bg-transparent px-0 py-0 shadow-none ring-0"
                : "bg-white/95 px-3 py-1.5 shadow-md ring-1 ring-black/5 backdrop-blur"
            }`}
          >
            <img
              src="/images/aflachat-logo-trimmed.png"
              alt="AflaChat"
              width={138}
              height={50}
              className="h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03] md:h-10"
            />
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            // Over the dark hero (transparent bar) links must be light; on the
            // cream scrolled bar they switch to dark. Active = clay accent.
            const linkColor = active
              ? isScrolled
                ? "text-[var(--color-clay)]"
                : "text-[var(--color-wheat)]"
              : isScrolled
                ? "text-[var(--color-soil)] hover:text-[var(--color-clay)]"
                : "text-white/85 hover:text-white";
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`relative text-sm font-semibold tracking-wide transition-colors ${linkColor}`}
              >
                {link.name}
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute -bottom-1.5 left-0 right-0 h-0.5 rounded-full bg-current"
                    transition={{ type: "spring", stiffness: 500, damping: 32 }}
                  />
                )}
              </Link>
            );
          })}

          {/* Language Selector */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setIsLangOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={isLangOpen}
              aria-label={`Language: ${language === "en" ? "English" : "Swahili"}`}
              className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full border transition-all ${
                isScrolled
                  ? "border-[var(--color-border-strong)] text-[var(--color-soil)] hover:border-[var(--color-clay)]/50 hover:bg-[var(--color-clay)]/5"
                  : "border-white/30 text-white hover:border-white/60 hover:bg-white/10"
              }`}
            >
              <Globe className="w-3.5 h-3.5" aria-hidden />
              {language === "en" ? (
                <img src="/images/US-UK_Flag.svg" alt="" className="w-4 h-3 object-cover rounded-sm shadow-sm" />
              ) : (
                <img src="/images/tz-flag.svg" alt="" className="w-4 h-3 object-cover rounded-sm shadow-sm" />
              )}
              {language === "en" ? "EN" : "SW"}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isLangOpen ? "rotate-180" : ""}`} aria-hidden />
            </button>

            {isLangOpen && (
              <div role="menu" className="absolute top-full right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-zinc-100 p-1.5 z-50">
                <button
                  role="menuitemradio"
                  aria-checked={language === "en"}
                  onClick={() => { setLanguage("en"); setIsLangOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2.5 transition-colors ${language === "en" ? "bg-accent text-primary font-semibold" : "hover:bg-zinc-50 text-zinc-600"}`}
                >
                  <img src="/images/US-UK_Flag.svg" alt="" className="w-5 h-3.5 object-cover rounded-sm shadow-sm" /> English
                </button>
                <button
                  role="menuitemradio"
                  aria-checked={language === "sw"}
                  onClick={() => { setLanguage("sw"); setIsLangOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2.5 transition-colors ${language === "sw" ? "bg-accent text-primary font-semibold" : "hover:bg-zinc-50 text-zinc-600"}`}
                >
                  <img src="/images/tz-flag.svg" alt="" className="w-5 h-3.5 object-cover rounded-sm shadow-sm" /> Swahili
                </button>
              </div>
            )}
          </div>

          <Link
            href="/download"
            className="px-5 py-2 bg-[var(--color-clay)] text-[var(--color-clay-foreground)] text-sm font-semibold rounded-full hover:bg-[var(--color-clay-hover)] transition-all shadow-md shadow-[var(--color-clay)]/25 hover:shadow-lg hover:-translate-y-0.5"
          >
            {t.nav.download}
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className={`md:hidden p-2 rounded-lg transition-colors ${
            isScrolled
              ? "text-[var(--color-soil)] hover:bg-black/5"
              : "text-white hover:bg-white/10"
          }`}
          onClick={() => setIsMenuOpen((o) => !o)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
        >
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
      {isMenuOpen && (
        <motion.div
          id="mobile-menu"
          initial={{ opacity: 0, y: reduce ? 0 : -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduce ? 0 : -12 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="md:hidden absolute top-full left-0 right-0 bg-[var(--color-cream)] border-t border-[var(--color-border)] p-6 flex flex-col gap-5 shadow-2xl">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`text-base font-semibold transition-colors ${
                isActive(link.href) ? "text-primary" : "text-zinc-800 hover:text-primary"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}

          <div className="flex gap-3 p-1.5 bg-zinc-100 rounded-xl">
            <button
              onClick={() => setLanguage("en")}
              aria-pressed={language === "en"}
              className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${language === "en" ? "bg-white shadow-sm text-primary" : "text-zinc-500"}`}
            >
              <img src="/images/US-UK_Flag.svg" alt="" className="w-5 h-3.5 object-cover rounded-sm" /> English
            </button>
            <button
              onClick={() => setLanguage("sw")}
              aria-pressed={language === "sw"}
              className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${language === "sw" ? "bg-white shadow-sm text-primary" : "text-zinc-500"}`}
            >
              <img src="/images/tz-flag.svg" alt="" className="w-5 h-3.5 object-cover rounded-sm" /> Swahili
            </button>
          </div>

          <Link
            href="/download"
            className="w-full py-3 bg-[var(--color-clay)] text-[var(--color-clay-foreground)] text-center font-bold rounded-full hover:bg-[var(--color-clay-hover)] transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            {t.nav.download}
          </Link>
        </motion.div>
      )}
      </AnimatePresence>
    </motion.nav>
  );
}
