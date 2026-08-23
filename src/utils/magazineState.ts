import type { AdInteraction, BrandAd, MagazinePage, UserQuery } from '@/types/magazine';
import { buildBrandAd } from '@/utils/brandDefaults';
import { assembleEditionPages, getEditorials, getSeedBrands } from '@/utils/editionLoader';

export type {
  AdInteraction,
  BrandAd,
  BrandAdInput,
  BrandFormat,
  BrandTheme,
  EditionConfig,
  MagazinePage,
  ThemeMode,
  UserQuery,
} from '@/types/magazine';

export { buildBrandAd, createBrandFromMinimal } from '@/utils/brandDefaults';
export {
  assembleEditionPages,
  getCurrentEdition,
  getEditorials,
  getSeedBrands,
} from '@/utils/editionLoader';

/** @deprecated Use getSeedBrands() */
export const DEFAULT_BRANDS = getSeedBrands();

/** @deprecated Use getEditorials() mapped to pages */
export const EDITORIAL_PAGES: MagazinePage[] = getEditorials().map((editorial) => ({
  id: editorial.id,
  type: 'editorial' as const,
  title: editorial.title,
  author: editorial.author,
  category: editorial.category,
  readTime: editorial.readTime,
  imageUrl: editorial.imageUrl,
  content: editorial.content,
}));

function getCustomAds(): BrandAd[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('thead_custom_ads');
  if (!stored) return [];
  return (JSON.parse(stored) as BrandAd[]).map((ad) => buildBrandAd(ad));
}

export function getMagazinePages(): MagazinePage[] {
  const customAds = getCustomAds();
  const pages = assembleEditionPages(customAds);

  if (typeof window === 'undefined') {
    return pages;
  }

  const storedCustomEditorials = localStorage.getItem('thead_custom_editorials');
  const customEditorials: MagazinePage[] = storedCustomEditorials ? JSON.parse(storedCustomEditorials) : [];

  return [...pages, ...customEditorials];
}

export function saveCustomAd(brand: BrandAd) {
  if (typeof window === 'undefined') return;
  const stored = localStorage.getItem('thead_custom_ads');
  const list: BrandAd[] = stored ? JSON.parse(stored) : [];
  list.push(buildBrandAd(brand));
  localStorage.setItem('thead_custom_ads', JSON.stringify(list));
  localStorage.setItem('thead_subscribed', 'true');
}

export function saveCustomEditorial(editorial: MagazinePage) {
  if (typeof window === 'undefined') return;
  const stored = localStorage.getItem('thead_custom_editorials');
  const list: MagazinePage[] = stored ? JSON.parse(stored) : [];

  const existingIdx = list.findIndex((e) => e.id === editorial.id);
  if (existingIdx >= 0) {
    list[existingIdx] = editorial;
  } else {
    list.push(editorial);
  }
  localStorage.setItem('thead_custom_editorials', JSON.stringify(list));
}

export function deleteCustomEditorial(id: string) {
  if (typeof window === 'undefined') return;
  const stored = localStorage.getItem('thead_custom_editorials');
  if (!stored) return;
  const list: MagazinePage[] = JSON.parse(stored);
  localStorage.setItem('thead_custom_editorials', JSON.stringify(list.filter((e) => e.id !== id)));
}

export function getCustomEditorials(): MagazinePage[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('thead_custom_editorials');
  return stored ? JSON.parse(stored) : [];
}

function getDeterministicSeed(str: string, max: number, min: number = 0): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return min + Math.abs(hash % (max - min));
}

export function getAdInteractions(brandId: string): AdInteraction {
  if (typeof window === 'undefined') {
    return { views: 0, likes: 0, clicks: 0, chatSessions: 0, chats: [], timeSpent: 0 };
  }

  const key = `thead_interact_${brandId}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    return JSON.parse(stored);
  }

  const views = getDeterministicSeed(brandId, 480, 150);
  const likes = Math.round(views * (getDeterministicSeed(brandId, 45, 18) / 100));
  const clicks = Math.round(views * (getDeterministicSeed(brandId, 25, 6) / 100));
  const chatSessions = Math.round(views * (getDeterministicSeed(brandId, 18, 4) / 100));
  const timeSpent = views * getDeterministicSeed(brandId, 5, 2);

  const seed: AdInteraction = { views, likes, clicks, chatSessions, chats: [], timeSpent };
  localStorage.setItem(key, JSON.stringify(seed));
  return seed;
}

export function saveAdInteraction(brandId: string, updates: Partial<AdInteraction>) {
  if (typeof window === 'undefined') return;
  const current = getAdInteractions(brandId);
  const updated = {
    ...current,
    ...updates,
    chats: updates.chats ? [...current.chats, ...updates.chats] : current.chats,
  };
  localStorage.setItem(`thead_interact_${brandId}`, JSON.stringify(updated));
}

export function simulateAIChat(brandAd: BrandAd, message: string): string {
  const lowercaseMsg = message.toLowerCase();

  if (lowercaseMsg.includes('price') || lowercaseMsg.includes('cost') || lowercaseMsg.includes('buy')) {
    return `${brandAd.name} is premium quality at a great value! Ask us about current offers. 💰✨`;
  }

  if (lowercaseMsg.includes('features') || lowercaseMsg.includes('spec') || lowercaseMsg.includes('what does it do')) {
    const list = brandAd.features.length > 0 ? brandAd.features.join(', ') : 'Unforgettable brand experiences';
    return `Key highlights of ${brandAd.name}: ${list}! ⚡`;
  }

  if (lowercaseMsg.includes('slogan') || lowercaseMsg.includes('tagline') || lowercaseMsg.includes('motto')) {
    return `Our tagline: "${brandAd.tagline}" 📣`;
  }

  if (lowercaseMsg.includes('who') || lowercaseMsg.includes('name')) {
    return `I'm ${brandAd.aiName}, the assistant for ${brandAd.name}! Nice to meet you. 😊`;
  }

  return `${brandAd.aiName} here! ${brandAd.tagline} What else would you like to know about ${brandAd.name}? 🎈`;
}

export function getUserQueries(): UserQuery[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('thead_user_queries');
  if (stored) {
    return JSON.parse(stored);
  }

  const seeds: UserQuery[] = [
    {
      id: 'q-1',
      name: 'Billy Bob',
      email: 'billy@funmail.com',
      message: 'How long does it take for my ad to appear in the reader?',
      status: 'Resolved',
      timestamp: '10 mins ago',
      replies: [
        {
          role: 'admin',
          text: 'Custom ads appear immediately after checkout in your browser session.',
          timestamp: '8 mins ago',
        },
      ],
    },
    {
      id: 'q-2',
      name: 'Sonia Sparkle',
      email: 'sonia@sparkleindustries.co',
      message: 'Can you help me format my AI assistant prompt?',
      status: 'Open',
      timestamp: 'Just now',
    },
  ];
  localStorage.setItem('thead_user_queries', JSON.stringify(seeds));
  return seeds;
}

export function saveUserQuery(query: UserQuery) {
  if (typeof window === 'undefined') return;
  const queries = getUserQueries();
  const index = queries.findIndex((q) => q.id === query.id);
  if (index >= 0) {
    queries[index] = query;
  } else {
    queries.push(query);
  }
  localStorage.setItem('thead_user_queries', JSON.stringify(queries));
}

export function addUserQuery(name: string, email: string, message: string) {
  if (typeof window === 'undefined') return;
  saveUserQuery({
    id: `q-${Date.now()}`,
    name,
    email,
    message,
    status: 'Open',
    timestamp: 'Just now',
  });
}

export function updateQueryStatus(id: string, status: 'Open' | 'In Progress' | 'Resolved') {
  if (typeof window === 'undefined') return;
  const query = getUserQueries().find((q) => q.id === id);
  if (query) {
    query.status = status;
    saveUserQuery(query);
  }
}

export function replyToQuery(id: string, replyText: string) {
  if (typeof window === 'undefined') return;
  const query = getUserQueries().find((q) => q.id === id);
  if (query) {
    if (!query.replies) query.replies = [];
    query.replies.push({ role: 'admin', text: replyText, timestamp: 'Just now' });
    query.status = 'Resolved';
    saveUserQuery(query);
  }
}

export function deleteQuery(id: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    'thead_user_queries',
    JSON.stringify(getUserQueries().filter((q) => q.id !== id))
  );
}
