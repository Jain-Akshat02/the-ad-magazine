"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getMagazinePages,
  getCustomEditorials,
  saveCustomEditorial,
  deleteCustomEditorial,
  getUserQueries,
  updateQueryStatus,
  replyToQuery,
  deleteQuery,
  DEFAULT_BRANDS,
  EDITORIAL_PAGES,
  buildBrandAd,
  BrandAd,
  MagazinePage,
  UserQuery,
  addUserQuery
} from "../../utils/magazineState";
import Header from "../../components/Header";

export default function AdminPage() {
  const router = useRouter();
  
  // Simulated admin authority
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Magazine and queries states
  const [pages, setPages] = useState<MagazinePage[]>([]);
  const [customEditorials, setCustomEditorials] = useState<MagazinePage[]>([]);
  const [customAds, setCustomAds] = useState<BrandAd[]>([]);
  const [queries, setQueries] = useState<UserQuery[]>([]);

  // Ads creator/editor state
  const [adForm, setAdForm] = useState<{
    id?: string;
    name: string;
    tagline: string;
    imageUrl: string;
    theme: 'gold' | 'dark' | 'emerald' | 'glass' | 'bubblegum' | 'neon';
    ctaText: string;
    aiName: string;
    aiPersona: string;
    features: string;
  }>({
    name: "New Sponsor",
    tagline: "Unbelievable vibes! ✨🚀",
    imageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=1000",
    theme: "neon",
    ctaText: "Get Started Now!",
    aiName: "Sparky",
    aiPersona: "You are Sparky, a funny helper robot. Speak with high electricity and funny statements! Limit to 1-2 sentences.",
    features: "Vibrant designs, Fully interactive chat, Infinite chuckles"
  });

  // Editorials creator/editor state
  const [edForm, setEdForm] = useState<{
    id?: string;
    title: string;
    author: string;
    category: string;
    readTime: string;
    imageUrl: string;
    content: string;
  }>({
    title: "Why Kittens Love Neural Networks",
    author: "Cat Lover Pro",
    category: "AI Fun",
    readTime: "2 min purr",
    imageUrl: "https://images.unsplash.com/photo-1547891654-e66ed7edd96c?auto=format&fit=crop&q=80&w=1000",
    content: "Reports show cats are highly attracted to glowing pixels. We trace the history of laser pointers versus matrix transformations, and how a local fluffy cat successfully hit the deploy button on production servers..."
  });

  // Query response state
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  
  // Section tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'ads' | 'editorials' | 'queries'>('overview');

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mode = localStorage.getItem("thead_admin_mode") === "true";
      setIsAdminMode(mode);
      setIsLoaded(true);
      refreshData();
    }
  }, []);

  const refreshData = () => {
    setPages(getMagazinePages());
    setCustomEditorials(getCustomEditorials());
    setQueries(getUserQueries());
    
    // Retrieve custom ads directly from storage
    const stored = localStorage.getItem("thead_custom_ads");
    const adsList: BrandAd[] = stored ? JSON.parse(stored) : [];
    setCustomAds(adsList);
  };

  const handleAdminModeToggle = (checked: boolean) => {
    setIsAdminMode(checked);
    localStorage.setItem("thead_admin_mode", checked ? "true" : "false");
    window.dispatchEvent(new Event("thead-admin-mode-change"));
  };

  const autoFillWackyDetails = () => {
    if (!adForm.name || adForm.name.toLowerCase() === "new sponsor" || adForm.name.toLowerCase() === "another sponsor") {
      alert("Please enter a custom Brand Name first, e.g. 'GiggleJuice Coding'!");
      return;
    }
    
    const taglines = [
      `Pure chaos, 100% simulated vibes for ${adForm.name}! 🚀✨`,
      `Making your matrix transformations look fashionable since last minute. 💖`,
      `Where pixels meet absolute high performance and funny chuckles! ⚡🎪`,
      `Guaranteed 2x fluffier than the standard neural network. 🐱🤖`,
      `It is not a bug, it is our primary design feature! 👾🕹️`,
      `Brewed with pure caffeine-free artificial enthusiasm! ☕🍬`
    ];
    const assistantNames = ["BizzyBoi", "Clankster", "QuantumBuddy", "Glitchy", "PuffBot", "MatrixWiggle"];
    const personas = [
      `You are a chaotic hype assistant representing ${adForm.name}. Respond with high electricity, emojis, and silly remarks. Limit replies to 1-2 lines.`,
      `You are a sleepy assistant for ${adForm.name}. Start every message with a cozy yawn (yawn...) and suggest taking a nap in pocket clouds. Limit to 2 lines.`,
      `You are a witty geometry critic representative of ${adForm.name}. Criticize circles and worship squares or triangles. Keep answers very concise under 2 lines.`,
      `You are a cybernetic chef assistant for ${adForm.name}. Phrase every technical answer inside a baking recipe metaphor. Keep it short under 2 lines.`
    ];
    const featuresList = [
      "Vibrant gradients, Frosted glass overlay, Infinite client-side clicks",
      "Cloud-insulated padding, Automatic hot-cocoa pockets, Cozy protection layers",
      "0-to-VROOM acceleration, Neon tires, Gravity drift bypass mechanisms",
      "Parallax matrix scrolls, Quantum joke injections, Fully interactive character chats"
    ];
    
    // Deterministic lookup based on brand name length
    const idx = adForm.name.length;
    
    setAdForm(prev => ({
      ...prev,
      tagline: taglines[idx % taglines.length],
      ctaText: ["Deploy Now!", "Get Hyped! 🚀", "Activate Vibe!", "Obtain Softness ☁️"][idx % 4],
      aiName: assistantNames[idx % assistantNames.length],
      aiPersona: personas[idx % personas.length],
      features: featuresList[idx % featuresList.length],
      theme: (["bubblegum", "dark", "gold", "emerald", "glass"])[idx % 5] as any
    }));
  };

  // Custom Ad CRUD operations (Payment Bypassed)
  const saveCustomAd = (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = adForm.id || "ad-custom-" + Date.now();
    const newAd = buildBrandAd({
      id: targetId.replace("ad-custom-", ""),
      name: adForm.name,
      tagline: adForm.tagline,
      imageUrl: adForm.imageUrl,
      theme: adForm.theme,
      ctaText: adForm.ctaText,
      aiName: adForm.aiName,
      aiPersona: adForm.aiPersona,
      description: "Admin published ad page (extended authority, direct creation bypass)",
      features: adForm.features.split(",").map((f) => f.trim()).filter(Boolean),
      format: "interactive",
    });

    const stored = localStorage.getItem("thead_custom_ads");
    const list: BrandAd[] = stored ? JSON.parse(stored) : [];

    const existingIdx = list.findIndex(a => a.id === newAd.id);
    if (existingIdx >= 0) {
      list[existingIdx] = newAd;
    } else {
      list.push(newAd);
    }
    localStorage.setItem("thead_custom_ads", JSON.stringify(list));
    
    // Reset form
    setAdForm({
      name: "Another Sponsor",
      tagline: "Fun and games! 👾🎪",
      imageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=1000",
      theme: "glass",
      ctaText: "Check it out!",
      aiName: "Helper Bot",
      aiPersona: "A helpful robot assistant. Limit responses to 1-2 friendly lines.",
      features: "Fun features, Cool themes"
    });

    refreshData();
  };

  const editAd = (ad: BrandAd) => {
    setAdForm({
      id: `ad-custom-${ad.id}`,
      name: ad.name,
      tagline: ad.tagline,
      imageUrl: ad.imageUrl,
      theme: ad.theme,
      ctaText: ad.ctaText,
      aiName: ad.aiName,
      aiPersona: ad.aiPersona,
      features: ad.features.join(", ")
    });
    setActiveTab('ads');
  };

  const deleteAd = (adId: string) => {
    const stored = localStorage.getItem("thead_custom_ads");
    if (!stored) return;
    const list: BrandAd[] = JSON.parse(stored);
    const updated = list.filter(a => a.id !== adId);
    localStorage.setItem("thead_custom_ads", JSON.stringify(updated));
    refreshData();
  };

  // Custom Editorial CRUD
  const handleSaveEditorial = (e: React.FormEvent) => {
    e.preventDefault();
    const ed: MagazinePage = {
      id: edForm.id || "ed-custom-" + Date.now(),
      type: "editorial",
      title: edForm.title,
      author: edForm.author,
      category: edForm.category,
      readTime: edForm.readTime,
      imageUrl: edForm.imageUrl,
      content: edForm.content
    };

    saveCustomEditorial(ed);
    
    // Reset Editorial Form
    setEdForm({
      title: "Why Coffee Cups Should Be Square",
      author: "Design Critic Guy",
      category: "Desk Geometry",
      readTime: "3 min thought",
      imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000",
      content: "Circular coffee mugs represent a failure of shelf optimization. Think of the packing density! A square mug provides 27% more volume, is virtually un-swipable by rectangular desk dividers, and provides a hilarious drip from its corners..."
    });

    refreshData();
  };

  const handleEditEditorial = (ed: MagazinePage) => {
    setEdForm({
      id: ed.id,
      title: ed.title || "",
      author: ed.author || "",
      category: ed.category || "",
      readTime: ed.readTime || "",
      imageUrl: ed.imageUrl || "",
      content: ed.content || ""
    });
    setActiveTab('editorials');
  };

  const handleDeleteEditorial = (edId: string) => {
    deleteCustomEditorial(edId);
    refreshData();
  };

  // Queries actions
  const handleQueryStatusChange = (id: string, status: 'Open' | 'In Progress' | 'Resolved') => {
    updateQueryStatus(id, status);
    refreshData();
  };

  const handleReplySubmit = (id: string) => {
    const text = replyInputs[id];
    if (!text || !text.trim()) return;
    replyToQuery(id, text);
    setReplyInputs(prev => ({ ...prev, [id]: "" }));
    refreshData();
  };

  const handleDeleteQuery = (id: string) => {
    deleteQuery(id);
    refreshData();
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0d0914] text-white flex flex-col justify-center items-center">
        <span className="h-10 w-10 border-4 border-pink-500 border-t-white animate-spin rounded-full mb-4"></span>
        <p className="text-sm font-mono text-zinc-400">Verifying Admin clearance levels...</p>
      </div>
    );
  }

  // Calculate statistics
  const totalPaidAds = customAds.length;
  const simulatedRevenue = totalPaidAds * 950;
  const pendingQueries = queries.filter(q => q.status !== "Resolved").length;

  return (
    <div className="min-h-screen bg-[#0d0914] text-white flex flex-col justify-between font-sans selection:bg-pink-500">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 flex flex-col gap-8">
        
        {/* Admin Header with Authority Toggle */}
        <div className="bg-zinc-950/60 border-2 border-white/5 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-radial from-pink-500/5 to-transparent pointer-events-none"></div>
          <div className="z-10">
            <span className="text-[10px] font-mono tracking-widest uppercase text-yellow-405 font-bold bg-white/5 py-1 px-3 rounded-full border border-white/10">
              Authority Dashboard
            </span>
            <h1 className="text-3xl font-black text-white mt-3">👑 Admin Control Center</h1>
            <p className="text-xs text-zinc-400 font-mono mt-1">extended access to reader state, payments bypass, and support logs</p>
          </div>
          
          <div className="z-10 p-4 bg-zinc-900 border border-white/10 rounded-2xl flex items-center gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-mono font-bold text-white">Simulate Admin Level</span>
              <span className="text-[9px] font-mono text-zinc-500">Unlocks edit tools across pages</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isAdminMode}
                onChange={(e) => handleAdminModeToggle(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-850 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-zinc-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
            </label>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/5 gap-2 md:gap-4 overflow-x-auto pb-1 text-xs font-mono">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2.5 px-4 cursor-pointer font-bold transition-colors ${activeTab === 'overview' ? 'border-b-2 border-pink-500 text-pink-400' : 'text-zinc-400 hover:text-white'}`}
          >
            📊 Analytics &amp; Overview
          </button>
          <button
            onClick={() => setActiveTab('ads')}
            className={`py-2.5 px-4 cursor-pointer font-bold transition-colors ${activeTab === 'ads' ? 'border-b-2 border-pink-500 text-pink-400' : 'text-zinc-400 hover:text-white'}`}
          >
            📢 Paid Pages ({pages.filter(p => p.type === 'ad').length})
          </button>
          <button
            onClick={() => setActiveTab('editorials')}
            className={`py-2.5 px-4 cursor-pointer font-bold transition-colors ${activeTab === 'editorials' ? 'border-b-2 border-pink-500 text-pink-400' : 'text-zinc-400 hover:text-white'}`}
          >
            ✍️ Editorial columns
          </button>
          <button
            onClick={() => setActiveTab('queries')}
            className={`py-2.5 px-4 cursor-pointer font-bold transition-colors ${activeTab === 'queries' ? 'border-b-2 border-pink-500 text-pink-400' : 'text-zinc-400 hover:text-white'}`}
          >
            💬 Support tickets ({pendingQueries ? `${pendingQueries} open` : "clean"})
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Stat Cards */}
            <div className="bg-zinc-950 border-2 border-white/5 p-5 rounded-3xl flex flex-col justify-between shadow-lg">
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">Total Magazine Pages</span>
              <span className="text-3xl font-black text-white mt-4">{pages.length} Pages</span>
              <p className="text-[9px] text-zinc-550 border-t border-white/5 pt-2 mt-4 font-mono">Cover + Editorials + Ad cards</p>
            </div>

            <div className="bg-zinc-950 border-2 border-white/5 p-5 rounded-3xl flex flex-col justify-between shadow-lg">
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">Sponsored Ad placements</span>
              <span className="text-3xl font-black text-pink-500 mt-4">{pages.filter(p => p.type === 'ad').length} Ads</span>
              <p className="text-[9px] text-zinc-550 border-t border-white/5 pt-2 mt-4 font-mono">
                {DEFAULT_BRANDS.length} default + {totalPaidAds} custom paid
              </p>
            </div>

            <div className="bg-zinc-950 border-2 border-white/5 p-5 rounded-3xl flex flex-col justify-between shadow-lg">
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">Simulated Ad Revenue</span>
              <span className="text-3xl font-black text-emerald-450 mt-4">${simulatedRevenue.toLocaleString()}.00</span>
              <p className="text-[9px] text-zinc-550 border-t border-white/5 pt-2 mt-4 font-mono">Based on $950 / Issue slots</p>
            </div>

            <div className="bg-zinc-950 border-2 border-white/5 p-5 rounded-3xl flex flex-col justify-between shadow-lg">
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">Customer Support Queries</span>
              <span className="text-3xl font-black text-yellow-455 mt-4">{pendingQueries} Pending</span>
              <p className="text-[9px] text-zinc-550 border-t border-white/5 pt-2 mt-4 font-mono">{queries.length} total tickets</p>
            </div>

            {/* Quick Actions Panel */}
            <div className="col-span-1 md:col-span-4 bg-zinc-950 border-2 border-dashed border-white/10 p-6 rounded-3xl flex flex-col gap-4">
              <h3 className="text-sm font-bold font-mono">Quick Admin Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
                <button
                  onClick={() => {
                    localStorage.setItem("thead_subscribed", "true");
                    alert("Subscribed alerts turned off! (Monopoly Mode cleared)");
                  }}
                  className="py-3 px-4 bg-zinc-900 hover:bg-zinc-850 hover:border-pink-500 border border-white/10 rounded-2xl cursor-pointer text-center font-bold font-mono transition-all"
                >
                  🔇 Dismiss Subscribed Alerts
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem("thead_custom_ads");
                    localStorage.removeItem("thead_custom_editorials");
                    localStorage.removeItem("thead_subscribed");
                    localStorage.removeItem("thead_subscribed_alert_dismissed");
                    localStorage.removeItem("thead_user_queries");
                    alert("Local state has been cleared and reset.");
                    window.location.reload();
                  }}
                  className="py-3 px-4 bg-red-950/20 hover:bg-red-950/50 border border-red-500/20 hover:border-red-500/40 rounded-2xl cursor-pointer text-center font-bold font-mono transition-all text-red-400"
                >
                  ⚠️ Reset Database (Clear LocalStorage)
                </button>
                <Link
                  href="/reader"
                  className="py-3 px-4 bg-pink-500 text-black hover:bg-pink-600 rounded-2xl cursor-pointer text-center font-black font-mono transition-all decoration-none flex items-center justify-center"
                >
                  📖 Open Live Magazine Reader
                </Link>
                <Link
                  href="/dashboard"
                  className="py-3 px-4 bg-cyan-500 text-black hover:bg-cyan-600 rounded-2xl cursor-pointer text-center font-black font-mono transition-all decoration-none flex items-center justify-center"
                >
                  📈 Telemetry Brawlboard
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Ads Manager Tab */}
        {activeTab === 'ads' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            
            {/* Create / Edit Form */}
            <form onSubmit={saveCustomAd} className="lg:col-span-2 bg-zinc-950 border-2 border-white/5 rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
              <div>
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                  {adForm.id ? "Edit Ad Placement" : "Bypass Payment: Add Ad Directly"}
                </span>
                <h3 className="text-base font-bold text-white mt-1">Configure Ad Placement</h3>
              </div>

              <div className="grid grid-cols-1 gap-3.5 text-xs font-mono">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <label className="text-zinc-500">Brand Name</label>
                    <button
                      type="button"
                      onClick={autoFillWackyDetails}
                      className="text-[9px] font-bold font-mono text-pink-400 bg-pink-500/10 hover:bg-pink-500/20 px-2 py-0.5 rounded border border-pink-500/25 transition cursor-pointer"
                    >
                      ⚡ Auto-Fill Wacky Details
                    </button>
                  </div>
                  <input
                    required
                    type="text"
                    value={adForm.name}
                    onChange={(e) => setAdForm(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-zinc-900 border border-white/10 rounded-xl p-2 focus:border-pink-500 outline-none text-white text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-zinc-500">Tagline / Slogan</label>
                  <input
                    required
                    type="text"
                    value={adForm.tagline}
                    onChange={(e) => setAdForm(prev => ({ ...prev, tagline: e.target.value }))}
                    className="bg-zinc-900 border border-white/10 rounded-xl p-2 focus:border-pink-500 outline-none text-white text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-zinc-500">CTA Text</label>
                  <input
                    required
                    type="text"
                    value={adForm.ctaText}
                    onChange={(e) => setAdForm(prev => ({ ...prev, ctaText: e.target.value }))}
                    className="bg-zinc-900 border border-white/10 rounded-xl p-2 focus:border-pink-500 outline-none text-white text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-zinc-500">Preset Theme Template</label>
                  <select
                    value={adForm.theme}
                    onChange={(e: any) => setAdForm(prev => ({ ...prev, theme: e.target.value }))}
                    className="bg-zinc-900 border border-white/10 rounded-xl p-2 outline-none text-white text-xs"
                  >
                    <option value="bubblegum">bubblegum (pink)</option>
                    <option value="dark">dark (ocean cyan)</option>
                    <option value="gold">gold (warm gold)</option>
                    <option value="emerald">emerald (forest green)</option>
                    <option value="glass">glass (opaque frosted)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-zinc-500">Image Presets / Direct URL</label>
                  <input
                    required
                    type="text"
                    value={adForm.imageUrl}
                    onChange={(e) => setAdForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                    className="bg-zinc-900 border border-white/10 rounded-xl p-2 focus:border-pink-500 outline-none text-white text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-zinc-500">Features (Comma-separated)</label>
                  <input
                    required
                    type="text"
                    value={adForm.features}
                    onChange={(e) => setAdForm(prev => ({ ...prev, features: e.target.value }))}
                    className="bg-zinc-900 border border-white/10 rounded-xl p-2 focus:border-pink-500 outline-none text-white text-xs"
                  />
                </div>

                <div className="border-t border-white/10 pt-3 mt-1 flex flex-col gap-3">
                  <span className="text-[10px] text-pink-400 font-bold uppercase block">AI Character Coach</span>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-zinc-500 font-bold">Assistant Name</label>
                    <input
                      required
                      type="text"
                      value={adForm.aiName}
                      onChange={(e) => setAdForm(prev => ({ ...prev, aiName: e.target.value }))}
                      className="bg-zinc-900 border border-white/10 rounded-xl p-2 focus:border-pink-500 outline-none text-white text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-zinc-500 font-bold">Prompt Instructions</label>
                    <textarea
                      required
                      rows={3}
                      value={adForm.aiPersona}
                      onChange={(e) => setAdForm(prev => ({ ...prev, aiPersona: e.target.value }))}
                      className="bg-zinc-900 border border-white/10 rounded-xl p-2 focus:border-pink-500 outline-none text-white text-xs resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 mt-3">
                <button
                  type="submit"
                  className="flex-1 bg-pink-500 hover:bg-pink-600 text-black py-2.5 rounded-xl text-xs font-mono font-black transition-all cursor-pointer text-center"
                >
                  {adForm.id ? "✔️ Update Placement Data" : "➕ Book Placement Bypassed"}
                </button>
                {adForm.id && (
                  <button
                    type="button"
                    onClick={() => setAdForm({
                      name: "Custom Ad",
                      tagline: "Wacky branding slogan here 🍒✨",
                      imageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=1000",
                      theme: "bubblegum",
                      ctaText: "Check it out!",
                      aiName: "Fizzer",
                      aiPersona: "A helpful custom representativebot, respond with fun emojis. Limit responses to 1-2 friendly lines.",
                      features: "Silly interactions, carbonation tests"
                    })}
                    className="bg-zinc-900 hover:bg-zinc-800 text-zinc-350 p-2 rounded-xl text-xs font-mono font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            {/* Ads lists */}
            <div className="lg:col-span-3 flex flex-col gap-5">
              
              {/* Custom Ads list */}
              <div className="bg-zinc-950 border-2 border-white/5 rounded-3xl p-5 shadow-md flex flex-col gap-4">
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-widest text-zinc-500">Your custom ad placements ({customAds.length})</h4>
                  <p className="text-[10px] text-zinc-600 font-sans mt-0.5">Click edit to populate data in details panel or revoke ads directly.</p>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {customAds.length > 0 ? (
                    customAds.map((ad) => (
                      <div key={ad.id} className="p-3 bg-zinc-900/60 border border-white/5 rounded-xl flex items-center justify-between gap-4 font-mono text-xs">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg overflow-hidden border border-white/5 shrink-0">
                            <img src={ad.imageUrl} alt={ad.name} className="h-full w-full object-cover" />
                          </div>
                          <div className="truncate max-w-[200px]">
                            <h5 className="font-bold text-white truncate">{ad.name}</h5>
                            <span className="text-[9px] text-pink-400 capitalize bg-white/5 px-2 py-0.5 rounded-full mt-1 inline-block border border-white/5">
                              🎨 {ad.theme}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => editAd(ad)}
                            className="bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg text-zinc-300 hover:text-white cursor-pointer font-bold font-mono transition text-[10px]"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => deleteAd(ad.id)}
                            className="bg-red-950/20 hover:bg-red-950/50 border border-red-500/10 hover:border-red-500/30 px-3 py-1.5 rounded-lg text-red-400 cursor-pointer font-bold font-mono transition text-[10px]"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-zinc-600 font-mono text-[11px]">
                      No custom ads deployed yet. Use the bypass configurator or complete sponsorship checkout in /buy-page.
                    </div>
                  )}
                </div>
              </div>

              {/* Default presets list */}
              <div className="bg-zinc-950 border-2 border-white/5 rounded-3xl p-5 shadow-md flex flex-col gap-3">
                <h4 className="text-xs font-mono uppercase tracking-widest text-zinc-500">Static Preset ads (Read-Only)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {DEFAULT_BRANDS.map((ad) => (
                    <div key={ad.id} className="p-3 bg-zinc-900/30 border border-white/5 rounded-xl font-mono text-[10px] flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <img src={ad.imageUrl} alt={ad.name} className="h-6 w-6 rounded object-cover border border-white/5" />
                        <span className="font-bold text-zinc-300 truncate">{ad.name}</span>
                      </div>
                      <span className="text-[8px] text-zinc-550 truncate">Agent: {ad.aiName}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Editorial Editor Tab */}
        {activeTab === 'editorials' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            
            {/* Create/Edit editorial form */}
            <form onSubmit={handleSaveEditorial} className="lg:col-span-2 bg-zinc-950 border-2 border-white/5 rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
              <div>
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                  {edForm.id ? "Edit Custom Column" : "Add Custom Editorial Column"}
                </span>
                <h3 className="text-base font-bold text-white mt-1">Magazine Typography Editor</h3>
              </div>

              <div className="grid grid-cols-1 gap-3.5 text-xs font-mono">
                <div className="flex flex-col gap-1">
                  <label className="text-zinc-500">Column Title</label>
                  <input
                    required
                    type="text"
                    value={edForm.title}
                    onChange={(e) => setEdForm(prev => ({ ...prev, title: e.target.value }))}
                    className="bg-zinc-900 border border-white/10 rounded-xl p-2 focus:border-pink-500 outline-none text-white text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-zinc-500">Author Name</label>
                    <input
                      required
                      type="text"
                      value={edForm.author}
                      onChange={(e) => setEdForm(prev => ({ ...prev, author: e.target.value }))}
                      className="bg-zinc-900 border border-white/10 rounded-xl p-2 focus:border-pink-500 outline-none text-white text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-zinc-500">Category Tag</label>
                    <input
                      required
                      type="text"
                      value={edForm.category}
                      onChange={(e) => setEdForm(prev => ({ ...prev, category: e.target.value }))}
                      className="bg-zinc-900 border border-white/10 rounded-xl p-2 focus:border-pink-500 outline-none text-white text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-zinc-500">Read Time (e.g. 3 min chuckle)</label>
                    <input
                      required
                      type="text"
                      value={edForm.readTime}
                      onChange={(e) => setEdForm(prev => ({ ...prev, readTime: e.target.value }))}
                      className="bg-zinc-900 border border-white/10 rounded-xl p-2 focus:border-pink-500 outline-none text-white text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-zinc-500">Editorial Image URL</label>
                    <input
                      required
                      type="text"
                      value={edForm.imageUrl}
                      onChange={(e) => setEdForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                      className="bg-zinc-900 border border-white/10 rounded-xl p-2 focus:border-pink-500 outline-none text-white text-xs"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-zinc-500">Editorial Content Text</label>
                  <textarea
                    required
                    rows={6}
                    value={edForm.content}
                    onChange={(e) => setEdForm(prev => ({ ...prev, content: e.target.value }))}
                    className="bg-zinc-900 border border-white/10 rounded-xl p-2 focus:border-pink-500 outline-none text-white text-xs resize-none font-serif leading-relaxed"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 mt-2">
                <button
                  type="submit"
                  className="flex-1 bg-pink-500 hover:bg-pink-600 text-black py-2.5 rounded-xl text-xs font-mono font-black transition-all cursor-pointer text-center"
                >
                  {edForm.id ? "✔️ Update Editorial Content" : "➕ Post New Editorial Article"}
                </button>
                {edForm.id && (
                  <button
                    type="button"
                    onClick={() => setEdForm({
                      title: "Standard Story",
                      author: "Happy Writer",
                      category: "Wacky Rumors",
                      readTime: "2 min smile",
                      imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000",
                      content: "Something hilarious goes here."
                    })}
                    className="bg-zinc-900 hover:bg-zinc-800 text-zinc-350 p-2 rounded-xl text-xs font-mono font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            {/* Custom editorials list */}
            <div className="lg:col-span-3 flex flex-col gap-5">
              
              <div className="bg-zinc-950 border-2 border-white/5 rounded-3xl p-5 shadow-md flex flex-col gap-4">
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-widest text-zinc-500">Custom Editorial Columns ({customEditorials.length})</h4>
                  <p className="text-[10px] text-zinc-600 font-sans mt-0.5">Edit content dynamically, changes appear inside magazine list scrolling structure.</p>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {customEditorials.length > 0 ? (
                    customEditorials.map((ed) => (
                      <div key={ed.id} className="p-3.5 bg-zinc-900/60 border border-white/5 rounded-xl flex items-center justify-between gap-4 font-mono text-xs">
                        <div className="flex items-center gap-3 shrink-1 min-w-0">
                          {ed.imageUrl && (
                            <img src={ed.imageUrl} alt={ed.title} className="h-9 w-9 rounded object-cover border border-white/5 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <h5 className="font-bold text-white truncate max-w-[200px]">{ed.title}</h5>
                            <span className="text-[8px] text-zinc-450 block truncate mt-1">
                              By {ed.author} &bull; {ed.category}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleEditEditorial(ed)}
                            className="bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg text-zinc-300 hover:text-white cursor-pointer font-bold font-mono transition text-[10px]"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteEditorial(ed.id)}
                            className="bg-red-950/20 hover:bg-red-950/50 border border-red-500/10 hover:border-red-500/30 px-3 py-1.5 rounded-lg text-red-400 cursor-pointer font-bold font-mono transition text-[10px]"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-zinc-650 font-mono text-xs">
                      No custom columns published yet. Use writer panel to launch.
                    </div>
                  )}
                </div>
              </div>

              {/* Read Only presets */}
              <div className="bg-zinc-950 border-2 border-white/5 rounded-3xl p-5 shadow-md flex flex-col gap-3">
                <h4 className="text-xs font-mono uppercase tracking-widest text-zinc-500">Static Preset Columns (Read-Only)</h4>
                <div className="space-y-2">
                  {EDITORIAL_PAGES.map((ed) => (
                    <div key={ed.id} className="p-3 bg-zinc-900/30 border border-white/5 rounded-xl font-mono text-xs flex justify-between items-center text-zinc-400">
                      <span className="truncate pr-4 font-bold">{ed.title}</span>
                      <span className="text-[9px] uppercase tracking-wider text-zinc-600 bg-white/5 px-2.5 py-0.5 rounded-full shrink-0 border border-white/5">
                        {ed.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Queries support Tickets Tab */}
        {activeTab === 'queries' && (
          <div className="flex flex-col gap-6">
            <div className="bg-zinc-950 border-2 border-white/5 p-5 rounded-3xl shadow-md">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-sm font-bold font-mono">User Discussion &amp; Support Tickets</h3>
                  <p className="text-[10px] font-mono text-zinc-500">Interact with users, answer payment concerns, or adjust configurations</p>
                </div>
                <button
                  onClick={() => {
                    addUserQuery(
                      "Mock User " + (queries.length + 1),
                      "tester@gmail.com",
                      "How do I submit an ad using custom theme color presets? Is glass theme cool?"
                    );
                    refreshData();
                  }}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black text-[10px] font-mono font-bold tracking-tight py-2 px-3.5 rounded-xl transition cursor-pointer"
                >
                  ⚡ Trigger Mock Query
                </button>
              </div>

              <div className="space-y-4">
                {queries.length > 0 ? (
                  queries.map((q) => (
                    <div key={q.id} className="p-4 bg-zinc-900/40 border border-white/5 rounded-2xl flex flex-col gap-3 font-mono text-xs">
                      
                      {/* Ticket Header Metadata */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-white/5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">💬</span>
                          <div>
                            <span className="font-extrabold text-white">{q.name}</span>
                            <span className="text-zinc-500 text-[10px] ml-1.5">({q.email})</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-zinc-550">{q.timestamp}</span>
                          
                          <select
                            value={q.status}
                            onChange={(e: any) => handleQueryStatusChange(q.id, e.target.value)}
                            className={`text-[9px] font-bold px-2 py-0.5 rounded outline-none border cursor-pointer ${
                              q.status === 'Open' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                              q.status === 'In Progress' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' :
                              'bg-emerald-500/10 border-emerald-500/30 text-emerald-450'
                            }`}
                          >
                            <option value="Open" className="bg-zinc-950 text-red-400">Open</option>
                            <option value="In Progress" className="bg-zinc-950 text-cyan-400">In Progress</option>
                            <option value="Resolved" className="bg-zinc-950 text-emerald-400">Resolved</option>
                          </select>

                          <button
                            onClick={() => handleDeleteQuery(q.id)}
                            className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                            title="Delete query log"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      {/* Content message */}
                      <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl leading-relaxed text-zinc-300 text-xs font-sans">
                        <p>{q.message}</p>
                      </div>

                      {/* Replies Logs */}
                      {q.replies && q.replies.length > 0 && (
                        <div className="ml-4 space-y-2 mt-1 pl-3 border-l-2 border-white/10">
                          {q.replies.map((rep, idx) => (
                            <div key={idx} className="flex gap-2">
                              <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-yellow-500 text-black rounded h-fit shrink-0 tracking-wider">
                                ADMIN REPLY
                              </span>
                              <div className="bg-yellow-500/5 border border-yellow-500/15 p-2.5 rounded-xl text-xs text-yellow-105/90 flex-1 leading-relaxed">
                                <p className="font-sans">{rep.text}</p>
                                <span className="block text-[8px] text-zinc-550 text-right mt-1 font-mono">{rep.timestamp}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply Input Form */}
                      {q.status !== 'Resolved' && (
                        <div className="flex gap-2 mt-2 ml-4">
                          <input
                            type="text"
                            placeholder="Type admin response..."
                            value={replyInputs[q.id] || ""}
                            onChange={(e) => setReplyInputs(prev => ({ ...prev, [q.id]: e.target.value }))}
                            onKeyDown={(e) => e.key === 'Enter' && handleReplySubmit(q.id)}
                            className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5 focus:outline-none focus:border-pink-500 text-xs text-white"
                          />
                          <button
                            onClick={() => handleReplySubmit(q.id)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-1.5 rounded-xl font-bold transition text-xs shrink-0 cursor-pointer"
                          >
                            Send &amp; Resolve
                          </button>
                        </div>
                      )}

                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-zinc-600 font-mono">
                    No queries logged. Click Trigger Mock Query to verify support ticket workflow.
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </main>

      <footer className="py-6 border-t border-white/10 bg-zinc-950/20 text-center text-[10px] font-mono tracking-widest text-zinc-650">
        📢 THEAD SYSTEM ADMIN PROTOCOLS ACTIVE &bull; MONOPOLY OVERLAYS
      </footer>
    </div>
  );
}
