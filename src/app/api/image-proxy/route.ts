import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://aphrodite-admin.onrender.com';

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

    // Ensure path starts with /
    const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    const fullImageUrl = `${BACKEND_URL}${normalizedPath}`;

    console.log('📸 Fetching image from backend:', fullImageUrl);

    // Fetch the image from the backend
    const response = await fetch(fullImageUrl, {
      method: 'GET',
      headers: {
        'Accept': 'image/*',
      },
      cache: 'force-cache', // Cache for performance
    });

    if (!response.ok) {
      console.warn(`⚠️ Backend returned ${response.status} for: ${fullImageUrl}`);

      // If backend image fails, return a placeholder
      return NextResponse.redirect(
        'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400&h=400&fit=crop',
        { status: 307 }
      );
    }

    // Get image details
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();

    console.log('✅ Image loaded successfully:', fullImageUrl);

    // Return the image with caching headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=2592000', // Cache for 30 days
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('❌ Error proxying image:', error);

    // Return placeholder on error
    return NextResponse.redirect(
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400&h=400&fit=crop',
      { status: 307 }
    );
  }
}
