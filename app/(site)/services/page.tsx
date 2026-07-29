"use client";

import React from "react";
import { useLanguage } from "@/components/LanguageContext";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { Button } from "@/components/ui/Button";
import { Info, ShieldCheck, Tractor, GraduationCap, MessagesSquare, MessageCircle } from "lucide-react";

export default function Services() {
  const { t, language } = useLanguage();
  const askLabel = language === "sw" ? "Ongea na Msaidizi" : "Talk to the Assistant";

  const services = [
    { icon: <Info            className="w-6 h-6" />, title: t.services.aiInfo,         desc: t.services.aiInfoDesc,         num: "01" },
    { icon: <ShieldCheck     className="w-6 h-6" />, title: t.services.safetyAwareness, desc: t.services.safetyAwarenessDesc, num: "02" },
    { icon: <Tractor         className="w-6 h-6" />, title: t.services.guidance,        desc: t.services.guidanceDesc,        num: "03" },
    { icon: <GraduationCap   className="w-6 h-6" />, title: t.services.education,       desc: t.services.educationDesc,       num: "04" },
    { icon: <MessagesSquare  className="w-6 h-6" />, title: t.services.chat,            desc: t.services.chatDesc,            num: "05" },
  ];

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative h-[50vh] min-h-[340px] overflow-hidden">
        <img
          src="/images/2148761810.jpg"
          alt="AflaChat agricultural field representing safe farming practices and aflatoxin prevention"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-zinc-900/60 flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full animate-fade-up">
            <div className="rule-accent mb-4 bg-secondary" />
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
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
            <FeatureCard key={i} icon={s.icon} title={s.title} desc={s.desc} num={s.num} />
          ))}
        </div>

        {/* Closing CTA — opens the AflaChat assistant via the public event */}
        <div className="mt-12 flex flex-col items-center gap-5 rounded-2xl bg-primary px-6 py-12 text-center text-primary-foreground">
          <h2 className="font-heading text-2xl font-bold md:text-3xl">{t.services.chat}</h2>
          <p className="max-w-xl text-sm text-emerald-100">{t.services.chatDesc}</p>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => window.dispatchEvent(new Event("aflachat:open"))}
          >
            <MessageCircle className="h-5 w-5" aria-hidden />
            {askLabel}
          </Button>
        </div>
      </section>
    </div>
  );
}
