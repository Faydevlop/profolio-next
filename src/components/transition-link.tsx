"use client";

import type { ReactNode } from "react";
import Link from "next/link";

type TransitionLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
};

export default function TransitionLink({ href, className, children }: TransitionLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      prefetch={true}
    >
      {children}
    </Link>
  );
}
