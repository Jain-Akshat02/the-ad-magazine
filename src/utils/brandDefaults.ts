import type { BrandAd, BrandAdInput, BrandTheme } from '@/types/magazine';

const THEMES: BrandTheme[] = ['gold', 'dark', 'emerald', 'glass', 'bubblegum', 'neon'];

export function pickThemeFromName(name: string): BrandTheme {
  return THEMES[name.length % THEMES.length];
}

export function buildBrandAd(input: BrandAdInput): BrandAd {
  const tagline = input.tagline ?? `${input.name} — made for the moment ✨`;
  const format = input.format ?? 'interactive';
  const isBanner = format === 'banner-only';

  return {
    id: input.id,
    name: input.name,
    imageUrl: input.imageUrl,
    format,
    tagline,
    theme: input.theme ?? pickThemeFromName(input.name),
    ctaText: input.ctaText ?? (isBanner ? 'Visit Website' : `Visit ${input.name}`),
    ctaUrl: input.ctaUrl,
    secondaryCtaText: input.secondaryCtaText ?? (isBanner ? 'Contact Brand' : undefined),
    secondaryCtaUrl: input.secondaryCtaUrl,
    aiName: input.aiName ?? `${input.name.split(/\s+/)[0]} Bot`,
    aiPersona:
      input.aiPersona ??
      `You are a friendly brand assistant for ${input.name}. Be upbeat, use emojis, and keep replies to 1-2 sentences.`,
    description: input.description ?? `Discover ${input.name}. ${tagline}`,
    features: input.features ?? [],
  };
}

export function createBrandFromMinimal(
  name: string,
  imageUrl: string,
  options: Partial<Omit<BrandAdInput, 'id' | 'name' | 'imageUrl'>> = {}
): BrandAd {
  const id = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;

  return buildBrandAd({
    id,
    name,
    imageUrl,
    ...options,
  });
}
