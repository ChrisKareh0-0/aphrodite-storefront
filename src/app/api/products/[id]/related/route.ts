import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const productId = resolvedParams.id;
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '4';

    // First, fetch the current product to get its category
    const productResponse = await fetch(
      `${BACKEND_URL}/api/public/products/${productId}`,
      {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      }
    );

    if (!productResponse.ok) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const productData = await productResponse.json();
    const product = productData.product;

    // Try to fetch products from the same category, fallback to all products
    let relatedData = { products: [] };

    try {
      // First try with category filter
      if (product.category?.slug) {
        const relatedParams = new URLSearchParams({
          limit: (parseInt(limit) + 2).toString(),
          category: product.category.slug
        });

        const relatedResponse = await fetch(
          `${BACKEND_URL}/api/public/products?${relatedParams.toString()}`,
          {
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store'
          }
        );

        if (relatedResponse.ok) {
          relatedData = await relatedResponse.json();
        }
      }

      // If no products found with category, get random products
      if (!relatedData.products || relatedData.products.length === 0) {
        const fallbackParams = new URLSearchParams({
          limit: (parseInt(limit) + 2).toString()
        });

        const fallbackResponse = await fetch(
          `${BACKEND_URL}/api/public/products?${fallbackParams.toString()}`,
          {
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store'
          }
        );

        if (fallbackResponse.ok) {
          relatedData = await fallbackResponse.json();
        }
      }
    } catch (err) {
      console.warn('Error fetching related products, will return empty:', err);
    }

    // Filter out the current product and limit results
    const relatedProducts = (relatedData.products || [])
      .filter((p: any) => p.id !== product.id && p.slug !== product.slug)
      .slice(0, parseInt(limit))
      .map((p: any) => {
        // Process images with fallback
        let images = p.images?.map((img: string) => {
          if (!img) return null;
          if (img.startsWith('http')) return img;
          return `${BACKEND_URL}${img}`;
        }).filter(Boolean) || [];

        // Ensure at least one valid image
        if (images.length === 0) {
          images = ['/placeholder-product.svg'];
        }

        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          originalPrice: p.originalPrice,
          category: p.category?.name || 'Uncategorized',
          rating: p.rating?.average || 0,
          reviewCount: p.rating?.count || 0,
          images,
          colors: p.colors || [],
          sizes: p.sizes || [],
          inStock: p.stock > 0,
          stockCount: p.stock,
          tags: p.tags || [],
          discount: p.originalPrice
            ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
            : 0,
          isPopular: (p.rating?.count || 0) > 50,
          availability: p.stock > 0
            ? (p.stock > 5 ? 'In Stock' : 'Limited Stock')
            : 'Out of Stock'
        };
      });

    return NextResponse.json({
      products: relatedProducts,
      metadata: {
        basedOn: product.name,
        category: product.category?.name,
        algorithm: 'category-based'
      }
    });

  } catch (error) {
    console.error('Error fetching related products from backend:', error);
    return NextResponse.json(
      { error: 'Failed to fetch related products', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
