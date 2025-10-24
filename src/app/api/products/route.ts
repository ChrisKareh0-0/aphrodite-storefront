import { NextRequest, NextResponse } from 'next/server';

import { BACKEND_URL, getImageUrl } from '@/constants';

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
    const transformedProducts = (data.products || []).map((product: Record<string, unknown>) => {
      // Get image URL - handle both array of objects and array of strings
      let imageUrls: string[] = [];
      if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        imageUrls = product.images.map((img: unknown) => {
          const imgUrl = typeof img === 'string' ? img : (img as Record<string, unknown>)?.url as string;
          return getImageUrl(imgUrl || '');
        }).filter(Boolean);
      } else if (product.image) {
        imageUrls = [getImageUrl(product.image as string)];
      }

      // Ensure at least one valid image
      if (imageUrls.length === 0) {
        imageUrls = ['/images/placeholder.svg'];
      }

      // Calculate total stock from stock array
      const stockArray = Array.isArray(product.stock) ? product.stock : [];
      const totalStock = stockArray.reduce((sum: number, item: { quantity?: number }) => sum + (item.quantity || 0), 0);

      return {
        id: product.id || product._id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        description: product.description,
        shortDescription: product.shortDescription,
        category: ((product.category as Record<string, unknown>)?.name as string) || 'Uncategorized',
        brand: 'Aphrodite', // Default brand
        rating: ((product.rating as Record<string, unknown>)?.average as number) || 0,
        reviewCount: ((product.rating as Record<string, unknown>)?.count as number) || 0,
        images: imageUrls,
        colors: (product.colors as string[]) || [],
        sizes: (product.sizes as string[]) || [],
        inStock: totalStock > 0,
        stockCount: totalStock,
        tags: (product.tags as string[]) || [],
        featured: (product.isFeatured as boolean) || false,
        isOnSale: (product.isOnSale as boolean) || false,
        createdAt: product.createdAt,
        discount: product.originalPrice
          ? Math.round((((product.originalPrice as number) - (product.price as number)) / (product.originalPrice as number)) * 100)
          : 0,
        availability: totalStock > 0
          ? (totalStock > 5 ? 'In Stock' : 'Limited Stock')
          : 'Out of Stock'
      };
    });

    const currentPage = parseInt(page);
    const pageLimit = parseInt(limit);
    const backendPagination = data.pagination;
    const totalProducts = backendPagination?.total || transformedProducts.length;

    return NextResponse.json({
      products: transformedProducts,
      pagination: {
        page: currentPage,
        limit: pageLimit,
        total: totalProducts,
        totalPages: Math.ceil(totalProducts / pageLimit),
        hasNext: currentPage < Math.ceil(totalProducts / pageLimit),
        hasPrev: currentPage > 1
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