import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/public/categories`, {
      cache: 'no-store', // Always get fresh data
    });

    if (!response.ok) {
      throw new Error('Failed to fetch categories from backend');
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
