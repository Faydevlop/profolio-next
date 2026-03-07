"use client";

import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";

type SmoothScrollProps = {
  children: ReactNode;
};

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
      {children}
    </ReactLenis>
  );
}
