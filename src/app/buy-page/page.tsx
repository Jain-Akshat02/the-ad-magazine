"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandAd, simulateAIChat } from "../../utils/magazineState";
import Header from "../../components/Header";

const PRESET_IMAGES = [
  { name: "TickTock Toys 🕰️", url: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&q=80&w=1000" },
  { name: "ZapBuggy Car 🏎️", url: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1000" },
  { name: "Cozy Fleece 🧥", url: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&q=80&w=1000" },
  { name: "Sparkling Soda 🥤", url: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=1000" }
];

export default function BuyPage() {
  const router = useRouter();

  // Configurator state
  const [adName, setAdName] = useState<string>("Silly Soda");
  const [tagline, setTagline] = useState<string>("Bubbly drinks that tickle your nose! 🥤✨");
  const [imageUrl, setImageUrl] = useState<string>(PRESET_IMAGES[3].url);
  const [selectedTheme, setSelectedTheme] = useState<'gold' | 'dark' | 'emerald' | 'glass' | 'bubblegum' | 'neon'>("bubblegum");
  const [ctaText, setCtaText] = useState<string>("Grab Free Can! 🥤");
  const [aiName, setAiName] = useState<string>("Fizzy");
  const [aiPersona, setAiPersona] = useState<string>(
    "You are Fizzy, a highly excited, bubbly soda helper for Silly Soda. Talk about popping carbonation bubbles, giant fruity slushes, and freeze-brain high fives! Use emojis like 🥤, 💥, 🍓, 🧊. Keep answers 1-2 rapid lines."
  );
  const [features, setFeatures] = useState<string>(
    "100% Pop Carbonation 💥, Free Freeze Brain Ice Cubes 🧊, Giggle inducing flavors 🍓"
  );

  // Sandboxed Tester state
  const [sandboxMessages, setSandboxMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [sandboxIntput, setSandboxInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [testerOpen, setTesterOpen] = useState<boolean>(false);

  // Checkout modal states
  const [checkoutOpen, setCheckoutOpen] = useState<boolean>(false);
  const [cardName, setCardName] = useState<string>("");
  const [cardNumber, setCardNumber] = useState<string>("4242 4242 4242 4242");
  const [cardExpiry, setCardExpiry] = useState<string>("12/28");
  const [cardCvc, setCardCvc] = useState<string>("424");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successPublish, setSuccessPublish] = useState<boolean>(false);

  useEffect(() => {
    setSandboxMessages([
      {
        role: "assistant",
        text: `Woohoo! 💥 I am ${aiName}, your customized brand avatar for ${adName}. Ask me anything, let's play!`
      }
    ]);
  }, [adName, aiName]);

  const handleSendSandbox = () => {
    if (!sandboxIntput.trim()) return;
    const userMsg = { role: 'user' as const, text: sandboxIntput };
    setSandboxMessages((prev) => [...prev, userMsg]);
    setSandboxInput("");
    setIsTyping(true);

    const simulatedSelf: BrandAd = {
      id: adName.toLowerCase().replace(/\s+/g, ""),
      name: adName,
      tagline,
      imageUrl,
      theme: selectedTheme,
      ctaText,
      aiName,
      aiPersona,
      description: `A brand-new customized presentation slide card for ${adName}.`,
      features: features.split(",").map(f => f.trim()).filter(Boolean)
    };

    setTimeout(() => {
      const reply = simulateAIChat(simulatedSelf, userMsg.text);
      setSandboxMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
      setIsTyping(false);
    }, 750);
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Create the brand sponsorship payload
    const newBrand: BrandAd = {
      id: adName.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now().toString().slice(-4),
      name: adName,
      tagline,
      imageUrl,
      theme: selectedTheme,
      ctaText,
      aiName,
      aiPersona,
      description: `A brand-new funny sponsored presentation block for ${adName}. Built by readers in real time!`,
      features: features.split(",").map(f => f.trim()).filter(Boolean)
    };

    setTimeout(() => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("thead_custom_ads");
        const list: BrandAd[] = stored ? JSON.parse(stored) : [];
        list.push(newBrand);
        localStorage.setItem("thead_custom_ads", JSON.stringify(list));
        localStorage.setItem("thead_subscribed", "true");
      }

      setIsProcessing(false);
      setSuccessPublish(true);
    }, 1800);
  };

  const getThemeBackground = (theme: string) => {
    switch (theme) {
      case "gold": return "bg-radial from-[#3a2c16] via-[#1c1206] to-[#0f0a03] border-yellow-500/40";
      case "dark": return "bg-radial from-[#0c2f47] via-[#091b29] to-[#030b11] border-cyan-400/40";
      case "emerald": return "bg-radial from-[#083821] via-[#041a0e] to-[#010905] border-emerald-400/40";
      case "bubblegum": return "bg-radial from-pink-900/60 via-purple-950/80 to-zinc-950 border-pink-400/40";
      case "glass":
      default: return "bg-radial from-stone-900 via-zinc-950 to-zinc-950 border-stone-850/60";
    }
  };

  const getThemeColorClass = (theme: string) => {
    switch (theme) {
      case "gold": return "bg-yellow-500 hover:bg-yellow-600 text-black border-yellow-400";
      case "dark": return "bg-cyan-500 hover:bg-cyan-600 text-black border-cyan-400";
      case "emerald": return "bg-emerald-500 hover:bg-emerald-600 text-black border-emerald-400";
      case "bubblegum": return "bg-pink-500 hover:bg-pink-600 text-black border-pink-400";
      case "glass":
      default: return "bg-white hover:bg-zinc-200 text-black border-white";
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0914] text-white flex flex-col justify-between font-sans selection:bg-pink-500">
      
      {/* Header */}
      <Header />

      {/* Main split-screen */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-3 bg-zinc-950/65 border-2 border-white/5 rounded-3xl p-6 flex flex-col justify-between gap-6 shadow-xl relative">
          
          <div className="flex flex-col gap-5">
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-yellow-450 font-bold bg-white/5 py-1 px-3 rounded-full border border-white/10">Ad Customizer 🎨</span>
              <h2 className="text-xl font-serif text-white font-black mt-3">Book &amp; Design Ad Space</h2>
              <p className="text-xs text-zinc-400 mt-1">Configure funny slogans and customize your robot chat responder persona.</p>
            </div>

            {/* Config inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-450 font-bold">Brand Name</label>
                <input
                  type="text"
                  value={adName}
                  onChange={(e) => setAdName(e.target.value)}
                  className="bg-zinc-900 border border-white/10 rounded-xl p-2.5 outline-none focus:border-pink-500 transition text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-450 font-bold">Fun Slogan / Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="bg-zinc-900 border border-white/10 rounded-xl p-2.5 outline-none focus:border-pink-500 transition text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-450 font-bold">CTA Button Text</label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  className="bg-zinc-900 border border-white/10 rounded-xl p-2.5 outline-none focus:border-pink-500 transition text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-450 font-bold">Bubble color scheme template</label>
                <select
                  value={selectedTheme}
                  onChange={(e: any) => setSelectedTheme(e.target.value)}
                  className="bg-zinc-900 border border-white/10 rounded-xl p-2.5 outline-none focus:border-pink-500 transition text-white"
                >
                  <option value="bubblegum">Bubblegum Pink (Sweet &amp; Cheerful)</option>
                  <option value="dark">Ocean Cyan (ZapBuggy style)</option>
                  <option value="gold">Warm Gold Glow (TickTock clock style)</option>
                  <option value="emerald">Forest Green (PuffyCo Outfitters style)</option>
                  <option value="glass">Glass Frosted (Minimalist vibe)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-zinc-450 font-bold">Fun illustrative images presets</label>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_IMAGES.map((img) => (
                    <button
                      key={img.name}
                      onClick={() => setImageUrl(img.url)}
                      className={`p-1.5 rounded-xl border text-[9px] truncate transition cursor-pointer font-bold ${
                        imageUrl === img.url ? "bg-white text-black border-white" : "bg-zinc-900 border-white/10 text-zinc-350 hover:bg-zinc-800"
                      }`}
                    >
                      {img.name}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={imageUrl}
                  placeholder="Or provide direct custom image url..."
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="bg-zinc-900 border border-white/10 rounded-xl p-2 mt-2 text-[10px] outline-none focus:border-pink-500 transition text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-zinc-450 font-bold">Crazy features (Comma-separated values)</label>
                <input
                  type="text"
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  placeholder="e.g. Free milkshakes, Synthesizer alarms, Sparkly tires"
                  className="bg-zinc-900 border border-white/10 rounded-xl p-2.5 outline-none focus:border-pink-500 transition text-white"
                />
              </div>

            </div>

            {/* AI setting instructions */}
            <div className="border-t border-white/10 pt-4 mt-2 flex flex-col gap-3 font-mono text-xs">
              <h3 className="text-sm font-serif font-black text-pink-400">Teach Your Customer Assistant Bot 🤖</h3>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-450 font-bold">Assistant Name</label>
                <input
                  type="text"
                  value={aiName}
                  onChange={(e) => setAiName(e.target.value)}
                  className="bg-zinc-900 border border-white/10 rounded-xl p-2.5 outline-none focus:border-pink-500 transition text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-450 font-bold">Write prompt instructions (behavior guidelines)</label>
                <textarea
                  rows={3}
                  value={aiPersona}
                  onChange={(e) => setAiPersona(e.target.value)}
                  className="bg-zinc-900 border border-white/10 rounded-xl p-2.5 outline-none focus:border-pink-500 transition text-white resize-none"
                />
              </div>
            </div>

          </div>

          <button
            onClick={() => setCheckoutOpen(true)}
            className="w-full bg-pink-500 hover:bg-pink-600 text-black py-3.5 rounded-xl text-xs font-mono font-black transition-all hover:scale-[1.01] cursor-pointer text-center"
          >
            Review &amp; Book Page Placement ($950/Issue) 🎉
          </button>
        </div>

        {/* Right Column: Visual Preview */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-500 block text-center lg:text-left">
            Live Preview (Goofy Simulation)
          </span>

          <div className="flex-1 flex flex-col justify-center items-center">
            
            {/* Visual template viewer container */}
            <div 
              className={`w-full max-w-sm h-[500px] border-4 border-dashed shadow-2xl rounded-3xl p-6 relative overflow-hidden transition-all duration-300 flex flex-col justify-between text-white ${
                getThemeBackground(selectedTheme)
              }`}
            >
              <div className="absolute inset-0 bg-[#ffffff03] [background-size:16px_16px]"></div>

              <div className="flex justify-between items-center text-[9px] tracking-widest text-zinc-400 font-mono z-10">
                <span>SIMULATOR MODE</span>
                <span className="flex items-center gap-1.5 text-zinc-400 cursor-default">
                  🖤 Like
                </span>
              </div>

              <div className="my-auto flex flex-col gap-4 z-10">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-1 bg-gradient-to-b from-white to-transparent rounded-full"></div>
                  <div>
                    <h3 className="text-lg font-black truncate max-w-[200px]">{adName || "Brand Name"}</h3>
                    <p className="text-[10px] text-yellow-405 font-mono italic truncate max-w-[220px]">{tagline || "Brand Tagline"}</p>
                  </div>
                </div>

                <div className="w-full h-36 overflow-hidden rounded-2xl border border-white/10 group shadow-md">
                  <img
                    src={imageUrl}
                    alt="Brand Preview"
                    className="w-full h-full object-cover"
                  />
                </div>

                <ul className="text-[10px] text-zinc-400 font-sans space-y-1 bg-white/5 p-2.5 rounded-xl border border-white/5">
                  {features && features.split(",").map((f, i) => (
                    <li key={i} className="flex items-center gap-1.5 truncate">
                      <span>✨</span>
                      <span>{f.trim()}</span>
                    </li>
                  ))}
                </ul>

                <div className="grid grid-cols-2 gap-3 mt-1 text-xs">
                  <button
                    onClick={() => alert(`Simulating CTA custom action click: redirects page.`)}
                    className={`py-2 px-3 rounded-xl font-mono font-bold border-2 text-center cursor-pointer transition ${
                      getThemeColorClass(selectedTheme)
                    }`}
                  >
                    {ctaText}
                  </button>
                  <button
                    onClick={() => setTesterOpen(true)}
                    className="py-2 px-3 rounded-xl font-mono font-bold bg-white text-black hover:bg-neutral-250 border transition text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    🤖 Test Agent
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] text-zinc-550 font-mono mt-2 pt-2 border-t border-white/5">
                <span>PAGE INDEX</span>
                <span>THEAD AD NETWORK</span>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-white/10 bg-zinc-950/20 text-center text-[10px] font-mono tracking-widest text-zinc-650">
        &copy; 2026 theadmagazine booking checkout
      </footer>

      {/* INLINE TESTER MODAL */}
      {testerOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0e0a16] border border-white/10 rounded-2xl h-[500px] flex flex-col justify-between shadow-2xl relative overflow-hidden animate-zoom-in">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-zinc-950">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg overflow-hidden border border-white/10">
                  <img src={imageUrl} alt={adName} className="h-full w-full object-cover" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{aiName} 🤖</h4>
                  <p className="text-[9px] text-zinc-400 font-mono uppercase tracking-wider">Tester Bot Sandbox</p>
                </div>
              </div>
              <button 
                onClick={() => setTesterOpen(false)}
                className="text-zinc-450 hover:text-white p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
              <div className="p-3 bg-purple-950/30 border border-pink-500/20 rounded-xl text-zinc-350 leading-relaxed font-mono">
                <span className="text-[10px] font-bold text-pink-400 block mb-1">PROMPT INSTRUCTIONS:</span>
                <p className="italic">{aiPersona}</p>
              </div>

              {sandboxMessages.map((chat, index) => (
                <div key={index} className={`flex ${chat.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-xl p-3 leading-relaxed shadow-sm ${
                    chat.role === "user" 
                      ? "bg-white text-black rounded-tr-none" 
                      : "bg-zinc-900 border border-white/5 text-zinc-100 rounded-tl-none font-mono"
                  }`}>
                    <p>{chat.text}</p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-zinc-900 border border-white/5 text-zinc-400 rounded-xl rounded-tl-none p-3 animate-pulse">
                    <p className="font-mono">Typing funny response...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Inputs */}
            <div className="p-4 border-t border-white/10 bg-zinc-950">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Tell ${aiName} something silly...`}
                  value={sandboxIntput}
                  onChange={(e) => setSandboxInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendSandbox()}
                  className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-pink-500 text-white"
                />
                <button
                  onClick={handleSendSandbox}
                  className="py-2 px-3 rounded-lg bg-pink-500 text-black hover:bg-pink-650 font-bold transition cursor-pointer"
                >
                  Bubble Ask
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STRIPE CHECKOUT MODAL OVERLAY */}
      {checkoutOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0d0914] border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden animate-zoom-in font-mono text-xs">
            
            {successPublish ? (
              <div className="p-8 text-center flex flex-col items-center gap-5">
                <div className="h-14 w-14 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center justify-center text-3xl animate-bounce">
                  🎉
                </div>
                <div>
                  <h4 className="text-base font-bold text-white uppercase tracking-tight">Placement Secured! 🕹️</h4>
                  <p className="text-zinc-400 mt-2 leading-relaxed font-sans">
                    Yay! Your custom ad block for <b>{adName}</b> is approved and deployed live inside the autumn issue of <b>theadmagazine</b>!
                  </p>
                </div>
                <div className="flex flex-col gap-2 w-full mt-4">
                  <button
                    onClick={() => {
                      setCheckoutOpen(false);
                      setSuccessPublish(false);
                      router.push("/reader");
                    }}
                    className="w-full py-2.5 bg-white text-black hover:bg-zinc-200 rounded-xl transition text-xs font-bold cursor-pointer"
                  >
                    Go Inspect In Reader View 📖
                  </button>
                  <button
                    onClick={() => {
                      setCheckoutOpen(false);
                      setSuccessPublish(false);
                      router.push("/dashboard");
                    }}
                    className="w-full py-2.5 bg-zinc-900 border border-white/10 hover:border-white/20 rounded-xl transition text-xs font-bold text-zinc-300 cursor-pointer"
                  >
                    Check Brand Brawlboard 📈
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCheckoutSubmit} className="p-6 flex flex-col gap-5">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h4 className="text-sm font-black text-white">Sponsorship checkout 🛒</h4>
                  <button
                    type="button"
                    onClick={() => setCheckoutOpen(false)}
                    className="text-zinc-500 hover:text-white p-1"
                  >
                    ✕
                  </button>
                </div>

                <div className="bg-zinc-900/60 p-4 border border-white/5 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-500 font-bold block uppercase">Placements Slot</span>
                    <span className="text-zinc-350 block mt-1">{adName} (Interactive Page)</span>
                  </div>
                  <span className="text-sm font-bold text-pink-400">$950.00</span>
                </div>

                <div className="flex flex-col gap-3 font-mono">
                  <div className="flex flex-col gap-1">
                    <label className="text-zinc-550">Billing Email Address</label>
                    <input
                      required
                      type="email"
                      placeholder="funny@sponser.com"
                      className="bg-zinc-900 border border-white/15 rounded-xl p-2.5 text-white outline-none focus:border-pink-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-zinc-550">Cardholder Name</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Robin Ringleader"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="bg-zinc-900 border border-white/15 rounded-xl p-2.5 text-white outline-none focus:border-pink-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-zinc-550">Credit Card Number</label>
                    <input
                      required
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="bg-zinc-900 border border-white/15 rounded-xl p-2.5 text-white outline-none focus:border-pink-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-zinc-550">Expiry Date</label>
                      <input
                        required
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="bg-zinc-900 border border-white/15 rounded-xl p-2.5 text-white outline-none focus:border-pink-500 text-center"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-zinc-550">CVC Code</label>
                      <input
                        required
                        type="password"
                        maxLength={3}
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="bg-zinc-900 border border-white/15 rounded-xl p-2.5 text-white outline-none focus:border-pink-500 text-center"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-pink-500 text-black hover:bg-pink-600 font-bold py-3.5 rounded-xl mt-2 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <span className="h-3.5 w-3.5 border-2 border-black/20 border-t-black animate-spin rounded-full"></span>
                      Charging Monopoly Money... 💸
                    </>
                  ) : (
                    `Spark Payment ($950.00)`
                  )}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
