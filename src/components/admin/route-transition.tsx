"use client";

import { type ReactNode, useEffect, useState } from "react";

export default function AdminRouteTransition({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => setActive(true));
    return () => cancelAnimationFrame(frameId);
  }, []);

  return <div className={`cms-route-transition ${active ? "is-active" : ""}`}>{children}</div>;
}
