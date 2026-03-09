"use client";

import React from "react";
import { useLanguage } from "@/components/LanguageContext";
import { Info, ShieldCheck, Tractor, GraduationCap, MessagesSquare } from "lucide-react";

export default function Services() {
  const { t } = useLanguage();

  const services = [
    {
      icon: <Info className="w-8 h-8 text-emerald-600" />,
      title: t.services.aiInfo,
      desc: "Instant access to a vast database of aflatoxin research and safety protocols powered by advanced AI.",
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-emerald-600" />,
      title: t.services.safetyAwareness,
      desc: "Educational content on how to identify contamination and ensure the quality of your food products.",
    },
    {
      icon: <Tractor className="w-8 h-8 text-emerald-600" />,
      title: t.services.guidance,
      desc: "Practical tips for pre-harvest, harvest, and post-harvest management to minimize aflatoxin risks.",
    },
    {
      icon: <GraduationCap className="w-8 h-8 text-emerald-600" />,
      title: t.services.education,
      desc: "Tools designed for extension officers and lead farmers to spread awareness in their communities.",
    },
    {
      icon: <MessagesSquare className="w-8 h-8 text-emerald-600" />,
      title: t.services.chat,
      desc: "A conversational interface that understands your local context and providing tailored advice.",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <div className="text-center mb-20 animate-fade-up">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6">{t.services.title}</h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          Explore how AflaChat leverages technology to ensure food safety and improve agricultural outcomes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((s, i) => (
          <div key={i} className="p-10 bg-zinc-50 dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 hover:border-emerald-200 transition-all hover:shadow-xl group animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="w-16 h-16 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform">
              {s.icon}
            </div>
            <h3 className="text-2xl font-bold mb-4">{s.title}</h3>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
              {s.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
