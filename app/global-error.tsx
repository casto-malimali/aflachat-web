"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Fatal global application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <title>Application Error | AflaChat</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 font-sans text-zinc-900 antialiased">
        <div className="w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-8 sm:p-10 shadow-xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 shadow-2xs">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <h1 className="mt-6 text-2xl sm:text-3xl font-black tracking-tight text-zinc-900">
            Critical Application Error
          </h1>
          <p className="mt-1 text-sm font-bold text-amber-800">
            Hitilafu kubwa ya mfumo imetokea
          </p>

          <p className="mt-4 text-xs sm:text-sm leading-relaxed text-zinc-600">
            A critical error prevented the application from loading. Please click the button below to recover.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#4C8D0A] px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-[#3E7308] transition-all"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reload Application / Pakia Upya</span>
            </button>
          </div>

          {error?.digest && (
            <p className="mt-6 text-[10px] font-mono text-zinc-400">
              Digest: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
