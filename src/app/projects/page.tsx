import type { Metadata } from "next";
import { getSectionVisibility, listContent } from "@/lib/content-store";
import TransitionLink from "@/components/transition-link";

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

      <section className="projects-hero">
        <p>Portfolio</p>
        <h1>All Projects</h1>
        <p>Browse case studies with stack details, approach, and delivery notes.</p>
      </section>

      <section className="projects-grid-wrap">
        {!sectionVisibility.projects ? (
          <p className="section-empty">Projects section is hidden from admin settings.</p>
        ) : null}
        {projects.length === 0 ? <p className="section-empty">No projects added yet.</p> : null}

        {sectionVisibility.projects ? (
          <div className="projects-grid">
            {projects.map((project) => (
              <article key={project.id} className="project-card">
                <TransitionLink href={`/projects/${project.id}`} className="project-card-image">
                  {project.imageUrl ? <img src={project.imageUrl} alt={project.title} /> : <span>No image</span>}
                </TransitionLink>
                <div className="project-card-body">
                  <p>{project.category} - {project.year}</p>
                  <h2>
                    <TransitionLink href={`/projects/${project.id}`}>{project.title}</TransitionLink>
                  </h2>
                  <p>{project.description.slice(0, 140)}{project.description.length > 140 ? "..." : ""}</p>
                  <p>{project.stack.length > 0 ? project.stack.join(" - ") : "Stack not added yet"}</p>
                  <p>{project.gitRepo ? "Git repo added" : "No git repo"} | {project.liveLink ? "Live link added" : "No live link"}</p>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
