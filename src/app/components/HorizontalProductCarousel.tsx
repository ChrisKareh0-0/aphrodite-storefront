"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "../context/CartContext";

interface Product {
  id: number | string;
  slug?: string;
  name: string;
  price: number;
  images: Array<{url: string}> | string[];
  rating: number;
  description?: string;
  category?: string;
  brand?: string;
  inStock?: boolean;
  originalPrice?: number;
}

interface CarouselProps {
  title: string;
  query: string;
  subtitle?: string;
  isNewCollection?: boolean;
}

export default function HorizontalProductCarousel({ title, query, subtitle, isNewCollection = false }: CarouselProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | number | null>(null);
  const [justAddedId, setJustAddedId] = useState<string | number | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/products?${query}`);
        const data = await res.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error(`Error fetching ${title}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [query, title]);

  const handleProductClick = (productSlug: string) => {
    router.push(`/product/${productSlug}`);
  };

  const handleAddToCart = async (product: Product) => {
    try {
      setAddingId(product.id);

      const imageUrl = product.images && product.images.length > 0
        ? (typeof product.images[0] === 'string'
          ? product.images[0]
          : (product.images[0] as { url: string }).url)
        : '/placeholder-product.svg';

      addToCart({
        productId: String(product.id),
        name: product.name,
        price: product.price,
        image: imageUrl,
        stock: 999, // Default stock for carousel items
      });

      setJustAddedId(product.id);
      setTimeout(() => setJustAddedId((prev) => (prev === product.id ? null : prev)), 1500);
    } catch (e) {
      console.error(e);
    } finally {
      setAddingId(null);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i key={i} className={`bx ${i < rating ? 'bxs-star' : 'bx-star'}`}></i>
    ));
  };

  if (loading) {
    return (
      <div className="horizontal-carousel-loading">
        <h2>{title}</h2>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={`horizontal-carousel ${isNewCollection ? 'new-collection' : ''}`}>
      <div className="carousel-header">
        <h2>{title}</h2>
        {subtitle && <p className="carousel-subtitle">{subtitle}</p>}
      </div>
      <div className="products-container">
        {products.map((product: Product, index: number) => (
          <div
            key={product.id}
            className="product-card animated-card"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            {isNewCollection && <span className="new-badge">NEW</span>}
            <div className="product-image-wrapper" onClick={() => handleProductClick(product.slug || String(product.id))}>
              <Image
                src={
                  product.images && product.images.length > 0
                    ? (typeof product.images[0] === 'string'
                      ? product.images[0]
                      : (product.images[0] as { url: string }).url)
                    : 'https://i.postimg.cc/t403yfn9/home2.jpg'
                }
                alt={product.name}
                width={250}
                height={200}
              />
              <div className="product-overlay">
                <button className="overlay-btn" aria-label="Quick view">
                  <i className="bx bx-show"></i>
                </button>
                <button className="overlay-btn" aria-label="Add to wishlist">
                  <i className="bx bx-heart"></i>
                </button>
              </div>
            </div>

            <div className="product-info">
              <p className="product-name">{product.name}</p>
              <div className="price">
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="original-price">${typeof product.originalPrice === 'number' ? product.originalPrice.toFixed(2) : product.originalPrice}</span>
                )}
                <span className="current-price">${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}</span>
              </div>

              {/* Product Info Section */}
              <div className="product-details">
                {product.brand && (
                  <div className="product-brand">
                    <span className="label">Brand:</span> {product.brand}
                  </div>
                )}
                {product.category && (
                  <div className="product-category">
                    <span className="label">Category:</span> {product.category}
                  </div>
                )}
                {product.description && (
                  <div className="product-description">
                    {product.description.length > 60
                      ? `${product.description.substring(0, 60)}...`
                      : product.description}
                  </div>
                )}
                <div className="stock-status">
                  <span className={`stock-indicator ${product.inStock !== false ? 'in-stock' : 'out-of-stock'}`}>
                    {product.inStock !== false ? '✓ In Stock' : '✗ Out of Stock'}
                  </span>
                </div>
              </div>

              <div className="product-actions">
                <button
                  className={`add-to-cart-btn ${justAddedId === product.id ? 'added' : ''}`}
                  onClick={() => handleAddToCart(product)}
                  disabled={addingId === product.id}
                >
                  {addingId === product.id ? 'Adding…' : justAddedId === product.id ? 'Added!' : 'Add to Cart'}
                </button>
              </div>
              <div className="rating">
                {renderStars(Math.floor(product.rating || 0))}
              </div>
            </div>
          </div>
        ))}
      </div>
      {isNewCollection && products.length > 0 && (
        <div className="carousel-footer">
          <button
            className="view-all-btn"
            onClick={() => router.push('/products?featured=true')}
          >
            Explore New Collection
            <i className="bx bx-right-arrow-alt"></i>
          </button>
        </div>
      )}
    </div>
  );
}