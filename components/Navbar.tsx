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
          ? "bg-white/80 dark:bg-black/80 backdrop-blur-md shadow-sm py-3" 
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          {/* use official logo instead of placeholder letter */}
          <img
            src="/images/aflachat_logo.png"
            alt="AflaChat logo"
            className="w-10 h-10 object-contain group-hover:scale-110 transition-transform"
          />
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            AflaChat
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className="font-medium hover:text-primary transition-colors"
            >
              {link.name}
            </Link>
          ))}
          
          <div className="relative">
            <button 
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1.5 font-medium px-3 py-1.5 rounded-full hover:bg-accent transition-colors"
            >
              <Globe className="w-4 h-4" />
              {language === "en" ? "🇬🇧 English" : "🇹🇿 Swahili"}
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {isLangOpen && (
              <div className="absolute top-full right-0 mt-2 w-36 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-100 p-1 animate-in fade-in slide-in-from-top-2">
                <button 
                  onClick={() => { setLanguage("en"); setIsLangOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${language === "en" ? "bg-accent text-primary font-semibold" : "hover:bg-zinc-50 dark:hover:bg-zinc-800"}`}
                >
                  <span className="text-base">🇬🇧</span> English
                </button>
                <button 
                  onClick={() => { setLanguage("sw"); setIsLangOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${language === "sw" ? "bg-accent text-primary font-semibold" : "hover:bg-zinc-50 dark:hover:bg-zinc-800"}`}
                >
                  <span className="text-base">🇹🇿</span> Swahili
                </button>
              </div>
            )}
          </div>

          <Link 
            href="/download"
            className="px-5 py-2.5 bg-primary text-white font-semibold rounded-full hover:bg-secondary transition-all shadow-primary/20 shadow-md hover:shadow-lg"
          >
            {t.nav.download}
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-zinc-950 border-t border-zinc-100 p-6 flex flex-col gap-6 shadow-2xl animate-in slide-in-from-top-5">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className="text-lg font-semibold"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          
          <div className="flex gap-4 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl">
            <button 
              onClick={() => setLanguage("en")}
              className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 ${language === "en" ? "bg-white dark:bg-zinc-800 shadow text-primary" : "text-zinc-500"}`}
            >
              🇬🇧 EN
            </button>
            <button 
              onClick={() => setLanguage("sw")}
              className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 ${language === "sw" ? "bg-white dark:bg-zinc-800 shadow text-primary" : "text-zinc-500"}`}
            >
              🇹🇿 SW
            </button>
          </div>

          <Link 
            href="/download"
            className="w-full py-3 bg-primary text-white text-center font-bold rounded-xl"
            onClick={() => setIsMenuOpen(false)}
          >
            {t.nav.download}
          </Link>
        </div>
      )}
    </nav>
  );
}
