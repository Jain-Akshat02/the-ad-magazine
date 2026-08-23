import type { ThemeMode } from '@/types/magazine';
import { getBorderClass, getMutedTextClass } from '@/components/magazine/theme';

interface EditorialPageProps {
  title: string;
  author?: string;
  category?: string;
  readTime?: string;
  content?: string;
  imageUrl?: string;
  themeMode: ThemeMode;
  pageNumber: number;
}

export default function EditorialPage({
  title,
  author,
  category,
  readTime,
  content,
  imageUrl,
  themeMode,
  pageNumber,
}: EditorialPageProps) {
  const hasHero = Boolean(imageUrl);

  return (
    <div
      className={`relative flex h-dvh w-full snap-start snap-always flex-col overflow-hidden ${
        themeMode === 'light' ? 'bg-[#fdfaf2] text-stone-900' : 'bg-[#110d1a] text-zinc-200'
      }`}
    >
      {hasHero && (
        <div className="relative h-[42vh] w-full shrink-0 md:h-[48vh]">
          <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
          <div
            className={`absolute inset-0 bg-gradient-to-t ${
              themeMode === 'light' ? 'from-[#fdfaf2] via-transparent' : 'from-[#110d1a] via-transparent'
            }`}
          />
        </div>
      )}

      <div className={`flex flex-1 flex-col justify-between p-6 md:p-10 ${hasHero ? '' : 'pt-10'}`}>
        <div
          className={`flex items-center justify-between border-b border-dashed pb-3 text-[10px] uppercase tracking-wider font-mono ${getMutedTextClass(themeMode)} ${getBorderClass(themeMode)}`}
        >
          <span>Editorial</span>
          <span>{category}</span>
        </div>

        <div className="my-auto flex flex-col gap-4 py-6">
          <h2 className="font-serif text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">
            {title}
          </h2>
          {author && (
            <p className={`text-[10px] font-semibold uppercase tracking-wide ${getMutedTextClass(themeMode)}`}>
              By {author}
              {readTime ? ` · ${readTime}` : ''}
            </p>
          )}
          {content && (
            <p
              className={`max-w-3xl text-sm leading-relaxed md:text-base font-serif first-letter:float-left first-letter:mr-3 first-letter:text-5xl first-letter:font-black first-letter:text-pink-600 ${
                themeMode === 'light' ? 'text-stone-700' : 'text-zinc-300'
              }`}
            >
              {content}
            </p>
          )}
        </div>

        <div
          className={`flex items-center justify-between border-t border-dashed pt-3 text-[10px] font-mono tracking-wider ${getMutedTextClass(themeMode)} ${getBorderClass(themeMode)}`}
        >
          <span>theadmagazine issue</span>
          <span>PAGE {pageNumber}</span>
        </div>
      </div>
    </div>
  );
}
