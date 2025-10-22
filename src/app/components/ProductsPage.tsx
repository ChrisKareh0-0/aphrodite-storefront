"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from 'react-hot-toast';

interface Product {
  id: number | string;
  slug?: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  brand: string;
  rating: number;
  reviewCount: number;
  images: string[];
  colors: string[];
  sizes: string[];
  inStock: boolean;
  stockCount: number;
  discount: number;
  availability: string;
}

interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    categories: string[];
    brands: string[];
    priceRange: { min: number; max: number };
  };
}

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<ProductsResponse['pagination'] | null>(null);
  const [filters, setFilters] = useState<ProductsResponse['filters'] | null>(null);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'created');
  const [minPrice, setMinPrice] = useState(parseFloat(searchParams.get('minPrice') || '0'));
  const [maxPrice, setMaxPrice] = useState(parseFloat(searchParams.get('maxPrice') || '1000'));
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [showFilters, setShowFilters] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(searchParams.get('featured') === 'true');

  useEffect(() => {
    fetchProducts();
  }, [currentPage, selectedCategory, selectedBrand, searchQuery, sortBy, minPrice, maxPrice, featuredOnly]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (currentPage > 1) params.append('page', currentPage.toString());
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedBrand) params.append('brand', selectedBrand);
      if (searchQuery) params.append('search', searchQuery);
      if (sortBy !== 'created') params.append('sortBy', sortBy);
      if (minPrice > 0) params.append('minPrice', minPrice.toString());
      if (maxPrice < 1000) params.append('maxPrice', maxPrice.toString());
      if (featuredOnly) params.append('isFeatured', 'true');
      params.append('limit', '12');

      console.log('🔄 Fetching products with params:', Object.fromEntries(params.entries()));
      const response = await fetch(`/api/products?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ProductsResponse = await response.json();
      setProducts(data.products);
      setPagination(data.pagination);
      setFilters(data.filters);

      // Update URL without page reload
      const url = new URL(window.location.href);
      params.forEach((value, key) => url.searchParams.set(key, value));
      window.history.replaceState({}, '', url.toString());

    } catch (err) {
      console.error('Error fetching products:', err);
      const errorMessage = 'Failed to load products. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedCategory, selectedBrand, searchQuery, sortBy, minPrice, maxPrice, featuredOnly]);

  const handleProductClick = (productSlug: string) => {
    router.push(`/product/${productSlug}`);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
    setCurrentPage(1);
  };

  const handleBrandFilter = (brand: string) => {
    setSelectedBrand(brand === selectedBrand ? '' : brand);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const handlePriceFilter = () => {
    setCurrentPage(1);
    fetchProducts();
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setSearchQuery('');
    setSortBy('created');
    setMinPrice(0);
    setMaxPrice(1000);
    setCurrentPage(1);
  };


  if (error) {
    return (
      <div className="aph-list">
        <div className="products-error">
          <div className="error-content">
            <i className="bx bx-error-circle"></i>
            <h2>Failed to Load Products</h2>
            <p>{error}</p>
            <button onClick={fetchProducts} className="retry-btn">
              <i className="bx bx-refresh"></i>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="aph-list">
        <div className="products-page-centered">
        <div className="products-main-container">
          <div className="back-row"><Link href="/" className="back-link"><i className="bx bx-left-arrow-alt"></i> Back</Link></div>

          {/* Page Header */}
          <div className="products-page-header">
            <div className="header-content">
              <h1>{featuredOnly ? 'New Collection' : 'Our Products'}</h1>
              <p>{featuredOnly ? 'Explore our latest featured products' : 'Discover our complete collection of premium fashion items'}</p>
            </div>

            {/* Search Bar */}
            <div className="search-section">
              <div className="search-input-container">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="search-input"
                />
                <i className="bx bx-search search-icon"></i>
              </div>

              <button
                className={`filter-toggle ${showFilters ? 'active' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <i className="bx bx-filter-alt"></i>
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>
          </div>

          <div className="products-centered-content">

            {/* Filters Sidebar */}
            <div className={`filters-sidebar-centered ${showFilters ? 'show' : ''}`}>
              <div className="filters-header">
                <h3>Filters</h3>
                <button onClick={clearFilters} className="clear-filters">
                  Clear All
                </button>
              </div>

              {/* Categories */}
              {filters && filters.categories.length > 0 && (
                <div className="filter-group">
                  <h4>Categories</h4>
                  <div className="filter-options">
                    {filters.categories.map((category: string) => (
                      <button
                        key={category}
                        className={`filter-option ${selectedCategory === category ? 'active' : ''}`}
                        onClick={() => handleCategoryFilter(category)}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Brands */}
              {filters && filters.brands.length > 0 && (
                <div className="filter-group">
                  <h4>Brands</h4>
                  <div className="filter-options">
                    {filters.brands.map((brand: string) => (
                      <button
                        key={brand}
                        className={`filter-option ${selectedBrand === brand ? 'active' : ''}`}
                        onClick={() => handleBrandFilter(brand)}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div className="filter-group">
                <h4>Price Range</h4>
                <div className="price-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice || ''}
                    onChange={(e) => setMinPrice(parseFloat(e.target.value) || 0)}
                    className="price-input"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice || ''}
                    onChange={(e) => setMaxPrice(parseFloat(e.target.value) || 1000)}
                    className="price-input"
                  />
                </div>
                <button onClick={handlePriceFilter} className="apply-price-filter">
                  Apply
                </button>
              </div>

              {/* Sort */}
              <div className="filter-group">
                <h4>Sort By</h4>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="sort-select"
                >
                  <option value="created">Newest</option>
                  <option value="price">Price: Low to High</option>
                  <option value="price">Price: High to Low</option>
                  <option value="rating">Rating</option>
                  <option value="reviews">Most Reviews</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            <div className="products-main-centered">

              {/* Results Info */}
              <div className="results-info-centered">
                <span>
                  {loading ? 'Loading...' : `Showing ${products.length} of ${pagination?.total || 0} products`}
                </span>
                {(selectedCategory || selectedBrand || searchQuery || featuredOnly) && (
                  <div className="active-filters">
                    {featuredOnly && (
                      <span className="active-filter">
                        New Collection
                        <button onClick={() => setFeaturedOnly(false)}>×</button>
                      </span>
                    )}
                    {selectedCategory && (
                      <span className="active-filter">
                        Category: {selectedCategory}
                        <button onClick={() => handleCategoryFilter(selectedCategory)}>×</button>
                      </span>
                    )}
                    {selectedBrand && (
                      <span className="active-filter">
                        Brand: {selectedBrand}
                        <button onClick={() => handleBrandFilter(selectedBrand)}>×</button>
                      </span>
                    )}
                    {searchQuery && (
                      <span className="active-filter">
                        Search: &ldquo;{searchQuery}&rdquo;
                        <button onClick={() => handleSearch('')}>×</button>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Loading State */}
              {loading && (
                <div className="products-loading">
                  <div className="loading-grid">
                    {Array.from({ length: 12 }, (_, i) => (
                      <div key={i} className="product-skeleton">
                        <div className="skeleton-image"></div>
                        <div className="skeleton-content">
                          <div className="skeleton-line"></div>
                          <div className="skeleton-line short"></div>
                          <div className="skeleton-line"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Products Grid */}
              {!loading && (
                <div className="products-grid-centered">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="product-card-centered"
                      onClick={() => handleProductClick(product.slug || String(product.id))}
                    >
                      <div className="product-image">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            loading="lazy"
                            onError={(e) => {
                              // Fallback to placeholder if image fails
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400&h=400&fit=crop';
                            }}
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: '#cbd5e1' }}>No Image</span>
                          </div>
                        )}
                        {product.discount > 0 && (
                          <span className="discount-badge">-{product.discount}%</span>
                        )}
                        <div className="product-overlay">
                          <button className="quick-view-btn">
                            <i className="bx bx-show"></i>
                            Quick View
                          </button>
                        </div>
                      </div>

                      <div className="product-info">
                        <div className="product-category">{product.category}</div>
                        <h3 className="product-name">{product.name}</h3>
                        <div className="product-price">
                          <span className="current-price">${product.price}</span>
                          {product.originalPrice && (
                            <span className="original-price">${product.originalPrice}</span>
                          )}
                        </div>
                        <div className="product-availability">
                          <span className={`status ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
                            {product.availability}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!loading && products.length === 0 && (
                <div className="empty-state">
                  <i className="bx bx-search-alt-2"></i>
                  <h3>No Products Found</h3>
                  <p>Try adjusting your filters or search terms</p>
                  <button onClick={clearFilters} className="clear-filters-btn">
                    Clear All Filters
                  </button>
                </div>
              )}

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    className="pagination-btn"
                  >
                    <i className="bx bx-chevron-left"></i>
                    Previous
                  </button>

                  <div className="page-numbers">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                      return (
                        page <= pagination.totalPages && (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`page-number ${currentPage === page ? 'active' : ''}`}
                          >
                            {page}
                          </button>
                        )
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className="pagination-btn"
                  >
                    Next
                    <i className="bx bx-chevron-right"></i>
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}