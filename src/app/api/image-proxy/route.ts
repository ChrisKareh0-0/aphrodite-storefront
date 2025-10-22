import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('src');
    if (!url) {
      return NextResponse.json({ error: 'Missing src parameter' }, { status: 400 });
    }

    // If the src is a relative path from the backend, prefix it
    const resolvedUrl = url.startsWith('/') ? `${BACKEND_URL}${url}` : url;

    const res = await fetch(resolvedUrl);
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: 502 });
    }

    const contentType = res.headers.get('content-type') || 'application/octet-stream';
    const buffer = await res.arrayBuffer();

    return new NextResponse(Buffer.from(buffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
