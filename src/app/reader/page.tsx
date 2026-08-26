"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  getMagazinePages,
  fetchMagazinePagesFromApi,
  saveAdInteraction,
  simulateAIChat,
  type MagazinePage,
  type BrandAd,
  type ThemeMode,
} from "@/utils/magazineState";
import CoverPage from "@/components/magazine/CoverPage";
import EditorialPage from "@/components/magazine/EditorialPage";
import BrandAdPage from "@/components/magazine/BrandAdPage";
import BannerAdPage from "@/components/magazine/BannerAdPage";
import ReaderChrome from "@/components/magazine/ReaderChrome";
import ChatPanel from "@/components/magazine/ChatPanel";
import { getReaderShellBackground } from "@/components/magazine/theme";

export default function ReaderPage() {
  const [pages, setPages] = useState<MagazinePage[]>([]);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");

  const [chatOpen, setChatOpen] = useState(false);
  const [chatBrand, setChatBrand] = useState<BrandAd | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<
    { role: "user" | "assistant"; text: string; timestamp: string }[]
  >([]);
  const [isTyping, setIsTyping] = useState(false);

  const [likedPages, setLikedPages] = useState<Record<string, boolean>>({});
  const [clickedCTA, setClickedCTA] = useState<Record<string, boolean>>({});

  const scrollRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pageTimers = useRef<Record<string, number>>({});
  const activePageRef = useRef(0);

  useEffect(() => {
    const loadedPages = getMagazinePages();
    setPages(loadedPages);

    const initialTimers: Record<string, number> = {};
    loadedPages.forEach((p) => {
      initialTimers[p.id] = 0;
    });
    pageTimers.current = { ...initialTimers, activeStartTime: Date.now() };
  }, []);

  const recordTimeElapsed = useCallback(
    (index: number) => {
      if (!pages[index]) return;
      const page = pages[index];
      const elapsed = Math.round(
        (Date.now() - (pageTimers.current.activeStartTime || Date.now())) / 1000
      );
      if (elapsed > 0 && page.type === "ad" && page.brandAd) {
        saveAdInteraction(page.brandAd.id, { timeSpent: elapsed });
      }
    },
    [pages]
  );

  useEffect(() => {
    if (pages.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = parseInt(entry.target.getAttribute("data-page-index") || "0", 10);
          const prevIndex = activePageRef.current;

          if (prevIndex !== index) {
            recordTimeElapsed(prevIndex);
            setActivePageIndex(index);
            activePageRef.current = index;
            pageTimers.current.activeStartTime = Date.now();

            const targetPage = pages[index];
            if (targetPage?.type === "ad" && targetPage.brandAd) {
              saveAdInteraction(targetPage.brandAd.id, { views: 1 });
            }
          }
        });
      },
      { root: scrollRef.current, threshold: 0.55 }
    );

    pageRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      recordTimeElapsed(activePageRef.current);
      observer.disconnect();
    };
  }, [pages, recordTimeElapsed]);

  const handleScrollToPage = (index: number) => {
    pageRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleLike = (brandId: string, pageId: string, e: React.MouseEvent) => {
    const isAlreadyLiked = likedPages[pageId];
    setLikedPages((prev) => ({ ...prev, [pageId]: !isAlreadyLiked }));
    saveAdInteraction(brandId, { likes: isAlreadyLiked ? -1 : 1 });
    e.stopPropagation();
  };

  const handleCTA = (brand: BrandAd, pageId: string, url?: string) => {
    setClickedCTA((prev) => ({ ...prev, [pageId]: true }));
    saveAdInteraction(brand.id, { clicks: 1 });

    const targetUrl = url || brand.ctaUrl;
    if (targetUrl) {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    } else {
      alert(`Redirecting to ${brand.name}!`);
    }

    setTimeout(() => {
      setClickedCTA((prev) => ({ ...prev, [pageId]: false }));
    }, 2000);
  };

  const handleSecondaryCTA = (brand: BrandAd, pageId: string) => {
    saveAdInteraction(brand.id, { clicks: 1 });
    if (brand.secondaryCtaUrl) {
      window.open(brand.secondaryCtaUrl, "_blank", "noopener,noreferrer");
    } else {
      alert(`Contact ${brand.name} — add a contact link when setting up your ad.`);
    }
  };

  const handleOpenChat = (brandAd: BrandAd) => {
    setChatBrand(brandAd);
    setChatOpen(true);
    saveAdInteraction(brandAd.id, { chatSessions: 1 });
    setChatHistory([
      {
        role: "assistant",
        text: `Hi! I'm ${brandAd.aiName}, representing ${brandAd.name}. What would you like to know?`,
        timestamp: "Just now",
      },
    ]);
  };

  const handleSendMessage = (textToSend?: string) => {
    const msgText = textToSend || chatInput;
    if (!msgText.trim() || !chatBrand) return;

    if (!textToSend) setChatInput("");

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

  const assignRef = (idx: number) => (el: HTMLDivElement | null) => {
    pageRefs.current[idx] = el;
  };

  return (
    <div className={`h-dvh overflow-hidden ${getReaderShellBackground(themeMode)}`}>
      <ReaderChrome
        themeMode={themeMode}
        onThemeChange={setThemeMode}
        pages={pages}
        activePageIndex={activePageIndex}
        onNavigate={handleScrollToPage}
      />

      <div
        ref={scrollRef}
        className="magazine-scroll h-dvh snap-y snap-mandatory overflow-y-auto scroll-smooth"
      >
        {pages.length === 0 ? (
          <div className="flex h-dvh flex-col items-center justify-center gap-3">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-pink-550 border-t-transparent" />
            <p className="text-xs font-mono text-zinc-500">Loading issue...</p>
          </div>
        ) : (
          pages.map((page, idx) => {
            const pageNumber = idx + 1;
            const wrapperProps = {
              ref: assignRef(idx),
              "data-page-index": idx,
            };

            if (page.id === "cover") {
              return (
                <div key={page.id} {...wrapperProps}>
                  <CoverPage
                    title={page.title}
                    category={page.category}
                    content={page.content}
                    themeMode={themeMode}
                    pageNumber={pageNumber}
                    onScrollNext={() => handleScrollToPage(1)}
                  />
                </div>
              );
            }

            if (page.type === "editorial") {
              return (
                <div key={page.id} {...wrapperProps}>
                  <EditorialPage
                    title={page.title}
                    author={page.author}
                    category={page.category}
                    readTime={page.readTime}
                    content={page.content}
                    imageUrl={page.imageUrl}
                    themeMode={themeMode}
                    pageNumber={pageNumber}
                  />
                </div>
              );
            }

            if (page.type === "ad" && page.brandAd) {
              const ad = page.brandAd;

              if (ad.format === "banner-only") {
                return (
                  <div key={page.id} {...wrapperProps}>
                    <BannerAdPage
                      ad={ad}
                      themeMode={themeMode}
                      pageNumber={pageNumber}
                      isLiked={Boolean(likedPages[page.id])}
                      onLike={(e) => handleLike(ad.id, page.id, e)}
                      onPrimaryCta={() => handleCTA(ad, page.id, ad.ctaUrl)}
                      onSecondaryCta={() => handleSecondaryCTA(ad, page.id)}
                    />
                  </div>
                );
              }

              return (
                <div key={page.id} {...wrapperProps}>
                  <BrandAdPage
                    ad={ad}
                    pageId={page.id}
                    themeMode={themeMode}
                    pageNumber={pageNumber}
                    isLiked={Boolean(likedPages[page.id])}
                    isCtaClicked={Boolean(clickedCTA[page.id])}
                    onLike={(e) => handleLike(ad.id, page.id, e)}
                    onCta={() => handleCTA(ad, page.id)}
                    onOpenChat={() => handleOpenChat(ad)}
                  />
                </div>
              );
            }

            return null;
          })
        )}
      </div>

      {chatBrand && (
        <ChatPanel
          brand={chatBrand}
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          chatHistory={chatHistory}
          chatInput={chatInput}
          isTyping={isTyping}
          onInputChange={setChatInput}
          onSend={handleSendMessage}
        />
      )}
    </div>
  );
}
