"use client";

import { useLanguage } from "@/components/LanguageContext";
import PlayStoreButton from "@/components/PlayStoreButton";
import { Shield, Zap, BookOpen, MessageCircle, ArrowRight } from "lucide-react";

export default function Home() {
  const { t } = useLanguage();

  const features = [
    {
      icon: <MessageCircle className="w-6 h-6 text-secondary" />,
      title: t.howItWorks.step1.title,
      desc: t.howItWorks.step1.desc,
    },
    {
      icon: <Zap className="w-6 h-6 text-secondary" />,
      title: t.howItWorks.step2.title,
      desc: t.howItWorks.step2.desc,
    },
    {
      icon: <Shield className="w-6 h-6 text-secondary" />,
      title: t.howItWorks.step3.title,
      desc: t.howItWorks.step3.desc,
    },
  ];

  const benefits = [
    t.benefits.item1,
    t.benefits.item2,
    t.benefits.item3,
    t.benefits.item4,
  ];

  return (
    <div className="flex flex-col gap-24 pb-20">
      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-12 overflow-hidden">
        <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-gradient-to-l from-secondary/10 to-transparent rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 text-center md:text-left animate-fade-up">
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-wider uppercase text-primary bg-accent rounded-full border border-primary/10">
              {t.hero.welcome}
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] mb-8 tracking-tight text-zinc-900 dark:text-zinc-50">
              {t.hero.headline.split("Against").map((part, idx) => (
                <span key={idx} className={idx === 1 ? "text-gradient block" : ""}>
                   {idx === 1 ? `Against ${part}` : part}
                </span>
              ))}
            </h1>
            <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-10 leading-relaxed max-w-2xl">
              {t.hero.description}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center md:justify-start">
              <PlayStoreButton />
              <button className="flex items-center gap-2 font-bold text-zinc-600 hover:text-primary transition-colors group">
                Learn how it works
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
          <div className="flex-1 relative animate-fade-up [animation-delay:200ms]">
            <div className="w-[300px] h-[600px] bg-zinc-900 rounded-[3rem] border-8 border-zinc-800 shadow-2xl overflow-hidden relative mx-auto">
                {/* Mock UI */}
                <div className="p-6 h-full flex flex-col">
                  <div className="w-full h-4 bg-zinc-800 rounded-full mb-8 flex justify-center items-center">
                    <div className="w-12 h-2 bg-zinc-700 rounded-full" />
                  </div>
                  <div className="flex-1 space-y-4">
                     <div className="bg-emerald-600/20 p-4 rounded-2xl rounded-tl-none mr-8">
                        <p className="text-xs text-white/90">Hello! I&apos;m AflaChat. How can I help you today with Aflatoxin safety?</p>
                     </div>
                     <div className="bg-zinc-800 p-4 rounded-2xl rounded-tr-none ml-8">
                        <p className="text-xs text-zinc-400">What are the best drying methods for maize to prevent aflatoxin?</p>
                     </div>
                     <div className="bg-emerald-600 p-4 rounded-2xl rounded-tl-none mr-8">
                        <p className="text-xs text-white">To prevent aflatoxin in maize, ensure rapid drying to below 13.5% moisture content...</p>
                     </div>
                  </div>
                  <div className="mt-auto h-12 bg-zinc-800 rounded-xl flex items-center px-4">
                    <div className="w-1/2 h-2 bg-zinc-700 rounded-full" />
                  </div>
                </div>
            </div>
            {/* Floating elements */}
            <div className="absolute top-1/4 -left-12 p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 animate-bounce [animation-duration:3s]">
               <Shield className="text-emerald-600" />
            </div>
            <div className="absolute bottom-1/4 -right-8 p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 animate-bounce [animation-duration:4s]">
               <BookOpen className="text-emerald-600" />
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="max-w-7xl mx-auto px-6 w-full">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">{t.howItWorks.title}</h2>
          <div className="h-1.5 w-24 bg-primary mx-auto rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {features.map((f, i) => (
            <div key={i} className="group p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 hover:border-emerald-200 transition-all hover:shadow-2xl hover:shadow-emerald-500/10">
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mb-6 border border-emerald-100 dark:border-emerald-800 group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold mb-4">{f.title}</h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-primary text-white py-24 px-6 overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-secondary to-transparent" />
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 relative z-10">
          <div className="flex-1">
            <h2 className="text-4xl font-bold mb-12">{t.benefits.title}</h2>
            <div className="space-y-6">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                  <div className="mt-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium">{b}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 text-center bg-white/10 p-12 rounded-[3rem] border border-white/20 backdrop-blur-md">
            <h3 className="text-3xl font-extrabold mb-6">Join thousands of safer farmers today.</h3>
            <p className="mb-10 text-emerald-100 text-lg">
              Start chatting with AflaChat and protect your harvest.
            </p>
            <PlayStoreButton />
          </div>
        </div>
      </section>
    </div>
  );
}
