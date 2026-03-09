"use client";

import PlayStoreButton from "@/components/PlayStoreButton";
import { Smartphone, Download, CheckCircle } from "lucide-react";

export default function DownloadPage() {

  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <div className="bg-primary rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-8 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm font-bold uppercase tracking-widest border border-white/20">
              <Download className="w-4 h-4" />
              Available Now
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              Get AflaChat on your Android device
            </h1>
            <p className="text-xl text-accent max-w-lg leading-relaxed">
              Start protecting your family and your harvest today. The official AflaChat app is free to download and easy to use.
            </p>
            
            <div className="pt-4">
              <PlayStoreButton />
            </div>

            <div className="space-y-4 pt-8 border-t border-white/10">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-secondary" />
                <span className="font-medium text-accent">Requires Android 8.0 or higher</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-secondary" />
                <span className="font-medium text-accent">Size: ~25MB</span>
              </div>
            </div>
          </div>

          <div className="flex-1 animate-fade-up [animation-delay:200ms]">
            <div className="relative mx-auto w-64 h-[500px] bg-zinc-900 rounded-[3rem] border-8 border-zinc-800 shadow-2xl flex items-center justify-center">
               <Smartphone className="w-32 h-32 text-zinc-800" />
               <div className="absolute top-8 left-1/2 -translate-x-1/2 w-20 h-2 bg-zinc-800 rounded-full" />
               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full border-4 border-zinc-800" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-12 text-center animate-fade-up [animation-delay:400ms]">
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">Step 1</h3>
          <p className="text-zinc-600 dark:text-zinc-400">Visit Google Play Store on your smartphone.</p>
        </div>
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">Step 2</h3>
          <p className="text-zinc-600 dark:text-zinc-400">Search for &quot;AflaChat&quot; in the search bar.</p>
        </div>
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">Step 3</h3>
          <p className="text-zinc-600 dark:text-zinc-400">Tap &quot;Install&quot; and start chatting with our AI.</p>
        </div>
      </div>
    </div>
  );
}
