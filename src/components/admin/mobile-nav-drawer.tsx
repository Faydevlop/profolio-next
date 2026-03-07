"use client";

import { useEffect, useState } from "react";
import SidebarNav, { type NavItem } from "@/components/admin/sidebar-nav";

type MobileNavDrawerProps = {
  email: string;
  items: NavItem[];
  logoutAction: () => Promise<void>;
};

export default function MobileNavDrawer({ email, items, logoutAction }: MobileNavDrawerProps) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  const openDrawer = () => {
    setOpen(true);
    requestAnimationFrame(() => setVisible(true));
  };

  const closeDrawer = () => {
    setVisible(false);
    setTimeout(() => setOpen(false), 220);
  };

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDrawer();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <header className="cms-mobile-header">
        <button type="button" className="cms-burger-btn" onClick={openDrawer} aria-label="Open menu">
          <span />
          <span />
          <span />
        </button>
        <div>
          <strong>Portfolio CMS</strong>
          <p>{email}</p>
        </div>
      </header>

      {open ? (
        <div
          className={`cms-mobile-drawer-backdrop ${visible ? "is-open" : ""}`}
          onClick={closeDrawer}
          role="dialog"
          aria-modal="true"
          aria-label="Admin navigation"
        >
          <aside className="cms-mobile-drawer" onClick={(event) => event.stopPropagation()}>
            <div className="cms-mobile-drawer-head">
              <strong>Navigation</strong>
              <button type="button" className="btn-secondary" onClick={closeDrawer}>
                Close
              </button>
            </div>

            <SidebarNav items={items} onNavigate={closeDrawer} />

            <div className="cms-sidebar-actions">
              <a href="/" target="_blank" rel="noreferrer" className="btn-secondary" onClick={closeDrawer}>
                Open Site
              </a>
              <form action={logoutAction}>
                <button type="submit" className="btn-danger">
                  Logout
                </button>
              </form>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
