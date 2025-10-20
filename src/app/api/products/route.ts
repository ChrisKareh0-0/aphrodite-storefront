import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '12';
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const sortBy = searchParams.get('sortBy') || 'newest';
    const featured = searchParams.get('featured') === 'true' || searchParams.get('isFeatured') === 'true';
    const sale = searchParams.get('isOnSale') === 'true';

    // Build backend API query
    const backendParams = new URLSearchParams({
      page,
      limit,
      ...(search && { search }),
      ...(category && { category }),
      ...(sortBy && { sort: sortBy }),
      ...(featured && { featured: 'true' }),
      ...(sale && { sale: 'true' })
    });

    // Fetch from backend
    const backendResponse = await fetch(
      `${BACKEND_URL}/api/public/products?${backendParams.toString()}`,
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

    // Transform backend data to match frontend expectations
    const transformedProducts = (data.products || []).map((product: any) => {
      // Get image URL - handle both array of objects and array of strings
      let imageUrls: string[] = [];
      if (product.images && product.images.length > 0) {
        imageUrls = product.images.map((img: any) => {
          const imgUrl = typeof img === 'string' ? img : img?.url;
          if (!imgUrl) return null;
          if (imgUrl.startsWith('http')) return imgUrl;
          return `${BACKEND_URL}${imgUrl}`;
        }).filter(Boolean);
      } else if (product.image) {
        // Fallback to single image field
        const imgUrl = product.image.startsWith('http') ? product.image : `${BACKEND_URL}${product.image}`;
        imageUrls = [imgUrl];
      }

      // Ensure at least one valid image
      if (imageUrls.length === 0) {
        imageUrls = ['/placeholder-product.svg'];
      }

      return {
        id: product.id || product._id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        description: product.description,
        shortDescription: product.shortDescription,
        category: product.category?.name || 'Uncategorized',
        brand: 'Aphrodite', // Default brand
        rating: product.rating?.average || 0,
        reviewCount: product.rating?.count || 0,
        images: imageUrls,
        colors: product.colors || [],
        sizes: product.sizes || [],
        inStock: (product.stock || 0) > 0,
        stockCount: product.stock || 0,
        tags: product.tags || [],
        featured: product.isFeatured || false,
        isOnSale: product.isOnSale || false,
        createdAt: product.createdAt,
        discount: product.originalPrice
          ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
          : 0,
        availability: (product.stock || 0) > 0
          ? ((product.stock || 0) > 5 ? 'In Stock' : 'Limited Stock')
          : 'Out of Stock'
      };
    });

    return NextResponse.json({
      products: transformedProducts,
      pagination: data.pagination || {
        page: parseInt(page),
        limit: parseInt(limit),
        total: transformedProducts.length,
        totalPages: Math.ceil(transformedProducts.length / parseInt(limit)),
        hasNext: false,
        hasPrev: false
      },
      filters: {
        categories: [],
        brands: [],
        priceRange: { min: 0, max: 1000 },
        appliedFilters: {
          search,
          category,
          sortBy,
          featured,
          sale
        }
      },
      metadata: {
        totalProducts: transformedProducts.length,
        searchQuery: search,
        resultsCount: transformedProducts.length
      }
    });

  } catch (error) {
    console.error('Error fetching products from backend:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}