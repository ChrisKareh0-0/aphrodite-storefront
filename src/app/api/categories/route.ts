import { NextResponse } from 'next/server';
import { BACKEND_URL } from '@/constants';

interface BackendCategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  isActive: boolean;
  sortOrder: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string | null;
}

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/public/categories`, {
      cache: 'no-store', // Always get fresh data
    });

    if (!response.ok) {
      throw new Error('Failed to fetch categories from backend');
    }

    const data = await response.json();
    const transformedData = {
      categories: data.categories.map((category: BackendCategory): Category => ({
        id: category._id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image
      }))
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
