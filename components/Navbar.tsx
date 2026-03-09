"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "./LanguageContext";
import { Menu, X, Globe, ChevronDown } from "lucide-react";

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: t.nav.home, href: "/" },
    { name: t.nav.services, href: "/services" },
    { name: t.nav.contact, href: "/contact" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 -zinc-950/90 backdrop-blur-lg shadow-sm border-b border-zinc-100 -zinc-800/50 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src="/images/AflaChatLogo.png"
            alt="AflaChat logo"
            className="w-9 h-9 object-contain group-hover:scale-105 transition-transform rounded-lg"
          />
          <span
            className="font-bold text-xl tracking-tight text-zinc-900 -zinc-50"
            style={{ fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)" }}
          >
            Afla<span className="text-primary">Chat</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium tracking-wide text-zinc-600 -zinc-400 hover:text-primary -secondary transition-colors"
            >
              {link.name}
            </Link>
          ))}

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border border-zinc-200 -zinc-700 hover:border-primary/40 hover:bg-accent transition-all"
            >
              <Globe className="w-3.5 h-3.5" />
              {language === "en" ? (
                <img src="/images/US-UK_Flag.svg" alt="English" className="w-4 h-3 object-cover rounded-sm shadow-sm" />
              ) : (
                <img src="/images/tz-flag.svg" alt="Swahili" className="w-4 h-3 object-cover rounded-sm shadow-sm" />
              )}
              {language === "en" ? "EN" : "SW"}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isLangOpen ? "rotate-180" : ""}`} />
            </button>

            {isLangOpen && (
              <div className="absolute top-full right-0 mt-2 w-40 bg-white -zinc-900 rounded-xl shadow-xl border border-zinc-100 -zinc-800 p-1.5 z-50">
                <button
                  onClick={() => { setLanguage("en"); setIsLangOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2.5 transition-colors ${language === "en" ? "bg-accent text-primary font-semibold" : "hover:bg-zinc-50 -zinc-800 text-zinc-600 -zinc-400"}`}
                >
                   <img src="/images/US-UK_Flag.svg" alt="English" className="w-5 h-3.5 object-cover rounded-sm shadow-sm" /> English
                </button>
                <button
                  onClick={() => { setLanguage("sw"); setIsLangOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2.5 transition-colors ${language === "sw" ? "bg-accent text-primary font-semibold" : "hover:bg-zinc-50 -zinc-800 text-zinc-600 -zinc-400"}`}
                >
                   <img src="/images/tz-flag.svg" alt="Swahili" className="w-5 h-3.5 object-cover rounded-sm shadow-sm" /> Swahili
                </button>
              </div>
            )}
          </div>

          <Link
            href="/download"
            className="px-5 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-secondary transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5"
          >
            {t.nav.download}
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-zinc-100 -zinc-800 transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white -zinc-950 border-t border-zinc-100 -zinc-800 p-6 flex flex-col gap-5 shadow-2xl">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-base font-semibold text-zinc-800 -zinc-200 hover:text-primary -secondary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}

          <div className="flex gap-3 p-1.5 bg-zinc-100 -zinc-900 rounded-xl">
            <button
              onClick={() => setLanguage("en")}
              className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${language === "en" ? "bg-white -zinc-800 shadow-sm text-primary" : "text-zinc-500"}`}
            >
               <img src="/images/US-UK_Flag.svg" alt="English" className="w-5 h-3.5 object-cover rounded-sm" /> English
            </button>
            <button
              onClick={() => setLanguage("sw")}
              className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${language === "sw" ? "bg-white -zinc-800 shadow-sm text-primary" : "text-zinc-500"}`}
            >
               <img src="/images/tz-flag.svg" alt="Swahili" className="w-5 h-3.5 object-cover rounded-sm" /> Swahili
            </button>
          </div>

          <Link
            href="/download"
            className="w-full py-3 bg-primary text-white text-center font-bold rounded-xl hover:bg-secondary transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            {t.nav.download}
          </Link>
        </div>
      )}
    </nav>
  );
}
