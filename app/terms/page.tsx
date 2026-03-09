"use client";

import React from "react";
import { useLanguage } from "@/components/LanguageContext";

export default function Terms() {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 animate-fade-up">
      <h1 className="text-4xl font-extrabold mb-4">{t.terms.title}</h1>
      <p className="text-zinc-500 mb-12">{t.terms.lastUpdated}</p>
      
      <div className="prose prose-zinc dark:prose-invert max-w-none space-y-10">
        <section>
          <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            By accessing and using the AflaChat application and website, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            2. AI Assistance Disclaimer
            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase rounded tracking-widest">Important</span>
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            AflaChat uses artificial intelligence to provide information. While we strive for accuracy, the information provided should be used for educational purposes and is not a substitute for professional agricultural or medical advice. Always verify critical safety information with local authorities.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">3. User Conduct</h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Users agree to use AflaChat for lawful purposes related to aflatoxin and food safety information. Harassment of other users or attempts to compromise the security of our systems are strictly prohibited.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">4. Privacy Commitment</h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            We are committed to protecting your privacy as outlined in our Privacy Policy. We collect data only to improve the service and provide better guidance to our users.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">5. Modifications of Terms</h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            AflaChat reserves the right to modify these terms at any time. Continued use of the service following such changes constitutes acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">6. Governing Law</h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            These terms are governed by the laws of the United Republic of Tanzania.
          </p>
        </section>

        <section className="p-8 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800">
          <h2 className="text-2xl font-bold mb-4">7. Contact Information</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            For questions regarding these terms, please contact us at:
          </p>
          <a href="mailto:pamsekela@gmail.com" className="text-primary font-bold hover:underline">pamsekela@gmail.com</a>
        </section>
      </div>
    </div>
  );
}
