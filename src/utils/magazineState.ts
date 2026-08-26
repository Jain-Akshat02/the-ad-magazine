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

let cachedPages: MagazinePage[] | null = null;
let cachedQueries: UserQuery[] | null = null;
const cachedInteractions: Record<string, AdInteraction> = {};

export async function fetchMagazinePagesFromApi(): Promise<MagazinePage[]> {
  try {
    const [adsRes, editorialsRes] = await Promise.all([
      fetch('/api/ads'),
      fetch('/api/editorials'),
    ]);

    if (adsRes.ok && editorialsRes.ok) {
      const { ads } = await adsRes.json();
      const { editorials } = await editorialsRes.json();

      const customAds: BrandAd[] = (ads || [])
        .filter((a: any) => !a.isSeed)
        .map((a: any) => buildBrandAd(a));

      const customEditorials: MagazinePage[] = (editorials || [])
        .filter((e: any) => !e.isSeed)
        .map((e: any) => ({
          id: e.id,
          type: 'editorial' as const,
          title: e.title,
          author: e.author,
          category: e.category,
          readTime: e.readTime,
          imageUrl: e.imageUrl,
          content: e.content,
        }));

      const basePages = assembleEditionPages(customAds);
      cachedPages = [...basePages, ...customEditorials];
      return cachedPages;
    }
  } catch (err) {
    console.error('Failed to fetch magazine pages from API:', err);
  }

  return getMagazinePages();
}

export function getMagazinePages(): MagazinePage[] {
  if (cachedPages) return cachedPages;

  let customAds: BrandAd[] = [];
  let customEditorials: MagazinePage[] = [];

  if (typeof window !== 'undefined') {
    const storedAds = localStorage.getItem('thead_custom_ads');
    if (storedAds) customAds = (JSON.parse(storedAds) as BrandAd[]).map((ad) => buildBrandAd(ad));

    const storedEd = localStorage.getItem('thead_custom_editorials');
    if (storedEd) customEditorials = JSON.parse(storedEd);
  }

  const pages = assembleEditionPages(customAds);
  return [...pages, ...customEditorials];
}

export async function saveCustomAd(brand: BrandAd) {
  const built = buildBrandAd(brand);

  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('thead_custom_ads');
    const list: BrandAd[] = stored ? JSON.parse(stored) : [];
    list.push(built);
    localStorage.setItem('thead_custom_ads', JSON.stringify(list));
    localStorage.setItem('thead_subscribed', 'true');
  }

  try {
    await fetch('/api/ads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(built),
    });
    cachedPages = null;
  } catch (err) {
    console.error('Error saving custom ad via API:', err);
  }
}

export async function saveCustomEditorial(editorial: MagazinePage) {
  if (typeof window !== 'undefined') {
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

  try {
    const isEdit = editorial.id && editorial.id.startsWith('ed-') === false;
    const url = isEdit ? `/api/editorials/${editorial.id}` : '/api/editorials';
    const method = isEdit ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: editorial.title,
        author: editorial.author,
        category: editorial.category,
        readTime: editorial.readTime,
        imageUrl: editorial.imageUrl,
        content: editorial.content,
      }),
    });
    cachedPages = null;
  } catch (err) {
    console.error('Error saving custom editorial via API:', err);
  }
}

export async function deleteCustomEditorial(id: string) {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('thead_custom_editorials');
    if (stored) {
      const list: MagazinePage[] = JSON.parse(stored);
      localStorage.setItem('thead_custom_editorials', JSON.stringify(list.filter((e) => e.id !== id)));
    }
  }

  try {
    await fetch(`/api/editorials/${id}`, { method: 'DELETE' });
    cachedPages = null;
  } catch (err) {
    console.error('Error deleting editorial via API:', err);
  }
}

export function getCustomEditorials(): MagazinePage[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('thead_custom_editorials');
  return stored ? JSON.parse(stored) : [];
}

export function getAdInteractions(brandId: string): AdInteraction {
  if (cachedInteractions[brandId]) {
    return cachedInteractions[brandId];
  }

  if (typeof window === 'undefined') {
    return { views: 0, likes: 0, clicks: 0, chatSessions: 0, chats: [], timeSpent: 0 };
  }

  const key = `thead_interact_${brandId}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    const parsed = JSON.parse(stored);
    cachedInteractions[brandId] = parsed;
    return parsed;
  }

  const views = 150 + Math.floor(Math.random() * 200);
  const likes = Math.round(views * 0.25);
  const clicks = Math.round(views * 0.12);
  const chatSessions = Math.round(views * 0.08);
  const timeSpent = views * 3;

  const seed: AdInteraction = { views, likes, clicks, chatSessions, chats: [], timeSpent };
  localStorage.setItem(key, JSON.stringify(seed));
  cachedInteractions[brandId] = seed;
  return seed;
}

export async function fetchAdInteractionsFromApi(brandId: string): Promise<AdInteraction> {
  try {
    const res = await fetch(`/api/telemetry/${brandId}`);
    if (res.ok) {
      const data = await res.json();
      if (data.interaction) {
        cachedInteractions[brandId] = data.interaction;
        if (typeof window !== 'undefined') {
          localStorage.setItem(`thead_interact_${brandId}`, JSON.stringify(data.interaction));
        }
        return data.interaction;
      }
    }
  } catch (err) {
    console.error('Error fetching telemetry API:', err);
  }
  return getAdInteractions(brandId);
}

export async function saveAdInteraction(brandId: string, updates: Partial<AdInteraction>) {
  const current = getAdInteractions(brandId);
  const updated: AdInteraction = {
    ...current,
    ...updates,
    views: current.views + (updates.views || 0),
    likes: current.likes + (updates.likes || 0),
    clicks: current.clicks + (updates.clicks || 0),
    chatSessions: current.chatSessions + (updates.chatSessions || 0),
    timeSpent: current.timeSpent + (updates.timeSpent || 0),
    chats: updates.chats ? [...current.chats, ...updates.chats] : current.chats,
  };

  cachedInteractions[brandId] = updated;

  if (typeof window !== 'undefined') {
    localStorage.setItem(`thead_interact_${brandId}`, JSON.stringify(updated));
  }

  try {
    await fetch(`/api/telemetry/${brandId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        views: updates.views || 0,
        likes: updates.likes || 0,
        clicks: updates.clicks || 0,
        chatSessions: updates.chatSessions || 0,
        timeSpent: updates.timeSpent || 0,
        newChat: updates.chats && updates.chats.length > 0 ? updates.chats[updates.chats.length - 1] : undefined,
      }),
    });
  } catch (err) {
    console.error('Error saving ad interaction to API:', err);
  }
}

export function simulateAIChat(brandAd: BrandAd, message: string): string {
  const lowercaseMsg = message.toLowerCase();

  if (lowercaseMsg.includes('price') || lowercaseMsg.includes('cost') || lowercaseMsg.includes('buy')) {
    return `${brandAd.name} is premium quality at a great value! Ask us about current offers. 💰✨`;
  }

  if (lowercaseMsg.includes('features') || lowercaseMsg.includes('spec') || lowercaseMsg.includes('what does it do')) {
    const list = brandAd.features && brandAd.features.length > 0 ? brandAd.features.join(', ') : 'Unforgettable brand experiences';
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

export async function getUserQueriesFromApi(): Promise<UserQuery[]> {
  try {
    const res = await fetch('/api/support');
    if (res.ok) {
      const data = await res.json();
      if (data.queries) {
        cachedQueries = data.queries;
        if (typeof window !== 'undefined') {
          localStorage.setItem('thead_user_queries', JSON.stringify(data.queries));
        }
        return data.queries;
      }
    }
  } catch (err) {
    console.error('Error fetching support queries API:', err);
  }
  return getUserQueries();
}

export function getUserQueries(): UserQuery[] {
  if (cachedQueries) return cachedQueries;
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('thead_user_queries');
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
}

export async function addUserQuery(name: string, email: string, message: string) {
  const tempQuery: UserQuery = {
    id: `q-${Date.now()}`,
    name,
    email,
    message,
    status: 'Open',
    timestamp: 'Just now',
  };

  if (typeof window !== 'undefined') {
    const queries = getUserQueries();
    queries.push(tempQuery);
    localStorage.setItem('thead_user_queries', JSON.stringify(queries));
  }

  try {
    await fetch('/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message }),
    });
    cachedQueries = null;
  } catch (err) {
    console.error('Error adding user query via API:', err);
  }
}

export async function updateQueryStatus(id: string, status: 'Open' | 'In Progress' | 'Resolved') {
  if (typeof window !== 'undefined') {
    const queries = getUserQueries();
    const q = queries.find((item) => item.id === id);
    if (q) {
      q.status = status;
      localStorage.setItem('thead_user_queries', JSON.stringify(queries));
    }
  }

  try {
    await fetch(`/api/support/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    cachedQueries = null;
  } catch (err) {
    console.error('Error updating query status via API:', err);
  }
}

export async function replyToQuery(id: string, replyText: string) {
  if (typeof window !== 'undefined') {
    const queries = getUserQueries();
    const q = queries.find((item) => item.id === id);
    if (q) {
      if (!q.replies) q.replies = [];
      q.replies.push({ role: 'admin', text: replyText, timestamp: 'Just now' });
      q.status = 'Resolved';
      localStorage.setItem('thead_user_queries', JSON.stringify(queries));
    }
  }

  try {
    await fetch(`/api/support/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ replyText }),
    });
    cachedQueries = null;
  } catch (err) {
    console.error('Error replying to query via API:', err);
  }
}

export async function deleteQuery(id: string) {
  if (typeof window !== 'undefined') {
    const queries = getUserQueries().filter((q) => q.id !== id);
    localStorage.setItem('thead_user_queries', JSON.stringify(queries));
  }

  try {
    await fetch(`/api/support/${id}`, { method: 'DELETE' });
    cachedQueries = null;
  } catch (err) {
    console.error('Error deleting query via API:', err);
  }
}
