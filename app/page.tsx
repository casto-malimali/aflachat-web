"use client";

import { useLanguage } from "@/components/LanguageContext";
import PlayStoreButton from "@/components/PlayStoreButton";
import { Shield, Zap, MessageCircle, ArrowRight, CheckCircle2, Tractor, Sprout, GraduationCap, HeartPulse, Store } from "lucide-react";

export default function Home() {
  const { t } = useLanguage();

  const features = [
    { icon: <MessageCircle className="w-6 h-6 text-primary" />, title: t.howItWorks.step1.title, desc: t.howItWorks.step1.desc, step: "01" },
    { icon: <Zap           className="w-6 h-6 text-primary" />, title: t.howItWorks.step2.title, desc: t.howItWorks.step2.desc, step: "02" },
    { icon: <Shield        className="w-6 h-6 text-primary" />, title: t.howItWorks.step3.title, desc: t.howItWorks.step3.desc, step: "03" },
  ];

  const benefits = [t.benefits.item1, t.benefits.item2, t.benefits.item3, t.benefits.item4];

  return (
    <div className="flex flex-col">
      {/* ── Hero ── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src="/images/2148761810.jpg" alt="Maize field" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-zinc-900/60" />
        </div>
        <div className="max-w-7xl mx-auto px-6 py-24 w-full">
          <div className="max-w-2xl animate-fade-up">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 text-xs font-bold tracking-widest uppercase text-secondary bg-secondary/10 border border-secondary/20 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              {t.hero.welcome}
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6" style={{ fontFamily: "var(--font-poppins,'Poppins',system-ui,sans-serif)" }}>
              AI-Powered<br />
              <span className="text-gradient">Protection</span><br />
              Against Aflatoxin
            </h1>
            <p className="text-lg text-zinc-300 mb-10 leading-relaxed max-w-xl">{t.hero.description}</p>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <PlayStoreButton />
              <button className="flex items-center gap-2 text-white font-semibold hover:text-secondary transition-colors group mt-1">
                {t.hero.learnHow}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
        {/* Stat cards */}
        <div className="hidden lg:flex absolute right-12 top-1/2 -translate-y-1/2 flex-col gap-4">
          {[
            { val: "24/7", label: t.hero.statAi },
            { val: "🇬🇧🇹🇿", label: t.hero.statLanguage },
            { val: t.hero.statFree, label: t.hero.statFreeLabel },
          ].map((s, i) => (
            <div key={i} className="bg-white px-6 py-4 rounded-2xl shadow-xl border border-zinc-100 animate-fade-up" style={{ animationDelay: `${300 + i * 150}ms` }}>
              <p className="text-3xl font-bold text-primary" style={{ fontFamily: "var(--font-poppins,'Poppins',system-ui,sans-serif)" }}>{s.val}</p>
              <p className="text-sm text-zinc-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-28 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <div className="w-12 h-1 bg-primary rounded-full mb-4" />
            <h2 className="text-4xl md:text-5xl font-bold text-zinc-900" style={{ fontFamily: "var(--font-poppins,'Poppins',system-ui,sans-serif)" }}>
              {t.howItWorks.title}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="group relative p-8 bg-zinc-50 rounded-2xl border border-zinc-100 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                <span className="absolute top-6 right-8 text-6xl font-black text-zinc-100 select-none" style={{ fontFamily: "var(--font-poppins,'Poppins',system-ui,sans-serif)" }}>{f.step}</span>
                <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-6 border border-primary/10 group-hover:bg-primary/10 transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-zinc-900">{f.title}</h3>
                <p className="text-zinc-600 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quote Banner ── */}
      <section className="relative h-80 overflow-hidden">
        <img src="/images/2149142834.jpg" alt="Farmers in field" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-primary/60 flex items-center justify-center">
          <div className="text-center text-white px-6">
            <p className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-poppins,'Poppins',system-ui,sans-serif)" }}>{t.quote.text}</p>
            <p className="text-emerald-200 text-sm tracking-widest uppercase">— {t.quote.author}</p>
          </div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="py-28 px-6 bg-zinc-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <div className="w-12 h-1 bg-secondary rounded-full mb-4" />
              <h2 className="text-4xl md:text-5xl font-bold mb-10 text-zinc-900" style={{ fontFamily: "var(--font-poppins,'Poppins',system-ui,sans-serif)" }}>
                {t.benefits.title}
              </h2>
              <div className="space-y-5">
                {benefits.map((b, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className="mt-1 w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-zinc-700 leading-relaxed font-medium">{b}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img src="/images/41468.jpg" alt="Farmer with mobile phone" className="w-full h-96 object-cover" />
                <div className="absolute inset-0 bg-zinc-900/60 flex flex-col justify-end p-8">
                  <h3 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-poppins,'Poppins',system-ui,sans-serif)" }}>{t.benefits.cta}</h3>
                  <p className="text-emerald-100 mb-6 text-sm">{t.benefits.ctaDesc}</p>
                  <PlayStoreButton />
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 -z-10 w-full h-full rounded-3xl bg-primary/10 border border-primary/10" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Bar ── */}
      <section className="py-20 px-6 bg-zinc-50 -zinc-950/50 border-t border-zinc-100 -zinc-800">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-10">{t.trustBar.label}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {t.trustBar.items.map((item, i) => {
              const icons = [
                <Tractor key="agri" className="w-8 h-8" />,
                <Sprout key="farm" className="w-8 h-8" />,
                <GraduationCap key="edu" className="w-8 h-8" />,
                <HeartPulse key="health" className="w-8 h-8" />,
                <Store key="trade" className="w-8 h-8" />
              ];
              return (
                <div key={i} className="flex flex-col items-center justify-center gap-4 bg-white -zinc-900 p-8 rounded-[2rem] shadow-sm border border-zinc-100 -zinc-800 group hover:shadow-xl hover:-translate-y-2 hover:border-primary/30 transition-all duration-300">
                  <div className="p-4 bg-accent -primary/20 text-primary rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    {icons[i]}
                  </div>
                  <span className="text-zinc-800 -zinc-200 font-bold text-lg tracking-tight text-center leading-tight">{item}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
