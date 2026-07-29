"use client";

import React from "react";
import { useLanguage } from "@/components/LanguageContext";

export default function Terms() {
  const { t, language } = useLanguage();
  const activeLang = language === "sw" ? "sw" : "en";

  const termsContent = {
    en: [
      {
        title: "1. Acceptance of Terms",
        desc: "By accessing and using the AflaChat application and website, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services."
      },
      {
        title: "2. AI Assistance Disclaimer",
        badge: "Important",
        desc: "AflaChat uses artificial intelligence to provide information. While we strive for accuracy, the information provided should be used for educational purposes and is not a substitute for professional agricultural or medical advice. Always verify critical safety information with local authorities."
      },
      {
        title: "3. User Conduct",
        desc: "Users agree to use AflaChat for lawful purposes related to aflatoxin and food safety information. Harassment of other users or attempts to compromise the security of our systems are strictly prohibited."
      },
      {
        title: "4. Privacy Commitment",
        desc: "We are committed to protecting your privacy as outlined in our Privacy Policy. We collect data only to improve the service and provide better guidance to our users."
      },
      {
        title: "5. Modifications of Terms",
        desc: "AflaChat reserves the right to modify these terms at any time. Continued use of the service following such changes constitutes acceptance of the new terms."
      },
      {
        title: "6. Governing Law",
        desc: "These terms are governed by the laws of the United Republic of Tanzania."
      },
      {
        title: "7. Contact Information",
        desc: "For questions regarding these terms, please contact us at:"
      }
    ],
    sw: [
      {
        title: "1. Kukubalika kwa Vigezo",
        desc: "Kwa kufikia na kutumia programu na tovuti ya AflaChat, unakubali kubanwa na Vigezo na Masharti haya. Ikiwa hukubaliani navyo, tafadhali usitumie huduma zetu."
      },
      {
        title: "2. Kanusho la Msaada wa AI",
        badge: "Muhimu",
        desc: "AflaChat hutumia akili bandia (AI) kutoa taarifa. Ingawa tunajitahidi kuwa sahihi, taarifa zinazotolewa zinapaswa kutumiwa kwa madhumuni ya kielimu pekee na sio mbadala wa ushauri wa kilimo au matibabu ya kitaalamu. Daima thibitisha taarifa muhimu za usalama na mamlaka za eneo lako."
      },
      {
        title: "3. Mwenendo wa Mtumiaji",
        desc: "Watumiaji wanakubali kutumia AflaChat kwa madhumuni halali yanayohusiana na taarifa za sumukuvu na usalama wa chakula. Unyanyasaji wa watumiaji wengine au majaribio ya kuhatarisha usalama wa mifumo yetu ni marufuku kabisa."
      },
      {
        title: "4. Ahadi ya Faragha",
        desc: "Tumejitolea kulinda faragha yako kama ilivyoainishwa kwenye Sera yetu ya Faragha. Tunakusanya data ili tu kuboresha huduma na kutoa mwongozo bora kwa watumiaji wetu."
      },
      {
        title: "5. Marekebisho ya Vigezo",
        desc: "AflaChat inahifadhi haki ya kurekebisha vigezo hivi wakati wowote. Kuendelea kutumia huduma baada ya mabadiliko hayo kunamaanisha unakubali vigezo vipya."
      },
      {
        title: "6. Sheria Inayotumika",
        desc: "Vigezo hivi vinaongozwa na sheria za Jamhuri ya Muungano wa Tanzania."
      },
      {
        title: "7. Taarifa za Mawasiliano",
        desc: "Kwa maswali yoyote kuhusu vigezo hivi, tafadhali wasiliana nasi kwa:"
      }
    ]
  }[activeLang];

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 animate-fade-up font-body">
      <div className="rule-accent mb-4" />
      <h1 className="text-4xl md:text-5xl font-bold mb-3 font-heading">{t.terms.title}</h1>
      <p className="text-zinc-500 mb-12 text-sm">{t.terms.lastUpdated}</p>
      
      <div className="prose prose-zinc max-w-none space-y-10">
        {termsContent.slice(0, 6).map((section, idx) => (
          <section key={idx}>
            <h2 className="text-2xl font-bold mb-4 font-heading flex items-center gap-2">
              {section.title}
              {section.badge && (
                <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase rounded tracking-widest font-body">
                  {section.badge}
                </span>
              )}
            </h2>
            <p className="text-zinc-600 leading-relaxed">
              {section.desc}
            </p>
          </section>
        ))}

        <section className="p-8 bg-zinc-50 rounded-3xl border border-zinc-150">
          <h2 className="text-2xl font-bold mb-4 font-heading">{termsContent[6].title}</h2>
          <p className="text-zinc-600 mb-4">
            {termsContent[6].desc}
          </p>
          <a href="mailto:chogop@nm-aist.ac.tz" className="text-primary font-bold hover:underline">chogop@nm-aist.ac.tz</a>
        </section>
      </div>
    </div>
  );
}
