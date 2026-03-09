"use client";

import React from "react";
import { useLanguage } from "@/components/LanguageContext";
import { Info, ShieldCheck, Tractor, GraduationCap, MessagesSquare } from "lucide-react";

export default function Services() {
  const { t } = useLanguage();

  const services = [
    {
      icon: <Info className="w-7 h-7 text-primary" />,
      title: t.services.aiInfo,
      desc: "Instant access to a vast database of aflatoxin research and safety protocols powered by advanced AI.",
      num: "01",
    },
    {
      icon: <ShieldCheck className="w-7 h-7 text-primary" />,
      title: t.services.safetyAwareness,
      desc: "Educational content on how to identify contamination and ensure the quality of your food products.",
      num: "02",
    },
    {
      icon: <Tractor className="w-7 h-7 text-primary" />,
      title: t.services.guidance,
      desc: "Practical tips for pre-harvest, harvest, and post-harvest management to minimize aflatoxin risks.",
      num: "03",
    },
    {
      icon: <GraduationCap className="w-7 h-7 text-primary" />,
      title: t.services.education,
      desc: "Tools designed for extension officers and lead farmers to spread awareness in their communities.",
      num: "04",
    },
    {
      icon: <MessagesSquare className="w-7 h-7 text-primary" />,
      title: t.services.chat,
      desc: "A conversational interface that understands your local context and provides tailored advice.",
      num: "05",
    },
  ];

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative h-[50vh] min-h-[340px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=1600&auto=format&fit=crop&q=80"
          alt="Agricultural field"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/70 to-zinc-950/30 flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full animate-fade-up">
            <div className="w-12 h-1 bg-secondary rounded-full mb-4" />
            <h1
              className="text-4xl md:text-6xl font-bold text-white mb-4"
              style={{ fontFamily: "var(--font-playfair,'Playfair Display',Georgia,serif)" }}
            >
              {t.services.title}
            </h1>
            <p className="text-lg text-zinc-300 max-w-xl">
              Explore how AflaChat leverages technology to ensure food safety and improve agricultural outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((s, i) => (
            <div
              key={i}
              className="group relative p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <span
                className="absolute top-6 right-7 text-5xl font-black text-zinc-100 dark:text-zinc-800 select-none"
                style={{ fontFamily: "var(--font-playfair,'Playfair Display',Georgia,serif)" }}
              >
                {s.num}
              </span>
              <div className="w-14 h-14 bg-accent dark:bg-primary/10 border border-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                {s.icon}
              </div>
              <h3
                className="text-xl font-bold mb-3 text-zinc-900 dark:text-zinc-50"
                style={{ fontFamily: "var(--font-playfair,'Playfair Display',Georgia,serif)" }}
              >
                {s.title}
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
