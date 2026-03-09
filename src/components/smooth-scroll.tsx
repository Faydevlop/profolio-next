"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { useEffect, type ReactNode } from "react";

type SmoothScrollProps = {
  children: ReactNode;
};

function AnchorScrollHandler() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Find the closest anchor tag in case we clicked an icon/span inside it
      const anchor = target.closest("a");

      if (!anchor) return;

      const href = anchor.getAttribute("href");

      // Check if it's an internal anchor link
      if (href && href.startsWith("#") && href.length > 1) {
        // Find the actual element on the page
        const targetElement = document.querySelector(href);

        if (targetElement) {
          e.preventDefault();
          e.stopPropagation();

          lenis.scrollTo(targetElement as HTMLElement, {
            offset: -80, // Optional: adjust for sticky headers
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth easeOutExpo
          });

          // Update URL hash without jumping
          window.history.pushState(null, "", href);
        }
      }
    };

    // Use capture phase to intercept before native browser jump or Next.js router
    document.addEventListener("click", handleAnchorClick, { capture: true });

    return () => {
      document.removeEventListener("click", handleAnchorClick, { capture: true });
    };
  }, [lenis]);

  return null;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  return (
    <ReactLenis
      root
      options={{
        autoRaf: true,
        lerp: 0.085,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.1,
        syncTouch: true,
      }}
    >
      <AnchorScrollHandler />
      {children}
    </ReactLenis>
  );
}
