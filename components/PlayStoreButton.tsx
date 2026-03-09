"use client";

import React from "react";
import Image from "next/image";
import { useLanguage } from "./LanguageContext";

export default function PlayStoreButton() {
  const { t } = useLanguage();
  
  return (
    <a
      href="#" // Replace with actual Play Store link
      className="inline-flex items-center gap-3 px-6 py-3 bg-black text-white rounded-xl hover:bg-zinc-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 border border-zinc-700"
    >
      <div className="w-8 h-8 relative">
        <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M74.1 36.1C70.6 39.7 68.6 45.4 68.6 52.6V459.4C68.6 466.6 70.6 472.3 74.1 475.9L76.1 477.9L301.9 252.1V259.9L76.1 34.1L74.1 36.1Z" fill="#2196F3"/>
          <path d="M377.3 327.5L301.9 252.1V259.9L377.3 335.3L379.3 334.2C386.3 330.2 391.1 322.8 391.1 314.1C391.1 305.4 386.3 298 379.3 294L377.3 292.9L377.3 327.5Z" fill="#FFC107"/>
          <path d="M76.1 477.9L301.9 252.1L377.3 327.5L76.1 477.9Z" fill="#F44336"/>
          <path d="M76.1 34.1L377.3 292.9L301.9 252.1L76.1 34.1Z" fill="#4CAF50"/>
        </svg>
      </div>
      <div className="flex flex-col items-start leading-tight">
        <span className="text-[10px] uppercase font-semibold tracking-wider opacity-80">Get it on</span>
        <span className="text-lg font-bold">Google Play</span>
      </div>
    </a>
  );
}
