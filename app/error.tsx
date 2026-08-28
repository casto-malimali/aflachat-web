"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, Mail, MessageCircle, RotateCcw } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected runtime errors for diagnostic tracking
    console.error("Application runtime error:", error);
  }, [error]);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50/50">
      <Navbar />

      <main id="main" className="flex-1 flex items-center justify-center px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl text-center">
          {/* Error Pill Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-amber-800 shadow-2xs">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
            <span>500 • System Error</span>
          </div>

          {/* Headline */}
          <h1 className="mt-6 font-heading text-4xl font-black tracking-tight text-zinc-900 sm:text-5xl">
            Something went wrong
          </h1>
          <p className="mt-2 text-lg font-bold text-amber-800">
            Hitilafu ya mfumo imetokea
          </p>

          <p className="mt-4 text-sm sm:text-base leading-relaxed text-zinc-600 max-w-lg mx-auto">
            An unexpected error occurred while loading this page. Our technical team has been notified. You can try refreshing the action or returning to the homepage.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-lg"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Try Again / Jaribu Tena</span>
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-bold text-zinc-700 shadow-2xs transition-all hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
            >
              <Home className="h-4 w-4 text-forest-moss-600" />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Diagnostic Info Card */}
          <div className="mt-12 rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-700">
                Need help or suspect an outage?
              </span>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Report Issue</span>
              </Link>
            </div>

            {error?.digest && (
              <div className="mt-3 rounded-lg bg-zinc-50 border border-zinc-200 p-2.5 text-[11px] font-mono text-zinc-500">
                <span className="font-semibold text-zinc-700">Error Reference:</span> {error.digest}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
