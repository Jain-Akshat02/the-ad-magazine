"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getMagazinePages, DEFAULT_BRANDS } from "../utils/magazineState";
import Header from "../components/Header";

export default function Home() {
  const [pagesCount, setPagesCount] = useState<number>(0);
  const [brandsCount, setBrandsCount] = useState<number>(0);

  useEffect(() => {
    const pages = getMagazinePages();
    setPagesCount(pages.length);
    setBrandsCount(DEFAULT_BRANDS.length + (pages.length - 6));
  }, []);

  return (
    <div className="min-h-screen bg-[#0d0914] text-white flex flex-col justify-between font-sans selection:bg-pink-500 selection:text-white relative overflow-hidden">
      {/* Playful glowing background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] rounded-full bg-pink-650/15 blur-[100px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-yellow-550/10 blur-[130px] pointer-events-none"></div>
      <div className="absolute top-[35%] right-[20%] w-[35%] h-[35%] rounded-full bg-cyan-550/15 blur-[120px] pointer-events-none"></div>

      {/* Decorative cartoon confetti floating grids */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>

      {/* Navigation */}
      <Header />

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center py-20 px-6 max-w-5xl mx-auto z-10 text-center gap-10">

        {/* Playful badge */}
        <div className="flex flex-col items-center gap-4">
          <div className="px-4 py-1.5 rounded-full bg-white/5 border-2 border-white/10 text-[10px] uppercase font-mono tracking-widest text-yellow-405 font-bold shadow-lg rotate-1">
            🔥 Welcome to the future of advertising!
          </div>

          <h1 className="text-5xl md:text-8xl font-black tracking-tight text-white max-w-4xl leading-[1.05] drop-shadow-lg">
            The New age <br className="hidden md:inline" />
            <span className="bg-gradient-to-r from-pink-500 via-purple-400 to-yellow-350 bg-clip-text text-transparent px-2">Advertising!</span>
          </h1>

          <p className="text-sm md:text-base text-zinc-300 max-w-2xl font-sans leading-relaxed mt-3">
            <b>theadmagazine</b> is the internet&apos;s wackiest ad-mag playgrounds. We swap boring corporate banners for interactive ad pages where customers can chat, laugh, and play with silly AI avatars!
          </p>
        </div>

        {/* Playful counter badges */}
        <div className="flex items-center justify-center gap-4 max-w-lg w-full border-2 border-dashed border-white/10 p-4 rounded-2xl bg-white/5 text-stone-200">
          <div className="flex-1 text-center">
            <span className="block text-3xl font-black text-pink-550">{pagesCount || 6}</span>
            <span className="text-[10px] uppercase tracking-wider font-mono text-zinc-500">Goofy Pages</span>
          </div>
          <div className="h-8 w-[1px] bg-white/10"></div>
          <div className="flex-1 text-center">
            <span className="block text-3xl font-black text-cyan-455">2</span>
            <span className="text-[10px] uppercase tracking-wider font-mono text-zinc-500">Funny Stories</span>
          </div>
          <div className="h-8 w-[1px] bg-white/10"></div>
          <div className="flex-1 text-center">
            <span className="block text-3xl font-black text-yellow-455">{brandsCount || 3}</span>
            <span className="text-[10px] uppercase tracking-wider font-mono text-zinc-500">Active Ads</span>
          </div>
        </div>

        {/* Directory cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-6 text-left">

          {/* Card 1: Read magazine */}
          <div className="group relative rounded-3xl bg-zinc-950 border-2 border-white/5 p-6 flex flex-col justify-between gap-6 hover:border-pink-500/40 hover:-translate-y-2 transition-all duration-300 shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div>
              <div className="h-11 w-11 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-400 mb-4 border border-pink-500/20 text-xl shadow-inner">
                📖
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-serif">Read the Issue</h3>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Flip open the pages, read silly comedy editorials, react with floating hearts, and talk direct with AI helpers like sparks the racer!
              </p>
            </div>
            <Link href="/reader" className="text-xs font-mono text-pink-450 group-hover:text-pink-400 group-hover:translate-x-1.5 transition-transform flex items-center gap-1.5 mt-2 cursor-pointer font-bold">
              {"Let's Flip Pages! →"}
            </Link>
          </div>

          {/* Card 2: Brand Portal */}
          <div className="group relative rounded-3xl bg-zinc-950 border-2 border-white/5 p-6 flex flex-col justify-between gap-6 hover:border-cyan-500/40 hover:-translate-y-2 transition-all duration-300 shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div>
              <div className="h-11 w-11 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-4 border border-cyan-500/20 text-xl shadow-inner">
                📊
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-serif">Brand Dashboard</h3>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Check on views, click-through rates, live conversation transcripts, customer emojis, and see who dominates the Brand Brawl Leaderboard!
              </p>
            </div>
            <Link href="/dashboard" className="text-xs font-mono text-cyan-450 group-hover:text-cyan-400 group-hover:translate-x-1.5 transition-transform flex items-center gap-1.5 mt-2 cursor-pointer font-bold">
              {"Analyze Engagement! →"}
            </Link>
          </div>

          {/* Card 3: Buy Page Marketplace */}
          <div className="group relative rounded-3xl bg-zinc-950 border-2 border-white/5 p-6 flex flex-col justify-between gap-6 hover:border-yellow-500/40 hover:-translate-y-2 transition-all duration-300 shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div>
              <div className="h-11 w-11 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-405 mb-4 border border-yellow-500/20 text-xl shadow-inner">
                🚀
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-serif">Buy Ad Placement</h3>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Customize your own ad view matching neon color themes, set a customized AI behavior prompt, test it in sandbox, and host it live!
              </p>
            </div>
            <Link href="/buy-page" className="text-xs font-mono text-yellow-450 group-hover:text-yellow-405 group-hover:translate-x-1.5 transition-transform flex items-center gap-1.5 mt-2 cursor-pointer font-bold">
              {"Design My Ad Slot! →"}
            </Link>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-white/10 bg-zinc-950/40 relative">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono tracking-wider text-zinc-500 uppercase">
          <span>&copy; 2026 theadmagazine corp. All smiles.</span>
          <span>AUTUMN LAUGHTER ISSUE &bull; MONOPOLY MODE ACTIVE</span>
        </div>
      </footer>
    </div>
  );
}
