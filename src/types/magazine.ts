export type BrandTheme = 'gold' | 'dark' | 'emerald' | 'glass' | 'bubblegum' | 'neon';
export type BrandFormat = 'interactive' | 'banner-only';
export type ThemeMode = 'light' | 'dark';

export interface BrandAdInput {
  id: string;
  name: string;
  imageUrl: string;
  format?: BrandFormat;
  tagline?: string;
  theme?: BrandTheme;
  ctaText?: string;
  ctaUrl?: string;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
  aiName?: string;
  aiPersona?: string;
  description?: string;
  features?: string[];
}

export interface BrandAd extends BrandAdInput {
  format: BrandFormat;
  tagline: string;
  theme: BrandTheme;
  ctaText: string;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
  aiName: string;
  aiPersona: string;
  description: string;
  features: string[];
}

export interface EditorialContent {
  id: string;
  title: string;
  author?: string;
  category?: string;
  readTime?: string;
  imageUrl?: string;
  content?: string;
}

export interface EditionCover {
  title: string;
  category?: string;
  author?: string;
  content?: string;
  imageUrl?: string;
}

export type EditionLayoutItem =
  | { type: 'cover' }
  | { type: 'editorial'; ref: string }
  | { type: 'ad'; ref: string }
  | { type: 'ad-slot' };

export interface EditionConfig {
  id: string;
  title: string;
  season: string;
  year: number;
  cover: EditionCover;
  layout: EditionLayoutItem[];
}

export interface MagazinePage {
  id: string;
  type: 'editorial' | 'ad';
  title: string;
  author?: string;
  content?: string;
  readTime?: string;
  category?: string;
  imageUrl?: string;
  brandAd?: BrandAd;
}

export interface AdInteraction {
  views: number;
  likes: number;
  clicks: number;
  chatSessions: number;
  chats: { role: 'user' | 'assistant'; text: string; timestamp: string }[];
  timeSpent: number;
}

export interface UserQuery {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  timestamp: string;
  replies?: { role: 'admin' | 'user'; text: string; timestamp: string }[];
}
