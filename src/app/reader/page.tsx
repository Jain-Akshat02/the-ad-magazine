"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  getMagazinePages,
  saveAdInteraction,
  simulateAIChat,
  MagazinePage,
  BrandAd
} from "../../utils/magazineState";
import Header from "../../components/Header";

export default function ReaderPage() {
  const [pages, setPages] = useState<MagazinePage[]>([]);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  
  // Interactive ad states
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [chatBrand, setChatBrand] = useState<BrandAd | null>(null);
  const [chatInput, setChatInput] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "assistant"; text: string; timestamp: string }[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  
  // Likes and CTAs states
  const [likedPages, setLikedPages] = useState<Record<string, boolean>>({});
  const [clickedCTA, setClickedCTA] = useState<Record<string, boolean>>({});
  const [sparks, setSparks] = useState<{ id: number; x: number; y: number }[]>([]);

  // Telemetry: Time spent on each page
  const pageTimers = useRef<Record<string, number>>({});
  const activePageRef = useRef<number>(0);

  // References for scroll navigation
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const loadedPages = getMagazinePages();
    setPages(loadedPages);
    
    // Initialize timing trackers for each page ID
    const initialTimers: Record<string, number> = {};
    loadedPages.forEach((p) => {
      initialTimers[p.id] = 0;
    });
    pageTimers.current = {
      ...initialTimers,
      activeStartTime: Date.now()
    };
  }, []);

  // Set up IntersectionObserver to update active page index scroll position
  useEffect(() => {
    if (pages.length === 0) return;

    const observerOptions = {
      root: null, // viewport
      rootMargin: "-20% 0px -40% 0px", // focus area in middle of screen
      threshold: 0.2
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute("data-page-index") || "0", 10);
          
          // Log time spent on the PREVIOUS active page before switching
          const prevIndex = activePageRef.current;
          if (prevIndex !== index) {
            recordTimeElapsed(prevIndex);
            
            // Switch active page
            setActivePageIndex(index);
            activePageRef.current = index;
            pageTimers.current.activeStartTime = Date.now();
            
            // Trigger a single view count increment for this page's brand ad
            const targetPage = pages[index];
            if (targetPage && targetPage.type === "ad" && targetPage.brandAd) {
              saveAdInteraction(targetPage.brandAd.id, { views: 1 });
            }
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    // Observe each page card element
    pageRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      // Record any final duration time before unmount
      recordTimeElapsed(activePageRef.current);
      observer.disconnect();
    };
  }, [pages]);

  const recordTimeElapsed = (index: number) => {
    if (!pages || pages.length === 0 || !pages[index]) return;
    const page = pages[index];
    const elapsed = Math.round((Date.now() - (pageTimers.current.activeStartTime || Date.now())) / 1000);
    
    if (elapsed > 0 && page.type === "ad" && page.brandAd) {
      saveAdInteraction(page.brandAd.id, { timeSpent: elapsed });
    }
  };

  const handleScrollToPage = (index: number) => {
    const el = pageRefs.current[index];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleLike = (brandId: string, pageId: string, e: React.MouseEvent) => {
    const isAlreadyLiked = likedPages[pageId];
    setLikedPages((prev) => ({ ...prev, [pageId]: !isAlreadyLiked }));
    saveAdInteraction(brandId, { likes: isAlreadyLiked ? -1 : 1 });

    if (!isAlreadyLiked) {
      const rect = e.currentTarget.getBoundingClientRect();
      const newSparks = Array.from({ length: 8 }).map((_, i) => ({
        id: Date.now() + i,
        x: rect.left + rect.width / 2 + (Math.random() - 0.5) * 60,
        y: rect.top - 10 + (Math.random() - 0.5) * 40
      }));
      setSparks((prev) => [...prev, ...newSparks]);
      setTimeout(() => {
        setSparks((prev) => prev.filter(s => !newSparks.some(n => n.id === s.id)));
      }, 800);
    }
  };

  const handleCTA = (brandId: string, pageId: string) => {
    setClickedCTA((prev) => ({ ...prev, [pageId]: true }));
    saveAdInteraction(brandId, { clicks: 1 });
    
    alert(`🎉 [Zap Redirect] Zooming you away to ${brandId.toUpperCase()}'s happy product world!`);
    setTimeout(() => {
      setClickedCTA((prev) => ({ ...prev, [pageId]: false }));
    }, 2000);
  };

  const handleOpenChat = (brandAd: BrandAd) => {
    setChatBrand(brandAd);
    setChatOpen(true);
    saveAdInteraction(brandAd.id, { chatSessions: 1 });
    
    const welcome = `Alakazam! 🌟 I'm ${brandAd.aiName}, your bubbly AI pal representing ${brandAd.name}. Ask me any fun thing!`;
    setChatHistory([
      { role: "assistant", text: welcome, timestamp: "Just now" }
    ]);
  };

  const handleSendMessage = (textToSend?: string) => {
    const msgText = textToSend || chatInput;
    if (!msgText.trim() || !chatBrand) return;

    if (!textToSend) {
      setChatInput("");
    }

    const newUserMsg = { role: "user" as const, text: msgText, timestamp: "Just now" };
    setChatHistory((prev) => [...prev, newUserMsg]);
    setIsTyping(true);

    saveAdInteraction(chatBrand.id, { chats: [newUserMsg] });

    setTimeout(() => {
      const responseText = simulateAIChat(chatBrand, msgText);
      const assistantMsg = { role: "assistant" as const, text: responseText, timestamp: "Just now" };
      setChatHistory((prev) => [...prev, assistantMsg]);
      setIsTyping(false);

      saveAdInteraction(chatBrand.id, { chats: [assistantMsg] });
    }, 850);
  };

  const getThemeBackground = (theme: string) => {
    switch (theme) {
      case "gold":
        return "bg-radial from-[#3a2c16] via-[#1c1206] to-[#0f0a03] border-yellow-500/40";
      case "dark":
        return "bg-radial from-[#0c2f47] via-[#091b29] to-[#030b11] border-cyan-400/40";
      case "emerald":
        return "bg-radial from-[#083821] via-[#041a0e] to-[#010905] border-emerald-400/40";
      case "bubblegum":
        return "bg-radial from-pink-900/60 via-purple-950/80 to-zinc-950 border-pink-400/40";
      case "glass":
      default:
        return "bg-radial from-stone-900 via-zinc-950 to-zinc-950 border-stone-850/60";
    }
  };

  const getThemeColorClass = (theme: string) => {
    switch (theme) {
      case "gold": return "bg-yellow-500 hover:bg-yellow-600 text-black border-yellow-400 shadow-yellow-500/20";
      case "dark": return "bg-cyan-500 hover:bg-cyan-600 text-black border-cyan-400 shadow-cyan-500/20";
      case "emerald": return "bg-emerald-500 hover:bg-emerald-600 text-black border-emerald-400 shadow-emerald-500/20";
      case "bubblegum": return "bg-pink-500 hover:bg-pink-600 text-black border-pink-400 shadow-pink-500/20";
      case "glass":
      default: return "bg-white hover:bg-zinc-200 text-black border-white shadow-white/10";
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0914] text-white flex flex-col justify-between font-sans selection:bg-pink-500 relative scroll-smooth">
      
      {/* Floating Spark Particle Indicators on Like */}
      {sparks.map((spark) => (
        <span
          key={spark.id}
          className="fixed text-xl pointer-events-none animate-ping z-50 transition-all duration-300"
          style={{ left: spark.x, top: spark.y }}
        >
          ✨
        </span>
      ))}

      {/* Header */}
      <Header />

      {/* Main vertical loop container (takes the full width of the screen) */}
      <main className="flex-1 w-full bg-zinc-950/20 py-2 relative flex flex-col items-center">
        
        {/* Floating Outline Navigation Panel (TOC) on the right */}
        <aside className="fixed right-6 top-1/4 hidden lg:flex flex-col gap-3 bg-zinc-950/80 border border-white/10 p-3 rounded-2xl backdrop-blur-xl z-30 shadow-2xl">
          <span className="text-[9px] font-mono text-zinc-550 uppercase tracking-widest text-center border-b border-white/5 pb-1">Chapters</span>
          {pages.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => handleScrollToPage(idx)}
              className={`text-[10px] font-mono text-left py-1.5 px-3 rounded-lg border transition-all cursor-pointer truncate max-w-[155px] ${
                activePageIndex === idx
                  ? "bg-white text-black border-white font-bold"
                  : "bg-transparent text-zinc-400 border-transparent hover:bg-white/5 hover:text-white"
              }`}
            >
              {idx === 0 ? "📔 Issue Cover" : p.type === "ad" ? `⚡ ${p.brandAd?.name || p.title}` : `📖 ${p.title}`}
            </button>
          ))}
        </aside>

        {/* Scroll Feed Content Container */}
        <div className="w-full flex flex-col gap-12 px-4 py-8 max-w-5xl mx-auto">
          {pages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <span className="h-6 w-6 border-2 border-pink-550 border-t-white animate-spin rounded-full"></span>
              <p className="text-xs font-mono text-zinc-550">Synthesizing scrolling layouts...</p>
            </div>
          ) : (
            pages.map((page, idx) => {
              
              // Reference function to assign component ref
              const assignRef = (el: HTMLDivElement | null) => {
                pageRefs.current[idx] = el;
              };

              // COVER PAGE CARD RENDERING
              if (page.id === "cover") {
                return (
                  <div
                    key={page.id}
                    ref={assignRef}
                    data-page-index={idx}
                    className="w-full min-h-[85vh] rounded-3xl bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-[#100b1a] to-[#07050a] border-4 border-dashed border-white/10 p-8 md:p-16 flex flex-col justify-between shadow-2xl relative overflow-hidden transition-all duration-300 scroll-mt-20 group"
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>
                    
                    <div className="flex justify-between items-center text-[10px] font-mono tracking-widest text-zinc-400 border-b border-white/10 pb-4">
                      <span>THEADMAGAZINE PUBLICATION &bull; AUTUMN &apos;26 IDLE</span>
                      <span>ISSUE COVER 📔</span>
                    </div>

                    <div className="my-auto flex flex-col items-center text-center gap-6 py-8">
                      <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] uppercase font-mono tracking-widest text-yellow-450 font-bold mb-2">
                        🎉 Interactive Scroll Feed Active!
                      </div>
                      
                      <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-none bg-gradient-to-r from-pink-550 via-purple-400 to-yellow-405 bg-clip-text text-transparent drop-shadow-md">
                        theadmagazine
                      </h1>
                      
                      <h2 className="text-xl md:text-2xl font-bold font-serif max-w-xl text-zinc-200">
                        {page.title}
                      </h2>
                      
                      <p className="text-xs md:text-sm text-zinc-400 max-w-lg leading-relaxed font-sans mt-2">
                        {page.content}
                      </p>

                      <button
                        onClick={() => handleScrollToPage(1)}
                        className="mt-6 flex flex-col items-center gap-1.5 animate-bounce text-xs font-mono text-pink-500 hover:text-white transition cursor-pointer"
                      >
                        <span>Scroll down to read stories &amp; play with AI</span>
                        <span>👇</span>
                      </button>
                    </div>

                    <div className="flex justify-between items-center text-[9px] font-mono tracking-wider text-zinc-550 border-t border-white/5 pt-4">
                      <span>&copy; theadmagazine networks</span>
                      <span>PAGE 1</span>
                    </div>
                  </div>
                );
              }

              // EDITORIAL PAGE CARDS RENDERING
              if (page.type === "editorial") {
                return (
                  <div
                    key={page.id}
                    ref={assignRef}
                    data-page-index={idx}
                    className="w-full min-h-[85vh] rounded-3xl bg-[#fdfaf2] text-stone-900 border-4 border-double border-stone-300 p-8 md:p-16 flex flex-col justify-between shadow-2xl scroll-mt-20 relative group"
                  >
                    <div className="flex justify-between items-center text-[10px] tracking-wider text-stone-500 uppercase font-mono border-b-2 border-dashed border-stone-200 pb-3">
                      <span>📖 Editorial Segment</span>
                      <span>{page.category}</span>
                    </div>

                    <div className="my-auto flex flex-col lg:flex-row items-center gap-8 py-8">
                      {page.imageUrl && (
                        <div className="w-full lg:w-1/2 h-56 md:h-80 rounded-2xl border-4 border-stone-900 shadow-xl overflow-hidden relative shrink-0">
                          <img
                            src={page.imageUrl}
                            alt={page.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                          />
                        </div>
                      )}
                      
                      <div className="flex flex-col gap-4">
                        <h2 className="font-extrabold text-2xl md:text-4xl tracking-tight leading-tight text-stone-900 font-serif">
                          {page.title}
                        </h2>
                        {page.author && (
                          <p className="text-[10px] font-sans font-semibold tracking-wide text-stone-500 uppercase mt-0.5">
                            Penciled by {page.author} &bull; {page.readTime}
                          </p>
                        )}
                        <p className="text-xs md:text-sm text-stone-800 font-serif leading-relaxed first-letter:text-6xl first-letter:font-black first-letter:float-left first-letter:mr-3 first-letter:text-pink-650 mt-2">
                          {page.content}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] tracking-wider text-stone-500 font-mono border-t-2 border-dashed border-stone-200 pt-3">
                      <span>theadmagazine issue &bull; column archives</span>
                      <span>PAGE {idx + 1}</span>
                    </div>
                  </div>
                );
              }

              // BRAND ADVERTISEMENT CARD RENDERING
              if (page.type === "ad" && page.brandAd) {
                const ad = page.brandAd;
                return (
                  <div
                    key={page.id}
                    ref={assignRef}
                    data-page-index={idx}
                    className={`w-full min-h-[85vh] rounded-3xl border-4 border-dashed p-8 md:p-16 flex flex-col justify-between shadow-2xl relative overflow-hidden transition-all duration-300 scroll-mt-20 group
                      ${getThemeBackground(ad.theme)}`}
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:18px_18px] pointer-events-none"></div>

                    <div className="flex justify-between items-center text-[9px] tracking-widest text-zinc-400 font-mono z-10 border-b border-white/5 pb-4">
                      <span className="bg-white/10 px-2.5 py-0.5 rounded-full text-yellow-350">SPONSOR PLAYGROUND 🎪</span>
                      <button
                        onClick={(e) => handleLike(ad.id, page.id, e)}
                        className="flex items-center gap-1.5 focus:outline-none group text-zinc-400 hover:text-pink-400 transition-colors cursor-pointer"
                      >
                        <span className="text-base">{likedPages[page.id] ? "💖" : "🖤"}</span>
                        <span className="font-mono text-[9px]">{likedPages[page.id] ? "Loved!" : "Like!"}</span>
                      </button>
                    </div>

                    <div className="my-auto flex flex-col lg:flex-row items-center gap-8 py-8 z-10">
                      
                      <div className="w-full lg:w-1/2 h-56 md:h-80 rounded-2xl overflow-hidden border-2 border-white/10 relative shadow-2xl shrink-0 group">
                        <img
                          src={ad.imageUrl}
                          alt={ad.name}
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-102"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>
                        <div className="absolute bottom-4 left-4 right-4 text-[11px] text-zinc-200 leading-relaxed font-sans">
                          {ad.description}
                        </div>
                      </div>

                      <div className="flex flex-col gap-5 w-full">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-1.5 bg-gradient-to-b from-pink-500 to-yellow-500 rounded-full"></div>
                          <div>
                            <h3 className="text-2xl md:text-3xl font-black tracking-tight">{ad.name}</h3>
                            <p className="text-xs text-yellow-405 font-mono tracking-tight font-bold">{ad.tagline}</p>
                          </div>
                        </div>

                        {/* Feature bullets */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-zinc-300 font-mono bg-white/5 p-4 rounded-xl border border-white/10 shadow-inner">
                          {ad.features.map((feat, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                              <span>✨</span>
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 text-xs w-full mt-2">
                          <button
                            onClick={() => handleCTA(ad.id, page.id)}
                            className={`flex-1 py-3 px-4 rounded-xl font-bold border-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 shadow-lg text-center cursor-pointer ${
                              clickedCTA[page.id] ? "bg-white/10 scale-95" : getThemeColorClass(ad.theme)
                            }`}
                          >
                            {clickedCTA[page.id] ? "Connecting... ⚡" : ad.ctaText}
                          </button>
                          <button
                            onClick={() => handleOpenChat(ad)}
                            className="flex-1 py-3 px-4 rounded-xl font-bold bg-white text-black hover:bg-neutral-200 border-2 border-white transition-all transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 text-center flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
                          >
                            🤖 Chat with Agent
                          </button>
                        </div>
                      </div>

                    </div>

                    <div className="flex justify-between items-center text-[10px] tracking-wider text-zinc-550 font-mono border-t border-white/5 pt-4">
                      <span>thead ad network telemetry ready</span>
                      <span>PAGE {idx + 1}</span>
                    </div>
                  </div>
                );
              }

              return null;
            })
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-white/10 uppercase tracking-widest text-[9px] text-zinc-550 text-center font-mono bg-black/40">
        &copy; 2026 theadmagazine pub &bull; modern scrolling feed edition
      </footer>

      {/* AI REPRESENTATIVE CHAT SIDE PANEL */}
      {chatOpen && chatBrand && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-[#0e0a16] border-l border-white/10 h-full flex flex-col justify-between shadow-2xl relative overflow-hidden animate-slide-in">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-zinc-950">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl overflow-hidden border-2 border-white/20">
                  <img src={chatBrand.imageUrl} alt={chatBrand.name} className="h-full w-full object-cover" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">{chatBrand.aiName} 🤖</h4>
                  <p className="text-[9px] text-yellow-450 font-mono uppercase tracking-wider">{chatBrand.name} Bot</p>
                </div>
              </div>
              <button 
                onClick={() => setChatOpen(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
              {chatHistory.map((chat, index) => (
                <div key={index} className={`flex ${chat.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl p-3 leading-relaxed shadow-md border ${
                    chat.role === "user" 
                      ? "bg-white text-black border-white rounded-tr-none" 
                      : "bg-purple-950/40 border-pink-500/20 text-zinc-100 rounded-tl-none font-mono"
                  }`}>
                    <p>{chat.text}</p>
                    <span className="block text-[8px] text-zinc-500 text-right mt-1 font-mono">{chat.timestamp}</span>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-zinc-900 border border-white/5 text-zinc-400 rounded-xl rounded-tl-none p-3 shadow-md">
                    <div className="flex gap-1.5 items-center py-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-bounce"></span>
                      <span className="h-1.5 w-1.5 rounded-full bg-pink-550 animate-bounce [animation-delay:0.2s]"></span>
                      <span className="h-1.5 w-1.5 rounded-full bg-pink-550 animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Inputs & suggestions */}
            <div className="p-4 border-t border-white/10 bg-zinc-950">
              <div className="flex flex-wrap gap-1.5 mb-3">
                <button
                  onClick={() => handleSendMessage("Show me your features!")}
                  className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-zinc-900 border border-white/10 hover:border-pink-500 text-zinc-405 hover:text-white transition"
                >
                  ⚡ Features
                </button>
                <button
                  onClick={() => handleSendMessage("How much does it cost?")}
                  className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-zinc-900 border border-white/10 hover:border-pink-500 text-zinc-405 hover:text-white transition"
                >
                  💵 Price
                </button>
                <button
                  onClick={() => handleSendMessage("Tell me something environmental.")}
                  className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-zinc-900 border border-white/10 hover:border-pink-500 text-zinc-405 hover:text-white transition"
                >
                  🌱 Eco-Specs
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Ask ${chatBrand.aiName} a fun question...`}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-pink-500 text-white"
                />
                <button
                  onClick={() => handleSendMessage()}
                  className="p-2 rounded-xl bg-pink-500 text-black hover:bg-pink-650 transition cursor-pointer"
                >
                  🚀
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
