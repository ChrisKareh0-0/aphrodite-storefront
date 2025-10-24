import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/constants';

export async function GET(
  request: NextRequest,
  context: { params: { slug: string } }
) {
  const { slug } = context.params;

  try {
    console.log('🔄 Fetching reviews for product:', slug);
    const response = await fetch(
      `${BACKEND_URL}/api/public/products/${slug}/reviews`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Reviews not found' },
          { status: 404 }
        );
      }
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Reviews data:', data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}