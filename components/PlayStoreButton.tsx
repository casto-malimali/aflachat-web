"use client";

import React from "react";
import { useLanguage } from "./LanguageContext";

export default function PlayStoreButton() {
  const { language } = useLanguage();

  const badge =
    language === "sw"
      ? "/images/GetItOnGooglePlay_Badge_Web_color_Swahili.svg"
      : "/images/GetItOnGooglePlay_Badge_Web_color_English.svg";

  const altText =
    language === "sw"
      ? "Pakua kwenye Google Play"
      : "Get it on Google Play";

  return (
    <a
      href="#"
      className="inline-block hover:-translate-y-0.5 transition-transform active:scale-95"
      aria-label={altText}
    >
      <img
        src={badge}
        alt={altText}
        className="h-14 w-auto"
      />
    </a>
  );
}
