import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updatedAd = await prisma.brandAd.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.tagline && { tagline: body.tagline }),
        ...(body.imageUrl && { imageUrl: body.imageUrl }),
        ...(body.theme && { theme: body.theme }),
        ...(body.ctaText && { ctaText: body.ctaText }),
        ...(body.ctaUrl !== undefined && { ctaUrl: body.ctaUrl }),
        ...(body.secondaryCtaText !== undefined && { secondaryCtaText: body.secondaryCtaText }),
        ...(body.secondaryCtaUrl !== undefined && { secondaryCtaUrl: body.secondaryCtaUrl }),
        ...(body.aiName && { aiName: body.aiName }),
        ...(body.aiPersona && { aiPersona: body.aiPersona }),
        ...(body.format && { format: body.format }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.features && { features: body.features }),
      },
      include: { interactions: true },
    });

    return NextResponse.json({ success: true, ad: updatedAd });
  } catch (error: any) {
    console.error('Error updating ad:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.brandAd.delete({ where: { id } });
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    console.error('Error deleting ad:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
