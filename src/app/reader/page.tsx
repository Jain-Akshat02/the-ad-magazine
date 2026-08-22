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

export default function ReaderPage() {
  const [pages, setPages] = useState<MagazinePage[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  // Interactive ad state
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [chatBrand, setChatBrand] = useState<BrandAd | null>(null);
  const [chatInput, setChatInput] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "assistant"; text: string; timestamp: string }[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [likedPages, setLikedPages] = useState<Record<string, boolean>>({});
  const [clickedCTA, setClickedCTA] = useState<Record<string, boolean>>({});

  // Performance Log State (Time spent on each page)
  const lastPageRef = useRef<number>(0);
  const pageTimerRef = useRef<number>(0);

  // Floating sparks reaction effect
  const [sparks, setSparks] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    setPages(getMagazinePages());
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    pageTimerRef.current = Date.now();
    return () => {
      recordTimeSpentOnPage(lastPageRef.current);
    };
  }, []);

  useEffect(() => {
    recordTimeSpentOnPage(lastPageRef.current);
    lastPageRef.current = currentPage;
    pageTimerRef.current = Date.now();
  }, [currentPage, isMobile]);

  const recordTimeSpentOnPage = (pageIdx: number) => {
    if (!pages || pages.length === 0) return;
    const elapsedSeconds = Math.round((Date.now() - pageTimerRef.current) / 1000);
    if (elapsedSeconds <= 0) return;

    if (isMobile) {
      const p = pages[pageIdx];
      if (p && p.type === "ad" && p.brandAd) {
        saveAdInteraction(p.brandAd.id, { timeSpent: elapsedSeconds, views: 1 });
      }
    } else {
      const visibleIndices = getVisibleIndices(pageIdx);
      visibleIndices.forEach((idx) => {
        const p = pages[idx];
        if (p && p.type === "ad" && p.brandAd) {
          saveAdInteraction(p.brandAd.id, { timeSpent: elapsedSeconds, views: 1 });
        }
      });
    }
  };

  const getVisibleIndices = (index: number): number[] => {
    if (index === 0) return [0];
    if (index % 2 === 1) {
      return index + 1 < pages.length ? [index, index + 1] : [index];
    } else {
      return [index - 1, index];
    }
  };

  const handleNext = () => {
    if (isMobile) {
      if (currentPage < pages.length - 1) {
        setCurrentPage((prev) => prev + 1);
      }
    } else {
      if (currentPage === 0) {
        setCurrentPage(1);
      } else {
        const nextIdx = currentPage + (currentPage % 2 === 1 ? 2 : 1);
        if (nextIdx < pages.length) {
          setCurrentPage(nextIdx);
        }
      }
    }
    setChatOpen(false);
  };

  const handlePrev = () => {
    if (isMobile) {
      if (currentPage > 0) {
        setCurrentPage((prev) => prev - 1);
      }
    } else {
      if (currentPage === 1) {
        setCurrentPage(0);
      } else {
        const prevIdx = currentPage - (currentPage % 2 === 1 ? 1 : 2);
        if (prevIdx >= 0) {
          setCurrentPage(prevIdx);
        }
      }
    }
    setChatOpen(false);
  };

  const handleLike = (brandId: string, pageId: string, e: React.MouseEvent) => {
    const isAlreadyLiked = likedPages[pageId];
    setLikedPages((prev) => ({ ...prev, [pageId]: !isAlreadyLiked }));
    saveAdInteraction(brandId, { likes: isAlreadyLiked ? -1 : 1 });

    // Trigger sparks
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
    
    alert(`🎉 [Zap Redirect] Wheee! Zooming you away to ${brandId.toUpperCase()}'s happy product world!`);
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
        return "bg-radial from-stone-900 via-zinc-950 to-zinc-950 border-stone-800/60";
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

  const renderPageCard = (idx: number, side: "left" | "right" | "cover") => {
    if (idx < 0 || idx >= pages.length) return null;
    const page = pages[idx];

    const isLeft = side === "left";
    const isRight = side === "right";

    // Editorial layout rendering
    if (page.type === "editorial") {
      return (
        <div 
          className={`flex flex-col justify-between h-full bg-[#fdfaf2] text-stone-900 p-8 md:p-12 relative overflow-hidden transition-all duration-500 shadow-2xl border-4 border-double border-stone-300
            ${isLeft ? "rounded-l-3xl border-r-2" : isRight ? "rounded-r-3xl border-l-2" : "rounded-3xl"}`}
        >
          {/* Header watermark */}
          <div className="flex justify-between items-center text-[10px] tracking-wider text-stone-500 uppercase font-mono border-b-2 border-dashed border-stone-200 pb-2">
            <span>📖 THEADMAGAZINE</span>
            <span>{page.category}</span>
          </div>

          <div className="my-auto flex flex-col gap-5">
            {page.imageUrl && (
              <div className="w-full h-44 md:h-56 overflow-hidden rounded-2xl border-2 border-stone-900 shadow-md relative group">
                <img
                  src={page.imageUrl}
                  alt={page.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            )}
            <div>
              <h2 className="font-black text-2xl md:text-3xl tracking-tight text-stone-900 leading-tight">
                {page.title}
              </h2>
              {page.author && (
                <p className="text-[11px] font-sans italic text-stone-500 mt-1">
                  Penciled by {page.author} &bull; {page.readTime}
                </p>
              )}
            </div>
            
            <p className="text-xs md:text-sm text-stone-800 font-serif leading-relaxed first-letter:text-6xl first-letter:font-black first-letter:float-left first-letter:mr-2.5 first-letter:text-pink-650">
              {page.content}
            </p>
          </div>

          <div className="flex justify-between items-center text-[10px] tracking-wider text-stone-500 font-mono mt-3 pt-2 border-t-2 border-dashed border-stone-200">
            <span>{isLeft ? `PAGE ${idx}` : isRight ? `PAGE ${idx}` : "INTRO PAGE"}</span>
            <span>Laugh &amp; Learn</span>
          </div>
        </div>
      );
    }

    // Sponsor ad layout rendering
    if (page.type === "ad" && page.brandAd) {
      const ad = page.brandAd;
      return (
        <div
          className={`flex flex-col justify-between h-full text-white p-8 md:p-12 relative overflow-hidden transition-all duration-500 border-4 border-dashed shadow-2xl
            ${getThemeBackground(ad.theme)}
            ${isLeft ? "rounded-l-3xl border-r-2" : isRight ? "rounded-r-3xl border-l-2" : "rounded-3xl"}`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:16px_16px]"></div>
          
          <div className="flex justify-between items-center text-[9px] tracking-widest text-zinc-400 font-mono z-10">
            <span className="bg-white/10 px-2 py-0.5 rounded-full text-yellow-350">SPONSOR PLAYGROUND 🎪</span>
            <button
              onClick={(e) => handleLike(ad.id, page.id, e)}
              className="flex items-center gap-1.5 focus:outline-none group text-zinc-400 hover:text-pink-400 transition-colors cursor-pointer"
            >
              <span className="text-base">{likedPages[page.id] ? "💖" : "🖤"}</span>
              <span className="font-mono text-[9px]">{likedPages[page.id] ? "Loved!" : "Like!"}</span>
            </button>
          </div>

          {/* Ad main content */}
          <div className="my-auto flex flex-col gap-4 z-10">
            <div className="flex items-center gap-2">
              <div className="h-8 w-1.5 bg-gradient-to-b from-pink-500 to-yellow-500 rounded-full animate-bounce"></div>
              <div>
                <h3 className="text-xl md:text-2xl font-black tracking-tight">{ad.name}</h3>
                <p className="text-[10px] text-yellow-405 font-mono tracking-tight font-bold">{ad.tagline}</p>
              </div>
            </div>

            <div className="w-full h-36 md:h-44 overflow-hidden rounded-2xl relative border-2 border-white/20 group shadow-lg">
              <img
                src={ad.imageUrl}
                alt={ad.name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
              <div className="absolute bottom-2.5 left-2.5 right-2.5 text-[10px] text-zinc-200">
                <p className="line-clamp-2 md:line-clamp-3 leading-relaxed font-sans">{ad.description}</p>
              </div>
            </div>

            {/* Bullet points */}
            <ul className="text-[10px] md:text-xs text-zinc-350 font-mono space-y-1 bg-white/5 p-2.5 rounded-xl border border-white/10">
              {ad.features.slice(0, 3).map((feat, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <span>✨</span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            {/* Actions triggers */}
            <div className="grid grid-cols-2 gap-3 mt-1 text-xs">
              <button
                onClick={() => handleCTA(ad.id, page.id)}
                className={`py-2 px-3 rounded-xl font-bold border-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 shadow-md cursor-pointer ${
                  clickedCTA[page.id] ? "bg-white/10 scale-95" : getThemeColorClass(ad.theme)
                }`}
              >
                {clickedCTA[page.id] ? "Connecting... ⚡" : ad.ctaText}
              </button>
              <button
                onClick={() => handleOpenChat(ad)}
                className="py-2 px-3 rounded-xl font-bold bg-white text-black hover:bg-neutral-200 border-2 border-white transition-all transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 text-center flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                🤖 Ask Agent
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] tracking-wider text-zinc-550 font-mono mt-3 pt-2 border-t border-white/5">
            <span>PAGE {idx}</span>
            <span>THEAD NETWORK ⚡</span>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderIndicators = () => {
    return (
      <div className="flex items-center gap-2 justify-center py-3 bg-zinc-950/60 backdrop-blur rounded-2xl px-6 border border-white/10 max-w-sm mx-auto mt-6 shadow-xl">
        <button
          onClick={handlePrev}
          disabled={currentPage === 0}
          className="p-1 px-3 text-xs font-mono uppercase bg-neutral-900 border border-white/10 hover:border-pink-500 hover:text-pink-400 text-white rounded-lg transition disabled:opacity-40"
        >
          👈 Prev
        </button>
        <span className="text-[11px] font-mono text-zinc-400 px-2.5">
          {currentPage + 1} / {pages.length}
        </span>
        <button
          onClick={handleNext}
          disabled={
            isMobile
              ? currentPage === pages.length - 1
              : currentPage >= pages.length - 2
          }
          className="p-1 px-3 text-xs font-mono uppercase bg-neutral-900 border border-white/10 hover:border-pink-500 hover:text-pink-400 text-white rounded-lg transition disabled:opacity-40"
        >
          Next 👉
        </button>
      </div>
    );
  };

  const renderSpread = () => {
    if (pages.length === 0) return null;
    
    if (currentPage === 0) {
      return (
        <div className="max-w-xl mx-auto w-full h-[650px] transition-all duration-300">
          {renderPageCard(0, "cover")}
        </div>
      );
    }

    const indices = getVisibleIndices(currentPage);
    const leftIdx = indices[0];
    const rightIdx = indices.length > 1 ? indices[1] : -1;

    return (
      <div className="flex w-full items-center justify-center max-w-5xl h-[680px] bg-gradient-to-br from-neutral-950 via-zinc-900 to-black p-4 rounded-3xl border-4 border-dashed border-white/10 shadow-3xl relative">
        <div className="grid grid-cols-2 w-full h-full gap-0 relative">
          
          <div className="h-full z-10">
            {renderPageCard(leftIdx, "left")}
          </div>

          {/* Spine crease shadow */}
          <div className="absolute top-0 bottom-0 left-1/2 w-[24px] -ml-[12px] z-20 pointer-events-none bg-gradient-to-r from-black/45 via-black/90 to-black/45 border-l border-r border-black/40"></div>
          
          <div className="h-full z-10">
            {rightIdx !== -1 ? (
              renderPageCard(rightIdx, "right")
            ) : (
              <div className="h-full bg-zinc-950 rounded-r-3xl border-l-2 border-zinc-800 flex items-center justify-center p-8 text-center border-4 border-double border-zinc-900">
                <div>
                  <h4 className="text-pink-500 font-mono text-sm uppercase font-bold">SLOT OPEN FOR SPONSOR! 🎫</h4>
                  <p className="text-xs text-zinc-550 mt-2">Become a sponsor to list your custom AI ad page right here in real time!</p>
                  <Link href="/buy-page" className="inline-block mt-4 text-xs font-mono font-bold py-2.5 px-5 rounded-xl bg-white text-black hover:bg-neutral-200 transition">
                    Book Placement! 🚀
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0d0914] text-white flex flex-col justify-between font-sans selection:bg-pink-500 relative">
      
      {/* Confetti spark markers */}
      {sparks.map((spark) => (
        <span
          key={spark.id}
          className="absolute text-xl pointer-events-none animate-ping z-50"
          style={{ left: spark.x, top: spark.y }}
        >
          ✨
        </span>
      ))}

      {/* Header */}
      <header className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-zinc-950/40 backdrop-blur sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-pink-500 to-yellow-500 flex items-center justify-center font-bold text-black text-sm rotate-[-4deg] group-hover:rotate-6">ad</div>
          <span className="font-extrabold text-base tracking-tight text-zinc-200">thead<span className="text-pink-500">magazine</span></span>
        </Link>
        
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-xs tracking-wider uppercase font-mono text-cyan-400 hover:text-white transition">
            📈 Brand Dashboard &rarr;
          </Link>
          <Link href="/buy-page" className="py-2 px-3 rounded-xl bg-pink-550 text-xs font-bold text-black hover:scale-105 active:scale-95 transition">
            Buy Ad Page 🛒
          </Link>
        </div>
      </header>

      {/* Main Magazine stage */}
      <main className="flex-1 flex flex-col justify-center items-center py-6 px-4 md:px-8">
        {pages.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3">
            <span className="h-6 w-6 border-2 border-pink-550 border-t-white animate-spin rounded-full"></span>
            <p className="text-xs font-mono text-zinc-550">Compiling goofy stories...</p>
          </div>
        ) : isMobile ? (
          <div className="w-full max-w-md h-[580px]">
            {renderPageCard(currentPage, "cover")}
          </div>
        ) : (
          renderSpread()
        )}

        {pages.length > 0 && renderIndicators()}
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-white/10 uppercase tracking-widest text-[9px] text-zinc-550 text-center font-mono bg-black/40">
        &copy; 2026 theadmagazine pub &bull; interactive AI playground
      </footer>

      {/* AI REPRESENTATIVE CHAT SIDE PANEL */}
      {chatOpen && chatBrand && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-[#0e0a16] border-l border-white/10 h-full flex flex-col justify-between shadow-2xl relative animate-slide-in">
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
                      : "bg-purple-950/40 border-pink-500/20 text-zinc-105 rounded-tl-none font-mono"
                  }`}>
                    <p>{chat.text}</p>
                    <span className="block text-[8px] text-zinc-500 text-right mt-1">{chat.timestamp}</span>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-zinc-900 border border-white/5 text-zinc-405 rounded-xl rounded-tl-none p-3 shadow-md">
                    <div className="flex gap-1.5 items-center py-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-bounce"></span>
                      <span className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-bounce [animation-delay:0.2s]"></span>
                      <span className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-bounce [animation-delay:0.4s]"></span>
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
                  className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-zinc-900 border border-white/10 hover:border-pink-505 text-zinc-400 hover:text-white transition"
                >
                  ⚡ Features
                </button>
                <button
                  onClick={() => handleSendMessage("How much does it cost?")}
                  className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-zinc-900 border border-white/10 hover:border-pink-505 text-zinc-400 hover:text-white transition"
                >
                  💵 Price
                </button>
                <button
                  onClick={() => handleSendMessage("Is it environmental / organic?")}
                  className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-zinc-900 border border-white/10 hover:border-pink-505 text-zinc-400 hover:text-white transition"
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
                  className="p-2 rounded-xl bg-pink-500 text-black hover:bg-pink-600 transition cursor-pointer"
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
