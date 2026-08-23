import type { MouseEvent } from 'react';
import type { BrandAd, ThemeMode } from '@/types/magazine';

interface BannerAdPageProps {
  ad: BrandAd;
  themeMode: ThemeMode;
  pageNumber: number;
  isLiked: boolean;
  onLike: (e: MouseEvent) => void;
  onPrimaryCta: () => void;
  onSecondaryCta?: () => void;
}

export default function BannerAdPage({
  ad,
  pageNumber,
  isLiked,
  onLike,
  onPrimaryCta,
  onSecondaryCta,
}: BannerAdPageProps) {
  const showSecondary = Boolean(ad.secondaryCtaText);

  return (
    <div className="relative h-dvh w-full snap-start snap-always overflow-hidden">
      <img src={ad.imageUrl} alt={ad.name} className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/25" />

      <div className="absolute left-0 right-0 top-0 flex items-center justify-between p-6 md:p-8">
        <span className="rounded-full bg-black/45 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-white backdrop-blur-sm">
          Sponsored · {ad.name}
        </span>
        <button
          type="button"
          onClick={onLike}
          className="cursor-pointer rounded-full bg-black/45 p-2 text-lg backdrop-blur-sm transition hover:bg-black/65"
        >
          {isLiked ? '💖' : '🖤'}
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
        <p className="text-sm font-mono text-yellow-200 md:text-base">{ad.tagline}</p>

        <div className={`mt-4 grid gap-3 ${showSecondary ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
          <button
            type="button"
            onClick={onPrimaryCta}
            className="cursor-pointer rounded-xl bg-white py-3.5 text-sm font-bold text-black transition hover:bg-zinc-200"
          >
            {ad.ctaText}
          </button>
          {showSecondary && (
            <button
              type="button"
              onClick={onSecondaryCta}
              className="cursor-pointer rounded-xl border-2 border-white/90 bg-white/10 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              {ad.secondaryCtaText}
            </button>
          )}
        </div>

        <p className="mt-3 text-[10px] font-mono text-zinc-400">PAGE {pageNumber}</p>
      </div>
    </div>
  );
}
