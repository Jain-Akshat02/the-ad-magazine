import type { ThemeMode } from '@/types/magazine';

export function getThemeBackground(theme: string, themeMode: ThemeMode): string {
  if (themeMode === 'light') {
    switch (theme) {
      case 'gold':
        return 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#fffcf0] via-[#f7ebd4] to-[#f2dfb6] text-zinc-900';
      case 'dark':
        return 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#f2fafd] via-[#e2f1fa] to-[#cee8f7] text-zinc-900';
      case 'emerald':
        return 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#f5fbf7] via-[#e4f5eb] to-[#d2eedb] text-zinc-900';
      case 'bubblegum':
        return 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#fffbfd] via-[#fcebf5] to-[#f7dded] text-zinc-900';
      case 'glass':
      default:
        return 'bg-[#fcfbf9] text-zinc-900';
    }
  }

  switch (theme) {
    case 'gold':
      return 'bg-radial from-[#3a2c16] via-[#1c1206] to-[#0f0a03] text-white';
    case 'dark':
      return 'bg-radial from-[#0c2f47] via-[#091b29] to-[#030b11] text-white';
    case 'emerald':
      return 'bg-radial from-[#083821] via-[#041a0e] to-[#010905] text-white';
    case 'bubblegum':
      return 'bg-radial from-pink-900/60 via-purple-950/80 to-zinc-950 text-white';
    case 'glass':
    default:
      return 'bg-radial from-stone-900 via-zinc-950 to-zinc-950 text-zinc-200';
  }
}

export function getThemeColorClass(theme: string): string {
  switch (theme) {
    case 'gold':
      return 'bg-yellow-500 hover:bg-yellow-600 text-black border-yellow-400 shadow-yellow-500/20';
    case 'dark':
      return 'bg-cyan-500 hover:bg-cyan-600 text-black border-cyan-400 shadow-cyan-500/20';
    case 'emerald':
      return 'bg-emerald-500 hover:bg-emerald-600 text-black border-emerald-400 shadow-emerald-500/20';
    case 'bubblegum':
      return 'bg-pink-500 hover:bg-pink-600 text-black border-pink-400 shadow-pink-500/20';
    case 'glass':
    default:
      return 'bg-white hover:bg-zinc-200 text-black border-white shadow-white/10';
  }
}

export function getReaderShellBackground(themeMode: ThemeMode): string {
  return themeMode === 'light' ? 'bg-[#ebe7df] text-zinc-900' : 'bg-[#0d0914] text-white';
}

export function getMutedTextClass(themeMode: ThemeMode): string {
  return themeMode === 'light' ? 'text-zinc-500' : 'text-zinc-400';
}

export function getBorderClass(themeMode: ThemeMode): string {
  return themeMode === 'light' ? 'border-zinc-200' : 'border-zinc-800';
}
