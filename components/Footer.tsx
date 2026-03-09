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
      className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-yellow-500" />
      ) : (
        <Moon className="w-5 h-5 text-zinc-700" />
      )}
    </button>
  );
}

export default function Footer() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <img
                src="/images/AflaChatLogo.png"
                alt="AflaChat logo"
                className="w-8 h-8 object-contain"
              />
              <span className="font-bold text-lg tracking-tight">AflaChat</span>
            </Link>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-sm">
              {t.hero.description}
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="p-2 bg-emerald-100 text-emerald-700 rounded-full hover:bg-emerald-200 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-emerald-100 text-emerald-700 rounded-full hover:bg-emerald-200 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-emerald-100 text-emerald-700 rounded-full hover:bg-emerald-200 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="mailto:pamsekela@gmail.com" className="p-2 bg-emerald-100 text-emerald-700 rounded-full hover:bg-emerald-200 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 text-zinc-900 dark:text-zinc-50 text-sm uppercase tracking-widest">
              Quick Links
            </h4>
            <div className="flex flex-col gap-4 text-zinc-600 dark:text-zinc-400">
              <Link href="/" className="hover:text-emerald-600 transition-colors">{t.nav.home}</Link>
              <Link href="/services" className="hover:text-emerald-600 transition-colors">{t.nav.services}</Link>
              <Link href="/contact" className="hover:text-emerald-600 transition-colors">{t.nav.contact}</Link>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 text-zinc-900 dark:text-zinc-50 text-sm uppercase tracking-widest">
              Legal
            </h4>
            <div className="flex flex-col gap-4 text-zinc-600 dark:text-zinc-400">
              <Link href="/privacy" className="hover:text-emerald-600 transition-colors">{t.nav.privacy}</Link>
              <Link href="/terms" className="hover:text-emerald-600 transition-colors">{t.nav.terms}</Link>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-zinc-200 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-zinc-500">
          <p>© {currentYear} AflaChat. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-zinc-900">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-zinc-900">Terms & Conditions</Link>
            {/* theme toggle button */}
            <ThemeToggleButton />
          </div>
        </div>
      </div>
    </footer>
  );
}
