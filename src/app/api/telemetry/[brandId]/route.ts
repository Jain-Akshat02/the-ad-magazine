import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ brandId: string }> }
) {
  try {
    const { brandId } = await params;

    let interaction = await prisma.adInteraction.findUnique({
      where: { brandId },
    });

    if (!interaction) {
      interaction = await prisma.adInteraction.create({
        data: {
          brandId,
          views: 1,
          likes: 0,
          clicks: 0,
          chatSessions: 0,
          timeSpent: 0,
        },
      });
    }

    const chats = await prisma.chatMessage.findMany({
      where: { brandId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      success: true,
      interaction: {
        views: interaction.views,
        likes: interaction.likes,
        clicks: interaction.clicks,
        chatSessions: interaction.chatSessions,
        timeSpent: interaction.timeSpent,
        chats: chats.map((c: { id: string; role: string; text: string; timestamp: string }) => ({
          id: c.id,
          role: c.role as 'user' | 'assistant',
          text: c.text,
          timestamp: c.timestamp,
        })),
      },
    });
  } catch (error: any) {
    console.error('Error fetching telemetry:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ brandId: string }> }
) {
  try {
    const { brandId } = await params;
    const body = await request.json();

    const { views = 0, likes = 0, clicks = 0, chatSessions = 0, timeSpent = 0, newChat } = body;

    let interaction = await prisma.adInteraction.findUnique({
      where: { brandId },
    });

    if (!interaction) {
      interaction = await prisma.adInteraction.create({
        data: {
          brandId,
          views: Math.max(views, 1),
          likes: Math.max(likes, 0),
          clicks: Math.max(clicks, 0),
          chatSessions: Math.max(chatSessions, 0),
          timeSpent: Math.max(timeSpent, 0),
        },
      });
    } else {
      interaction = await prisma.adInteraction.update({
        where: { brandId },
        data: {
          views: { increment: views },
          likes: { increment: likes },
          clicks: { increment: clicks },
          chatSessions: { increment: chatSessions },
          timeSpent: { increment: timeSpent },
        },
      });
    }

    if (newChat && newChat.role && newChat.text) {
      await prisma.chatMessage.create({
        data: {
          brandId,
          role: newChat.role,
          text: newChat.text,
          timestamp: newChat.timestamp || 'Just now',
        },
      });
    }

    const updatedChats = await prisma.chatMessage.findMany({
      where: { brandId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      success: true,
      interaction: {
        views: interaction.views,
        likes: interaction.likes,
        clicks: interaction.clicks,
        chatSessions: interaction.chatSessions,
        timeSpent: interaction.timeSpent,
        chats: updatedChats.map((c) => ({
          id: c.id,
          role: c.role as 'user' | 'assistant',
          text: c.text,
          timestamp: c.timestamp,
        })),
      },
    });
  } catch (error: any) {
    console.error('Error updating telemetry:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
