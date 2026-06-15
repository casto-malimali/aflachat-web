"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "./LanguageContext";
import { Mail, Instagram, Twitter, Facebook } from "lucide-react";

export default function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-zinc-950 text-white mt-0">
      <div className="h-1 bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-leaf)] to-[var(--color-clay)]" />
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" aria-label="AflaChat — home" className="mb-5 inline-flex">
              <span className="inline-flex items-center rounded-xl bg-[var(--color-cream)] px-3.5 py-2 shadow-sm ring-1 ring-white/10">
                <img
                  src="/images/aflachat-logo-trimmed.png"
                  alt="AflaChat"
                  width={138}
                  height={50}
                  className="h-9 w-auto object-contain"
                />
              </span>
            </Link>
            <p className="text-zinc-400 leading-relaxed text-sm max-w-sm mb-8">{t.hero.description}</p>
            <div className="flex gap-3">
              {[
                { icon: <Twitter className="w-4 h-4" />, label: "Twitter" },
                { icon: <Facebook className="w-4 h-4" />, label: "Facebook" },
                { icon: <Instagram className="w-4 h-4" />, label: "Instagram" },
                { icon: <Mail className="w-4 h-4" />, href: "mailto:pamsekela@gmail.com", label: "Email" },
              ].map((s, i) => (
                <a key={i} href={s.href ?? "#"} aria-label={s.label} className="p-2.5 bg-zinc-800 text-zinc-400 hover:bg-primary hover:text-white rounded-lg transition-all">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-6 text-zinc-200 text-xs uppercase tracking-widest">{t.footer.quickLinks}</h4>
            <div className="flex flex-col gap-3 text-zinc-400 text-sm">
              <Link href="/" className="hover:text-secondary transition-colors">{t.nav.home}</Link>
              <Link href="/services" className="hover:text-secondary transition-colors">{t.nav.services}</Link>
              <Link href="/download" className="hover:text-secondary transition-colors">{t.nav.download}</Link>
              <Link href="/contact" className="hover:text-secondary transition-colors">{t.nav.contact}</Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold mb-6 text-zinc-200 text-xs uppercase tracking-widest">{t.footer.legal}</h4>
            <div className="flex flex-col gap-3 text-zinc-400 text-sm">
              <Link href="/privacy" className="hover:text-secondary transition-colors">{t.nav.privacy}</Link>
              <Link href="/terms" className="hover:text-secondary transition-colors">{t.nav.terms}</Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-500">
          <p>
            © {year} AflaChat. {t.footer.rights} {t.footer.tagline}
            <a href="https://github.com/casto-malimali" target="_blank" rel="noopener noreferrer" className="font-bold hover:text-white transition-colors">
              Casto MALIMALI
            </a>
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-zinc-300 transition-colors">{t.nav.privacy}</Link>
            <Link href="/terms" className="hover:text-zinc-300 transition-colors">{t.nav.terms}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
