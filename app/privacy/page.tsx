"use client";

import React from "react";
import { useLanguage } from "@/components/LanguageContext";

export default function Privacy() {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 animate-fade-up">
      <h1 className="text-4xl font-extrabold mb-4">{t.privacy.title}</h1>
      <p className="text-zinc-500 mb-12">{t.privacy.lastUpdated}</p>
      
      <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">What information is collected</h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            AflaChat collects minimal information necessary to provide our AI services. This includes chat logs for improving our AI model, basic device information for compatibility, and voluntary contact information if you reach out to us.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">How user data is used</h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Your data is primarily used to provide immediate answers to your queries. We use anonymized chat data to train our AI model to better understand local agricultural contexts and improve the accuracy of our recommendations.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">How data is protected</h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            We implement industry-standard security measures to protect your data from unauthorized access. Communication between your device and our servers is encrypted using SSL/TLS protocols.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">User rights and privacy protection</h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Users have the right to request deletion of their data at any time. We do not sell or share your personal information with third-party advertisers. Your privacy is our priority as we work together towards food safety.
          </p>
        </section>
      </div>
    </div>
  );
}
