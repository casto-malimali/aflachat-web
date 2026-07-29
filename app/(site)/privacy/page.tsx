"use client";

import React from "react";
import { useLanguage } from "@/components/LanguageContext";

export default function Privacy() {
  const { t, language } = useLanguage();
  const activeLang = language === "sw" ? "sw" : "en";

  const content = {
    en: {
      lead: "AflaChat respects your privacy and is committed to protecting the personal information of users who access and use the application. This Privacy Policy explains how information is collected, used, and protected when you use the AflaChat mobile application.",
      sections: [
        {
          title: "1. Introduction",
          paragraphs: [
            "AflaChat is an AI powered mobile application designed to provide information and answers related to aflatoxin contamination, food safety, and agricultural awareness. The application assists users such as farmers, traders, and the general public in understanding aflatoxin risks and prevention practices.",
            "By using the AflaChat application, you agree to the collection and use of information in accordance with this Privacy Policy."
          ]
        },
        {
          title: "2. Information We Collect",
          paragraphs: [
            "AflaChat may collect limited information to improve the performance and functionality of the application."
          ],
          subsections: [
            {
              subtitle: "a) Information Provided by Users",
              desc: "Users may voluntarily provide information when interacting with the application, including:",
              bullets: [
                "Questions submitted to the AI chat system",
                "Feedback or messages sent through the app",
                "Contact information if provided through communication channels"
              ]
            },
            {
              subtitle: "b) Automatically Collected Information",
              desc: "The application may automatically collect certain technical information, such as:",
              bullets: [
                "Device type",
                "Operating system version",
                "App usage data",
                "Error logs and performance information"
              ],
              footer: "This information helps improve the reliability and performance of the application."
            }
          ]
        },
        {
          title: "3. How We Use the Information",
          paragraphs: [
            "The information collected may be used for the following purposes:"
          ],
          bullets: [
            "To provide AI powered responses and information",
            "To improve the functionality and accuracy of the application",
            "To analyze usage trends and improve user experience",
            "To identify and resolve technical issues"
          ],
          footer: "AflaChat does not use personal information for advertising or commercial marketing purposes."
        },
        {
          title: "4. Data Protection",
          paragraphs: [
            "We take appropriate measures to protect user information from unauthorized access, misuse, or disclosure. Technical and administrative safeguards are used to maintain the security and integrity of the application.",
            "However, no digital platform can guarantee complete security, and users should use the application responsibly."
          ]
        },
        {
          title: "5. AI Information Disclaimer",
          paragraphs: [
            "The responses provided by AflaChat are generated using artificial intelligence technology. The information is intended for educational and informational purposes only."
          ],
          footer: "Users should not rely solely on the AI responses for professional, scientific, medical, or legal decisions."
        },
        {
          title: "6. Third Party Services",
          paragraphs: [
            "AflaChat may use certain third party services that help operate and improve the application. These services may collect limited technical data necessary for application functionality.",
            "Such services follow their own privacy and data protection policies."
          ]
        },
        {
          title: "7. Children's Privacy",
          paragraphs: [
            "AflaChat does not knowingly collect personal information from children under the age of 13. If we become aware that such information has been provided, we will take appropriate steps to remove it."
          ]
        },
        {
          title: "8. Changes to This Privacy Policy",
          paragraphs: [
            "We may update this Privacy Policy from time to time. Any updates will be posted within the application or on the official AflaChat website.",
            "Continued use of the application after changes means you accept the updated policy."
          ]
        },
        {
          title: "9. Contact Information",
          paragraphs: [
            "If you have any questions or concerns regarding this Privacy Policy, please contact us at:"
          ]
        },
        {
          title: "10. Consent",
          paragraphs: [
            "By using the AflaChat application, you agree to the terms of this Privacy Policy."
          ]
        }
      ]
    },
    sw: {
      lead: "AflaChat inaheshimu faragha yako na imejitolea kulinda taarifa binafsi za watumiaji wanaofikia na kutumia programu hii. Sera hii ya Faragha inaeleza jinsi taarifa zinavyokusanywa, kutumiwa na kulindwa unapotumia programu ya simu ya AflaChat.",
      sections: [
        {
          title: "1. Utangulizi",
          paragraphs: [
            "AflaChat ni programu ya simu ya mkononi inayotumia akili bandia (AI) iliyoundwa ili kutoa taarifa na majibu yanayohusiana na sumukuvu (aflatoxin), usalama wa chakula, na uelewa wa kilimo. Programu hii inasaidia watumiaji kama vile wakulima, wafanyabiashara, na jamii kwa ujumla katika kuelewa hatari za sumukuvu na mbinu za kuzuia.",
            "Kwa kutumia programu ya AflaChat, unakubaliana na ukusanyaji na matumizi ya taarifa kwa mujibu wa Sera hii ya Faragha."
          ]
        },
        {
          title: "2. Taarifa Tunazokusanya",
          paragraphs: [
            "AflaChat inaweza kukusanya taarifa chache ili kuboresha utendaji na ufanisi wa programu."
          ],
          subsections: [
            {
              subtitle: "a) Taarifa Zinazotolewa na Watumiaji",
              desc: "Watumiaji wanaweza kutoa taarifa kwa hiari wanapoingiliana na programu, ikijumuisha:",
              bullets: [
                "Maswali yaliyowasilishwa kwenye mfumo wa chat ya AI",
                "Maoni au ujumbe uliotumwa kupitia programu",
                "Taarifa za mawasiliano zikitolewa kupitia njia za mawasiliano"
              ]
            },
            {
              subtitle: "b) Taarifa Zinazokusanywa Kiotomatiki",
              desc: "Programu inaweza kukusanya kiotomatiki taarifa fulani za kiufundi, kama vile:",
              bullets: [
                "Aina ya kifaa",
                "Toleo la mfumo wa uendeshaji",
                "Data ya matumizi ya programu",
                "Kumbukumbu za makosa na taarifa za utendaji"
              ],
              footer: "Taarifa hizi husaidia kuboresha uaminifu na utendaji wa programu."
            }
          ]
        },
        {
          title: "3. Jinsi Tunavyotumia Taarifa",
          paragraphs: [
            "Taarifa zinazokusanywa zinaweza kutumika kwa madhumuni yafuatayo:"
          ],
          bullets: [
            "Kutoa majibu na taarifa zinazotokana na AI",
            "Kuboresha utendaji na usahihi wa programu",
            "Kuchambua mienendo ya matumizi na kuboresha uzoefu wa mtumiaji",
            "Kutambua na kutatua masuala ya kiufundi"
          ],
          footer: "AflaChat haitumii taarifa binafsi kwa ajili ya matangazo au madhumuni ya biashara ya kibiashara."
        },
        {
          title: "4. Ulinzi wa Data",
          paragraphs: [
            "Tunachukua hatua zinazofaa ili kulinda taarifa za watumiaji dhidi ya ufikiaji usioidhinishwa, matumizi mabaya, au ufichuzi. Ulinzi wa kiufundi na kiutawala hutumiwa kudumisha usalama na uadilifu wa programu.",
            "Hata hivyo, hakuna jukwaa la kidijitali linaloweza kuhakikisha usalama kamili, na watumiaji wanapaswa kutumia programu kwa uwajibikaji."
          ]
        },
        {
          title: "5. Kanusho la Taarifa za AI",
          paragraphs: [
            "Majibu yanayotolewa na AflaChat yanazalishwa kwa kutumia teknolojia ya akili bandia. Taarifa hii imekusudiwa kwa madhumuni ya kielimu na habari pekee."
          ],
          footer: "Watumiaji hawapaswi kutegemea majibu ya AI pekee kwa maamuzi ya kitaalamu, kisayansi, matibabu au kisheria."
        },
        {
          title: "6. Huduma za Wahusika Wengine",
          paragraphs: [
            "AflaChat inaweza kutumia huduma fulani za wahusika wengine zinazosaidia kuendesha na kuboresha programu. Huduma hizi zinaweza kukusanya data chache za kiufundi zinazohitajika kwa utendaji wa programu.",
            "Huduma hizo hufuata sera zao wenyewe za faragha na ulinzi wa data."
          ]
        },
        {
          title: "7. Faragha ya Watoto",
          paragraphs: [
            "AflaChat haikusanyi kwa makusudi taarifa binafsi kutoka kwa watoto walio chini ya umri wa miaka 13. Tukigundua kuwa taarifa hizo zimetolewa, tutachukua hatua zinazofaa kuziondoa."
          ]
        },
        {
          title: "8. Mabadiliko kwenye Sera hii ya Faragha",
          paragraphs: [
            "Tunaweza kusasisha Sera hii ya Faragha mara kwa mara. Sasisho lolote litachapishwa ndani ya programu au kwenye tovuti rasmi ya AflaChat.",
            "Kuendelea kutumia programu baada ya mabadiliko inamaanisha unakubali sera iliyosasishwa."
          ]
        },
        {
          title: "9. Taarifa za Mawasiliano",
          paragraphs: [
            "Ikiwa una maswali au wasiwasi wowote kuhusu Sera hii ya Faragha, tafadhali wasiliana nasi kwa:"
          ]
        },
        {
          title: "10. Ridhaa (Consent)",
          paragraphs: [
            "Kwa kutumia programu ya AflaChat, unakubaliana na masharti ya Sera hii ya Faragha."
          ]
        }
      ]
    }
  }[activeLang];

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 animate-fade-up font-body">
      <div className="rule-accent mb-4" />
      <h1 className="text-4xl md:text-5xl font-bold mb-3 font-heading">{t.privacy.title}</h1>
      <p className="text-zinc-500 mb-12 text-sm">{t.privacy.lastUpdated}</p>
      
      <div className="prose prose-zinc max-w-none space-y-12">
        <section>
          <p className="text-zinc-600 leading-relaxed text-lg">
            {content.lead}
          </p>
        </section>

        {content.sections.map((section, idx) => (
          <section key={idx} className={idx === 9 ? "bg-zinc-50 p-8 rounded-3xl border border-zinc-150" : ""}>
            <h2 className="text-2xl font-extrabold mb-6 font-heading">{section.title}</h2>
            
            {section.paragraphs?.map((p, pIdx) => (
              <p key={pIdx} className="text-zinc-600 leading-relaxed mt-4 first:mt-0">
                {/* Format highlighted keywords */}
                {p.includes("aflatoxin contamination") ? (
                  <>
                    AflaChat is an AI powered mobile application designed to provide information and answers related to <strong>aflatoxin contamination, food safety, and agricultural awareness</strong>. The application assists users such as farmers, traders, and the general public in understanding aflatoxin risks and prevention practices.
                  </>
                ) : p.includes("sumukuvu") ? (
                  <>
                    AflaChat ni programu ya simu ya mkononi inayotumia akili bandia (AI) iliyoundwa ili kutoa taarifa na majibu yanayohusiana na <strong>sumukuvu (aflatoxin), usalama wa chakula, na uelewa wa kilimo</strong>. Programu hii inasaidia watumiaji kama vile wakulima, wafanyabiashara, na jamii kwa ujumla katika kuelewa hatari za sumukuvu na mbinu za kuzuia.
                  </>
                ) : p.includes("educational and informational purposes only") ? (
                  <>
                    The responses provided by AflaChat are generated using artificial intelligence technology. The information is intended for <strong>educational and informational purposes only</strong>.
                  </>
                ) : p.includes("kielimu na habari pekee") ? (
                  <>
                    Majibu yanayotolewa na AflaChat yanazalishwa kwa kutumia teknolojia ya akili bandia. Taarifa hii imekusudiwa kwa madhumuni ya <strong>kielimu na habari pekee</strong>.
                  </>
                ) : p}
              </p>
            ))}

            {section.bullets && (
              <ul className="list-disc pl-6 text-zinc-600 space-y-2 mt-4">
                {section.bullets.map((b, bIdx) => (
                  <li key={bIdx}>{b}</li>
                ))}
              </ul>
            )}

            {section.subsections?.map((sub, sIdx) => (
              <div key={sIdx} className="space-y-4 mt-6">
                <h3 className="text-xl font-bold font-heading">{sub.subtitle}</h3>
                <p className="text-zinc-600">{sub.desc}</p>
                <ul className="list-disc pl-6 text-zinc-600 space-y-2">
                  {sub.bullets.map((b, bIdx) => (
                    <li key={bIdx}>{b}</li>
                  ))}
                </ul>
                {sub.footer && (
                  <p className="text-zinc-600 italic mt-2">{sub.footer}</p>
                )}
              </div>
            ))}

            {section.footer && (
              <p className={`mt-6 font-medium ${section.title.includes("Disclaimer") || section.title.includes("Kanusho") ? "text-secondary" : "text-zinc-700"}`}>
                {section.footer}
              </p>
            )}

            {section.title.includes("Contact") && (
              <p className="text-zinc-600 mt-4">
                <strong>Email:</strong> <a href="mailto:chogop@nm-aist.ac.tz" className="text-primary hover:underline">chogop@nm-aist.ac.tz</a>
              </p>
            )}
            {section.title.includes("Mawasiliano") && (
              <p className="text-zinc-600 mt-4">
                <strong>Barua Pepe:</strong> <a href="mailto:chogop@nm-aist.ac.tz" className="text-primary hover:underline">chogop@nm-aist.ac.tz</a>
              </p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
