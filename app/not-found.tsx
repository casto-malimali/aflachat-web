"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, Compass, Home, Mail, MessageCircle, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/chat/ChatWidget";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50/50">
      <Navbar />

      <main id="main" className="flex-1 flex items-center justify-center px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl text-center">
          {/* 404 Pill Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-forest-moss-200 bg-forest-moss-50 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-primary shadow-2xs">
            <Compass className="h-3.5 w-3.5 text-primary" />
            <span>404 • Page Not Found</span>
          </div>

          {/* Headline */}
          <h1 className="mt-6 font-heading text-4xl font-black tracking-tight text-zinc-900 sm:text-5xl md:text-6xl">
            Lost your trail?
          </h1>
          <p className="mt-2 text-lg font-bold text-forest-moss-800">
            Ukurasa unaoutafuta haupatikani
          </p>

          <p className="mt-4 text-sm sm:text-base leading-relaxed text-zinc-600 max-w-lg mx-auto">
            The page you are looking for might have been moved, renamed, or is temporarily unavailable. Let&apos;s get you back on track with verified agricultural knowledge.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-lg"
            >
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-bold text-zinc-700 shadow-2xs transition-all hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
            >
              <BookOpen className="h-4 w-4 text-forest-moss-600" />
              <span>Explore Blog & Guides</span>
            </Link>
          </div>

          {/* Helpful Navigation Links Card */}
          <div className="mt-12 rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs text-left">
            <h2 className="text-xs font-black uppercase tracking-wider text-zinc-400">
              Popular Destinations
            </h2>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                href="/services"
                className="group flex flex-col p-3 rounded-xl border border-zinc-100 hover:border-forest-moss-300 hover:bg-forest-moss-50/50 transition-all"
              >
                <span className="font-bold text-sm text-zinc-800 group-hover:text-primary transition-colors">
                  Our Services
                </span>
                <span className="text-xs text-zinc-500 mt-1">
                  AI crop protection tools & safety awareness
                </span>
              </Link>
              <Link
                href="/download"
                className="group flex flex-col p-3 rounded-xl border border-zinc-100 hover:border-forest-moss-300 hover:bg-forest-moss-50/50 transition-all"
              >
                <span className="font-bold text-sm text-zinc-800 group-hover:text-primary transition-colors">
                  Mobile App
                </span>
                <span className="text-xs text-zinc-500 mt-1">
                  Download AflaChat for Android & offline use
                </span>
              </Link>
              <Link
                href="/contact"
                className="group flex flex-col p-3 rounded-xl border border-zinc-100 hover:border-forest-moss-300 hover:bg-forest-moss-50/50 transition-all"
              >
                <span className="font-bold text-sm text-zinc-800 group-hover:text-primary transition-colors">
                  Contact Us
                </span>
                <span className="text-xs text-zinc-500 mt-1">
                  Get in touch with our agricultural experts
                </span>
              </Link>
            </div>

            {/* Quick Ask AI Assistant Link */}
            <div className="mt-5 pt-4 border-t border-zinc-100 flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                Need immediate help with harvest safety?
              </span>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event("aflachat:open"))}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>Ask AflaChat AI</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
}
