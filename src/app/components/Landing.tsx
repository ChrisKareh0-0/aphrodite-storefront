"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { PLACEHOLDER_IMAGE } from "@/constants";
import InteractiveDots from "./InteractiveDots";
import CategoriesGallery from "./CategoriesGallery";
import CenterNavbar from "./CenterNavbar";
import { getImageUrl } from "@/constants";
import "../carousel.css";
import "../categories-gallery.css";
import "../center-navbar.css";
import "../product-details.css";
import HorizontalProductCarousel from "./HorizontalProductCarousel";
import "../horizontal-carousel.css";
import "../modern-footer.css";

interface HeroData {
  imageUrl: string;
  title: string;
  heading: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

export default function Landing() {
  const [heroData, setHeroData] = useState<HeroData>({
    imageUrl: PLACEHOLDER_IMAGE,
    title: 'SUMMER COLLECTION',
    heading: 'FALL - WINTER\nCollection 2025',
    description: 'A specialist label creating luxury essentials. Ethically crafted with an unwavering commitment to exceptional quality.',
    buttonText: 'New Collection',
    buttonLink: '#new-collection'
  });
  const [, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        console.log('🔄 Fetching hero data from:', `/api/hero`);
        const response = await fetch(`/api/hero`);
        console.log('📡 Hero API Response Status:', response.status);
        const data = await response.json();
        console.log('✅ Hero data:', data);
        console.log('🖼️ Raw hero image URL:', data.imageUrl);
        const processedImageUrl = getImageUrl(data.imageUrl) || data.imageUrl;
        console.log('🖼️ Processed hero image URL:', processedImageUrl);
        
        const newHeroData = {
          ...data,
          imageUrl: processedImageUrl
        };
        console.log('🎯 Setting hero data:', newHeroData);
        setHeroData(newHeroData);
      } catch (error) {
        console.error('❌ Error fetching hero data:', error);
        console.log('⚠️ Using default hero data:', heroData);
        // Keep default values on error
      } finally {
        setLoading(false);
      }
    })();

    const handleClick = (event: Event) => {
      const target = event.currentTarget as HTMLAnchorElement;
      if (!target || !target.hash) return;
      const hash = target.hash;
      const el = document.querySelector(hash);
      if (!el) return;
      history.pushState(null, "", hash);
      const checkbox = document.getElementById("checkbox") as HTMLInputElement | null;
      if (checkbox) checkbox.checked = false;
    };
    const anchors = Array.from(document.querySelectorAll<HTMLAnchorElement>(".center-navbar__nav-item, a[href^='#']"));
    anchors.forEach((a) => a.addEventListener("click", handleClick));
    return () => anchors.forEach((a) => a.removeEventListener("click", handleClick));
  }, []);

  return (
    <>
      {/* Center Navigation */}
      <CenterNavbar />
      <main className="main-content">
        <InteractiveDots />
        <section id="home">
        <div className="home_page ">
          <div className="home_img hero-image-wrapper">
            <Image
              src={heroData.imageUrl}
              alt="home image"
              width={600}
              height={400}
              priority
            />
            <button className="hero-float-btn">
              <a href={heroData?.buttonLink || '#new-collection'}>{heroData?.buttonText || 'New Collection'}</a>
              <i className="bx bx-right-arrow-alt"></i>
            </button>
          </div>
          <div className="home_txt ">
            {/* ...existing code... */}
          </div>
      <style jsx>{`
        .hero-image-wrapper {
          position: relative;
        }
        .hero-float-btn {
          position: absolute;
          bottom: 24px;
          right: 24px;
          background: #000;
          color: #fff;
          border: none;
          border-radius: 32px;
          padding: 0.75em 1.5em;
          font-size: 1.1em;
          display: flex;
          align-items: center;
          gap: 0.5em;
          box-shadow: 0 4px 16px rgba(0,0,0,0.18);
          cursor: pointer;
          z-index: 2;
          transition: background 0.2s;
        }
        .hero-float-btn:hover {
          background: #222;
        }
        .hero-float-btn a {
          color: inherit;
          text-decoration: none;
          font-weight: 500;
        }
        @media (max-width: 600px) {
          .hero-float-btn {
            bottom: 12px;
            right: 12px;
            font-size: 1em;
            padding: 0.6em 1.1em;
          }
        }
      `}</style>
        </div>
      </section>


      <section id="new-collection">
        <HorizontalProductCarousel
          title="New Collection"
          subtitle="Discover our latest featured products"
          query="isFeatured=true&limit=10"
          isNewCollection={true}
        />
      </section>

      <section id="collection">
        <CategoriesGallery />
      </section>

      {/* <section id="sellers">
        <div className="seller container">
          <h2>Top Sales</h2>
          <div className="best-seller">
            <div className="best-p1">
              <img src="https://i.postimg.cc/8CmBZH5N/shoes.webp" alt="img" />
              <div className="best-p1-txt">
                <div className="name-of-p">
                  <p>Aphrodite Shoes</p>
                </div>
                <div className="rating">
                  <i className="bx bxs-star"></i>
                  <i className="bx bxs-star"></i>
                  <i className="bx bxs-star"></i>
                  <i className="bx bx-star"></i>
                  <i className="bx bx-star"></i>
                </div>
                <div className="price">
                  $37.24
                  <div className="colors">
                    <i className="bx bxs-circle red"></i>
                    <i className="bx bxs-circle blue"></i>
                    <i className="bx bxs-circle white"></i>
                  </div>
                </div>
                <div className="buy-now">
                  <button>
                    <a href="https://codepen.io/sanketbodke/full/mdprZOq">Buy  Now</a>
                  </button>
                </div>
              </div>
            </div>
            <div className="best-p1">
              <img
                src="https://i.postimg.cc/76X9ZV8m/Screenshot_from_2022-06-03_18-45-12.png"
                alt="img"
              />
              <div className="best-p1-txt">
                <div className="name-of-p">
                  <p>Aphrodite Jacket</p>
                </div>
                <div className="rating">
                  <i className="bx bxs-star"></i>
                  <i className="bx bxs-star"></i>
                  <i className="bx bx-star"></i>
                  <i className="bx bx-star"></i>
                  <i className="bx bx-star"></i>
                </div>
                <div className="price">
                  $17.24
                  <div className="colors">
                    <i className="bx bxs-circle green"></i>
                    <i className="bx bxs-circle grey"></i>
                    <i className="bx bxs-circle brown"></i>
                  </div>
                </div>
                <div className="buy-now">
                  <button>
                    <a href="https://codepen.io/sanketbodke/full/mdprZOq">Buy  Now</a>
                  </button>
                </div>
              </div>
            </div>
            <div className="best-p1">
              <img src="https://i.postimg.cc/j2FhzSjf/bs2.png" alt="img" />
              <div className="best-p1-txt">
                <div className="name-of-p">
                  <p>Aphrodite Shirt</p>
                </div>
                <div className="rating">
                  <i className="bx bxs-star"></i>
                  <i className="bx bxs-star"></i>
                  <i className="bx bxs-star"></i>
                  <i className="bx bxs-star"></i>
                  <i className="bx bx-star"></i>
                </div>
                <div className="price">
                  $27.24
                  <div className="colors">
                    <i className="bx bxs-circle brown"></i>
                    <i className="bx bxs-circle green"></i>
                    <i className="bx bxs-circle blue"></i>
                  </div>
                </div>
                <div className="buy-now">
                  <button>
                    <a href="https://codepen.io/sanketbodke/full/mdprZOq">Buy  Now</a>
                  </button>
                </div>
              </div>
            </div>
            <div className="best-p1">
              <img src="https://i.postimg.cc/QtjSDzPF/bs3.png" alt="img" />
              <div className="best-p1-txt">
                <div className="name-of-p">
                  <p>Aphrodite Shoes</p>
                </div>
                <div className="rating">
                  <i className="bx bxs-star"></i>
                  <i className="bx bxs-star"></i>
                  <i className="bx bxs-star"></i>
                  <i className="bx bxs-star"></i>
                  <i className="bx bxs-star"></i>
                </div>
                <div className="price">
                  $43.67
                  <div className="colors">
                    <i className="bx bxs-circle red"></i>
                    <i className="bx bxs-circle grey"></i>
                    <i className="bx bxs-circle blue"></i>
                  </div>
                </div>
                <div className="buy-now">
                  <button>
                    <a href="https://codepen.io/sanketbodke/full/mdprZOq">Buy  Now</a>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="seller container">
          <h2>New Arrivals</h2>
          <div className="best-seller">
            <div className="best-p1">
              <img src="https://i.postimg.cc/fbnB2yfj/na1.png" alt="img" />
              <div className="best-p1-txt">
                <div className="name-of-p">
                  <p>Aphrodite T-Shirt</p>
                </div>
                <div className="rating">
                  <i className="bx bxs-star"></i>
                  <i className="bx bxs-star"></i>
                  <i className="bx bxs-star"></i>
                  <i className="bx bxs-star"></i>
                  <i className="bx bxs-star"></i>
                </div>
                <div className="price">
                  $10.23
                  <div className="colors">
                    <i className="bx bxs-circle blank"></i>
                    <i className="bx bxs-circle blue"></i>
                    <i className="bx bxs-circle brown"></i>
                  </div>
                </div>
                <div className="buy-now">
                  <button>
                    <a href="https://codepen.io/sanketbodke/full/mdprZOq">Buy  Now</a>
                  </button>
                </div>
              </div>
            </div>
            <div className="best-p1">
              <img src="https://i.postimg.cc/zD02zJq8/na2.png" alt="img" />
              <div className="best-p1-txt">
                <div className="name-of-p">
                  <p>Aphrodite Bag</p>
                </div>
                <div className="rating">
                  <i className="bx bxs-star"></i>
                  <i className="bx bx-star"></i>
                  <i className="bx bx-star"></i>
                  <i className="bx bx-star"></i>
                  <i className="bx bx-star"></i>
                </div>
                <div className="price">
                  $09.28
                  <div className="colors">
                    <i className="bx bxs-circle brown"></i>
                    <i className="bx bxs-circle red"></i>
                    <i className="bx bxs-circle green"></i>
                  </div>
                </div>
                <div className="buy-now">
                  <button>
                    <a href="https://codepen.io/sanketbodke/full/mdprZOq">Buy  Now</a>
                  </button>
                </div>
              </div>
            </div>
            <div className="best-p1">
              <img src="https://i.postimg.cc/Dfj5VBcz/sunglasses1.jpg" alt="img" />
              <div className="best-p1-txt">
                <div className="name-of-p">
                  <p>Aphrodite Sunglasses</p>
                </div>
                <div className="rating">
                  <i className="bx bxs-star"></i>
                  <i className="bx bxs-star"></i>
                  <i className="bx bxs-star"></i>
                  <i className="bx bxs-star"></i>
                  <i className="bx bxs-star"></i>
                </div>
                <div className="price">
                  $06.24
                  <div className="colors">
                    <i className="bx bxs-circle grey"></i>
                    <i className="bx bxs-circle blank"></i>
                    <i className="bx bxs-circle blank"></i>
                  </div>
                </div>
                <div className="buy-now">
                  <button>
                    <a href="https://codepen.io/sanketbodke/full/mdprZOq">Buy  Now</a>
                  </button>
                </div>
              </div>
            </div>
            <div className="best-p1">
              <img src="https://i.postimg.cc/FszW12Kc/na4.png" alt="img" />
              <div className="best-p1-txt">
                <div className="name-of-p">
                  <p>Aphrodite Shoes</p>
                </div>
                <div className="rating">
                  <i className="bx bxs-star"></i>
                  <i className="bx bxs-star"></i>
                  <i className="bx bxs-star"></i>
                  <i className="bx bxs-star"></i>
                  <i className="bx bxs-star"></i>
                </div>
                <div className="price">
                  $43.67
                  <div className="colors">
                    <i className="bx bxs-circle grey"></i>
                    <i className="bx bxs-circle red"></i>
                    <i className="bx bxs-circle blue"></i>
                  </div>
                </div>
                <div className="buy-now">
                  <button>
                    <a href="https://codepen.io/sanketbodke/full/mdprZOq">Buy  Now</a>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="seller container">
          <h2>Hot Sales</h2>
          <div className="best-seller">
            <div className="best-p1">
              <img src="https://i.postimg.cc/jS7pSQLf/na4.png" alt="img" />
              <div className="best-p1-txt">
                <div className="name-of-p">
                  <p>Aphrodite Shoes</p>
                </div>
                <div className="rating">
                  <i className="bx bxs-star"></i>
                  <i className="bx bxs-star"></i>
                  <i className="bx bxs-star"></i>
                  <i className="bx bxs-star"></i>
                  <i className="bx bxs-star"></i>
                </div>
                <div className="price">
                  $37.24
                  <div className="colors">
                    <i className="bx bxs-circle grey"></i>
                    <i className="bx bxs-circle black"></i>
                    <i className="bx bxs-circle blue"></i>
                  </div>
                </div>
                <div className="buy-now">
                  <button>
                    <a href="https://codepen.io/sanketbodke/full/mdprZOq">Buy  Now</a>
                  </button>
                </div>
              </div>
            </div>
            <div className="best-p1">
              <img src="https://i.postimg.cc/fbnB2yfj/na1.png" alt="img" />
              <div className="best-p1-txt">
                <div className="name-of-p">
                  <p>Aphrodite T-Shirt</p>
                </div>
                <div className="rating">
                  <i className="bx bxs-star"></i>
                  <i className="bx bxs-star"></i>
                  <i className="bx bxs-star"></i>
                  <i className="bx bxs-star"></i>
                  <i className="bx bxs-star"></i>
                </div>
                <div className="price">
                  $10.23
                  <div className="colors">
                    <i className="bx bxs-circle blank"></i>
                    <i className="bx bxs-circle blue"></i>
                    <i className="bx bxs-circle brown"></i>
                  </div>
                </div>
                <div className="buy-now">
                  <button>
                    <a href="https://codepen.io/sanketbodke/full/mdprZOq">Buy  Now</a>
                  </button>
                </div>
              </div>
            </div>
            <div className="best-p1">
              <img src="https://i.postimg.cc/RhVP7YQk/hs1.png" alt="img" />
              <div className="best-p1-txt">
                <div className="name-of-p">
                  <p>Aphrodite T-Shirt</p>
                </div>
                <div className="rating">
                  <i className="bx bxs-star"></i>
                  <i className="bx bxs-star"></i>
                  <i className="bx bxs-star"></i>
                  <i className="bx bxs-star"></i>
                  <i className="bx bxs-star"></i>
                </div>
                <div className="price">
                  $15.24
                  <div className="colors">
                    <i className="bx bxs-circle blank"></i>
                    <i className="bx bxs-circle red"></i>
                    <i className="bx bxs-circle blue"></i>
                  </div>
                </div>
                <div className="buy-now">
                  <button>
                    <a href="https://codepen.io/sanketbodke/full/mdprZOq">Buy  Now</a>
                  </button>
                </div>
              </div>
            </div>
            <div className="best-p1">
              <img src="https://i.postimg.cc/zD02zJq8/na2.png" alt="img" />
              <div className="best-p1-txt">
                <div className="name-of-p">
                  <p>Aphrodite Bag</p>
                </div>
                <div className="rating">
                  <i className="bx bxs-star"></i>
                  <i className="bx bx-star"></i>
                  <i className="bx bx-star"></i>
                  <i className="bx bx-star"></i>
                  <i className="bx bx-star"></i>
                </div>
                <div className="price">
                  $09.28
                  <div className="colors">
                    <i className="bx bxs-circle blank"></i>
                    <i className="bx bxs-circle grey"></i>
                    <i className="bx bxs-circle brown"></i>
                  </div>
                </div>
                <div className="buy-now">
                  <button>
                    <a href="https://codepen.io/sanketbodke/full/mdprZOq">Buy  Now</a>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section> */}
      {/* <section id="news">
        <div className="news-heading">
          <p>LATEST NEWS</p>
          <h2>Aphrodite New Trends</h2>
        </div>
        <div className="l-news container">
          <div className="l-news1">
            <div className="news1-img">
              <img src="https://i.postimg.cc/2y6wbZCm/news1.jpg" alt="img" />
            </div>
            <div className="news1-conte">
              <div className="date-news1">
                <p>
                  <i className="bx bxs-calendar"></i> 12 February 2022
                </p>
                <h4>What Curling Irons Are The Best Ones</h4>
                <a
                  href="https://www.vogue.com/article/best-curling-irons"
                  target="_blank"
                >
                  read more
                </a>
              </div>
            </div>
          </div>
          <div className="l-news2">
            <div className="news2-img">
              <img src="https://i.postimg.cc/9MXPK7RT/news2.jpg" alt="img" />
            </div>
            <div className="news2-conte">
              <div className="date-news2">
                <p>
                  <i className="bx bxs-calendar"></i> 17 February 2022
                </p>
                <h4>The Health Benefits Of Sunglasses</h4>
                <a
                  href="https://www.rivieraopticare.com/blog/314864-the-health-benefits-of-wearing-sunglasses_2/"
                  target="_blank"
                >
                  read more
                </a>
              </div>
            </div>
          </div>
          <div className="l-news3">
            <div className="news3-img">
              <img src="https://i.postimg.cc/x1KKdRLM/news3.jpg" alt="img" />
            </div>
            <div className="news3-conte">
              <div className="date-news3">
                <p>
                  <i className="bx bxs-calendar"></i> 26 February 202
                </p>
                <h4>Eternity Bands Do Last Forever</h4>
                <a
                  href="https://www.briangavindiamonds.com/news/eternity-bands-symbolize-love-that-lasts-forever/"
                  target="_blank"
                >
                  read more
                </a>
              </div>
            </div>
          </div>
        </div>
      </section> */}
      <section id="contact">
        <div className="contact container">
          <div className="map">
            {/* <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3782.121169986175!2d73.90618951442687!3d18.568575172551647!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2c131ed5b54a7%3A0xad718b8b2c93d36d!2sSky%20Vista!5e0!3m2!1sen!2sin!4v1654257749399!5m2!1sen!2sin"
              width="600"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe> */}
          </div>
          <form action="https://formspree.io/f/xzbowpjq" method="POST">
            <div className="form">
              <div className="form-txt">
                <h4>INFORMATION</h4>
                <h1>Contact Us</h1>
                {/* <span>
                  As you might expect of a company that began as a high-end
                  interiors contractor, we pay strict attention.
                </span> */}
                <h3></h3>
                <p>
                 
                </p>
                <h3></h3>
                <p>
                  
                </p>
              </div>
              <div className="form-details">
                <input type="text" name="name" id="name" placeholder="Name" required />
                <input type="email" name="email" id="email" placeholder="Email" required />
                <textarea
                  name="message"
                  id="message"
                  cols={52}
                  rows={7}
                  placeholder="Message"
                  required
                ></textarea>
                <button>SEND MESSAGE</button>
              </div>
            </div>
          </form>
        </div>
      </section>
      <footer className="modern-footer">
        <div className="modern-footer-container">
          {/* Contact Info */}
          <div className="footer-contact-section">
            <div className="contact-item">
              <i className="bx bx-phone"></i>
              <div>
                <span className="contact-label">Phone</span>
                <a href="tel:+96181937847" className="contact-value">+961 81 937 847</a>
              </div>
            </div>
            <div className="contact-item">
              <i className="bx bx-envelope"></i>
              <div>
                <span className="contact-label">Email</span>
                <a href="mailto:aphroditeee.lb@gmail.com" className="contact-value">aphroditeee.lb@gmail.com</a>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="footer-social-section">
            <h3>Follow Us</h3>
            <div className="social-links">
              {/* <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <i className="bx bxl-facebook"></i>
              </a> */}
              <a href="https://www.instagram.com/aphroditeee.lb?igsh=Y3gycGZ2NGp0czhh" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <i className="bx bxl-instagram"></i>
              </a>
              {/* <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <i className="bx bxl-twitter"></i>
              </a> */}
              {/* <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <i className="bx bxl-linkedin"></i>
              </a> */}
              {/* <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" aria-label="Pinterest">
                <i className="bx bxl-pinterest"></i>
              </a> */}
              <a href="https://wa.me/96181937847" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <i className="bx bxl-whatsapp"></i>
              </a>
            </div>
          </div>

          {/* Copyright */}
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Aphrodite. All rights reserved.</p>
            <p className="powered-by">Powered by NextGem</p>
          </div>
        </div>
      </footer>
    </main>
    </>
  );
}
