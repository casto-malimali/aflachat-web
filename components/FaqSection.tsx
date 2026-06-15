"use client";

import React, { useState } from "react";
import { useLanguage } from "./LanguageContext";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function FaqSection() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqData = t.faq || { title: "FAQ", subtitle: "", items: [] };

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="texture-grain bg-paper-2 scroll-mt-24 py-28 px-6 border-t border-[var(--color-border)]">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <span className="p-3 bg-primary/10 text-primary rounded-2xl">
              <HelpCircle className="w-6 h-6" />
            </span>
          </div>
          <h2 className="display text-4xl md:text-5xl text-[var(--color-soil)] mb-4">
            {faqData.title}
          </h2>
          <p className="text-[var(--color-muted-foreground)] max-w-xl mx-auto text-base">
            {faqData.subtitle}
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {faqData.items.map((item: { q: string; a: string }, i: number) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className={`bg-white rounded-2xl border transition-all duration-300 ${
                  isOpen
                    ? "border-primary/30 shadow-lg shadow-primary/5 translate-y-[-2px]"
                    : "border-zinc-200 hover:border-zinc-300 shadow-sm"
                }`}
              >
                {/* Accordion Trigger */}
                <button
                  onClick={() => toggleFaq(i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${i}`}
                  id={`faq-question-${i}`}
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-heading focus:outline-none"
                >
                  <h3 className="text-zinc-900 font-bold text-base md:text-lg leading-snug">
                    {item.q}
                  </h3>
                  <span
                    className={`p-1.5 rounded-lg transition-all duration-300 shrink-0 ${
                      isOpen
                        ? "bg-primary text-white rotate-180"
                        : "bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>

                {/* Accordion Content */}
                <div
                  id={`faq-answer-${i}`}
                  role="region"
                  aria-labelledby={`faq-question-${i}`}
                  className={`grid transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 text-zinc-600 leading-relaxed text-sm md:text-base border-t border-zinc-100/80 pt-4">
                      {item.a}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
