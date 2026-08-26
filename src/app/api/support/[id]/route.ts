import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, replyText } = body;

    if (replyText) {
      await prisma.queryReply.create({
        data: {
          queryId: id,
          role: 'admin',
          text: replyText,
          timestamp: 'Just now',
        },
      });

      const updatedQuery = await prisma.userQuery.update({
        where: { id },
        data: { status: 'Resolved' },
        include: { replies: { orderBy: { createdAt: 'asc' } } },
      });

      return NextResponse.json({ success: true, query: updatedQuery });
    }

    if (status) {
      const updatedQuery = await prisma.userQuery.update({
        where: { id },
        data: { status },
        include: { replies: { orderBy: { createdAt: 'asc' } } },
      });

      return NextResponse.json({ success: true, query: updatedQuery });
    }

    return NextResponse.json({ success: false, error: 'No update parameters provided' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating support query:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.userQuery.delete({ where: { id } });
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    console.error('Error deleting support query:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
