import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import seedBrands from '@/content/brands/seed.json';

export async function GET() {
  try {
    let ads = await prisma.brandAd.findMany({
      orderBy: { createdAt: 'asc' },
      include: { interactions: true },
    });

    // Auto-seed default brands if database is fresh
    if (ads.length === 0) {
      for (const b of seedBrands) {
        await prisma.brandAd.create({
          data: {
            id: b.id,
            name: b.name,
            tagline: b.tagline,
            imageUrl: b.imageUrl,
            theme: b.theme,
            ctaText: b.ctaText,
            aiName: b.aiName,
            aiPersona: b.aiPersona,
            description: b.description,
            features: b.features,
            format: b.format || 'interactive',
            isSeed: true,
            interactions: {
              create: {
                views: Math.floor(Math.random() * 300) + 150,
                likes: Math.floor(Math.random() * 60) + 20,
                clicks: Math.floor(Math.random() * 40) + 10,
                chatSessions: Math.floor(Math.random() * 25) + 5,
                timeSpent: Math.floor(Math.random() * 800) + 200,
              },
            },
          },
        });
      }
      ads = await prisma.brandAd.findMany({
        orderBy: { createdAt: 'asc' },
        include: { interactions: true },
      });
    }

    return NextResponse.json({ success: true, ads });
  } catch (error: any) {
    console.error('Error fetching ads:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      tagline,
      imageUrl,
      theme = 'neon',
      ctaText = 'Visit Website',
      ctaUrl,
      secondaryCtaText,
      secondaryCtaUrl,
      aiName = 'AI Assistant',
      aiPersona = 'Friendly assistant',
      format = 'interactive',
      description,
      features = [],
    } = body;

    if (!name || !imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Name and Image URL are required' },
        { status: 400 }
      );
    }

    const newAd = await prisma.brandAd.create({
      data: {
        name,
        tagline: tagline || `${name} — Premium Experience! ✨`,
        imageUrl,
        theme,
        ctaText,
        ctaUrl,
        secondaryCtaText,
        secondaryCtaUrl,
        aiName,
        aiPersona,
        format,
        description,
        features: Array.isArray(features) ? features : [],
        interactions: {
          create: {
            views: 1,
            likes: 0,
            clicks: 0,
            chatSessions: 0,
            timeSpent: 0,
          },
        },
      },
      include: { interactions: true },
    });

    return NextResponse.json({ success: true, ad: newAd }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating ad:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
