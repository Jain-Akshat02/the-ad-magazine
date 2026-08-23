"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createBrandFromMinimal,
  saveCustomAd,
  simulateAIChat,
  type BrandAd,
  type BrandFormat,
} from "@/utils/magazineState";
import Header from "@/components/Header";
import BrandAdPage from "@/components/magazine/BrandAdPage";
import BannerAdPage from "@/components/magazine/BannerAdPage";

const PRESET_IMAGES = [
  { name: "Watch", url: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&q=80&w=1200" },
  { name: "Car", url: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1200" },
  { name: "Fashion", url: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&q=80&w=1200" },
  { name: "Drink", url: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=1200" },
];

export default function BuyPage() {
  const router = useRouter();

  const [adName, setAdName] = useState("");
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[3].url);
  const [format, setFormat] = useState<BrandFormat>("interactive");
  const [tagline, setTagline] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [secondaryCtaText, setSecondaryCtaText] = useState("");
  const [secondaryCtaUrl, setSecondaryCtaUrl] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [aiName, setAiName] = useState("");
  const [aiPersona, setAiPersona] = useState("");

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successPublish, setSuccessPublish] = useState(false);

  const previewBrand: BrandAd = useMemo(() => {
    const name = adName.trim() || "Your Brand";
    return createBrandFromMinimal(name, imageUrl, {
      format,
      tagline: tagline.trim() || undefined,
      ctaText: ctaText.trim() || undefined,
      ctaUrl: ctaUrl.trim() || undefined,
      secondaryCtaText: secondaryCtaText.trim() || undefined,
      secondaryCtaUrl: secondaryCtaUrl.trim() || undefined,
      aiName: aiName.trim() || undefined,
      aiPersona: aiPersona.trim() || undefined,
    });
  }, [adName, imageUrl, format, tagline, ctaText, ctaUrl, secondaryCtaText, secondaryCtaUrl, aiName, aiPersona]);

  const canPublish = adName.trim().length > 0 && imageUrl.trim().length > 0;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPublish) return;

    setIsProcessing(true);
    const brand = createBrandFromMinimal(adName.trim(), imageUrl.trim(), {
      format,
      tagline: tagline.trim() || undefined,
      ctaText: ctaText.trim() || undefined,
      ctaUrl: ctaUrl.trim() || undefined,
      secondaryCtaText: secondaryCtaText.trim() || undefined,
      secondaryCtaUrl: secondaryCtaUrl.trim() || undefined,
      aiName: aiName.trim() || undefined,
      aiPersona: aiPersona.trim() || undefined,
    });

    setTimeout(() => {
      saveCustomAd(brand);
      setIsProcessing(false);
      setSuccessPublish(true);
    }, 1200);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0d0914] text-white">
      <Header />

      <main className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-8 p-4 md:p-8 lg:grid-cols-2">
        <section className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-zinc-950/65 p-6 shadow-xl">
          <div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-yellow-450">
              Ad placement
            </span>
            <h2 className="mt-3 text-xl font-black">Add your brand to the issue</h2>
            <p className="mt-1 text-xs text-zinc-400">
              Only brand name and banner are required. Everything else is auto-filled.
            </p>
          </div>

          <div className="flex flex-col gap-4 text-xs">
            <label className="flex flex-col gap-1.5">
              <span className="font-bold text-zinc-300">Brand name *</span>
              <input
                type="text"
                value={adName}
                onChange={(e) => setAdName(e.target.value)}
                placeholder="e.g. Silly Soda Co."
                className="rounded-xl border border-white/10 bg-zinc-900 p-2.5 text-white outline-none focus:border-pink-500"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="font-bold text-zinc-300">Banner image *</span>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_IMAGES.map((img) => (
                  <button
                    key={img.name}
                    type="button"
                    onClick={() => setImageUrl(img.url)}
                    className={`cursor-pointer rounded-lg border p-1 text-[9px] font-bold transition ${
                      imageUrl === img.url
                        ? "border-white bg-white text-black"
                        : "border-white/10 bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
                    }`}
                  >
                    {img.name}
                  </button>
                ))}
              </div>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Or paste your banner URL"
                className="rounded-xl border border-white/10 bg-zinc-900 p-2.5 text-white outline-none focus:border-pink-500"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="font-bold text-zinc-300">Page format</span>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as BrandFormat)}
                className="cursor-pointer rounded-xl border border-white/10 bg-zinc-900 p-2.5 text-white outline-none focus:border-pink-500"
              >
                <option value="interactive">Interactive (banner + chat + CTA)</option>
                <option value="banner-only">Simple (full-page banner + 2 buttons)</option>
              </select>
            </label>

            {format === "banner-only" && (
              <div className="flex flex-col gap-3 rounded-xl border border-pink-500/20 bg-pink-500/5 p-4">
                <p className="text-[10px] font-mono uppercase tracking-wider text-pink-300">
                  Two action buttons
                </p>
                <label className="flex flex-col gap-1">
                  <span className="text-zinc-300">Button 1 label</span>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="Visit Website / View Catalogue"
                    className="rounded-xl border border-white/10 bg-zinc-900 p-2.5 text-white outline-none focus:border-pink-500"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-zinc-300">Button 1 link</span>
                  <input
                    type="url"
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    placeholder="https://yourbrand.com"
                    className="rounded-xl border border-white/10 bg-zinc-900 p-2.5 text-white outline-none focus:border-pink-500"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-zinc-300">Button 2 label</span>
                  <input
                    type="text"
                    value={secondaryCtaText}
                    onChange={(e) => setSecondaryCtaText(e.target.value)}
                    placeholder="Contact Brand"
                    className="rounded-xl border border-white/10 bg-zinc-900 p-2.5 text-white outline-none focus:border-pink-500"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-zinc-300">Button 2 link</span>
                  <input
                    type="url"
                    value={secondaryCtaUrl}
                    onChange={(e) => setSecondaryCtaUrl(e.target.value)}
                    placeholder="mailto:hello@brand.com or contact page"
                    className="rounded-xl border border-white/10 bg-zinc-900 p-2.5 text-white outline-none focus:border-pink-500"
                  />
                </label>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className="cursor-pointer text-left text-[10px] font-mono uppercase tracking-wider text-pink-400"
            >
              {showAdvanced ? "− Hide optional fields" : "+ Optional: tagline, AI settings"}
            </button>

            {showAdvanced && (
              <div className="flex flex-col gap-3 rounded-xl border border-white/5 bg-zinc-900/40 p-4">
                <label className="flex flex-col gap-1">
                  <span className="text-zinc-400">Tagline</span>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="Auto-generated if empty"
                    className="rounded-xl border border-white/10 bg-zinc-900 p-2.5 text-white outline-none focus:border-pink-500"
                  />
                </label>
                {format === "interactive" && (
                  <>
                    <label className="flex flex-col gap-1">
                      <span className="text-zinc-400">Website / CTA link</span>
                      <input
                        type="url"
                        value={ctaUrl}
                        onChange={(e) => setCtaUrl(e.target.value)}
                        placeholder="https://yourbrand.com"
                        className="rounded-xl border border-white/10 bg-zinc-900 p-2.5 text-white outline-none focus:border-pink-500"
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-zinc-400">AI assistant name</span>
                      <input
                        type="text"
                        value={aiName}
                        onChange={(e) => setAiName(e.target.value)}
                        placeholder="Auto-generated if empty"
                        className="rounded-xl border border-white/10 bg-zinc-900 p-2.5 text-white outline-none focus:border-pink-500"
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-zinc-400">AI persona prompt</span>
                      <textarea
                        rows={3}
                        value={aiPersona}
                        onChange={(e) => setAiPersona(e.target.value)}
                        placeholder="Auto-generated if empty"
                        className="resize-none rounded-xl border border-white/10 bg-zinc-900 p-2.5 text-white outline-none focus:border-pink-500"
                      />
                    </label>
                  </>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={!canPublish}
            onClick={() => setCheckoutOpen(true)}
            className="cursor-pointer rounded-xl bg-pink-500 py-3.5 text-xs font-black text-black transition hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Review &amp; publish ($950/issue)
          </button>
        </section>

        <section className="flex flex-col gap-3">
          <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
            Full-page preview (light mode)
          </p>
          <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
            <div className="magazine-scroll h-[min(78vh,720px)] snap-y snap-mandatory overflow-y-auto">
              {format === "banner-only" ? (
                <BannerAdPage
                  ad={previewBrand}
                  themeMode="light"
                  pageNumber={1}
                  isLiked={false}
                  onLike={() => {}}
                  onPrimaryCta={() => {}}
                  onSecondaryCta={() => {}}
                />
              ) : (
                <BrandAdPage
                  ad={previewBrand}
                  pageId="preview"
                  themeMode="light"
                  pageNumber={1}
                  isLiked={false}
                  isCtaClicked={false}
                  onLike={() => {}}
                  onCta={() => {}}
                  onOpenChat={() => {
                    if (previewBrand.aiName) {
                      alert(simulateAIChat(previewBrand, "Tell me about your brand"));
                    }
                  }}
                />
              )}
            </div>
          </div>
          <p className="text-[10px] text-zinc-500">
            This is exactly how your page appears in the reader — full viewport, no container card.
          </p>
        </section>
      </main>

      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d0914] p-6 text-xs shadow-2xl">
            {successPublish ? (
              <div className="flex flex-col items-center gap-4 text-center">
                <span className="text-4xl">🎉</span>
                <h4 className="text-base font-bold">Placement secured!</h4>
                <p className="text-zinc-400">
                  <b>{adName}</b> is live in the current issue.
                </p>
                <div className="flex w-full flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCheckoutOpen(false);
                      setSuccessPublish(false);
                      router.push("/reader");
                    }}
                    className="cursor-pointer rounded-xl bg-white py-2.5 font-bold text-black"
                  >
                    View in reader
                  </button>
                  <Link
                    href="/dashboard"
                    className="rounded-xl border border-white/10 py-2.5 text-center font-bold text-zinc-300"
                  >
                    Open dashboard
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCheckoutSubmit} className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h4 className="text-sm font-black">Checkout</h4>
                  <button
                    type="button"
                    onClick={() => setCheckoutOpen(false)}
                    className="cursor-pointer text-zinc-500 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <div className="rounded-xl border border-white/5 bg-zinc-900/60 p-4">
                  <span className="text-[10px] uppercase text-zinc-500">Placement</span>
                  <p className="mt-1 text-zinc-300">
                    {adName} · {format === "banner-only" ? "Banner page" : "Interactive page"}
                  </p>
                  <p className="mt-2 text-sm font-bold text-pink-400">$950.00</p>
                </div>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="cursor-pointer rounded-xl bg-pink-500 py-3.5 font-bold text-black disabled:opacity-60"
                >
                  {isProcessing ? "Processing..." : "Confirm payment"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
