"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { BACKEND_URL } from "@/constants";
import { fetchWithConfig } from "@/utils/fetchWithConfig";

interface Product {
  id: number | string;
  slug?: string;
  name: string;
  price: number;
  images: string[];
}

interface BackendProduct {
  id: number | string;
  name: string;
  slug?: string;
  price: number;
  images: Array<string | { url: string }>;
}

interface BackendCategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  sortOrder: number;
}

interface Category {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  color: string;
  category: string;
  products: Product[];
}

interface CollectionSettings {
  imageUrl: string | null;
  title: string;
  subtitle: string;
}

export default function CategoriesGallery() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [collectionSettings, setCollectionSettings] = useState<CollectionSettings>({
    imageUrl: null,
    title: 'Our Collections',
    subtitle: 'Explore our curated selection of premium products'
  });
  const galleryRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Load collection settings and categories once on mount
    (async () => {
      await fetchCollectionSettings();
      await fetchCategories();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCollectionSettings = async () => {
    try {
      console.log('🔄 Fetching collection settings from:', `${BACKEND_URL}/api/collection`);
      const data = await fetchWithConfig('/api/collection');
      console.log('✅ Collection settings data:', data);
      setCollectionSettings(data);
    } catch (error) {
      console.error('Error fetching collection settings:', error);
      // Keep default values on error
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);

      // Fetch categories from backend
      console.log('🔄 Fetching categories from:', `${BACKEND_URL}/api/categories`);
      const categoriesResponse = await fetch(`${BACKEND_URL}/api/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
      });
      if (!categoriesResponse.ok) {
        throw new Error(`HTTP error! status: ${categoriesResponse.status}`);
      }
      const categoriesData = await categoriesResponse.json();
      console.log('✅ Categories data:', categoriesData);
      
      // Check the shape of the response
      if (!categoriesData || !Array.isArray(categoriesData.categories)) {
        console.error('❌ Invalid categories response format:', categoriesData);
        setCategories([]);
        return;
      }
      
      if (categoriesData.categories.length === 0) {
        console.warn('⚠️ No categories found in response');
        setCategories([]);
        return;
      }

  // Define color palette for categories
  const colors = ["#27323c", "#19304a", "#2b2533", "#1a3a52", "#2d1f33", "#324a5e"];

      // Fetch products for each category
      const processedCategories = await Promise.all(
        categoriesData.categories.map(async (cat: BackendCategory, index: number) => {
            try {
              console.log(`🔄 Fetching products for category "${cat.name}" from:`, `${BACKEND_URL}/api/products?category=${cat.slug}&limit=3`);
              const productsResponse = await fetch(`${BACKEND_URL}/api/products?category=${cat.slug}&limit=3`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                },
                credentials: 'include',
                mode: 'cors',
              });
              if (!productsResponse.ok) {
                throw new Error(`HTTP error! status: ${productsResponse.status}`);
              }
              const productsData = await productsResponse.json();
              console.log(`✅ Products data for category "${cat.name}":`, productsData);
              
              if (!productsData || !Array.isArray(productsData.products)) {
                console.error(`❌ Invalid products response format for category "${cat.name}":`, productsData);
                return null;
              }

            // Handle relative image paths from backend
            const categoryImage = cat.image
              ? (cat.image.startsWith('http') ? cat.image : `${BACKEND_URL}${cat.image}`)
              : "https://i.postimg.cc/Xqmwr12c/clothing.webp";

            // Map the products data, ensuring proper image URL handling
            const mappedProducts = (productsData.products || []).map((prod: BackendProduct) => ({
              ...prod,
              images: (prod.images || []).map((img: string | { url: string }) => 
                typeof img === 'string' 
                  ? (img.startsWith('http') ? img : `${BACKEND_URL}${img}`)
                  : (img.url ? (img.url.startsWith('http') ? img.url : `${BACKEND_URL}${img.url}`) : '')
              ).filter(Boolean)
            }));

            // Ensure each product has at least one image
            mappedProducts.forEach((prod: BackendProduct) => {
              if (!prod.images || prod.images.length === 0) {
                console.warn(`⚠️ No images found for product "${prod.name}", using placeholder`);
                prod.images = ['/placeholder-product.svg'];
              }
            });

            return {
              id: cat._id,
              title: cat.name,
              subtitle: `Explore ${cat.name}`,
              description: cat.description || `Discover our curated ${cat.name.toLowerCase()} collection.`,
              image: categoryImage,
              color: colors[index % colors.length],
              category: cat.slug,
              products: mappedProducts
            };
          } catch (error) {
            console.error(`Error fetching products for category ${cat.name}:`, error);
            const categoryImage = cat.image
              ? (cat.image.startsWith('http') ? cat.image : `${BACKEND_URL}${cat.image}`)
              : "https://i.postimg.cc/Xqmwr12c/clothing.webp";

            return {
              id: cat._id,
              title: cat.name,
              subtitle: `Explore ${cat.name}`,
              description: cat.description || `Discover our curated ${cat.name.toLowerCase()} collection.`,
              image: categoryImage,
              color: colors[index % colors.length],
              category: cat.slug,
              products: []
            };
          }
        })
      );

      // Filter out null categories and those without products
      const validCategories = processedCategories
        .filter((cat): cat is Category => {
          if (!cat) {
            console.warn('⚠️ Found null category in processed results');
            return false;
          }
          if (!cat.products || cat.products.length === 0) {
            console.warn(`⚠️ No products found for category "${cat.title}"`);
            return false;
          }
          return true;
        });

      if (validCategories.length === 0) {
        console.warn('⚠️ No valid categories with products found');
      }

      setCategories(validCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to empty categories
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productSlug: string) => {
    router.push(`/product/${productSlug}`);
  };

  const handleViewAllClick = (category: string) => {
    router.push(`/products?category=${category}`);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCategory((prev) => (prev + 1) % categories.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [categories.length]);

  const handleCategoryClick = (index: number) => {
    setActiveCategory(index);
  };

  if (loading) {
    return (
      <div className="categories-gallery" ref={galleryRef}>
        <div className="categories-gallery__container">
          <div className="categories-gallery__header">
            <h2 className="categories-gallery__title">{collectionSettings.title}</h2>
            <p className="categories-gallery__subtitle">Loading categories...</p>
          </div>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="categories-gallery" ref={galleryRef}>
        <div className="categories-gallery__container">
          <div className="categories-gallery__header">
            <h2 className="categories-gallery__title">{collectionSettings.title}</h2>
            <p className="categories-gallery__subtitle">No categories available at the moment</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="categories-gallery" ref={galleryRef}>
      <div className="categories-gallery__container">

        {/* Header */}
        <div className="categories-gallery__header">
          {collectionSettings.imageUrl && (
            <div className="categories-gallery__header-image">
              <Image
                src={collectionSettings.imageUrl}
                alt={collectionSettings.title}
                width={1200}
                height={300}
                style={{ width: '100%', height: 'auto', objectFit: 'cover', borderRadius: '16px', marginBottom: '2rem' }}
              />
            </div>
          )}
          <h2 className="categories-gallery__title">{collectionSettings.title}</h2>
          <p className="categories-gallery__subtitle">{collectionSettings.subtitle}</p>
        </div>

        {/* Main Gallery */}
        <div className="categories-gallery__main">

          {/* Category Navigation */}
          <div className="categories-gallery__nav">
            {categories.map((category, index) => (
              <button
                key={category.id}
                className={`categories-gallery__nav-item ${index === activeCategory ? 'active' : ''}`}
                onClick={() => handleCategoryClick(index)}
                style={{ '--accent-color': category.color } as React.CSSProperties}
              >
                <span className="categories-gallery__nav-number">{String(index + 1).padStart(2, '0')}</span>
                <div className="categories-gallery__nav-text">
                  <h3>{category.title}</h3>
                  <p>{category.subtitle}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="categories-gallery__content">
            {categories.map((category, index) => (
              <div
                key={category.id}
                className={`categories-gallery__content-item ${index === activeCategory ? 'active' : ''}`}
                style={{ '--bg-color': category.color } as React.CSSProperties}
              >

                {/* Hero Image */}
                <div className="categories-gallery__hero">
                  <div
                    className="categories-gallery__hero-image"
                    style={{ backgroundImage: `url(${category.image})` }}
                  >
                    <div className="categories-gallery__hero-overlay">
                      <div className="categories-gallery__hero-content">
                        <h2>{category.title}</h2>
                        <p>{category.description}</p>
                        <button className="categories-gallery__cta" onClick={() => handleViewAllClick(category.category)}>
                          Shop Collection
                          <i className="bx bx-right-arrow-alt"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Products Grid */}
                <div className="categories-gallery__products">
                  <h3>Featured Products</h3>
                  <div className="categories-gallery__products-grid">
                    {category.products.map((product, pidx) => (
                      <div key={pidx} className="categories-gallery__product">
                        <div className="categories-gallery__product-image" onClick={() => handleProductClick(product.slug || String(product.id))}>
                          <Image
                            src={product.images?.[0] || 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400&h=400&fit=crop'}
                            alt={product.name}
                            width={200}
                            height={200}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400&h=400&fit=crop';
                            }}
                          />
                          <div className="categories-gallery__product-overlay">
                            <button className="categories-gallery__product-btn">
                              <i className="bx bx-shopping-bag"></i>
                            </button>
                          </div>
                        </div>
                        <div className="categories-gallery__product-info">
                          <h4>{product.name}</h4>
                          <span className="price">${product.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>

        {/* Progress Indicators */}
        <div className="categories-gallery__indicators">
          {categories.map((_, index) => (
            <button
              key={index}
              className={`categories-gallery__indicator ${index === activeCategory ? 'active' : ''}`}
              onClick={() => handleCategoryClick(index)}
            >
              <span className="sr-only">Go to category {index + 1}</span>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}