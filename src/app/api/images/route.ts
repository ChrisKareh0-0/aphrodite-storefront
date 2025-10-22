import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Decode the URL if it's encoded
    const decodedUrl = decodeURIComponent(imageUrl);

    console.log('📸 Image proxy request for:', decodedUrl);

    // Try to fetch the image from the backend
    try {
      const response = await fetch(decodedUrl, {
        method: 'GET',
        headers: {
          'Accept': 'image/*',
        },
      });

      if (response.ok) {
        console.log('✅ Image loaded successfully from:', decodedUrl);
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        const buffer = await response.arrayBuffer();

        return new NextResponse(buffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=3600',
            'Access-Control-Allow-Origin': '*',
          },
        });
      } else {
        console.warn(`⚠️ Backend returned ${response.status} for image: ${decodedUrl}`);
        // Continue to try local fallback
      }
    } catch (fetchError) {
      console.warn('⚠️ Failed to fetch from backend, trying local path:', decodedUrl, fetchError);
    }

    // Fallback: Try to load from local public directory if it's a relative path
    if (decodedUrl.includes('/uploads/')) {
      const localPath = path.join(process.cwd(), 'public', decodedUrl);
      console.log('📁 Trying local path:', localPath);

      if (fs.existsSync(localPath)) {
        const buffer = fs.readFileSync(localPath);
        const ext = path.extname(localPath).toLowerCase();
        const contentTypeMap: Record<string, string> = {
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.gif': 'image/gif',
          '.webp': 'image/webp',
        };
        const contentType = contentTypeMap[ext] || 'image/jpeg';

        console.log('✅ Image loaded from local path:', localPath);
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=3600',
          },
        });
      }
    }

    // Return placeholder if both attempts fail
    console.error('❌ Image not found at:', decodedUrl);
    return NextResponse.json(
      { error: 'Image not found', url: decodedUrl },
      { status: 404 }
    );

  } catch (error) {
    console.error('❌ Error proxying image:', error);
    return NextResponse.json(
      { error: 'Failed to proxy image', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
