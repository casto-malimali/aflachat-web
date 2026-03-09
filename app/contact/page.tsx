"use client";

import React, { useState } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";

export default function Contact() {
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <div className="mb-16 animate-fade-up">
        <div className="w-12 h-1 bg-primary rounded-full mb-4" />
        <h1 className="text-4xl md:text-6xl font-bold mb-6" style={{ fontFamily: "var(--font-poppins,'Poppins',system-ui,sans-serif)" }}>{t.contact.title}</h1>
        <p className="text-xl text-zinc-600 -zinc-400 max-w-2xl">
          {t.contact.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Contact Info */}
        <div className="space-y-12 animate-fade-up [animation-delay:100ms]">
          <div className="space-y-8">
            <h2 className="text-3xl font-bold mb-8" style={{ fontFamily: "var(--font-poppins,'Poppins',system-ui,sans-serif)" }}>{t.contact.getInTouch}</h2>
            <div className="flex items-start gap-6 group">
              <div className="p-4 bg-accent -primary/20 text-primary rounded-2xl group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">{t.contact.email}</h4>
                <a href="mailto:pamsekela@gmail.com" className="text-zinc-600 -zinc-400 hover:text-primary transition-colors">
                  pamsekela@gmail.com
                </a>
              </div>
            </div>
            
            <div className="flex items-start gap-6 group">
              <div className="p-4 bg-accent -primary/20 text-primary rounded-2xl group-hover:scale-110 transition-transform">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">{t.contact.phone}</h4>
                <p className="text-zinc-600 -zinc-400">+255 7XX XXX XXX</p>
              </div>
            </div>

            <div className="flex items-start gap-6 group">
              <div className="p-4 bg-accent -primary/20 text-primary rounded-2xl group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">{t.contact.organization}</h4>
                <p className="text-zinc-600 -zinc-400">{t.contact.location}</p>
              </div>
            </div>
          </div>

          <div className="p-8 bg-primary text-white rounded-2xl relative overflow-hidden border border-primary/50">
             <div className="absolute top-0 right-0 w-40 h-40 bg-secondary/20 rounded-full blur-[60px]" />
             <h3 className="text-xl font-bold mb-3" style={{ fontFamily: "var(--font-poppins,'Poppins',system-ui,sans-serif)" }}>{t.contact.langSupport}</h3>
             <p className="text-emerald-100 mb-6 text-sm">{t.contact.langSupportDesc}</p>
             <div className="flex gap-3">
                <span className="px-4 py-1.5 bg-white/15 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20 flex items-center gap-2">
                  <img src="/images/US-UK_Flag.svg" alt="English" className="w-4 h-3 object-cover rounded-sm" />
                  English
                </span>
                <span className="px-4 py-1.5 bg-white/15 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20 flex items-center gap-2">
                  <img src="/images/tz-flag.svg" alt="Swahili" className="w-4 h-3 object-cover rounded-sm" />
                  Kiswahili
                </span>
             </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white -zinc-900 p-8 md:p-12 rounded-[2.5rem] border border-zinc-100 -zinc-800 shadow-xl animate-fade-up [animation-delay:200ms]">
          {submitted ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-6">
              <div className="w-20 h-20 bg-accent -primary/20 text-primary rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold">{t.contact.success}</h3>
              <p className="text-zinc-500">{t.contact.successDesc}</p>
              <button 
                onClick={() => setSubmitted(false)}
                className="text-primary font-bold hover:underline"
              >
                {t.contact.sendAnother}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-widest text-zinc-500 px-1">{t.contact.formName}</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-6 py-4 bg-zinc-50 -zinc-800 rounded-2xl border-none focus:ring-2 focus:ring-primary transition-all text-lg" 
                   placeholder={t.contact.formNamePlaceholder}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-widest text-zinc-500 px-1">{t.contact.formEmail}</label>
                <input 
                  required
                  type="email" 
                  className="w-full px-6 py-4 bg-zinc-50 -zinc-800 rounded-2xl border-none focus:ring-2 focus:ring-primary transition-all text-lg" 
                   placeholder={t.contact.formEmailPlaceholder}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-widest text-zinc-500 px-1">{t.contact.formMessage}</label>
                <textarea 
                  required
                  rows={4}
                  className="w-full px-6 py-4 bg-zinc-50 -zinc-800 rounded-2xl border-none focus:ring-2 focus:ring-primary transition-all text-lg resize-none" 
                   placeholder={t.contact.formMessagePlaceholder}
                ></textarea>
              </div>
              <button 
                type="submit"
                className="w-full py-5 bg-primary text-white font-bold text-xl rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-xl flex items-center justify-center gap-3"
              >
                {t.contact.formSubmit}
                <Send className="w-5 h-5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
