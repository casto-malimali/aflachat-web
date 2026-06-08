"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";
import { BookOpen, Sparkles, ArrowLeft } from "lucide-react";

export default function Blog() {
  const { language } = useLanguage();
  const activeLang = language === "sw" ? "sw" : "en";

  const content = {
    en: {
      badge: "Coming Soon",
      title: "AflaChat Blog",
      subtitle: "We are preparing agricultural insights, research articles, and crop preservation guides to help you protect your harvest from aflatoxin. Stay tuned!",
      cta: "Back to Home",
    },
    sw: {
      badge: "Inakuja Hivi Karibuni",
      title: "Bloku ya AflaChat",
      subtitle: "Tunatayarisha makala za kilimo, utafiti, na miongozo ya uhifadhi wa mazao ili kukusaidia kulinda mavuno yako dhidi ya sumukuvu. Kaa mkao wa kula!",
      cta: "Rudi Mwanzo",
    },
  }[activeLang];

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-zinc-50 py-24 px-6">
      {/* Decorative glowing background gradients */}
      <div className="absolute top-1/4 left-1/4 -z-10 w-96 h-96 rounded-full bg-secondary/10 blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 w-96 h-96 rounded-full bg-primary/5 blur-[100px] animate-pulse" style={{ animationDelay: "2s" }} />

      <div className="max-w-xl w-full text-center relative z-10 animate-fade-up">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold uppercase tracking-widest mb-6 animate-bounce">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{content.badge}</span>
        </div>

        {/* Coming Soon Box (Glassmorphic) */}
        <div className="bg-white/80 backdrop-blur-md border border-zinc-200/80 rounded-3xl p-8 md:p-12 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-accent flex items-center justify-center text-primary mb-6 shadow-sm border border-primary/10">
            <BookOpen className="w-8 h-8" />
          </div>
          
          <h1 className="font-heading text-4xl md:text-5xl font-black text-zinc-900 mb-6 tracking-tight">
            {content.title}
          </h1>
          
          <div className="rule-accent mx-auto mb-6 bg-primary" />
          
          <p className="text-zinc-600 text-base md:text-lg leading-relaxed mb-8">
            {content.subtitle}
          </p>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md font-semibold tracking-tight transition-all hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none bg-primary text-primary-foreground hover:bg-primary-hover shadow-md shadow-primary/20 hover:shadow-lg h-14 px-7 text-base cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            {content.cta}
          </Link>
        </div>
      </div>
    </div>
  );
}
