import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;

    // For now, return empty reviews array
    // In the future, this can be connected to a reviews backend
    return NextResponse.json({
      reviews: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10
      }
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews', reviews: [] },
      { status: 200 } // Return 200 with empty array instead of error
    );
  }
}
