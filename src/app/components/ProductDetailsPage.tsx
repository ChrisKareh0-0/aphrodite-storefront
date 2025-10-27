"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from 'react-hot-toast';
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import { PLACEHOLDER_IMAGE, getImageUrl } from '@/constants';

interface ColorOption {
  name: string;
  code?: string;
  available?: boolean;
  _id?: string;
}

interface SizeOption {
  name: string;
  available?: boolean;
  _id?: string;
}

interface Product {
  id: number | string;
  slug?: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: { _id: string; name: string; slug: string };
  brand?: string;
  rating: { average: number; count: number };
  images: string[];
  colors: (string | ColorOption)[];
  sizes: (string | SizeOption)[];
  stock: { color?: string; size?: string; quantity: number }[];
  tags?: string[];
  features: string[];
  specifications: Record<string, string>;
}

interface Review {
  id: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

interface ProductDetailsPageProps {
  productId: string;
}

export default function ProductDetailsPage({ productId }: ProductDetailsPageProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  const fetchProductDetails = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching product details for ID:', productId);
      const response = await fetch(`/api/products/${productId}`);

      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Product not found');
          setError('Product not found');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { product: data } = await response.json();
      if (!data) {
        toast.error('Product not found');
        setError('Product not found');
        router.push('/products');
        return;
      }
      console.log('✅ Product details data:', data);
      console.log('📸 Product images:', data.images);

      // Images should already be absolute URLs from the API
      let processedImages = data.images || [];
      
      // Fallback to placeholder if no images
      if (processedImages.length === 0) {
        console.warn('⚠️ No images found for product, using placeholder');
        processedImages = [PLACEHOLDER_IMAGE];
      }
      
      // Ensure all images are valid URLs or fallback to placeholder
      processedImages = processedImages.map((img: string) => {
        if (!img || img === '/placeholder-product.svg') {
          return PLACEHOLDER_IMAGE;
        }
        return img;
      });

      const processedData = {
        ...data,
        images: processedImages,
        features: data.features || [],
        colors: data.colors || [],
        sizes: data.sizes || [],
        specifications: data.specifications || {}
      };

      console.log('🖼️ Processed image URLs:', processedData.images);
      setProduct(processedData);
      const firstColor = data.colors?.[0];
      const firstSize = data.sizes?.[0];
      setSelectedColor(typeof firstColor === 'string' ? firstColor : firstColor?.name || "");
      setSelectedSize(typeof firstSize === 'string' ? firstSize : firstSize?.name || "");
      setError(null);
    } catch (err) {
      console.error('Error fetching product:', err);
      const errorMsg = 'Failed to load product details';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [productId, router]);

  const fetchProductReviews = useCallback(async () => {
    try {
      const response = await fetch(`/api/products/${productId}/reviews`);

      if (!response.ok) {
        // Reviews are optional, just log the error
        console.warn('No reviews available');
        setReviews([]);
        return;
      }

      const { reviews: data } = await response.json();
      setReviews(data || []);
    } catch (err) {
      console.warn('Error fetching reviews:', err);
      setReviews([]);
    }
  }, [productId]);

  const fetchRelatedProducts = useCallback(async () => {
    try {
      const response = await fetch(`/api/products/${productId}/related`);

      if (!response.ok) {
        console.warn('No related products available');
        setRelatedProducts([]);
        return;
      }

      const { products } = await response.json();
      setRelatedProducts(products || []);
    } catch (err) {
      console.warn('Error fetching related products:', err);
      setRelatedProducts([]);
    }
  }, [productId]);
  
  // Calculate stock count from stock array
  const stockCount = product?.stock?.reduce((total, item) => total + item.quantity, 0) || 0;
  
  // Check if product is in stock
  const isInStock = stockCount > 0;

  // Fetch data when component mounts or product ID changes
  useEffect(() => {
    fetchProductDetails();
    fetchProductReviews();
    fetchRelatedProducts();
  }, [productId, fetchProductDetails, fetchProductReviews, fetchRelatedProducts]);

  const handleAddToCart = () => {
    if (!product) return;

    try {
      addToCart({
        productId: String(product.id),
        name: product.name,
        price: product.price,
        image: product.images[0] || PLACEHOLDER_IMAGE,
        color: selectedColor,
        size: selectedSize,
        stock: stockCount,
        quantity,
      });
    } catch (err) {
      console.error('Error adding to cart:', err);
      toast.error('Failed to add to cart');
    }
  };

  const handleBuyNow = () => {
    if (!product) return;

    try {
      addToCart({
        productId: String(product.id),
        name: product.name,
        price: product.price,
        image: product.images[0] || PLACEHOLDER_IMAGE,
        color: selectedColor,
        size: selectedSize,
        stock: stockCount,
        quantity,
      });

      // Redirect to cart/checkout
      router.push('/cart');
    } catch (err) {
      console.error('Error:', err);
      toast.error('Failed to proceed to checkout');
    }
  };

  const toggleWishlist = async () => {
    try {
      const response = await fetch(`/api/wishlist/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle wishlist');
      }

      setIsWishlisted(!isWishlisted);
      showNotification(
        isWishlisted ? 'Removed from wishlist' : 'Added to wishlist',
        'success'
      );
    } catch (err) {
      console.error('Error toggling wishlist:', err);
      showNotification('Failed to update wishlist', 'error');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    // Simple notification implementation
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i key={i} className={`bx ${i < rating ? 'bxs-star' : 'bx-star'}`}></i>
    ));
  };

  if (loading) {
    return (
      <div className="aph-pdp">
        <div className="product-details-loading">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="aph-pdp">
        <div className="product-details-error">
          <div className="error-message">
            <i className="bx bx-error"></i>
            <h2>Product Not Found</h2>
            <p>Sorry, we couldn&apos;t find the product you&apos;re looking for.</p>
            <button onClick={() => window.history.back()}>Go Back</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="aph-pdp">
        <div className="product-details-page">
        <div className="product-details-container">

          {/* Back + Breadcrumb */}
          <div className="back-row"><Link href="/" className="back-link"><i className="bx bx-left-arrow-alt"></i> Back</Link></div>
          <div className="breadcrumb">
            <Link href="/">Home</Link>
            <i className="bx bx-chevron-right"></i>
            <Link href="/shop">{product.category.name}</Link>
            <i className="bx bx-chevron-right"></i>
            <span>{product.name}</span>
          </div>

          {/* Main Product Section */}
          <div className="product-main">

            {/* Image Gallery */}
            <div className="product-gallery">
              <div className="main-image">
                <Image
                  src={product.images?.[selectedImage] || PLACEHOLDER_IMAGE}
                  alt={product.name}
                  width={500}
                  height={500}
                  style={{ objectFit: 'contain', width: '100%', height: 'auto' }}
                  priority
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== PLACEHOLDER_IMAGE) {
                      target.src = PLACEHOLDER_IMAGE;
                    }
                  }}
                  unoptimized
                />
                <button
                  className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
                  onClick={toggleWishlist}
                >
                  <i className={`bx ${isWishlisted ? 'bxs-heart' : 'bx-heart'}`}></i>
                </button>
              </div>
              <div className="thumbnail-gallery">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <Image
                      src={image || PLACEHOLDER_IMAGE}
                      alt={`${product.name} ${index + 1}`}
                      width={100}
                      height={100}
                      style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== PLACEHOLDER_IMAGE) {
                          target.src = PLACEHOLDER_IMAGE;
                        }
                      }}
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="product-info">
              <div className="product-header">
                <h1>{product.name}</h1>
                <div className="product-brand">{product.brand}</div>
              </div>

              {/* <div className="product-rating">
                <div className="stars">
                  {renderStars(Math.floor(product.rating.average))}
                  <span className="rating-text">({product.rating.average})</span>
                </div>
                <span className="review-count">{product.rating.count} reviews</span>
              </div> */}

              <div className="product-price">
                <span className="current-price">${product.price}</span>
                {product.originalPrice && (
                  <span className="original-price">${product.originalPrice}</span>
                )}
                {product.originalPrice && (
                  <span className="discount">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </span>
                )}
              </div>

              <div className="product-description">
                <p>{product.description}</p>
              </div>

              {/* Color Selection */}
              {product.colors.length > 0 && (
                <div className="product-options">
                  <h3>Color</h3>
                  <div className="color-options">
                    {product.colors.map((color, idx) => {
                      const colorName = typeof color === 'string' ? color : color.name;
                      const colorCode = typeof color === 'object' && color.code ? color.code : undefined;
                      const colorKey = typeof color === 'string' ? color : `${color.name}-${idx}`;
                      return (
                        <button
                          key={colorKey}
                          className={`color-option ${selectedColor === colorName ? 'active' : ''}`}
                          onClick={() => setSelectedColor(colorName)}
                          title={colorName}
                          style={colorCode ? { backgroundColor: colorCode } : undefined}
                        >
                          <span className="color-name">{colorName}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.sizes.length > 0 && (
                <div className="product-options">
                  <h3>Size</h3>
                  <div className="size-options">
                    {product.sizes.map((size, idx) => {
                      const sizeName = typeof size === 'string' ? size : size.name;
                      const sizeKey = typeof size === 'string' ? size : `${size.name}-${idx}`;
                      return (
                        <button
                          key={sizeKey}
                          className={`size-option ${selectedSize === sizeName ? 'active' : ''}`}
                          onClick={() => setSelectedSize(sizeName)}
                        >
                          {sizeName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="product-options">
                <h3>Quantity</h3>
                <div className="quantity-selector">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <i className="bx bx-minus"></i>
                  </button>
                  <span>{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(stockCount, quantity + 1))}
                    disabled={quantity >= stockCount}
                  >
                    <i className="bx bx-plus"></i>
                  </button>
                </div>
                <span className="stock-info">
                  {stockCount > 5 ? 'In Stock' : `Only ${stockCount} left`}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="product-actions">
                <button
                  className="add-to-cart-btn"
                  onClick={handleAddToCart}
                  disabled={!isInStock}
                >
                  <i className="bx bx-shopping-bag"></i>
                  Add to Cart
                </button>
                <button
                  className="buy-now-btn"
                  onClick={handleBuyNow}
                  disabled={!isInStock}
                >
                  Buy Now
                </button>
              </div>

              {/* Features */}
              {product.features.length > 0 && (
                <div className="product-features">
                  <h3>Key Features</h3>
                  <ul>
                    {product.features.map((feature, index) => (
                      <li key={index}>
                        <i className="bx bx-check"></i>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="product-tabs">
            <div className="tab-headers">
              <button
                className={`tab-header ${activeTab === 'description' ? 'active' : ''}`}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
              <button
                className={`tab-header ${activeTab === 'specifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('specifications')}
              >
                Specifications
              </button>
              <button
                className={`tab-header ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews ({reviews.length})
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'description' && (
                <div className="tab-panel">
                  <h3>Product Description</h3>
                  <p>{product.description}</p>
                  {product.features.length > 0 && (
                    <div className="detailed-features">
                      <h4>Features:</h4>
                      <ul>
                        {product.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'specifications' && (
                <div className="tab-panel">
                  <h3>Specifications</h3>
                  <div className="specifications-table">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="spec-row">
                        <span className="spec-label">{key}:</span>
                        <span className="spec-value">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="tab-panel">
                  <div className="reviews-summary">
                    <h3>Customer Reviews</h3>
                    <div className="rating-summary">
                      <div className="average-rating">
                        <span className="rating-number">{product.rating.average}</span>
                        <div className="stars">
                          {renderStars(Math.floor(product.rating.average))}
                        </div>
                        <span>Based on {product.rating.count} reviews</span>
                      </div>
                    </div>
                  </div>

                  <div className="reviews-list">
                    {reviews.map((review) => (
                      <div key={review.id} className="review-item">
                        <div className="review-header">
                          <div className="reviewer-info">
                            <span className="reviewer-name">{review.userName}</span>
                            {review.verified && (
                              <span className="verified-badge">
                                <i className="bx bx-check-shield"></i>
                                Verified Purchase
                              </span>
                            )}
                          </div>
                          <div className="review-rating">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                        <div className="review-content">
                          <p>{review.comment}</p>
                          <span className="review-date">{new Date(review.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="related-products">
              <h2>You May Also Like</h2>
              <div className="related-products-grid">
                {relatedProducts.map((relatedProduct) => {
                  return (
                    <div key={relatedProduct.id} className="related-product-item">
                      <div className="product-image">
                        <Image
                          src={relatedProduct.images?.[0] || PLACEHOLDER_IMAGE}
                          alt={relatedProduct.name}
                          width={200}
                          height={200}
                          style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src !== PLACEHOLDER_IMAGE) {
                              target.src = PLACEHOLDER_IMAGE;
                            }
                          }}
                          unoptimized
                        />
                      </div>
                      <div className="product-info">
                        <h3>{relatedProduct.name}</h3>
                        {/* <div className="rating">
                          {renderStars(relatedProduct.rating.average)}
                          <span>({relatedProduct.rating.count || 0})</span>
                        </div> */}
                        <div className="price">${relatedProduct.price}</div>
                        <button className="quick-add-btn">
                          <i className="bx bx-plus"></i>
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </>
  );
}