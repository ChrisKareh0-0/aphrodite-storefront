import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'https://aphrodite-admin.onrender.com';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const productId = resolvedParams.id;

    // Fetch from backend
    const backendResponse = await fetch(
      `${BACKEND_URL}/api/public/products/${productId}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      }
    );

    if (!backendResponse.ok) {
      if (backendResponse.status === 404) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }
      throw new Error(`Backend returned ${backendResponse.status}`);
    }

    const data = await backendResponse.json();
    const product = data.product;

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Transform backend data to match frontend expectations
    // Process images with fallback
    let images = product.images?.map((img: unknown) => {
      const imgUrl = typeof img === 'string' ? img : (img as Record<string, unknown>)?.url as string;
      if (!imgUrl) return null;
  const resolved = (imgUrl as string).startsWith('http') ? imgUrl : `${BACKEND_URL}${imgUrl}`;
  return resolved;
    }).filter(Boolean) || [];

    // Ensure at least one valid image
    if (images.length === 0) {
      images = ['/placeholder-product.svg'];
    }

    const transformedProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      originalPrice: product.originalPrice,
      description: product.description,
      shortDescription: product.shortDescription,
      category: product.category?.name || 'Uncategorized',
  brand: 'Aphrodite', // Default brand if not in backend
      rating: product.rating?.average || 0,
      reviewCount: product.rating?.count || 0,
      images,
      colors: product.colors || [],
      sizes: product.sizes || [],
      inStock: product.stock > 0,
      stockCount: product.stock,
      features: [
        ...(product.tags || []),
        ...(product.description ? ['Premium quality'] : [])
      ],
      specifications: product.seo || {},
      tags: product.tags || [],
      createdAt: product.createdAt,
      updatedAt: product.updatedAt || product.createdAt,
      views: Math.floor(Math.random() * 1000) + 100,
      lastUpdated: product.updatedAt || product.createdAt,
      availability: product.stock > 0
        ? (product.stock > 5 ? 'In Stock' : 'Limited Stock')
        : 'Out of Stock'
    };

    return NextResponse.json(transformedProduct);

  } catch (error) {
    console.error('Error fetching product from backend:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
