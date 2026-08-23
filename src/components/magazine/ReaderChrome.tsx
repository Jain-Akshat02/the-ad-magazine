import Link from 'next/link';
import type { MagazinePage, ThemeMode } from '@/types/magazine';

interface ReaderChromeProps {
  themeMode: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
  pages: MagazinePage[];
  activePageIndex: number;
  onNavigate: (index: number) => void;
}

function getChapterLabel(page: MagazinePage, index: number): string {
  if (page.id === 'cover' || index === 0) return 'Issue Cover';
  if (page.type === 'ad') return page.brandAd?.name || page.title;
  return page.title;
}

export default function ReaderChrome({
  themeMode,
  onThemeChange,
  pages,
  activePageIndex,
  onNavigate,
}: ReaderChromeProps) {
  const isLight = themeMode === 'light';

  const chromeBtn = isLight
    ? 'border-stone-300/80 bg-white/90 text-stone-800 shadow-md backdrop-blur-md hover:bg-white'
    : 'border-white/15 bg-black/45 text-white backdrop-blur-md hover:bg-black/65';

  const panelClass = isLight
    ? 'border-stone-200 bg-white/95 text-stone-800 shadow-xl backdrop-blur-xl'
    : 'border-white/10 bg-zinc-950/85 text-zinc-200 shadow-2xl backdrop-blur-xl';

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-between p-4 md:p-6">
        <Link
          href="/"
          className={`pointer-events-auto rounded-full border px-4 py-2 text-[10px] font-mono uppercase tracking-wider transition ${chromeBtn}`}
        >
          ← Home
        </Link>

        <div className={`pointer-events-auto flex items-center gap-1 rounded-full border p-1 ${chromeBtn}`}>
          <button
            type="button"
            onClick={() => onThemeChange('light')}
            className={`cursor-pointer rounded-full px-3 py-1.5 text-[10px] font-bold transition ${
              isLight ? 'bg-stone-900 text-white' : 'text-zinc-300 hover:text-white'
            }`}
          >
            Light
          </button>
          <button
            type="button"
            onClick={() => onThemeChange('dark')}
            className={`cursor-pointer rounded-full px-3 py-1.5 text-[10px] font-bold transition ${
              !isLight ? 'bg-white text-black' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Dark
          </button>
        </div>
      </div>

      <aside
        className={`fixed right-4 top-1/4 z-40 hidden max-h-[60vh] w-[180px] -translate-y-0 flex-col gap-2 overflow-y-auto rounded-2xl border p-3 md:right-6 lg:flex ${panelClass}`}
      >
        <span
          className={`border-b pb-2 text-center text-[9px] font-mono uppercase tracking-widest ${
            isLight ? 'border-stone-200 text-stone-500' : 'border-white/10 text-zinc-500'
          }`}
        >
          Chapters
        </span>
        {pages.map((page, idx) => {
          const label = getChapterLabel(page, idx);
          const isActive = activePageIndex === idx;
          const prefix = page.id === 'cover' || idx === 0 ? '📔' : page.type === 'ad' ? '⚡' : '📖';

          return (
            <button
              key={page.id}
              type="button"
              onClick={() => onNavigate(idx)}
              title={label}
              className={`cursor-pointer truncate rounded-lg border px-3 py-2 text-left text-[10px] font-mono transition-all ${
                isActive
                  ? isLight
                    ? 'border-stone-900 bg-stone-900 font-bold text-white'
                    : 'border-white bg-white font-bold text-black'
                  : isLight
                    ? 'border-transparent text-stone-600 hover:border-stone-200 hover:bg-stone-100 hover:text-stone-900'
                    : 'border-transparent text-zinc-400 hover:border-white/10 hover:bg-white/5 hover:text-white'
              }`}
            >
              {prefix} {label}
            </button>
          );
        })}
      </aside>
    </>
  );
}
