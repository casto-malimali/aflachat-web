"use client";

import PlayStoreButton from "@/components/PlayStoreButton";
import { CheckCircle } from "lucide-react";

export default function DownloadPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 -z-10">
          <img
            src="https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=1600&auto=format&fit=crop&q=80"
            alt="Smartphone in farm"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/40" />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-white animate-fade-up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 text-xs font-bold tracking-widest uppercase bg-white/10 border border-white/20 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                Available Now on Android
              </div>
              <h1
                className="text-5xl md:text-7xl font-bold leading-tight mb-6"
                style={{ fontFamily: "var(--font-playfair,'Playfair Display',Georgia,serif)" }}
              >
                Get AflaChat
              </h1>
              <p className="text-xl text-emerald-100 leading-relaxed mb-10 max-w-lg">
                Start protecting your family and your harvest today. The official AflaChat app is free to download and easy to use.
              </p>
              <PlayStoreButton />

              <div className="mt-10 flex flex-col gap-3">
                <div className="flex items-center gap-3 text-emerald-100">
                  <CheckCircle className="w-5 h-5 text-secondary shrink-0" />
                  <span className="text-sm">Requires Android 8.0 or higher</span>
                </div>
                <div className="flex items-center gap-3 text-emerald-100">
                  <CheckCircle className="w-5 h-5 text-secondary shrink-0" />
                  <span className="text-sm">Completely free to download — no subscription</span>
                </div>
                <div className="flex items-center gap-3 text-emerald-100">
                  <CheckCircle className="w-5 h-5 text-secondary shrink-0" />
                  <span className="text-sm">Works offline for basic features</span>
                </div>
              </div>
            </div>

            {/* Phone mockup with real app imagery */}
            <div className="hidden lg:flex justify-center animate-fade-up [animation-delay:300ms]">
              <div className="relative w-72">
                {/* Phone frame */}
                <div className="relative w-72 h-[560px] bg-zinc-950 rounded-[3.5rem] border-[10px] border-zinc-800 shadow-2xl overflow-hidden">
                  {/* Status bar */}
                  <div className="h-6 bg-zinc-900 flex justify-center items-center">
                    <div className="w-16 h-1.5 bg-zinc-700 rounded-full" />
                  </div>
                  {/* App UI mockup */}
                  <div className="p-4 space-y-3 h-full bg-zinc-950 overflow-hidden">
                    <div className="flex items-center gap-2 py-2 border-b border-zinc-800 mb-2">
                      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-white text-xs font-bold">A</span>
                      </div>
                      <span className="text-white text-sm font-semibold">AflaChat</span>
                    </div>
                    <div className="bg-emerald-900/40 p-3 rounded-2xl rounded-tl-none mr-8 border border-emerald-800/30">
                      <p className="text-xs text-emerald-100">Hello! I&apos;m AflaChat. How can I help you with aflatoxin safety today?</p>
                    </div>
                    <div className="bg-zinc-800 p-3 rounded-2xl rounded-tr-none ml-8">
                      <p className="text-xs text-zinc-300">What are the best drying methods for maize to prevent aflatoxin?</p>
                    </div>
                    <div className="bg-primary/80 p-3 rounded-2xl rounded-tl-none mr-6 border border-primary/30">
                      <p className="text-xs text-white">To prevent aflatoxin in maize, ensure rapid drying to below 13.5% moisture content within 24-48 hours of harvest...</p>
                    </div>
                    <div className="mt-auto absolute bottom-6 left-4 right-4 h-10 bg-zinc-800 rounded-2xl flex items-center px-4 gap-2">
                      <div className="flex-1 h-1.5 bg-zinc-600 rounded-full" />
                      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-white text-xs">↑</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Floating badge */}
                <div className="absolute -right-8 top-1/4 bg-white text-zinc-900 px-4 py-3 rounded-2xl shadow-2xl text-center">
                  <p className="text-2xl font-black text-primary" style={{ fontFamily: "var(--font-playfair,'Playfair Display',Georgia,serif)" }}>Free</p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Download</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-24 px-6 bg-white dark:bg-zinc-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="w-12 h-1 bg-primary rounded-full mx-auto mb-4" />
            <h2
              className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-50"
              style={{ fontFamily: "var(--font-playfair,'Playfair Display',Georgia,serif)" }}
            >
              How to Download
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Open Play Store", desc: "Visit the Google Play Store on your Android smartphone." },
              { step: "02", title: "Search AflaChat", desc: 'Search for "AflaChat" in the Play Store search bar.' },
              { step: "03", title: "Install & Start", desc: 'Tap "Install" and begin chatting with our AI assistant.' },
            ].map((s, i) => (
              <div key={i} className="relative p-8 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700 text-center">
                <span
                  className="block text-6xl font-black text-zinc-100 dark:text-zinc-700 mb-4"
                  style={{ fontFamily: "var(--font-playfair,'Playfair Display',Georgia,serif)" }}
                >
                  {s.step}
                </span>
                <h3
                  className="text-xl font-bold mb-3 text-zinc-900 dark:text-zinc-50"
                  style={{ fontFamily: "var(--font-playfair,'Playfair Display',Georgia,serif)" }}
                >
                  {s.title}
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
