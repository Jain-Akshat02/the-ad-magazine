import autumn2026 from '@/content/editions/autumn-2026.json';
import editorialsIndex from '@/content/editorials/index.json';
import seedBrandsRaw from '@/content/brands/seed.json';
import type {
  BrandAd,
  BrandAdInput,
  EditionConfig,
  EditionCover,
  EditorialContent,
  MagazinePage,
} from '@/types/magazine';
import { buildBrandAd } from '@/utils/brandDefaults';

const CURRENT_EDITION = autumn2026 as EditionConfig;
const EDITORIALS = editorialsIndex as Record<string, EditorialContent>;
const SEED_BRANDS: BrandAd[] = (seedBrandsRaw as BrandAdInput[]).map(buildBrandAd);

const seedBrandMap = new Map(SEED_BRANDS.map((b) => [b.id, b]));

export function getCurrentEdition(): EditionConfig {
  return CURRENT_EDITION;
}

export function getSeedBrands(): BrandAd[] {
  return SEED_BRANDS;
}

export function getEditorials(): EditorialContent[] {
  return Object.values(EDITORIALS);
}

function buildCoverPage(cover: EditionCover): MagazinePage {
  return {
    id: 'cover',
    type: 'editorial',
    title: cover.title,
    category: cover.category,
    author: cover.author,
    content: cover.content,
    imageUrl: cover.imageUrl,
  };
}

function buildEditorialPage(ref: string): MagazinePage | null {
  const editorial = EDITORIALS[ref];
  if (!editorial) return null;

  return {
    id: editorial.id,
    type: 'editorial',
    title: editorial.title,
    author: editorial.author,
    category: editorial.category,
    readTime: editorial.readTime,
    imageUrl: editorial.imageUrl,
    content: editorial.content,
  };
}

function buildAdPage(ref: string): MagazinePage | null {
  const brand = seedBrandMap.get(ref);
  if (!brand) return null;

  return {
    id: `ad-${ref}`,
    type: 'ad',
    title: brand.name,
    brandAd: brand,
  };
}

export function assembleEditionPages(customAds: BrandAd[] = []): MagazinePage[] {
  const pages: MagazinePage[] = [];
  const adSlotQueue = [...customAds];

  for (const item of CURRENT_EDITION.layout) {
    if (item.type === 'cover') {
      pages.push(buildCoverPage(CURRENT_EDITION.cover));
      continue;
    }

    if (item.type === 'editorial') {
      const page = buildEditorialPage(item.ref);
      if (page) pages.push(page);
      continue;
    }

    if (item.type === 'ad') {
      const page = buildAdPage(item.ref);
      if (page) pages.push(page);
      continue;
    }

    if (item.type === 'ad-slot' && adSlotQueue.length > 0) {
      const brand = adSlotQueue.shift()!;
      pages.push({
        id: `ad-custom-${brand.id}`,
        type: 'ad',
        title: brand.name,
        brandAd: brand,
      });
    }
  }

  adSlotQueue.forEach((brand) => {
    pages.push({
      id: `ad-custom-${brand.id}`,
      type: 'ad',
      title: brand.name,
      brandAd: brand,
    });
  });

  return pages;
}
