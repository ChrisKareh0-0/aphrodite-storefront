import { NextRequest, NextResponse } from 'next/server';

import { BACKEND_URL } from '@/constants';

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
    // Process images - backend already returns URLs
    let images = product.images?.map((imgUrl: string) => {
      if (!imgUrl) return null;
      // Convert relative URLs to absolute URLs
      const resolved = imgUrl.startsWith('http') ? imgUrl : `${BACKEND_URL}${imgUrl.startsWith('/') ? imgUrl : '/' + imgUrl}`;
      return resolved;
    }).filter(Boolean) || [];

    // Ensure at least one valid image
    if (images.length === 0) {
      images = [`${BACKEND_URL}/images/placeholder.svg`];
    }

    // Calculate stock count from stock array
    const stockArray = Array.isArray(product.stock) ? product.stock : [];
    const totalStock = stockArray.reduce((sum: number, item: { quantity?: number }) => sum + (item.quantity || 0), 0);

    const transformedProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      originalPrice: product.originalPrice,
      description: product.description,
      shortDescription: product.shortDescription,
      category: typeof product.category === 'object' && product.category
        ? { _id: product.category._id, name: product.category.name, slug: product.category.slug }
        : { _id: '', name: 'Uncategorized', slug: '' },
      brand: 'Aphrodite', // Default brand if not in backend
      rating: product.rating && typeof product.rating === 'object'
        ? { average: product.rating.average || 0, count: product.rating.count || 0 }
        : { average: 0, count: 0 },
      images,
      colors: product.colors || [],
      sizes: product.sizes || [],
      stock: stockArray,
      inStock: totalStock > 0,
      stockCount: totalStock,
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
      availability: totalStock > 0
        ? (totalStock > 5 ? 'In Stock' : 'Limited Stock')
        : 'Out of Stock'
    };

    return NextResponse.json({ product: transformedProduct });

  } catch (error) {
    console.error('Error fetching product from backend:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
