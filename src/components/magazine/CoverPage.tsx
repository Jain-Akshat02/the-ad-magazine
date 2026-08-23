import type { ThemeMode } from '@/types/magazine';

interface CoverPageProps {
  title: string;
  category?: string;
  content?: string;
  themeMode: ThemeMode;
  pageNumber: number;
  onScrollNext: () => void;
}

export default function CoverPage({
  title,
  category,
  content,
  themeMode,
  pageNumber,
  onScrollNext,
}: CoverPageProps) {
  const isLight = themeMode === 'light';

  return (
    <div
      className={`relative flex h-dvh w-full snap-start snap-always flex-col justify-between overflow-hidden p-6 md:p-10 ${
        isLight
          ? 'bg-gradient-to-b from-[#faf8f3] via-[#f3efe6] to-[#e8e2d6] text-stone-900'
          : 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-[#100b1a] to-[#07050a] text-white'
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-0 [background-size:24px_24px] ${
          isLight
            ? 'bg-[radial-gradient(#00000008_1px,transparent_1px)]'
            : 'bg-[radial-gradient(#ffffff08_1px,transparent_1px)]'
        }`}
      />

      <div
        className={`relative z-10 flex items-center justify-between border-b pb-4 text-[10px] font-mono tracking-widest ${
          isLight ? 'border-stone-300 text-stone-500' : 'border-white/10 text-zinc-400'
        }`}
      >
        <span>THE AD MAGAZINE &bull; AUTUMN &apos;26</span>
        <span>{category ?? 'ISSUE COVER'}</span>
      </div>

      <div className="relative z-10 my-auto flex flex-col items-center gap-6 py-8 text-center">
        <div
          className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
            isLight
              ? 'border border-pink-300 bg-pink-50 text-pink-700'
              : 'border border-pink-500/30 bg-pink-500/10 text-pink-400'
          }`}
        >
          Interactive Magazine
        </div>

        <h1 className="text-5xl font-black leading-none tracking-tight drop-shadow-sm md:text-7xl">
          {isLight ? (
            <>
              <span className="text-stone-950">thead</span>
              <span className="text-pink-600">magazine</span>
            </>
          ) : (
            <span className="bg-gradient-to-r from-pink-400 via-purple-300 to-amber-300 bg-clip-text text-transparent">
              theadmagazine
            </span>
          )}
        </h1>

        <h2
          className={`max-w-2xl text-xl font-bold font-serif md:text-3xl ${
            isLight ? 'text-stone-800' : 'text-zinc-200'
          }`}
        >
          {title}
        </h2>

        {content && (
          <p
            className={`max-w-lg text-sm leading-relaxed md:text-base ${
              isLight ? 'text-stone-600' : 'text-zinc-400'
            }`}
          >
            {content}
          </p>
        )}

        <button
          type="button"
          onClick={onScrollNext}
          className={`mt-4 flex animate-bounce cursor-pointer flex-col items-center gap-1.5 text-xs font-mono transition ${
            isLight ? 'text-pink-700 hover:text-pink-800' : 'text-pink-400 hover:text-pink-300'
          }`}
        >
          <span>Scroll to read</span>
          <span>↓</span>
        </button>
      </div>

      <div
        className={`relative z-10 flex items-center justify-between border-t pt-4 text-[9px] font-mono tracking-wider ${
          isLight ? 'border-stone-300 text-stone-500' : 'border-white/10 text-zinc-500'
        }`}
      >
        <span>&copy; theadmagazine</span>
        <span>PAGE {pageNumber}</span>
      </div>
    </div>
  );
}
