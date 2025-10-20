"use client";

import { useEffect } from "react";
import "../interactive-dots.css";

interface GSAPInstance {
  timeline: () => GSAPTimeline;
  to: (...args: unknown[]) => void;
  set: (...args: unknown[]) => void;
  registerPlugin: (...args: unknown[]) => void;
  utils: {
    random: (...args: unknown[]) => unknown;
    interpolate: (...args: unknown[]) => unknown;
  };
}

interface GSAPTimeline {
  to: (...args: unknown[]) => GSAPTimeline;
  set: (...args: unknown[]) => GSAPTimeline;
}

declare global {
  interface Window {
    gsap: GSAPInstance;
    InertiaPlugin: unknown;
  }
}

export default function InteractiveDots() {
  useEffect(() => {
    const loadScript = (src: string) => {
      return new Promise<void>((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(script);
      });
    };

    const initGlowingInteractiveDotsGrid = () => {
      const hasGsap = !!window.gsap;
      if (hasGsap && window.InertiaPlugin) {
        window.gsap.registerPlugin(window.InertiaPlugin);
      }

      document.querySelectorAll<HTMLElement>("[data-dots-container-init]").forEach((container) => {
        const colors = { base: "#000000", active: "#000000" };
        const threshold = 150;
        const speedThreshold = 100;
        const shockRadius = 250;
        const shockPower = 5;
        const maxSpeed = 5000;
        // On small screens, disable center hole so dots remain visible
        const wantsCenterHole = window.innerWidth >= 768;

        let dots: HTMLElement[] = [];
        let dotCenters: { el: HTMLElement; x: number; y: number }[] = [];

        function buildGrid() {
          container.innerHTML = "";
          dots = [];
          dotCenters = [];

          const style = getComputedStyle(container);
          const dotPx = parseFloat(style.fontSize);
          const gapPx = dotPx * 2;
          const contW = container.clientWidth;
          const contH = container.clientHeight;

          const cols = Math.floor((contW + gapPx) / (dotPx + gapPx));
          const rows = Math.floor((contH + gapPx) / (dotPx + gapPx));
          const total = cols * rows;

          // Clamp hole size so it never exceeds the grid on small screens
          const desiredHoleCols = cols % 2 === 0 ? 8 : 9;
          const desiredHoleRows = rows % 2 === 0 ? 4 : 5;
          const holeCols = wantsCenterHole ? Math.max(0, Math.min(desiredHoleCols, cols - 2)) : 0;
          const holeRows = wantsCenterHole ? Math.max(0, Math.min(desiredHoleRows, rows - 2)) : 0;
          const startCol = (cols - holeCols) / 2;
          const startRow = (rows - holeRows) / 2;

          for (let i = 0; i < total; i++) {
            const row = Math.floor(i / cols);
            const col = i % cols;
            const isHole =
              wantsCenterHole && holeCols > 0 && holeRows > 0 &&
              row >= startRow &&
              row < startRow + holeRows &&
              col >= startCol &&
              col < startCol + holeCols;

            const d = document.createElement("div");
            d.classList.add("dot");

            if (isHole) {
              d.style.visibility = "hidden";
              // @ts-expect-error GSAP library methods not fully typed GSAP library methods not fully typed GSAP library methods not fully typed
              d._isHole = true;
            } else {
              // Initialize position/color even without GSAP
              d.style.transform = "translate(0, 0)";
              d.style.backgroundColor = colors.base;
              // @ts-expect-error GSAP library methods not fully typed GSAP library methods not fully typed GSAP library methods not fully typed
              d._inertiaApplied = false;
            }

            container.appendChild(d);
            dots.push(d);
          }

          requestAnimationFrame(() => {
            dotCenters = dots
              // @ts-expect-error GSAP library methods not fully typed GSAP library methods not fully typed GSAP library methods not fully typed
              .filter((d) => !d._isHole)
              .map((d) => {
                const r = d.getBoundingClientRect();
                return {
                  el: d,
                  x: r.left + window.scrollX + r.width / 2,
                  y: r.top + window.scrollY + r.height / 2,
                };
              });
          });
        }

        window.addEventListener("resize", buildGrid);
        buildGrid();

        let lastTime = 0,
          lastX = 0,
          lastY = 0;

        window.addEventListener("mousemove", (e) => {
          const now = performance.now();
          const dt = now - lastTime || 16;
          const dx = e.pageX - lastX;
          const dy = e.pageY - lastY;
          let vx = (dx / dt) * 1000;
          let vy = (dy / dt) * 1000;
          let speed = Math.hypot(vx, vy);

          if (speed > maxSpeed) {
            const scale = maxSpeed / speed;
            vx *= scale;
            vy *= scale;
            speed = maxSpeed;
          }

          lastTime = now;
          lastX = e.pageX;
          lastY = e.pageY;

          requestAnimationFrame(() => {
            dotCenters.forEach(({ el, x, y }) => {
              const dist = Math.hypot(x - e.pageX, y - e.pageY);
              if (hasGsap && window.gsap?.utils?.interpolate) {
                const t = Math.max(0, 1 - dist / threshold);
                const col = window.gsap.utils.interpolate(colors.base, colors.active, t);
                el.style.backgroundColor = col as string;
              }

              // Only apply inertia if plugin is available
              // @ts-expect-error GSAP library methods not fully typed GSAP library methods not fully typed GSAP library methods not fully typed
              if (hasGsap && window.InertiaPlugin && speed > speedThreshold && dist < threshold && !el._inertiaApplied) {
                // @ts-expect-error GSAP library methods not fully typed GSAP library methods not fully typed GSAP library methods not fully typed
                el._inertiaApplied = true;
                const pushX = x - e.pageX + vx * 0.005;
                const pushY = y - e.pageY + vy * 0.005;

                window.gsap.to(el, {
                  inertia: { x: pushX, y: pushY, resistance: 750 },
                  onComplete() {
                    window.gsap.to(el, {
                      x: 0,
                      y: 0,
                      duration: 1.5,
                      ease: "elastic.out(1,0.75)",
                    });
                    // @ts-expect-error GSAP library methods not fully typed GSAP library methods not fully typed GSAP library methods not fully typed
                    el._inertiaApplied = false;
                  },
                });
              }
            });
          });
        });

        window.addEventListener("click", (e) => {
          // Only apply shockwave if plugin is available
          if (!(hasGsap && window.InertiaPlugin)) return;
          dotCenters.forEach(({ el, x, y }) => {
            const dist = Math.hypot(x - e.pageX, y - e.pageY);
            // @ts-expect-error GSAP library methods not fully typed GSAP library methods not fully typed GSAP library methods not fully typed
            if (dist < shockRadius && !el._inertiaApplied) {
              // @ts-expect-error GSAP library methods not fully typed GSAP library methods not fully typed GSAP library methods not fully typed
              el._inertiaApplied = true;
              const falloff = Math.max(0, 1 - dist / shockRadius);
              const pushX = (x - e.pageX) * shockPower * falloff;
              const pushY = (y - e.pageY) * shockPower * falloff;

              window.gsap.to(el, {
                inertia: { x: pushX, y: pushY, resistance: 750 },
                onComplete() {
                  window.gsap.to(el, {
                    x: 0,
                    y: 0,
                    duration: 1.5,
                    ease: "elastic.out(1,0.75)",
                  });
                  // @ts-expect-error GSAP library methods not fully typed GSAP library methods not fully typed GSAP library methods not fully typed
                  el._inertiaApplied = false;
                },
              });
            }
          });
        });
      });
    };

    Promise.all([
      loadScript("https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"),
      loadScript("https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/InertiaPlugin.min.js").catch(() => Promise.resolve()),
    ])
      .then(() => {
        initGlowingInteractiveDotsGrid();
      })
      .catch((err) => {
        console.error("Failed to load GSAP:", err);
      });

    return () => {
      // No-op cleanup (listeners are attached to window; leaving as-is for demo)
    };
  }, []);

  return (
    <section className="section-resource">
      <div className="dots-wrap">
        <div data-dots-container-init className="dots-container">
          <div className="dot"></div>
        </div>
      </div>
      <div className="aphrodite-text">APHRODITE</div>
    </section>
  );
}


