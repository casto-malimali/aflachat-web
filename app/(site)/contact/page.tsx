"use client";

import React, { useState } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { submitContact } from "@/lib/contactApi";

export default function Contact() {
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSubmitting(true);
    setError(null);
    try {
      await submitContact({
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        message: String(form.get("message") ?? ""),
      });
      setSubmitted(true);
    } catch (err) {
      setError((err as Error).message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <div className="mb-16 animate-fade-up">
        <div className="rule-accent mb-4" />
        <h1 className="text-4xl md:text-6xl font-bold mb-6">{t.contact.title}</h1>
        <p className="text-xl text-zinc-600 max-w-2xl">
          {t.contact.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Contact Info */}
        <div className="space-y-12 animate-fade-up [animation-delay:100ms]">
          <div className="space-y-8">
            <h2 className="text-3xl font-bold mb-8">{t.contact.getInTouch}</h2>
            <div className="flex items-start gap-6 group">
              <div className="p-4 bg-accent text-primary rounded-2xl group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">{t.contact.email}</h4>
                <a href="mailto:chogop@nm-aist.ac.tz" className="text-zinc-600 hover:text-primary transition-colors">
                  chogop@nm-aist.ac.tz
                </a>
              </div>
            </div>
            
            <div className="flex items-start gap-6 group">
              <div className="p-4 bg-accent text-primary rounded-2xl group-hover:scale-110 transition-transform">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">{t.contact.phone}</h4>
                <p className="text-zinc-600"><a href="tel:+255759334659" className="text-zinc-600 hover:text-primary transition-colors">+255 759 334 659</a></p>
              </div>
            </div>

            <div className="flex items-start gap-6 group">
              <div className="p-4 bg-accent text-primary rounded-2xl group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">{t.contact.organization}</h4>
                <p className="text-zinc-600">{t.contact.location}</p>
              </div>
            </div>
          </div>

          <div className="p-8 bg-primary text-white rounded-2xl relative overflow-hidden border border-primary/50">
             <div className="absolute top-0 right-0 w-40 h-40 bg-secondary/20 rounded-full blur-[60px]" />
             <h3 className="text-xl font-bold mb-3">{t.contact.langSupport}</h3>
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
        <div className="bg-surface p-8 md:p-12 rounded-[2.5rem] border border-border shadow-xl animate-fade-up [animation-delay:200ms]">
          {submitted ? (
            <div role="status" aria-live="polite" className="h-full flex flex-col items-center justify-center text-center py-12 space-y-6">
              <div className="w-20 h-20 bg-accent text-primary rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold">{t.contact.success}</h3>
              <p className="text-muted-foreground">{t.contact.successDesc}</p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-primary font-bold hover:underline"
              >
                {t.contact.sendAnother}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Field label={t.contact.formName}>
                {(props) => (
                  <Input {...props} name="name" required type="text" placeholder={t.contact.formNamePlaceholder} />
                )}
              </Field>
              <Field label={t.contact.formEmail}>
                {(props) => (
                  <Input {...props} name="email" required type="email" placeholder={t.contact.formEmailPlaceholder} />
                )}
              </Field>
              <Field label={t.contact.formMessage}>
                {(props) => (
                  <Textarea {...props} name="message" required rows={4} placeholder={t.contact.formMessagePlaceholder} />
                )}
              </Field>
              {error && (
                <p role="alert" className="rounded-xl bg-error/10 px-4 py-3 text-sm text-error">
                  {error}
                </p>
              )}
              <Button type="submit" size="lg" loading={submitting} className="w-full text-lg">
                {t.contact.formSubmit}
                <Send className="w-5 h-5" aria-hidden />
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
