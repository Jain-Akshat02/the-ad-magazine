import type { MouseEvent } from 'react';
import type { BrandAd, ThemeMode } from '@/types/magazine';
import { getBorderClass, getMutedTextClass, getThemeBackground, getThemeColorClass } from '@/components/magazine/theme';

interface BrandAdPageProps {
  ad: BrandAd;
  pageId: string;
  themeMode: ThemeMode;
  pageNumber: number;
  isLiked: boolean;
  isCtaClicked: boolean;
  onLike: (e: MouseEvent) => void;
  onCta: () => void;
  onOpenChat: () => void;
}

export default function BrandAdPage({
  ad,
  themeMode,
  pageNumber,
  isLiked,
  isCtaClicked,
  onLike,
  onCta,
  onOpenChat,
}: BrandAdPageProps) {
  return (
    <div
      className={`relative flex h-dvh w-full snap-start snap-always flex-col overflow-hidden ${getThemeBackground(ad.theme, themeMode)}`}
    >
      <div className="relative h-[45vh] w-full shrink-0 md:h-[50vh]">
        <img src={ad.imageUrl} alt={ad.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <span className="mb-3 inline-block rounded-full bg-white/15 px-2.5 py-0.5 text-[9px] font-mono tracking-widest text-yellow-300 backdrop-blur-sm">
            SPONSORED
          </span>
          <h3 className="text-3xl font-black tracking-tight text-white md:text-5xl">{ad.name}</h3>
          <p className="mt-1 text-sm font-mono font-bold text-yellow-300 md:text-base">{ad.tagline}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-6 md:p-10">
        <div className="flex items-center justify-between">
          <p className={`text-xs leading-relaxed md:text-sm ${themeMode === 'light' ? 'text-zinc-700' : 'text-zinc-300'}`}>
            {ad.description}
          </p>
          <button
            type="button"
            onClick={onLike}
            className={`ml-4 flex shrink-0 cursor-pointer items-center gap-1.5 transition hover:text-pink-400 ${getMutedTextClass(themeMode)}`}
          >
            <span className="text-base">{isLiked ? '💖' : '🖤'}</span>
          </button>
        </div>

        {ad.features.length > 0 && (
          <div
            className={`my-4 grid grid-cols-1 gap-2 rounded-xl border p-4 text-xs font-mono md:grid-cols-2 ${
              themeMode === 'light'
                ? 'border-zinc-200 bg-white/60 text-zinc-700'
                : 'border-white/10 bg-white/5 text-zinc-300'
            }`}
          >
            {ad.features.map((feat) => (
              <div key={feat} className="flex items-center gap-1.5">
                <span>✨</span>
                <span>{feat}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-auto flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onCta}
            className={`flex-1 cursor-pointer rounded-xl border-2 py-3 px-4 text-center text-xs font-bold transition-all md:text-sm ${
              isCtaClicked ? 'scale-95 bg-white/10' : getThemeColorClass(ad.theme)
            }`}
          >
            {isCtaClicked ? 'Connecting...' : ad.ctaText}
          </button>
          <button
            type="button"
            onClick={onOpenChat}
            className="flex-1 cursor-pointer rounded-xl border-2 border-white bg-white py-3 px-4 text-center text-xs font-bold text-black transition hover:bg-neutral-200 md:text-sm"
          >
            Chat with {ad.aiName}
          </button>
        </div>

        <div
          className={`mt-4 flex items-center justify-between border-t pt-3 text-[10px] font-mono tracking-wider ${getMutedTextClass(themeMode)} ${getBorderClass(themeMode)}`}
        >
          <span>thead ad network</span>
          <span>PAGE {pageNumber}</span>
        </div>
      </div>
    </div>
  );
}
