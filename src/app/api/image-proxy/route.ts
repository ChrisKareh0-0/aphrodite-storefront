import { NextRequest, NextResponse } from 'next/server';
import { getImageUrl } from '@/constants';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imagePath = searchParams.get('path');

    if (!imagePath) {
      return NextResponse.json(
        { error: 'Image path is required' },
        { status: 400 }
      );
    }

    // Instead of proxying, redirect to the actual image URL on production
    const imageUrl = getImageUrl(imagePath);

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Invalid image path' },
        { status: 400 }
      );
    }

    return NextResponse.redirect(imageUrl, {
      status: 307,
      headers: {
        'Cache-Control': 'public, max-age=2592000', // Cache for 30 days
      },
    });

  } catch (error) {
    console.error('❌ Error handling image:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
}
