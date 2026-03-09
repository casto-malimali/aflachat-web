"use client";

import React from "react";
import { useLanguage } from "@/components/LanguageContext";
import { Info, ShieldCheck, Tractor, GraduationCap, MessagesSquare } from "lucide-react";

export default function Services() {
  const { t } = useLanguage();

  const services = [
    { icon: <Info            className="w-7 h-7 text-primary" />, title: t.services.aiInfo,         desc: t.services.aiInfoDesc,         num: "01" },
    { icon: <ShieldCheck     className="w-7 h-7 text-primary" />, title: t.services.safetyAwareness, desc: t.services.safetyAwarenessDesc, num: "02" },
    { icon: <Tractor         className="w-7 h-7 text-primary" />, title: t.services.guidance,        desc: t.services.guidanceDesc,        num: "03" },
    { icon: <GraduationCap   className="w-7 h-7 text-primary" />, title: t.services.education,       desc: t.services.educationDesc,       num: "04" },
    { icon: <MessagesSquare  className="w-7 h-7 text-primary" />, title: t.services.chat,            desc: t.services.chatDesc,            num: "05" },
  ];

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative h-[50vh] min-h-[340px] overflow-hidden">
        <img
          src="/images/2148761810.jpg"
          alt="Agricultural field"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-zinc-900/60 flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full animate-fade-up">
            <div className="w-12 h-1 bg-secondary rounded-full mb-4" />
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-poppins,'Poppins',system-ui,sans-serif)" }}>
              {t.services.title}
            </h1>
            <p className="text-lg text-zinc-300 max-w-xl">{t.services.subtitle}</p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((s, i) => (
            <div key={i} className="group relative p-8 bg-white rounded-2xl border border-zinc-100 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
              <span className="absolute top-6 right-7 text-5xl font-black text-zinc-100 select-none" style={{ fontFamily: "var(--font-poppins,'Poppins',system-ui,sans-serif)" }}>
                {s.num}
              </span>
              <div className="w-14 h-14 bg-accent border border-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                {s.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-zinc-900" style={{ fontFamily: "var(--font-poppins,'Poppins',system-ui,sans-serif)" }}>
                {s.title}
              </h3>
              <p className="text-zinc-600 leading-relaxed text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
