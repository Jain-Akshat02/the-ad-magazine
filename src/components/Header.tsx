"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";

import { useUser } from "@clerk/nextjs";
import { addUserQuery } from "../utils/magazineState";

function SubscriptionAlert() {
  const [mounted, setMounted] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    setMounted(true);
    const subscribed = localStorage.getItem("thead_subscribed") === "true";
    const dismissed = localStorage.getItem("thead_subscribed_alert_dismissed") === "true";
    if (!subscribed && !dismissed) {
      setShowAlert(true);
    }
  }, []);

  if (!mounted || !showAlert) return null;

  return (
    <div className="absolute right-6 top-[72px] w-80 p-4.5 bg-[#120b1e]/95 border border-yellow-500/30 rounded-2xl flex flex-col gap-2.5 text-yellow-250 text-xs font-mono backdrop-blur-md shadow-2xl z-50 animate-bounce-in origin-top-right">
      {/* Triangle pointer pointing up to the Buy Ad element */}
      <div className="absolute top-[-7px] right-20 w-3.5 h-3.5 bg-[#120b1e]/95 border-t border-l border-yellow-500/30 rotate-45 z-10"></div>

      <div className="flex items-start justify-between relative z-20">
        <div className="flex items-center gap-2">
          <span className="text-base animate-pulse">📢</span>
          <span className="font-extrabold text-white uppercase tracking-wider">Exclusive Brand Alert</span>
        </div>
        <button
          onClick={handleDismiss}
          className="text-yellow-405 hover:text-white font-bold p-1 cursor-pointer hover:scale-110 active:scale-95 transition-all text-[13px]"
        >
          ✕
        </button>
      </div>

      <p className="text-zinc-300 font-sans leading-relaxed relative z-20 pr-2">
        Buy your ad page now once if you haven&apos;t and get featured in the next issue!
      </p>

      <div className="flex justify-end gap-2 mt-1 relative z-20">
        <button
          onClick={handleDismiss}
          className="text-[9px] uppercase tracking-wider text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer font-bold"
        >
          Dismiss
        </button>
      </div>
    </div>
  );

  function handleDismiss() {
    setShowAlert(false);
    localStorage.setItem("thead_subscribed_alert_dismissed", "true");
  }
}

export default function Header() {
  const pathname = usePathname();
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);
  const [isAdText, setIsAdText] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Support ticket form states
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [supportName, setSupportName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportMsg, setSupportMsg] = useState("");
  const [supportSuccess, setSupportSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsAdminMode(localStorage.getItem("thead_admin_mode") === "true");

    const onAdminModeChange = () => {
      setIsAdminMode(localStorage.getItem("thead_admin_mode") === "true");
    };
    window.addEventListener("storage", onAdminModeChange);
    window.addEventListener("thead-admin-mode-change", onAdminModeChange);

    const interval = setInterval(() => {
      setIsAdText((prev) => !prev);
    }, 4000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", onAdminModeChange);
      window.removeEventListener("thead-admin-mode-change", onAdminModeChange);
    };
  }, [pathname]);

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportName || !supportEmail || !supportMsg) return;
    
    addUserQuery(supportName, supportEmail, supportMsg);
    setSupportSuccess(true);
    
    // Clear fields
    setSupportMsg("");
    setTimeout(() => {
      setSupportSuccess(false);
      setIsSupportOpen(false);
    }, 2000);
  };

  return (
    <div className="z-45 w-full relative">
      <header className="px-6 py-4.5 border-b border-white/10 flex items-center justify-between bg-zinc-950/70 backdrop-blur sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-600 to-yellow-455 flex items-center justify-center font-black text-black text-sm rotate-[-4deg] group-hover:rotate-6 transition-all duration-300">
            ad
          </div>
          <span className="font-extrabold text-lg tracking-tight text-white font-sans group-hover:text-pink-400 transition-colors">
            thead<span className="text-pink-500">magazine</span>
          </span>
        </Link>

        <div className="flex items-center gap-5 text-xs font-mono tracking-wider uppercase text-zinc-350">
          {pathname !== "/reader" && (
            <Link href="/reader" className="hover:text-pink-400 transition hover:scale-105">
              📖 Read Issue
            </Link>
          )}
          {pathname !== "/reader" && pathname !== "/dashboard" && <span className="text-zinc-800">|</span>}
          {pathname !== "/dashboard" && (
            <Link href="/dashboard" className="hover:text-cyan-400 transition hover:scale-105">
              ⚡ Portal Dashboard
            </Link>
          )}

          <span className="text-zinc-800">|</span>
          <button
            onClick={() => {
              if (user) {
                setSupportName(user.fullName || "");
                setSupportEmail(user.primaryEmailAddress?.emailAddress || "");
              }
              setIsSupportOpen(true);
            }}
            className="hover:text-amber-300 transition hover:scale-105 cursor-pointer uppercase font-mono tracking-wider"
          >
            💬 Support
          </button>

          {mounted && isAdminMode && (
            <>
              <span className="text-zinc-800">|</span>
              <Link href="/admin" className="hover:text-yellow-405 transition hover:scale-105 flex items-center gap-1">
                Admin
              </Link>
            </>
          )}

          <span className="text-zinc-800">|</span>

          {!mounted ? (
            <div className="py-2 px-4 rounded-xl bg-zinc-900 text-zinc-600 font-bold min-w-[145px] text-center select-none text-[10px]">
              Loading...
            </div>
          ) : (
            <>
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button
                    type="button"
                    className="py-2 px-4 rounded-xl bg-gradient-to-tr from-pink-550 to-purple-650 hover:from-pink-600 hover:to-purple-700 text-white font-bold tracking-tight transition-all duration-500 hover:scale-105 active:scale-95 shadow-lg min-w-[145px] text-center cursor-pointer relative overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity"></span>
                    <span className="relative flex items-center justify-center gap-1 font-mono uppercase tracking-wider text-[10px]">
                      {isAdText ? "Buy Ad Page 🛒" : "🔑 Sign In"}
                    </span>
                  </button>
                </SignInButton>
              </Show>

              <Show when="signed-in">
                <div className="flex items-center gap-4">
                  <Link
                    href="/buy-page"
                    className="py-2 px-4 rounded-xl bg-pink-505 hover:bg-pink-600 text-black font-bold tracking-tight transition-all hover:scale-105 active:scale-95 shadow-md animate-pulse"
                  >
                    Buy Ad Page 🛒
                  </Link>
                  <div className="flex items-center justify-center border-2 border-pink-500/35 rounded-full p-0.5 hover:border-pink-500 transition-colors">
                    <UserButton />
                  </div>
                </div>
              </Show>
            </>
          )}
        </div>
      </header>

      {/* Dismissible speech-bubble subscription alert */}
      <SubscriptionAlert />

      {/* SUPPORT MODAL DIALOG */}
      {isSupportOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0e0a16] border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden animate-zoom-in font-mono text-xs text-white p-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-4">
              <h4 className="text-sm font-black text-white">💬 Contact Support Query</h4>
              <button
                onClick={() => setIsSupportOpen(false)}
                className="text-zinc-500 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {supportSuccess ? (
              <div className="py-8 text-center flex flex-col items-center gap-4">
                <span className="text-3xl animate-bounce">📬</span>
                <div>
                  <h5 className="font-bold text-emerald-400">Query Logged Successfully!</h5>
                  <p className="text-[10px] text-zinc-450 mt-2 font-sans">
                    Admin team has been alerted! You can check resolution statuses in the Admin Dashboard query center.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSupportSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-zinc-550">Your Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Pixel Artist"
                    value={supportName}
                    onChange={(e) => setSupportName(e.target.value)}
                    className="bg-zinc-900 border border-white/15 rounded-xl p-2.5 text-white outline-none focus:border-pink-500 text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-zinc-550">Your Email</label>
                  <input
                    required
                    type="email"
                    placeholder="artist@neuralnet.com"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="bg-zinc-900 border border-white/15 rounded-xl p-2.5 text-white outline-none focus:border-pink-500 text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-zinc-550">How can our admin squads help you?</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Type your concern here regarding ad billing, edits, prompt settings..."
                    value={supportMsg}
                    onChange={(e) => setSupportMsg(e.target.value)}
                    className="bg-zinc-900 border border-white/15 rounded-xl p-2.5 text-white outline-none focus:border-pink-500 text-xs resize-none font-sans leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-pink-500 hover:bg-pink-600 text-black font-extrabold py-3.5 rounded-xl transition cursor-pointer text-center mt-2"
                >
                  Send Query &bull; Alert Admin 🚀
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

