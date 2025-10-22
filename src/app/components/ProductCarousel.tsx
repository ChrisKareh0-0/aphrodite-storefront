"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  rating: number;
  reviewCount: number;
  category: string;
}

interface Category {
  id: number;
  name: string;
  continent: string;
  description: string;
  author: string;
  bgColor: string;
  type: string;
  category: string;
  bestSellers: Product[];
}

export default function ProductCarousel() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const activeIndex = useRef(0);
  const limit = useRef(0);
  const disabled = useRef(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [productCategories, setProductCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  // Remove unused variable
  // const [activeEls, setActiveEls] = useState([]);

  const SPIN_FORWARD_CLASS = 'js-spin-fwd';
  const SPIN_BACKWARD_CLASS = 'js-spin-bwd';
  const DISABLE_TRANSITIONS_CLASS = 'js-transitions-disabled';
  const SPIN_DUR = 1000;

  useEffect(() => {
    fetchProductCategories();
  }, []);

  const fetchProductCategories = async () => {
    try {
      setLoading(true);

      const categoriesData = await Promise.all([
        fetch('/api/products?category=Clothing&limit=3&sortBy=rating').then(res => res.json()),
        fetch('/api/products?category=Shoes&limit=3&sortBy=rating').then(res => res.json()),
        fetch('/api/products?category=Accessories&limit=3&sortBy=rating').then(res => res.json()),
      ]);

      const categories = [
        {
          id: 1,
          name: "CLOTHING",
          continent: "COLLECTION",
          description: "Discover our premium clothing collection featuring the latest trends in fashion. From casual wear to formal attire, our clothing line offers exceptional quality and style for every occasion.",
          author: "Fashion Team",
          bgColor: "#27323c",
          type: "clothing",
          category: "Clothing",
          bestSellers: categoriesData[0].products || []
        },
        {
          id: 2,
          name: "SHOES",
          continent: "COLLECTION",
          description: "Step into style with our exclusive shoe collection. From elegant dress shoes to comfortable sneakers, our footwear combines comfort, durability, and cutting-edge design.",
          author: "Footwear Team",
          bgColor: "#19304a",
          type: "shoes",
          category: "Shoes",
          bestSellers: categoriesData[1].products || []
        },
        {
          id: 3,
          name: "ACCESSORIES",
          continent: "COLLECTION",
          description: "Complete your look with our stunning accessories collection. From stylish bags to elegant sunglasses and jewelry, find the perfect pieces to express your unique style.",
          author: "Accessories Team",
          bgColor: "#2b2533",
          type: "accessories",
          category: "Accessories",
          bestSellers: categoriesData[2].products || []
        }
      ];

      setProductCategories(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to static data on error
      const fallbackCategories = [
        {
          id: 1,
          name: "CLOTHING",
          continent: "COLLECTION",
          description: "Discover our premium clothing collection featuring the latest trends in fashion. From casual wear to formal attire, our clothing line offers exceptional quality and style for every occasion.",
          author: "Fashion Team",
          bgColor: "#27323c",
          type: "clothing",
          category: "Clothing",
          bestSellers: [
            { id: 1, name: "Aphrodite Jacket", price: 17.24, rating: 4, images: ["https://i.postimg.cc/76X9ZV8m/Screenshot_from_2022-06-03_18-45-12.png"], reviewCount: 100, category: "Clothing" },
            { id: 2, name: "Aphrodite Shirt", price: 27.24, rating: 5, images: ["https://i.postimg.cc/j2FhzSjf/bs2.png"], reviewCount: 85, category: "Clothing" },
            { id: 3, name: "Aphrodite T-Shirt", price: 10.23, rating: 5, images: ["https://i.postimg.cc/fbnB2yfj/na1.png"], reviewCount: 156, category: "Clothing" }
          ]
        }
      ];
      setProductCategories(fallbackCategories);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId: number) => {
    router.push(`/product/${productId}`);
  };

  const handleViewAllClick = (category: string) => {
    router.push(`/products?category=${category}`);
  };

  const appendControls = () => {
    if (!controlsRef.current) return;

    controlsRef.current.innerHTML = '';
    for (let i = 0; i < limit.current; i++) {
      const link = document.createElement('a');
      link.href = '#';
      link.setAttribute('data-index', i.toString());
      controlsRef.current.appendChild(link);
    }

    const height = controlsRef.current.children[0]?.getBoundingClientRect().height || 40;
    controlsRef.current.style.height = `${30 + (limit.current * height)}px`;

    const controls = controlsRef.current.children;
    if (controls[activeIndex.current]) {
      controls[activeIndex.current].classList.add('active');
    }
  };

  const setIndexes = () => {
    const spinnerFaces = document.querySelectorAll('.spinner__face');
    spinnerFaces.forEach((el, i) => {
      el.setAttribute('data-index', i.toString());
      limit.current++;
    });
  };

  const spin = (inc = 1) => {
    if (disabled.current || !inc || !stageRef.current) return;

    activeIndex.current += inc;
    disabled.current = true;

    if (activeIndex.current >= limit.current) {
      activeIndex.current = 0;
    }

    if (activeIndex.current < 0) {
      activeIndex.current = (limit.current - 1);
    }

    const activeEls = document.querySelectorAll('.product-carousel-spinner__face.js-active');
    const nextEls = document.querySelectorAll(`.product-carousel-spinner__face[data-index="${activeIndex.current}"]`);
    nextEls.forEach(el => el.classList.add('product-carousel-next'));

    if (inc > 0) {
      stageRef.current.classList.add(SPIN_FORWARD_CLASS);
    } else {
      stageRef.current.classList.add(SPIN_BACKWARD_CLASS);
    }

    const controls = controlsRef.current?.children;
    if (controls) {
      Array.from(controls).forEach(el => el.classList.remove('active'));
      if (controls[activeIndex.current]) {
        controls[activeIndex.current].classList.add('active');
      }
    }

    setTimeout(() => {
      spinCallback(inc);
    }, SPIN_DUR);
  };

  const spinCallback = (inc: number) => {
    if (!stageRef.current) return;

    document.querySelectorAll('.js-active').forEach(el => el.classList.remove('js-active'));
    document.querySelectorAll('.product-carousel-next').forEach(el => {
      el.classList.remove('product-carousel-next');
      el.classList.add('js-active');
    });

    stageRef.current.classList.add(DISABLE_TRANSITIONS_CLASS);
    stageRef.current.classList.remove(SPIN_FORWARD_CLASS);
    stageRef.current.classList.remove(SPIN_BACKWARD_CLASS);

    document.querySelectorAll('.js-active').forEach(el => {
      const parent = el.parentNode;
      if (parent) {
        parent.prepend(el);
      }
    });

    setTimeout(() => {
      if (stageRef.current) {
        stageRef.current.classList.remove(DISABLE_TRANSITIONS_CLASS);
      }
      disabled.current = false;
    }, 100);
  };

  const attachListeners = useCallback(() => {
    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.keyCode) {
        case 38:
          spin(-1);
          break;
        case 40:
          spin(1);
          break;
      }
    };

    const handleControlClick = (e: Event) => {
      e.preventDefault();
      if (disabled.current) return;
      const target = e.target as HTMLElement;
      const toIndex = parseInt(target.getAttribute('data-index') || '0', 10);
      spin(toIndex - activeIndex.current);
    };

    document.addEventListener('keyup', handleKeyUp);

    if (controlsRef.current) {
      Array.from(controlsRef.current.children).forEach(control => {
        control.addEventListener('click', handleControlClick);
      });
    }

    return () => {
      document.removeEventListener('keyup', handleKeyUp);
      if (controlsRef.current) {
        Array.from(controlsRef.current.children).forEach(control => {
          control.removeEventListener('click', handleControlClick);
        });
      }
    };
  }, []);

  useEffect(() => {
    const init = () => {
      if (productCategories.length > 0 && !loading) {
        setIndexes();
        appendControls();
        attachListeners();
      }
    };

    const timer = setTimeout(init, 200);
    return () => clearTimeout(timer);
  }, [productCategories, loading]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i key={i} className={`bx ${i < rating ? 'bxs-star' : 'bx-star'}`}></i>
    ));
  };

  if (loading) {
    return (
      <div className="carousel" ref={carouselRef}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#1e293b',
          color: 'white',
          fontSize: '1.5rem'
        }}>
          Loading Categories...
        </div>
      </div>
    );
  }

  return (
    <div className="carousel" ref={carouselRef}>
      <div className="carousel__control" ref={controlsRef}></div>
      <div className="carousel__stage" ref={stageRef}>
        <div className="spinner spinner--left">
          {productCategories.map((category, index) => (
            <div
              key={category.id}
              className={`spinner__face ${index === 0 ? 'js-active' : ''}`}
              data-bg={category.bgColor}
            >
              <div className="content" data-type={category.type}>
                <div className="content__left" onClick={() => handleViewAllClick(category.category)}>
                  <h1>{category.name}<br/><span>{category.continent}</span></h1>
                </div>
                <div className="content__right">
                  <div className="content__main">
                    <p>&ldquo;{category.description}&rdquo;</p>
                    <p>– {category.author}</p>
                  </div>
                  <h3 className="content__index">{String(index + 1).padStart(2, '0')}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="spinner spinner--right">
          {productCategories.map((category, index) => (
            <div
              key={`right-${category.id}`}
              className={`spinner__face ${index === 0 ? 'js-active' : ''}`}
              data-bg={category.bgColor}
            >
              <div className="content" data-type={category.type}>
                <div className="content__left">
                  <h1>{category.name}<br/><span>{category.continent}</span></h1>
                </div>
                <div className="content__right">
                  <div className="content__main">
                    <h3 style={{color: '#fff', marginBottom: '2rem'}}>Best Sellers</h3>
                    <div className="best-sellers-grid">
                      {category.bestSellers.map((product: Product, pidx: number) => (
                        <div key={pidx} className="product-item" onClick={() => handleProductClick(product.id)}>
                          <Image src={product.images ? product.images[0] : (product as Product & { image: string }).image} alt={product.name} width={100} height={100} />
                          <div className="product-info">
                            <p className="product-name">{product.name}</p>
                            <div className="rating">
                              {renderStars(Math.floor(product.rating))}
                            </div>
                            <div className="price">${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <h3 className="content__index">{String(index + 1).padStart(2, '0')}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preloader */}
      <div style={{height: 0, width: 0, overflow: 'hidden'}}>
        <Image src="https://i.postimg.cc/8CmBZH5N/shoes.webp" alt="" width={1} height={1} />
        <Image src="https://i.postimg.cc/Xqmwr12c/clothing.webp" alt="" width={1} height={1} />
        <Image src="https://i.postimg.cc/MHv7KJYp/access.webp" alt="" width={1} height={1} />
        <Image src="https://i.postimg.cc/76X9ZV8m/Screenshot_from_2022-06-03_18-45-12.png" alt="" width={1} height={1} />
      </div>
    </div>
  );
}