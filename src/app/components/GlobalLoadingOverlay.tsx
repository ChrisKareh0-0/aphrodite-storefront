"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function GlobalLoadingOverlay() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);

  // Initial load
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Show on route changes
  useEffect(() => {
    if (!pathname) return;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className="global-loading-overlay" aria-live="polite" aria-busy="true">
      <div className="global-loading-image">
        <Image
          src="/Website%20Intro.jpg"
          alt="Loading"
          width={320}
          height={320}
          priority
          sizes="320px"
        />
      </div>
    </div>
  );
}


