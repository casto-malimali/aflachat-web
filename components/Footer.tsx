"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "./LanguageContext";
import { Mail, Instagram, Twitter, Facebook, Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeContext";

function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 text-yellow-500" />
      ) : (
        <Moon className="w-4 h-4 text-zinc-600" />
      )}
    </button>
  );
}

export default function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-zinc-950 text-white mt-0">
      {/* Top accent line */}
      <div className="h-1 bg-gradient-to-r from-primary via-secondary to-primary" />

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand column */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-5 group">
              <img
                src="/images/aflachat_logo.png"
                alt="AflaChat logo"
                className="w-9 h-9 object-contain rounded-lg"
              />
              <span
                className="font-bold text-xl tracking-tight text-white"
                style={{ fontFamily: "var(--font-playfair,'Playfair Display',Georgia,serif)" }}
              >
                Afla<span className="text-secondary">Chat</span>
              </span>
            </Link>
            <p className="text-zinc-400 leading-relaxed text-sm max-w-sm mb-8">
              {t.hero.description}
            </p>
            <div className="flex gap-3">
              <a href="#" aria-label="Twitter" className="p-2.5 bg-zinc-800 text-zinc-400 hover:bg-primary hover:text-white rounded-lg transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Facebook" className="p-2.5 bg-zinc-800 text-zinc-400 hover:bg-primary hover:text-white rounded-lg transition-all">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Instagram" className="p-2.5 bg-zinc-800 text-zinc-400 hover:bg-primary hover:text-white rounded-lg transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="mailto:pamsekela@gmail.com" aria-label="Email" className="p-2.5 bg-zinc-800 text-zinc-400 hover:bg-primary hover:text-white rounded-lg transition-all">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-6 text-zinc-200 text-xs uppercase tracking-widest">
              Quick Links
            </h4>
            <div className="flex flex-col gap-3 text-zinc-400 text-sm">
              <Link href="/" className="hover:text-secondary transition-colors">{t.nav.home}</Link>
              <Link href="/services" className="hover:text-secondary transition-colors">{t.nav.services}</Link>
              <Link href="/download" className="hover:text-secondary transition-colors">{t.nav.download}</Link>
              <Link href="/contact" className="hover:text-secondary transition-colors">{t.nav.contact}</Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold mb-6 text-zinc-200 text-xs uppercase tracking-widest">
              Legal
            </h4>
            <div className="flex flex-col gap-3 text-zinc-400 text-sm">
              <Link href="/privacy" className="hover:text-secondary transition-colors">{t.nav.privacy}</Link>
              <Link href="/terms" className="hover:text-secondary transition-colors">{t.nav.terms}</Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-500">
          <p>© {currentYear} AflaChat. All rights reserved. Developed with ❤️ for safer food systems.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-zinc-300 transition-colors">Terms</Link>
            <ThemeToggleButton />
          </div>
        </div>
      </div>
    </footer>
  );
}
