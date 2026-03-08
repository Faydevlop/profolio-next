import type { Metadata } from "next";
import { getSectionVisibility, listContent } from "@/lib/content-store";
import TransitionLink from "@/components/transition-link";
import ProjectsGrid from "@/components/projects-grid";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projects — Web Development Portfolio",
  description:
    "Browse the complete project portfolio of Fayis Namiyath — case studies in web development, UI/UX design, React, Next.js, and full-stack applications built for clients across Kerala and India.",
  keywords: [
    "Fayis Namiyath projects",
    "web development portfolio Kerala",
    "React projects",
    "Next.js projects",
    "web design case studies",
    "full-stack projects India",
  ],
  openGraph: {
    title: "Projects — Fayis Namiyath Portfolio",
    description:
      "Case studies and projects by Fayis Namiyath — web development, UI/UX design, and full-stack applications.",
    type: "website",
  },
  alternates: {
    canonical: "/projects",
  },
};

export default async function ProjectsPage() {
  const sectionVisibility = await getSectionVisibility();
  const { projects } = await listContent();

  const siteUrl = process.env.SITE_URL || "http://localhost:3000";

  /* JSON-LD: ItemList for projects */
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Web Development Projects by Fayis Namiyath",
    description:
      "A curated list of web development and design projects by Fayis Namiyath from Kerala, India.",
    numberOfItems: projects.length,
    itemListElement: projects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: project.title,
      url: `${siteUrl}/projects/${project.id}`,
      description: project.description.slice(0, 160),
    })),
  };

  /* JSON-LD: BreadcrumbList */
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Projects",
        item: `${siteUrl}/projects`,
      },
    ],
  };

  return (
    <main className="projects-page">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* Hero */}
      <section className="projects-hero">
        <TransitionLink href="/" className="projects-back-home">← Home</TransitionLink>
        <div className="projects-hero-content">
          <span className="projects-hero-label">Portfolio</span>
          <h1>All Projects</h1>
          <p>Browse case studies with stack details, approach, and delivery notes.</p>
        </div>
      </section>

      {/* Projects section */}
      <section className="projects-grid-wrap">
        {!sectionVisibility.projects ? (
          <p className="section-empty">Projects section is hidden from admin settings.</p>
        ) : projects.length === 0 ? (
          <p className="section-empty">No projects added yet.</p>
        ) : (
          <ProjectsGrid
            projects={projects}
            totalCategories={new Set(projects.map((p) => p.category)).size}
            totalTechnologies={new Set(projects.flatMap((p) => p.stack)).size}
          />
        )}
      </section>
    </main>
  );
}
