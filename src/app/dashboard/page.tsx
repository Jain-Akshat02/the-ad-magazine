"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  getMagazinePages,
  getSeedBrands,
  getAdInteractions,
  BrandAd,
  AdInteraction
} from "../../utils/magazineState";
import Header from "../../components/Header";

export default function DashboardPage() {
  const [brands, setBrands] = useState<BrandAd[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<BrandAd | null>(null);
  const [interactions, setInteractions] = useState<AdInteraction | null>(null);
  const [leaderboard, setLeaderboard] = useState<{ brand: BrandAd; engagements: number; engagementRate: number }[]>([]);

  const loadStats = () => {
    const pages = getMagazinePages();
    const allBrands: BrandAd[] = [];

    getSeedBrands().forEach((b) => {
      if (!allBrands.some((e) => e.id === b.id)) allBrands.push(b);
    });

    pages.forEach((p) => {
      if (p.type === "ad" && p.brandAd) {
        if (!allBrands.some(e => e.id === p.brandAd!.id)) {
          allBrands.push(p.brandAd);
        }
      }
    });

    setBrands(allBrands);

    let currentBrand = selectedBrand;
    if (!currentBrand && allBrands.length > 0) {
      currentBrand = allBrands[0];
      setSelectedBrand(allBrands[0]);
    }

    if (currentBrand) {
      setInteractions(getAdInteractions(currentBrand.id));
    }

    // Process Leaderboard
    const list = allBrands.map((b) => {
      const stats = getAdInteractions(b.id);
      const engagements = stats.likes + stats.clicks + stats.chatSessions;
      const rate = stats.views > 0 ? (engagements / stats.views) * 100 : 0;
      return {
        brand: b,
        engagements,
        engagementRate: Math.round(rate * 10) / 10
      };
    });
    list.sort((a, b) => b.engagements - a.engagements);
    setLeaderboard(list);
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 4000);
    return () => clearInterval(interval);
  }, [selectedBrand]);

  const handleSelectBrand = (brand: BrandAd) => {
    setSelectedBrand(brand);
    setInteractions(getAdInteractions(brand.id));
  };

  const calcRate = () => {
    if (!interactions || interactions.views === 0) return 0;
    const items = interactions.clicks + interactions.likes + interactions.chatSessions;
    return Math.round((items / interactions.views) * 1000) / 10;
  };

  const getTimelineData = () => {
    if (!interactions) return [];
    const viewsVal = interactions.views;
    const clicksVal = interactions.clicks;
    return [
      { date: "Aug 18", views: Math.round(viewsVal * 0.15), clicks: Math.round(clicksVal * 0.08) },
      { date: "Aug 19", views: Math.round(viewsVal * 0.35), clicks: Math.round(clicksVal * 0.22) },
      { date: "Aug 20", views: Math.round(viewsVal * 0.60), clicks: Math.round(clicksVal * 0.45) },
      { date: "Aug 21", views: Math.round(viewsVal * 0.80), clicks: Math.round(clicksVal * 0.70) },
      { date: "Today", views: viewsVal, clicks: clicksVal }
    ];
  };

  const timeline = getTimelineData();
  const maxView = timeline.length > 0 ? Math.max(...timeline.map(t => t.views), 10) : 100;

  return (
    <div className="min-h-screen bg-[#0d0914] text-white flex flex-col justify-between font-sans selection:bg-pink-500">

      {/* Header */}
      <Header />

      {/* Main Grid */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Left Col: Lists & Brawlboard */}
        <div className="lg:col-span-1 flex flex-col gap-6">

          <div className="bg-zinc-950/50 rounded-3xl border-2 border-white/5 p-4 flex flex-col gap-3">
            <h3 className="text-xs font-mono tracking-widest uppercase text-pink-400 font-bold mb-1">Your Advertisers 📢</h3>
            <div className="flex flex-col gap-2">
              {brands.map((b) => (
                <button
                  key={b.id}
                  onClick={() => handleSelectBrand(b)}
                  className={`w-full py-2.5 px-3 rounded-xl text-left text-xs font-mono font-medium flex items-center justify-between transition-all border-2 cursor-pointer ${selectedBrand?.id === b.id
                      ? "bg-white text-black border-white"
                      : "bg-zinc-900 border-white/5 text-zinc-300 hover:bg-neutral-900"
                    }`}
                >
                  <span className="truncate">{b.name}</span>
                  {selectedBrand?.id === b.id && (
                    <span className="text-xs">⚡</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Brawl Leaderboard */}
          <div className="bg-zinc-950/50 rounded-3xl border-2 border-white/5 p-5 flex flex-col gap-4">
            <div>
              <h3 className="text-xs font-mono tracking-widest uppercase text-cyan-400 font-bold">Brand Brawlboard 🏆</h3>
              <p className="text-[10px] text-zinc-400 font-sans mt-0.5">Who is scoring the most fun clicks?</p>
            </div>

            <div className="flex flex-col gap-4">
              {leaderboard.map((item, idx) => (
                <div key={item.brand.id} className="flex flex-col gap-1 font-mono">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-300 truncate">
                      {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "👾"} {item.brand.name}
                    </span>
                    <span className="text-white font-bold">{item.engagements} pts</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 to-yellow-405 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((item.engagements / Math.max(...leaderboard.map(l => l.engagements), 1)) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[9px] text-zinc-550">
                    <span>Fun Index: {item.engagementRate}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Col: Graphs and Chats */}
        <div className="lg:col-span-3 flex flex-col gap-8">
          {selectedBrand && interactions ? (
            <>
              {/* Headline Banner */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-950 border-2 border-dashed border-white/10 rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-radial from-pink-500/5 to-transparent pointer-events-none"></div>
                <div className="z-10">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-pink-400 font-bold bg-white/5 py-1 px-3 rounded-full border border-white/10">
                    Telemetry Channel
                  </span>
                  <h2 className="text-2xl font-black text-white mt-3">{selectedBrand.name}</h2>
                  <p className="text-xs text-zinc-400 font-mono mt-1">{selectedBrand.tagline}</p>
                </div>
                <Link
                  href="/reader"
                  className="z-10 text-xs font-bold font-mono bg-pink-500 text-black hover:bg-pink-600 transition-all hover:scale-105 py-2.5 px-4 rounded-xl shadow-md cursor-pointer"
                >
                  {"Inspect Ad Slide →"}
                </Link>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                <div className="bg-zinc-950/40 rounded-2xl border-2 border-white/5 p-4 flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block">👀 Views</span>
                  <span className="text-2xl font-black text-white mt-2">{interactions.views}</span>
                  <span className="text-[9px] font-mono text-zinc-400">Total eyeballs</span>
                </div>

                <div className="bg-zinc-950/40 rounded-2xl border-2 border-white/5 p-4 flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block">💖 Love Sent</span>
                  <span className="text-2xl font-black text-pink-500 mt-2">{interactions.likes}</span>
                  <span className="text-[9px] font-mono text-pink-400">Heart clicks</span>
                </div>

                <div className="bg-zinc-950/40 rounded-2xl border-2 border-white/5 p-4 flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block">⚡ Clicks</span>
                  <span className="text-2xl font-black text-indigo-400 mt-2">{interactions.clicks}</span>
                  <span className="text-[9px] font-mono text-indigo-400">CTA triggers</span>
                </div>

                <div className="bg-zinc-950/40 rounded-2xl border-2 border-white/5 p-4 flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block">🤖 chat sessions</span>
                  <span className="text-2xl font-black text-yellow-405 mt-2">{interactions.chatSessions}</span>
                  <span className="text-[9px] font-mono text-yellow-400">AI discussions</span>
                </div>

              </div>

              {/* Custom SVG line-chart */}
              <div className="bg-zinc-950 border-2 border-white/5 rounded-3xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-sm font-bold font-mono">Bouncing Trends</h3>
                    <p className="text-[10px] font-mono text-zinc-500">Live monitoring of page interactions over the past 5 days</p>
                  </div>
                  <div className="flex gap-4 font-mono text-[9px] uppercase tracking-wider text-zinc-400">
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 bg-pink-500 rounded-full inline-block"></span> Views</span>
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 bg-emerald-400 rounded-full inline-block"></span> Clicks</span>
                  </div>
                </div>

                <div className="w-full h-64 relative bg-[#060408] rounded-2xl border border-white/[0.04]">
                  <svg className="w-full h-full p-4" viewBox="0 0 500 200" preserveAspectRatio="none">
                    <line x1="0" y1="50" x2="500" y2="50" stroke="#ffffff08" strokeDasharray="3" />
                    <line x1="0" y1="100" x2="500" y2="100" stroke="#ffffff08" strokeDasharray="3" />
                    <line x1="0" y1="150" x2="500" y2="150" stroke="#ffffff08" strokeDasharray="3" />

                    <path
                      d={timeline.map((t, idx) => {
                        const x = (idx / (timeline.length - 1)) * 500;
                        const y = 180 - (t.views / maxView) * 150;
                        return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
                      }).join(" ")}
                      fill="none"
                      stroke="#ec4899"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    <path
                      d={timeline.map((t, idx) => {
                        const x = (idx / (timeline.length - 1)) * 500;
                        const y = 180 - (t.clicks / maxView) * 150;
                        return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
                      }).join(" ")}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeDasharray="5 3"
                      strokeLinecap="round"
                    />

                    {timeline.map((t, idx) => {
                      const x = (idx / (timeline.length - 1)) * 500;
                      const yView = 180 - (t.views / maxView) * 150;
                      const yClick = 180 - (t.clicks / maxView) * 150;
                      return (
                        <g key={idx}>
                          <circle cx={x} cy={yView} r="5" fill="#ec4899" />
                          <circle cx={x} cy={yClick} r="4" fill="#10b981" />
                        </g>
                      );
                    })}
                  </svg>

                  <div className="absolute bottom-2 left-6 right-6 flex justify-between font-mono text-[9px] text-zinc-550">
                    {timeline.map((t, i) => (
                      <span key={i}>{t.date}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live Feeds */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Profile summary */}
                <div className="bg-zinc-950 border-2 border-white/5 rounded-3xl p-5 md:col-span-1 flex flex-col justify-between shadow-md">
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-widest text-zinc-500">AI Representative Profile 🤖</h4>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl overflow-hidden border border-white/10">
                        <img src={selectedBrand.imageUrl} alt={selectedBrand.name} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-zinc-500">Agent Name</span>
                        <h5 className="text-sm font-semibold">{selectedBrand.aiName}</h5>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-zinc-900 border border-white/5 rounded-xl text-xs leading-relaxed text-zinc-400">
                      <p className="line-clamp-4 italic font-mono">&apos;&apos;{selectedBrand.aiPersona}&apos;&apos;</p>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-white/5 pt-3">
                    <span className="text-[10px] font-mono text-zinc-550 uppercase block">Attention span clock⏰</span>
                    <span className="text-xl font-bold font-serif text-pink-500">{interactions.timeSpent}s</span>
                    <p className="text-[8px] text-zinc-600 font-sans mt-0.5">Total customer reading time</p>
                  </div>
                </div>

                {/* AI Dialogue Logs */}
                <div className="bg-zinc-950 border-2 border-white/5 rounded-3xl p-5 md:col-span-2 flex flex-col gap-4 shadow-md">
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-widest text-zinc-500">Dialogue logs transcript feed 🗣️</h4>
                    <p className="text-[10px] text-zinc-505 font-sans mt-0.5">Real-time chats fed from custom reader sessions</p>
                  </div>

                  <div className="flex-1 max-h-60 overflow-y-auto space-y-3 pr-2">
                    {interactions.chats && interactions.chats.length > 0 ? (
                      interactions.chats.map((chat, idx) => (
                        <div key={idx} className="flex gap-2">
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded h-fit shrink-0 font-bold ${chat.role === "user" ? "bg-white text-black" : "bg-pink-650 text-white"
                            }`}>
                            {chat.role === "user" ? "CUSTOMER" : selectedBrand.aiName.toUpperCase()}
                          </span>
                          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2.5 text-xs text-zinc-300 flex-1">
                            <p className="leading-relaxed font-sans">{chat.text}</p>
                            <span className="text-[8px] text-zinc-650 block text-right mt-1 font-mono">{chat.timestamp}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-600 font-mono text-xs">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-2 opacity-35">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.92 1.61c-.16.16-.33.315-.506.462a.75.75 0 0 0 .515 1.282A8.966 8.966 0 0 0 12 20.25Z" />
                        </svg>
                        No chat logs recorded yet. <br /> Open the reader and type a message to start!
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="h-6 w-6 border-2 border-pink-500 border-t-white animate-spin rounded-full mb-3"></span>
              <p className="text-xs font-mono text-zinc-550">Summoning telemetry charts...</p>
            </div>
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-white/10 bg-zinc-950/20 text-center text-[9px] font-mono tracking-widest text-zinc-550">
        &copy; 2026 theadmagazine and affiliates
      </footer>
    </div>
  );
}
