"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, translations } from "@/lib/translations";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("language") as Language;
      if (savedLang && (savedLang === "en" || savedLang === "sw")) {
        return savedLang;
      }
      // Instant timezone-based heuristic for East Africa before geo-fetch resolves
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (tz && (tz.includes("Dar_es_Salaam") || tz.includes("Nairobi") || tz.includes("Kampala"))) {
          return "sw";
        }
      } catch {
        /* ignore */
      }
    }
    return "en"; // Default fallback for other locations
  });

  // Keep HTML lang attribute in sync with selected language
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.lang = language;
    }
  }, [language]);

  // Geolocation detection on first-time mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedLang = localStorage.getItem("language");
    if (savedLang) return; // User already set a preference manually

    fetch("https://ipapi.co/json/")
      .then((res) => {
        if (!res.ok) throw new Error("Geo IP fetch failed");
        return res.json();
      })
      .then((data) => {
        const country = data.country_code; // e.g. "TZ"
        const detectedLang = country === "TZ" ? "sw" : "en";
        setLanguage(detectedLang);
        localStorage.setItem("language", detectedLang);
      })
      .catch(() => {
        /* Fallback silently to timezone-based initial state */
      });
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const value = {
    language,
    setLanguage: handleSetLanguage,
    t: translations[language],
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
