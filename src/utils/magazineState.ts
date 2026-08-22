export interface BrandAd {
  id: string;
  name: string;
  tagline: string;
  imageUrl: string;
  theme: 'gold' | 'dark' | 'emerald' | 'glass' | 'bubblegum' | 'neon';
  ctaText: string;
  aiName: string;
  aiPersona: string;
  description: string;
  features: string[];
}

export interface AdInteraction {
  views: number;
  likes: number;
  clicks: number;
  chatSessions: number;
  chats: { role: 'user' | 'assistant'; text: string; timestamp: string }[];
  timeSpent: number; // in seconds
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

export const DEFAULT_BRANDS: BrandAd[] = [
  {
    id: "chronochuckle",
    name: "TickTock Toys",
    tagline: "Time flies when you are having fun! ⏰✨",
    imageUrl: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&q=80&w=1000",
    theme: "gold",
    ctaText: "Get Goofy Clock!",
    aiName: "Barnaby",
    aiPersona: "You are Barnaby, a goofy, energetic, and slightly eccentric clockmakers helper for TickTock Toys. Respond with lots of puns, time-related jokes, and emojis (⏰, 🕰️, ⚡). Keep replies short (1-2 sentences) and make sure they bring a smile!",
    description: "Retro mechanical watches that tick backwards on Tuesdays, play custom synthesizer noises on the hour, and are entirely water-resistant to chocolate milk. Truly hilarious watchmaking!",
    features: [
      "Custom Synthesizer Chimes 🎵",
      "Tuesday Backwards-Spin Capability 🔄",
      "Spill-proof (Even Milkshakes!) 🥛",
      "Bright neon watch straps ⚡"
    ]
  },
  {
    id: "zapbuggy",
    name: "ZapBuggy EV",
    tagline: "Electric dune buggies with extra attitude! ⚡🏎️",
    imageUrl: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1000",
    theme: "dark",
    ctaText: "Configure Buggy!",
    aiName: "Sparks",
    aiPersona: "You are Sparks, a hyperactive racing driver robot built for ZapBuggy EV. Use sound effects like 'BZZT!', 'VROOM!', and 'SKRRRT!'. Explain EV stats with extreme excitement and exclamation marks. Keep responses to 1-2 rapid lines!",
    description: "Built for dirt tracks, rocket launches, and supermarket parking lots. Recharges in the time it takes to eat a slice of pizza, pushing out 110% pure electric fun.",
    features: [
      "0-60 mph faster than a cheetah! 🐆",
      "Mud-flinging hover motor suspension 🏎️",
      "Pizza-box storage dashboard slot 🍕",
      "Vroom-vroom sound synthesizer 🔊"
    ]
  },
  {
    id: "puffyco",
    name: "PuffyCo Outfitters",
    tagline: "Wearable marshmallows for maximum cozy! ☁️🧥",
    imageUrl: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&q=80&w=1000",
    theme: "emerald",
    ctaText: "Get Marshmallow Cozy!",
    aiName: "Puffa",
    aiPersona: "You are Puffa, a friendly, soft-spoken styling coach made entirely of pillows for PuffyCo Outfitters. Speak about coziness, giant hugs, sleeping on clouds, and warm fuzzy feelings. Make cozy marshmallow references. Limit response to 1-2 sweet sentences.",
    description: "Stuffed with 100% simulated clouds and recycled hugs. Oversized, insulated bubble-jackets designed to keep you cozy even in an emergency snowball war.",
    features: [
      "Cloud-like ultra padding ☁️",
      "Fleece-lined marshmallow pockets 🧥",
      "Snowball-resistant shield guard ❄️",
      "Includes miniature pocket hot chocolate ☕"
    ]
  }
];

export const EDITORIAL_PAGES: MagazinePage[] = [
  {
    id: "edit-1",
    type: "editorial",
    title: "Is Your Office Desk Secretly a Slime Swamp?",
    author: "Giggle McSilly",
    category: "Office Shenanigans",
    readTime: "3 min giggle",
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000",
    content: "Science reveals that 9 out of 10 desks left unattended for over 48 hours begin to grow microscopic bounce-house particles. We investigate the mysterious sticky syrup behind your keyboard, why your favorite pen keeps walking towards the break room, and how to negotiate a peace treaty with the dust bunny under your CPU..."
  },
  {
    id: "edit-2",
    type: "editorial",
    title: "How to Prompt AI to Draw a Cat with 12 Legs",
    author: "Pixel Prankster",
    category: "Tech Jokes",
    readTime: "4 min snort",
    imageUrl: "https://images.unsplash.com/photo-1547891654-e66ed7edd96c?auto=format&fit=crop&q=80&w=1000",
    content: "We spent 24 straight hours asking neural networks to depict a standard tabby cat, but with exactly 12 legs. The results were: a multi-legged caterpillar cat, an abstract spider-kitten, and a server room crash in Munich. Read on for the full prompt recipes that will puzzle artificial programmers and wow your group chats!"
  }
];

export function getMagazinePages(): MagazinePage[] {
  if (typeof window === "undefined") {
    return [
      { id: "cover", type: "editorial", title: "theadmagazine: Autumn Fun Issue '26", category: "Cover Story🎉", author: "The Fun Squad", content: "Welcome to theadmagazine, the internet's most entertaining AI-integrated ad playground! Grab your favorite soda, read silly articles, click some buttons, and chat with goofy AI product characters." },
      EDITORIAL_PAGES[0],
      { id: "ad-chronochuckle", type: "ad", title: "TickTock Toys", brandAd: DEFAULT_BRANDS[0] },
      EDITORIAL_PAGES[1],
      { id: "ad-zapbuggy", type: "ad", title: "ZapBuggy EV", brandAd: DEFAULT_BRANDS[1] },
      { id: "ad-puffyco", type: "ad", title: "PuffyCo Outfitters", brandAd: DEFAULT_BRANDS[2] }
    ];
  }

  const storedCustom = localStorage.getItem("thead_custom_ads");
  const customAds: BrandAd[] = storedCustom ? JSON.parse(storedCustom) : [];

  const pages: MagazinePage[] = [
    {
      id: "cover",
      type: "editorial",
      title: "theadmagazine: Autumn Fun Issue '26",
      category: "Cover Story🎉",
      author: "The Fun Squad",
      content: "Welcome to theadmagazine, the internet's most entertaining AI-integrated ad playground! Grab your favorite soda, read silly articles, click some buttons, and chat with goofy AI product characters."
    },
    EDITORIAL_PAGES[0],
    { id: "ad-chronochuckle", type: "ad", title: "TickTock Toys", brandAd: DEFAULT_BRANDS[0] },
    EDITORIAL_PAGES[1],
    { id: "ad-zapbuggy", type: "ad", title: "ZapBuggy EV", brandAd: DEFAULT_BRANDS[1] },
    { id: "ad-puffyco", type: "ad", title: "PuffyCo Outfitters", brandAd: DEFAULT_BRANDS[2] }
  ];

  customAds.forEach((ad) => {
    pages.push({
      id: `ad-custom-${ad.id}`,
      type: "ad",
      title: ad.name,
      brandAd: ad
    });
  });

  return pages;
}

export function getAdInteractions(brandId: string): AdInteraction {
  if (typeof window === "undefined") {
    return { views: 0, likes: 0, clicks: 0, chatSessions: 0, chats: [], timeSpent: 0 };
  }

  const key = `thead_interact_${brandId}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    return JSON.parse(stored);
  }

  let seed: AdInteraction = { views: 154, likes: 58, clicks: 31, chatSessions: 22, chats: [], timeSpent: 340 };
  if (brandId === "zapbuggy") {
    seed = { views: 320, likes: 142, clicks: 82, chatSessions: 65, chats: [
      { role: 'user', text: 'Does it go vroom?', timestamp: '5 mins ago' },
      { role: 'assistant', text: 'BZZT! Absolutely! Sparks here says ZapBuggy goes full VROOM VROOM and SKRRRT on the dirt tracks! ⚡🏎️', timestamp: '5 mins ago' }
    ], timeSpent: 620 };
  } else if (brandId === "chronochuckle") {
    seed = { views: 210, likes: 78, clicks: 42, chatSessions: 28, chats: [
      { role: 'user', text: 'Why backward?', timestamp: '30 mins ago' },
      { role: 'assistant', text: 'Because clucking chickens and ticking backwards on Tuesdays makes time travel almost possible! ⏰🔄 Cluck-cluck!', timestamp: '30 mins ago' }
    ], timeSpent: 410 };
  } else if (brandId === "puffyco") {
    seed = { views: 180, likes: 89, clicks: 54, chatSessions: 38, chats: [
      { role: 'user', text: 'Are there marshmallows in it?', timestamp: '1 hour ago' },
      { role: 'assistant', text: '☁️ Sleepy soft simulated cloud puffs keep you cozy, with actual miniature marshmallow packets in your pockets! ☕ Cozy hugs!', timestamp: '1 hour ago' }
    ], timeSpent: 390 };
  }

  localStorage.setItem(key, JSON.stringify(seed));
  return seed;
}

export function saveAdInteraction(brandId: string, updates: Partial<AdInteraction>) {
  if (typeof window === "undefined") return;
  const current = getAdInteractions(brandId);
  const updated = {
    ...current,
    ...updates,
    chats: updates.chats ? [...current.chats, ...updates.chats] : current.chats
  };
  localStorage.setItem(`thead_interact_${brandId}`, JSON.stringify(updated));
}

// Simulated simple client AI endpoint
export function simulateAIChat(brandAd: BrandAd, message: string): string {
  const lowercaseMsg = message.toLowerCase();
  
  if (brandAd.id === "chronochuckle") {
    if (lowercaseMsg.includes("price") || lowercaseMsg.includes("cost") || lowercaseMsg.includes("buy")) {
      return "TickTock Retro clocks are yours for a small sack of shiny beans, or $199 USD! Tick-tock! ⏰✨";
    }
    if (lowercaseMsg.includes("material") || lowercaseMsg.includes("milk")) {
      return "Crafted with biodegradable sugar-plastics and safe chocolate-milk resistant space gear! 🍫🥛";
    }
    return "Time is a funny circle! 🕰️ Do you want your alarm chimes to play laser tag sounds or goat screams? 🐐💥";
  }

  if (brandAd.id === "zapbuggy") {
    if (lowercaseMsg.includes("speed") || lowercaseMsg.includes("fast")) {
      return "VROOM! We go from 0 to 'WHOAAA!' in 1.8 seconds flat! Hold onto your socks! ⚡🐆";
    }
    if (lowercaseMsg.includes("battery") || lowercaseMsg.includes("range")) {
      return "Our pizza-charging cells power up to 500 drift miles on a single bubble-gum charge! 🔋🍕 BZZT!";
    }
    return "SKRRRT! 🏎️ Sparks is ready to drift! Send me a message and let's configure your neon dirt tires!";
  }

  if (brandAd.id === "puffyco") {
    if (lowercaseMsg.includes("size") || lowercaseMsg.includes("fit")) {
      return "PuffyCo bubble coats are giant cloud sizes! Get your normal size for a cozy sleeping-bag vibe. ☁️🧥";
    }
    if (lowercaseMsg.includes("warm") || lowercaseMsg.includes("cold")) {
      return "Insulated with 100% premium synthesized hugs to withstand snowman assaults and severe marshmallow spills! ⛄🧣";
    }
    return "Cozy high-fives and cloud pockets! ☁️ What flavor of pocket hot chocolate would you like to request?";
  }

  // Custom AI simulation fallback
  return `YAHOO! Thanks for chatting with ${brandAd.aiName} for brand ${brandAd.name}! We love having fun in theadmagazine! ask me any question! 🎈🚀`;
}
