import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TransitionLink from "@/components/transition-link";
import { getProjectById, getSectionVisibility } from "@/lib/content-store";

type ProjectDetailsPageProps = {
  params: Promise<{ id: string }>;
};

/* ── Dynamic metadata for each project ── */
export async function generateMetadata({ params }: ProjectDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    return { title: "Project Not Found" };
  }

  const description = project.description.slice(0, 160) || `${project.title} — a ${project.category} project by Fayis Namiyath.`;
  const ogImage = project.mainImageUrl || project.imageUrl || undefined;

  return {
    title: `${project.title} — ${project.category} Project`,
    description,
    keywords: [
      project.title,
      project.category,
      "Fayis Namiyath project",
      "web development Kerala",
      ...project.stack,
    ],
    openGraph: {
      title: `${project.title} — Fayis Namiyath`,
      description,
      type: "article",
      images: ogImage ? [{ url: ogImage, alt: project.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} — Fayis Namiyath`,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    alternates: {
      canonical: `/projects/${id}`,
    },
  };
}

export default async function ProjectDetailsPage({ params }: ProjectDetailsPageProps) {
  const { id } = await params;
  const project = await getProjectById(id);
  const sectionVisibility = await getSectionVisibility();

  if (!project || project.hidden || !sectionVisibility.projects) {
    notFound();
  }

  const siteUrl = process.env.SITE_URL || "http://localhost:3000";

  const uniqueImages = Array.from(new Set(project.images));
  const mainImage = project.mainImageUrl || project.imageUrl || uniqueImages[0] || null;
  const galleryImages = uniqueImages.filter((imageUrl) => imageUrl !== mainImage);
  const descriptionParts = project.description
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean);

  /* JSON-LD: CreativeWork for the project */
  const projectJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.description.slice(0, 300),
    url: `${siteUrl}/projects/${project.id}`,
    image: mainImage || undefined,
    dateCreated: project.createdAt,
    genre: project.category,
    keywords: project.stack.join(", "),
    author: {
      "@type": "Person",
      name: "Fayis Namiyath",
      url: siteUrl,
    },
    creator: {
      "@type": "Person",
      name: "Fayis Namiyath",
    },
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
      {
        "@type": "ListItem",
        position: 3,
        name: project.title,
        item: `${siteUrl}/projects/${project.id}`,
      },
    ],
  };

  return (
    <main className="project-details-page">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(projectJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* Navigation bar */}
      <nav className="project-details-nav">
        <TransitionLink href="/projects" className="project-back-link">
          ← Back to all projects
        </TransitionLink>

        <div className="project-inline-links">
          {project.gitRepo ? (
            <a href={project.gitRepo} target="_blank" rel="noreferrer" className="project-ext-link">
              <span className="project-ext-icon">&#x2197;</span> Git Repository
            </a>
          ) : null}
          {project.liveLink ? (
            <a href={project.liveLink} target="_blank" rel="noreferrer" className="project-ext-link">
              <span className="project-ext-icon">&#x2197;</span> Live Project
            </a>
          ) : null}
        </div>
      </nav>

      {/* Hero banner with main image */}
      <section className="project-hero-banner">
        <div className="project-hero-image-wrap">
          {mainImage ? (
            <img src={mainImage} alt={`${project.title} main cover`} />
          ) : (
            <div className="project-hero-empty">No project image added yet.</div>
          )}
        </div>
      </section>

      {/* Title block */}
      <section className="project-title-block">
        <span className="project-category-tag">{project.category}</span>
        <h1>{project.title}</h1>
        <p className="project-year-label">{project.year}</p>
      </section>

      {/* Content area: description + sidebar */}
      <section className="project-content-layout">
        <article className="project-overview-col">
          <div className="project-section-label">About this project</div>
          <div className="project-overview-text">
            {descriptionParts.length > 0 ? (
              descriptionParts.map((part, index) => <p key={`${part}-${index}`}>{part}</p>)
            ) : (
              <p className="section-empty">No description added yet.</p>
            )}
          </div>
        </article>

        <aside className="project-meta-col">
          {/* Project Facts */}
          <div className="project-meta-card">
            <div className="project-section-label">Project Facts</div>
            <dl className="project-facts-grid">
              <div className="project-fact-item">
                <dt>Category</dt>
                <dd>{project.category}</dd>
              </div>
              <div className="project-fact-item">
                <dt>Year</dt>
                <dd>{project.year}</dd>
              </div>
              <div className="project-fact-item">
                <dt>Images</dt>
                <dd>{uniqueImages.length}</dd>
              </div>
              <div className="project-fact-item">
                <dt>Status</dt>
                <dd>{mainImage ? "Complete" : "In Progress"}</dd>
              </div>
            </dl>
          </div>

          {/* Tech Stack */}
          <div className="project-meta-card">
            <div className="project-section-label">Tech Stack</div>
            {project.stack.length > 0 ? (
              <div className="project-stack-list">
                {project.stack.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            ) : (
              <p className="section-empty">No stack details added yet.</p>
            )}
          </div>

          {/* Quick Links (if any) */}
          {(project.gitRepo || project.liveLink) && (
            <div className="project-meta-card">
              <div className="project-section-label">Quick Links</div>
              <div className="project-quick-links">
                {project.gitRepo && (
                  <a href={project.gitRepo} target="_blank" rel="noreferrer">
                    &#x2197; Repository
                  </a>
                )}
                {project.liveLink && (
                  <a href={project.liveLink} target="_blank" rel="noreferrer">
                    &#x2197; Live Demo
                  </a>
                )}
              </div>
            </div>
          )}
        </aside>
      </section>

      {/* Gallery */}
      {galleryImages.length > 0 && (
        <section className="project-gallery-section">
          <div className="project-section-label">Gallery</div>
          <div className="project-gallery-grid">
            {galleryImages.map((imageUrl, index) => (
              <figure key={`${imageUrl}-${index}`} className="project-gallery-item">
                <img src={imageUrl} alt={`${project.title} image ${index + 1}`} />
                <figcaption>Image {index + 1}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
