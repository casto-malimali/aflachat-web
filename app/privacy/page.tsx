"use client";

import React from "react";
import { useLanguage } from "@/components/LanguageContext";

export default function Privacy() {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 animate-fade-up">
      <h1 className="text-4xl font-extrabold mb-4">{t.privacy.title}</h1>
      <p className="text-zinc-500 mb-12">{t.privacy.lastUpdated}</p>
      
      <div className="prose prose-zinc dark:prose-invert max-w-none space-y-12">
        <section>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
            AflaChat respects your privacy and is committed to protecting the personal information of users who access and use the application. This Privacy Policy explains how information is collected, used, and protected when you use the AflaChat mobile application.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-extrabold mb-6">1. Introduction</h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            AflaChat is an AI powered mobile application designed to provide information and answers related to <strong>aflatoxin contamination, food safety, and agricultural awareness</strong>. The application assists users such as farmers, traders, students, and the general public in understanding aflatoxin risks and prevention practices.
          </p>
          <p className="text-zinc-600 dark:text-zinc-400 mt-4">
            By using the AflaChat application, you agree to the collection and use of information in accordance with this Privacy Policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-extrabold mb-6">2. Information We Collect</h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
            AflaChat may collect limited information to improve the performance and functionality of the application.
          </p>
          <div className="space-y-4">
            <h3 className="text-xl font-bold">a) Information Provided by Users</h3>
            <p className="text-zinc-600 dark:text-zinc-400">Users may voluntarily provide information when interacting with the application, including:</p>
            <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-400 space-y-2">
              <li>Questions submitted to the AI chat system</li>
              <li>Feedback or messages sent through the app</li>
              <li>Contact information if provided through communication channels</li>
            </ul>
          </div>
          <div className="space-y-4 mt-6">
            <h3 className="text-xl font-bold">b) Automatically Collected Information</h3>
            <p className="text-zinc-600 dark:text-zinc-400">The application may automatically collect certain technical information, such as:</p>
            <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-400 space-y-2">
              <li>Device type</li>
              <li>Operating system version</li>
              <li>App usage data</li>
              <li>Error logs and performance information</li>
            </ul>
            <p className="text-zinc-600 dark:text-zinc-400 italic">This information helps improve the reliability and performance of the application.</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-extrabold mb-6">3. How We Use the Information</h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
            The information collected may be used for the following purposes:
          </p>
          <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-400 space-y-2">
            <li>To provide AI powered responses and information</li>
            <li>To improve the functionality and accuracy of the application</li>
            <li>To analyze usage trends and improve user experience</li>
            <li>To identify and resolve technical issues</li>
          </ul>
          <p className="text-zinc-600 dark:text-zinc-400 mt-6 font-medium">
            AflaChat does not use personal information for advertising or commercial marketing purposes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-extrabold mb-6">4. Data Protection</h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            We take appropriate measures to protect user information from unauthorized access, misuse, or disclosure. Technical and administrative safeguards are used to maintain the security and integrity of the application.
          </p>
          <p className="text-zinc-600 dark:text-zinc-400 mt-4 italic">
            However, no digital platform can guarantee complete security, and users should use the application responsibly.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-extrabold mb-6">5. AI Information Disclaimer</h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            The responses provided by AflaChat are generated using artificial intelligence technology. The information is intended for <strong>educational and informational purposes only</strong>.
          </p>
          <p className="text-zinc-600 dark:text-zinc-400 mt-4 font-medium text-secondary">
            Users should not rely solely on the AI responses for professional, scientific, medical, or legal decisions.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-extrabold mb-6">6. Third Party Services</h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            AflaChat may use certain third party services that help operate and improve the application. These services may collect limited technical data necessary for application functionality.
          </p>
          <p className="text-zinc-600 dark:text-zinc-400 mt-4">
            Such services follow their own privacy and data protection policies.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-extrabold mb-6">7. Children&apos;s Privacy</h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            AflaChat does not knowingly collect personal information from children under the age of 13. If we become aware that such information has been provided, we will take appropriate steps to remove it.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-extrabold mb-6">8. Changes to This Privacy Policy</h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            We may update this Privacy Policy from time to time. Any updates will be posted within the application or on the official AflaChat website.
          </p>
          <p className="text-zinc-600 dark:text-zinc-400 mt-4">
            Continued use of the application after changes means you accept the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-extrabold mb-6">9. Contact Information</h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            If you have any questions or concerns regarding this Privacy Policy, please contact us at:
          </p>
          <p className="text-zinc-600 dark:text-zinc-400 mt-4">
            <strong>Email:</strong> <a href="mailto:pamsekela@gmail.com" className="text-primary hover:underline">pamsekela@gmail.com</a>
          </p>
        </section>

        <section className="bg-zinc-50 dark:bg-zinc-900/50 p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800">
          <h2 className="text-2xl font-extrabold mb-6">10. Consent</h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            By using the AflaChat application, you agree to the terms of this Privacy Policy.
          </p>
        </section>
      </div>
    </div>
  );
}
