"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from 'react-hot-toast';
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import { getImageUrl, BACKEND_URL } from '@/constants';

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
  images: string[];
  colors: (string | ColorOption)[];
  sizes: (string | SizeOption)[];
  stock: { color?: string; size?: string; quantity: number }[];
  tags?: string[];
  features: string[];
  specifications: Record<string, string>;
}



interface ProductDetailsPageProps {
  productId: string;
}

export default function ProductDetailsPage({ productId }: ProductDetailsPageProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  // Removed reviews
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  // Get available stock for selected color/size combination
  const getAvailableStock = useCallback((color?: string, size?: string) => {
    if (!product?.stock) return 0;
    
    const stockItem = product.stock.find(
      (item) => item.color === (color || selectedColor) && item.size === (size || selectedSize)
    );
    
    return stockItem?.quantity || 0;
  }, [product, selectedColor, selectedSize]);

  // Get stock for a specific color (sum across all sizes)
  const getColorStock = useCallback((color: string) => {
    if (!product?.stock) return 0;
    
    return product.stock
      .filter((item) => item.color === color)
      .reduce((total, item) => total + item.quantity, 0);
  }, [product]);

  // Get stock for a specific size (sum across all colors)
  const getSizeStock = useCallback((size: string) => {
    if (!product?.stock) return 0;
    
    return product.stock
      .filter((item) => item.size === size)
      .reduce((total, item) => total + item.quantity, 0);
  }, [product]);

  const fetchProductDetails = useCallback(async () => {
    try {
      setLoading(true);
  console.log('🔄 Fetching product details for ID:', productId);
  // Use public endpoint for storefront (admin endpoints are protected)
  const response = await fetch(`${BACKEND_URL}/api/public/products/${productId}`);

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

      // Ensure required arrays exist
      const processedData = {
        ...data,
        images: data.images || [],
        features: data.features || [],
        colors: data.colors || [],
        sizes: data.sizes || [],
        specifications: data.specifications || {}
      };


      // Convert image objects or strings to valid absolute URLs using getImageUrl
      type ProductImage = string | { _id?: string; path?: string; alt?: string; isPrimary?: boolean };
      processedData.images = (processedData.images || []).map((img: ProductImage) => {
        if (!img) return null;
        if (typeof img === 'string') {
          if (img.startsWith('http')) return img;
          return getImageUrl(img);
        }
        // object
        if (typeof img === 'object') {
          if (img._id) return getImageUrl(`/api/images/products/${processedData.id}/${img._id}`);
          if (img.path) return getImageUrl(`/uploads/products/${img.path}`);
        }
        return null;
      }).filter(Boolean);

      if (!processedData.images.length) {
        console.warn('⚠️ No images found for product');
      }

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



  const fetchRelatedProducts = useCallback(async () => {
    try {
      // Use public related-products endpoint
      const response = await fetch(`${BACKEND_URL}/api/public/products/${productId}/related`);

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
  // Fetch data when component mounts or product ID changes
  useEffect(() => {
    fetchProductDetails();
  // Removed fetchProductReviews
    fetchRelatedProducts();
  }, [productId, fetchProductDetails, fetchRelatedProducts]);

  // Calculate current available stock based on selection
  const currentStock = getAvailableStock();
  const isInStock = currentStock > 0;

  const handleAddToCart = () => {
    if (!product) return;

    if (currentStock === 0) {
      toast.error('This item is out of stock');
      return;
    }

    if (quantity > currentStock) {
      toast.error(`Only ${currentStock} items available`);
      return;
    }

    try {
      addToCart({
        productId: String(product.id),
        name: product.name,
        price: product.price,
        image: product.images[0] || '',
        color: selectedColor,
        size: selectedSize,
        stock: currentStock,
        quantity,
      });
    } catch (err) {
      console.error('Error adding to cart:', err);
      toast.error('Failed to add to cart');
    }
  };

  const handleBuyNow = () => {
    if (!product) return;

    if (currentStock === 0) {
      toast.error('This item is out of stock');
      return;
    }

    if (quantity > currentStock) {
      toast.error(`Only ${currentStock} items available`);
      return;
    }

    try {
      addToCart({
        productId: String(product.id),
        name: product.name,
        price: product.price,
        image: product.images[0] || '',
        color: selectedColor,
        size: selectedSize,
        stock: currentStock,
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
      const response = await fetch(`${BACKEND_URL}/api/wishlist/toggle`, {
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


  // Fullscreen image handler
  const openFullscreen = (imgUrl: string) => {
    if (!imgUrl) return;

    // Helper to remove overlay and cleanup listeners
    const removeOverlay = (overlayElem: HTMLDivElement, keyHandler?: (e: KeyboardEvent) => void) => {
      try {
        if (keyHandler) document.removeEventListener('keydown', keyHandler);
        if (overlayElem && overlayElem.parentElement) overlayElem.parentElement.removeChild(overlayElem);
      } catch {
        // ignore
      }
    };

    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'rgba(0,0,0,0.95)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '9999';
    overlay.style.cursor = 'zoom-out';

    // Clicking the overlay (outside the image) closes it
    overlay.addEventListener('click', () => removeOverlay(overlay, keyHandler));

    // Create image
    const img = document.createElement('img');
    img.src = imgUrl;
    img.style.maxWidth = '90vw';
    img.style.maxHeight = '90vh';
    img.style.borderRadius = '16px';
    img.style.boxShadow = '0 8px 40px rgba(0,0,0,0.5)';
    img.alt = 'Product Image';
    img.style.cursor = 'auto';
    // Prevent clicks on the image from bubbling to the overlay
    img.addEventListener('click', (e) => e.stopPropagation());

    // Create close button (X)
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.innerText = '✕';
    closeBtn.setAttribute('aria-label', 'Close image');
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '20px';
    closeBtn.style.right = '20px';
    closeBtn.style.zIndex = '10000';
    closeBtn.style.background = 'transparent';
    closeBtn.style.border = 'none';
    closeBtn.style.color = '#fff';
    closeBtn.style.fontSize = '28px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.padding = '6px';
    closeBtn.style.borderRadius = '6px';

    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      removeOverlay(overlay, keyHandler);
    });

    // Add keyboard handler for Escape
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        removeOverlay(overlay, keyHandler);
      }
    };

    // Compose overlay contents
    overlay.appendChild(img);
    overlay.appendChild(closeBtn);

    // Attach and register keydown listener
    document.body.appendChild(overlay);
    document.addEventListener('keydown', keyHandler);
  };

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
              <div className="main-image" onClick={() => openFullscreen(product.images?.[selectedImage])} style={{ cursor: 'zoom-in' }}>
                {product.images?.[selectedImage] && (
                  <Image
                    src={product.images[selectedImage]}
                    alt={product.name}
                    width={500}
                    height={500}
                    style={{ objectFit: 'contain', width: '100%', height: 'auto' }}
                    priority
                    unoptimized
                  />
                )}
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
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      width={100}
                      height={100}
                      style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
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
                      const colorStock = getColorStock(colorName);
                      const colorKey = typeof color === 'string' ? color : `${color.name}-${idx}`;
                      return (
                        <button
                          key={colorKey}
                          className={`color-option ${selectedColor === colorName ? 'active' : ''} ${colorStock === 0 ? 'out-of-stock' : ''}`}
                          onClick={() => setSelectedColor(colorName)}
                          title={`${colorName} - ${colorStock > 0 ? `${colorStock} available` : 'Out of stock'}`}
                          style={{ backgroundColor: '#000', color: '#fff' }}
                          disabled={colorStock === 0}
                        >
                          <span className="color-name">{colorName}</span>
                          <span className="color-stock">{colorStock > 0 ? `(${colorStock})` : '(Out)'}</span>
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
                      const sizeStock = getSizeStock(sizeName);
                      const sizeKey = typeof size === 'string' ? size : `${size.name}-${idx}`;
                      return (
                        <button
                          key={sizeKey}
                          className={`size-option ${selectedSize === sizeName ? 'active' : ''} ${sizeStock === 0 ? 'out-of-stock' : ''}`}
                          onClick={() => setSelectedSize(sizeName)}
                          title={`${sizeName} - ${sizeStock > 0 ? `${sizeStock} available` : 'Out of stock'}`}
                          disabled={sizeStock === 0}
                        >
                          <span className="size-name">{sizeName}</span>
                          <span className="size-stock">{sizeStock > 0 ? `(${sizeStock})` : '(Out)'}</span>
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
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    disabled={quantity >= currentStock}
                  >
                    <i className="bx bx-plus"></i>
                  </button>
                </div>
                <span className="stock-info">
                  {currentStock === 0 ? (
                    <span className="out-of-stock-text">Out of Stock</span>
                  ) : currentStock > 5 ? (
                    'In Stock'
                  ) : (
                    `Only ${currentStock} left`
                  )}
                </span>
              </div>

              {/* Stock Availability Table */}
              {product.stock && product.stock.length > 0 && (
                <div className="product-options">
                  <h3>Stock Availability</h3>
                  <div className="stock-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Color</th>
                          <th>Size</th>
                          <th>Quantity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {product.stock
                          .filter(item => item.quantity > 0)
                          .sort((a, b) => {
                            // Sort by color first, then by size
                            if (a.color !== b.color) return (a.color || '').localeCompare(b.color || '');
                            return (a.size || '').localeCompare(b.size || '');
                          })
                          .map((item, idx) => (
                            <tr 
                              key={idx}
                              className={
                                item.color === selectedColor && item.size === selectedSize 
                                  ? 'selected-variation' 
                                  : ''
                              }
                            >
                              <td>{item.color || 'N/A'}</td>
                              <td>{item.size || 'N/A'}</td>
                              <td>
                                <span className={`qty-badge ${item.quantity < 5 ? 'low-stock' : ''}`}>
                                  {item.quantity}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                    {product.stock.filter(item => item.quantity === 0).length > 0 && (
                      <p className="out-of-stock-note">
                        * Some variations are out of stock
                      </p>
                    )}
                  </div>
                </div>
              )}

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


            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="related-products">
              <h2>You May Also Like</h2>
              <div className="related-products-grid">
                {relatedProducts.map((relatedProduct) => {
                  return (
                    <div 
                      key={relatedProduct.id} 
                      className="related-product-item"
                      onClick={() => router.push(`/product/${relatedProduct.slug || relatedProduct.id}`)}
                    >
                      <div className="product-image">
                        {relatedProduct.images?.[0] && (
                          <Image
                            src={relatedProduct.images[0]}
                            alt={relatedProduct.name}
                            width={200}
                            height={200}
                            style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
                            unoptimized
                          />
                        )}
                      </div>
                      <div className="product-info">
                        <h3>{relatedProduct.name}</h3>
                        
                        <div className="price">${relatedProduct.price}</div>
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