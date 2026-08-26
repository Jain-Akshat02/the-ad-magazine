import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let queries = await prisma.userQuery.findMany({
      orderBy: { createdAt: 'desc' },
      include: { replies: { orderBy: { createdAt: 'asc' } } },
    });

    if (queries.length === 0) {
      await prisma.userQuery.create({
        data: {
          id: 'q-1',
          name: 'Billy Bob',
          email: 'billy@funmail.com',
          message: 'How long does it take for my ad to appear in the reader?',
          status: 'Resolved',
          timestamp: '10 mins ago',
          replies: {
            create: {
              role: 'admin',
              text: 'Custom ads appear immediately after checkout in your browser session and database.',
              timestamp: '8 mins ago',
            },
          },
        },
      });

      await prisma.userQuery.create({
        data: {
          id: 'q-2',
          name: 'Sonia Sparkle',
          email: 'sonia@sparkleindustries.co',
          message: 'Can you help me format my AI assistant prompt?',
          status: 'Open',
          timestamp: 'Just now',
        },
      });

      queries = await prisma.userQuery.findMany({
        orderBy: { createdAt: 'desc' },
        include: { replies: { orderBy: { createdAt: 'asc' } } },
      });
    }

    return NextResponse.json({ success: true, queries });
  } catch (error: any) {
    console.error('Error fetching support queries:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    const newQuery = await prisma.userQuery.create({
      data: {
        name,
        email,
        message,
        status: 'Open',
        timestamp: 'Just now',
      },
      include: { replies: true },
    });

    return NextResponse.json({ success: true, query: newQuery }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating support query:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
