"use client";

import type { MouseEvent, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

type TransitionLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
};

export default function TransitionLink({ href, className, children }: TransitionLinkProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    if (!href.startsWith("/")) {
      return;
    }

    event.preventDefault();

    if (pathname === href) {
      return;
    }

    const navigate = () => router.push(href);
    const doc = document as Document & {
      startViewTransition?: (callback: () => void) => void;
    };

    if (typeof doc.startViewTransition === "function") {
      doc.startViewTransition(navigate);
      return;
    }

    navigate();
  };

  return (
    <a href={href} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
