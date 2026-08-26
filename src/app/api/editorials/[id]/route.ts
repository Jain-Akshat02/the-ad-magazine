import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updatedEditorial = await prisma.editorial.update({
      where: { id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.author && { author: body.author }),
        ...(body.category && { category: body.category }),
        ...(body.readTime && { readTime: body.readTime }),
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
        ...(body.content && { content: body.content }),
      },
    });

    return NextResponse.json({ success: true, editorial: updatedEditorial });
  } catch (error: any) {
    console.error('Error updating editorial:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.editorial.delete({ where: { id } });
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    console.error('Error deleting editorial:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
