import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import seedEditorialsMap from '@/content/editorials/index.json';

export async function GET() {
  try {
    let editorials = await prisma.editorial.findMany({
      orderBy: { createdAt: 'asc' },
    });

    if (editorials.length === 0) {
      const entries = Object.values(seedEditorialsMap);
      for (const ed of entries) {
        await prisma.editorial.create({
          data: {
            id: ed.id,
            title: ed.title,
            author: ed.author,
            category: ed.category,
            readTime: ed.readTime,
            imageUrl: ed.imageUrl,
            content: ed.content,
            isSeed: true,
          },
        });
      }
      editorials = await prisma.editorial.findMany({
        orderBy: { createdAt: 'asc' },
      });
    }

    return NextResponse.json({ success: true, editorials });
  } catch (error: any) {
    console.error('Error fetching editorials:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, author, category, readTime, imageUrl, content } = body;

    if (!title || !author || !content) {
      return NextResponse.json(
        { success: false, error: 'Title, author, and content are required' },
        { status: 400 }
      );
    }

    const newEditorial = await prisma.editorial.create({
      data: {
        title,
        author,
        category: category || 'Editorial',
        readTime: readTime || '3 min read',
        imageUrl: imageUrl || null,
        content,
      },
    });

    return NextResponse.json({ success: true, editorial: newEditorial }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating editorial:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
