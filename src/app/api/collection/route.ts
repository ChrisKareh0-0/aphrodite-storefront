import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'https://aphrodite-admin.onrender.com';

export async function GET(request: NextRequest) {
  try {
    // Fetch from backend
    const backendResponse = await fetch(
      `${BACKEND_URL}/api/settings/collection`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      }
    );

    if (!backendResponse.ok) {
      throw new Error(`Backend returned ${backendResponse.status}`);
    }

    const data = await backendResponse.json();

    // Handle image URL - convert relative to absolute
    if (data.imageUrl && !data.imageUrl.startsWith('http')) {
      data.imageUrl = `${BACKEND_URL}${data.imageUrl}`;
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching collection settings from backend:', error);

    // Return default values on error
    return NextResponse.json({
      imageUrl: null,
      title: 'Our Collections',
      subtitle: 'Explore our curated selection of premium products'
    });
  }
}
