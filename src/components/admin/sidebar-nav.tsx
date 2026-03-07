"use client";

import type { MouseEvent } from "react";
import { usePathname, useRouter } from "next/navigation";

export type NavItem = {
  href: string;
  label: string;
  count: number;
};

type SidebarNavProps = {
  items: NavItem[];
  onNavigate?: () => void;
};

function isPathActive(currentPath: string, itemPath: string) {
  if (currentPath === itemPath) {
    return true;
  }

  if (itemPath === "/admin") {
    return false;
  }

  return currentPath.startsWith(`${itemPath}/`);
}

export default function SidebarNav({ items, onNavigate }: SidebarNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigate = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();

    onNavigate?.();

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
    <nav className="cms-nav" aria-label="Admin sections">
      {items.map((item) => {
        const active = isPathActive(pathname, item.href);

        return (
          <a
            href={item.href}
            key={item.href}
            onClick={(event) => handleNavigate(event, item.href)}
            className={`cms-nav-link ${active ? "is-active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <span>{item.label}</span>
            <span>{item.count}</span>
          </a>
        );
      })}
    </nav>
  );
}
