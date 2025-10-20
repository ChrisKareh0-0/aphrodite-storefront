"use client";

import { useEffect } from "react";

export default function CategoryCarousel() {
  useEffect(() => {
    // jQuery replacement for carousel functionality
    let activeIndex = 0;
    let limit = 0;
    let disabled = false;
    let stage: HTMLElement | null = null;
    let controls: NodeListOf<HTMLAnchorElement> | null = null;

    const SPIN_FORWARD_CLASS = 'js-spin-fwd';
    const SPIN_BACKWARD_CLASS = 'js-spin-bwd';
    const DISABLE_TRANSITIONS_CLASS = 'js-transitions-disabled';
    const SPIN_DUR = 1000;

    const appendControls = () => {
      const controlContainer = document.querySelector('.carousel__control');
      if (!controlContainer) return;

      for (let i = 0; i < limit; i++) {
        const link = document.createElement('a');
        link.href = '#';
        link.setAttribute('data-index', i.toString());
        controlContainer.appendChild(link);
      }

      const height = controlContainer.children[controlContainer.children.length - 1]?.getBoundingClientRect().height || 40;
      (controlContainer as HTMLElement).style.height = `${30 + (limit * height)}px`;

      controls = document.querySelectorAll('.carousel__control a');
      if (controls && controls[activeIndex]) {
        controls[activeIndex].classList.add('active');
      }
    };

    const setIndexes = () => {
      const spinnerFaces = document.querySelectorAll('.spinner__face');
      spinnerFaces.forEach((el, i) => {
        el.setAttribute('data-index', i.toString());
        limit++;
      });
    };

    const duplicateSpinner = () => {
      const spinnerParent = document.querySelector('.spinner')?.parentElement;
      if (!spinnerParent) return;

      const html = spinnerParent.innerHTML;
      spinnerParent.insertAdjacentHTML('beforeend', html);

      const lastSpinner = spinnerParent.querySelector('.spinner:last-child');
      if (lastSpinner) {
        lastSpinner.classList.add('spinner--right');
        lastSpinner.classList.remove('spinner--left');
      }
    };

    const prepareDom = () => {
      setIndexes();
      duplicateSpinner();
      appendControls();
    };

    const spin = (inc = 1) => {
      if (disabled || !inc || !stage) return;

      activeIndex += inc;
      disabled = true;

      if (activeIndex >= limit) {
        activeIndex = 0;
      }

      if (activeIndex < 0) {
        activeIndex = (limit - 1);
      }

      const nextEls = document.querySelectorAll(`.spinner__face[data-index="${activeIndex}"]`);
      nextEls.forEach(el => el.classList.add('js-next'));

      if (inc > 0) {
        stage.classList.add(SPIN_FORWARD_CLASS);
      } else {
        stage.classList.add(SPIN_BACKWARD_CLASS);
      }

      if (controls) {
        controls.forEach(control => control.classList.remove('active'));
        if (controls[activeIndex]) {
          controls[activeIndex].classList.add('active');
        }
      }

      setTimeout(() => {
        spinCallback(inc);
      }, SPIN_DUR);
    };

    const spinCallback = (inc: number) => {
      const activeEls = document.querySelectorAll('.js-active');
      const nextEls = document.querySelectorAll('.js-next');

      activeEls.forEach(el => el.classList.remove('js-active'));
      nextEls.forEach(el => {
        el.classList.remove('js-next');
        el.classList.add('js-active');
      });

      if (stage) {
        stage.classList.add(DISABLE_TRANSITIONS_CLASS);
        stage.classList.remove(SPIN_FORWARD_CLASS);
        stage.classList.remove(SPIN_BACKWARD_CLASS);
      }

      const newActiveEls = document.querySelectorAll('.js-active');
      newActiveEls.forEach(el => {
        const parent = el.parentElement;
        if (parent) {
          parent.insertBefore(el, parent.firstChild);
        }
      });

      setTimeout(() => {
        if (stage) {
          stage.classList.remove(DISABLE_TRANSITIONS_CLASS);
        }
        disabled = false;
      }, 100);
    };

    const attachListeners = () => {
      document.addEventListener('keyup', (e) => {
        switch (e.keyCode) {
          case 38:
            spin(-1);
            break;
          case 40:
            spin(1);
            break;
        }
      });

      if (controls) {
        controls.forEach(control => {
          control.addEventListener('click', (e) => {
            e.preventDefault();
            if (disabled) return;
            const toIndex = parseInt(control.getAttribute('data-index') || '0', 10);
            spin(toIndex - activeIndex);
          });
        });
      }
    };

    const init = () => {
      stage = document.querySelector('.carousel__stage');
      prepareDom();
      attachListeners();
    };

    // Initialize after component mounts
    const timer = setTimeout(() => {
      init();
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('keyup', () => {});
    };
  }, []);

  return (
    <section id="collection" className="carousel-section">
      <div className="carousel">
        <div className="carousel__control"></div>
        <div className="carousel__stage">
          <div className="spinner spinner--left">

            {/* Clothing Category */}
            <div className="spinner__face js-active" data-bg="#2c1810">
              <div className="content" data-type="clothing">
                <div className="content__left">
                  <h1>CLOTHING<br /><span>FASHION</span></h1>
                </div>
                <div className="content__right">
                  <div className="content__main">
                    <p>&ldquo;Discover our exquisite clothing collection featuring elegant dresses, sophisticated blazers, and timeless pieces. Each garment is carefully curated to embody the essence of modern femininity and classic style that defines the Aphrodite brand.&rdquo;</p>
                    <p>– APHRODITE COLLECTION</p>
                  </div>
                  <h3 className="content__index">01</h3>
                </div>
              </div>
            </div>

            {/* Shoes Category */}
            <div className="spinner__face" data-bg="#1a237e">
              <div className="content" data-type="shoes">
                <div className="content__left">
                  <h1>SHOES<br /><span>FOOTWEAR</span></h1>
                </div>
                <div className="content__right">
                  <div className="content__main">
                    <p>&ldquo;Step into elegance with our premium footwear collection. From comfortable everyday sneakers to stunning heels for special occasions, our shoes combine comfort with style, ensuring you feel confident with every step you take.&rdquo;</p>
                    <p>– APHRODITE FOOTWEAR</p>
                  </div>
                  <h3 className="content__index">02</h3>
                </div>
              </div>
            </div>

            {/* Accessories Category */}
            <div className="spinner__face" data-bg="#2e2d2b">
              <div className="content" data-type="accessories">
                <div className="content__left">
                  <h1>ACCESSORIES<br /><span>LUXURY</span></h1>
                </div>
                <div className="content__right">
                  <div className="content__main">
                    <p>&ldquo;Complete your look with our luxury accessories collection. From designer handbags and elegant jewelry to stylish sunglasses and scarves, each piece is selected to add the perfect finishing touch to your ensemble.&rdquo;</p>
                    <p>– APHRODITE ACCESSORIES</p>
                  </div>
                  <h3 className="content__index">03</h3>
                </div>
              </div>
            </div>

            {/* Sale Category */}
            <div className="spinner__face" data-bg="#b71c1c">
              <div className="content" data-type="sale">
                <div className="content__left">
                  <h1>SALE<br /><span>LIMITED TIME</span></h1>
                </div>
                <div className="content__right">
                  <div className="content__main">
                    <p>&ldquo;Don&apos;t miss our exclusive sale collection featuring premium items at unbeatable prices. Limited time offers on selected clothing, shoes, and accessories. Discover luxury for less and refresh your wardrobe with timeless pieces.&rdquo;</p>
                    <p>– SPECIAL OFFERS</p>
                  </div>
                  <h3 className="content__index">04</h3>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}