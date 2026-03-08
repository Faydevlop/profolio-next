import { ReactNode } from "react";
import { logoutAction } from "@/app/admin/actions";
import { requireAdminSession } from "@/lib/auth";
import { listContent } from "@/lib/content-store";
import SidebarNav from "@/components/admin/sidebar-nav";
import MobileNavDrawer from "@/components/admin/mobile-nav-drawer";

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const session = await requireAdminSession();
  const { projects, services, blogs, reviews, faqs, enquiries } = await listContent({
    includeHidden: true,
  });

  const navItems = [
    { href: "/admin", label: "Overview", count: projects.length + services.length + blogs.length + reviews.length + faqs.length },
    { href: "/admin/hero", label: "Hero", count: 1 },
    { href: "/admin/projects", label: "Projects", count: projects.length },
    { href: "/admin/services", label: "Services", count: services.length },
    { href: "/admin/blogs", label: "Blogs", count: blogs.length },
    { href: "/admin/reviews", label: "Client Reviews", count: reviews.length },
    { href: "/admin/faqs", label: "FAQ", count: faqs.length },
    { href: "/admin/enquiries", label: "Enquiries", count: enquiries.length },
  ];

  return (
    <main className="cms-page">
      <div className="cms-shell">
        <aside className="cms-sidebar">
          <div className="cms-sidebar-head">
            <h1>Portfolio CMS</h1>
            <p>{session.email}</p>
          </div>

          <SidebarNav items={navItems} />

          <div className="cms-sidebar-actions">
            <a href="/" target="_blank" rel="noreferrer" className="btn-secondary">
              Open Site
            </a>
            <form action={logoutAction}>
              <button type="submit" className="btn-danger">
                Logout
              </button>
            </form>
          </div>
        </aside>

        <div className="cms-main">
          <MobileNavDrawer email={session.email} items={navItems} logoutAction={logoutAction} />
          {children}
        </div>
      </div>
    </main>
  );
}
