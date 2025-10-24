import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/constants';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    console.log('🔄 Fetching related products for:', params.slug);
    const response = await fetch(
      `${BACKEND_URL}/api/public/products/${params.slug}/related`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Related products data:', data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching related products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch related products', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}