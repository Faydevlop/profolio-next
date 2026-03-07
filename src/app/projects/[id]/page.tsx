import { notFound } from "next/navigation";
import TransitionLink from "@/components/transition-link";
import { getProjectById, getSectionVisibility } from "@/lib/content-store";

type ProjectDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProjectDetailsPage({ params }: ProjectDetailsPageProps) {
  const { id } = await params;
  const project = await getProjectById(id);
  const sectionVisibility = await getSectionVisibility();

  if (!project || project.hidden || !sectionVisibility.projects) {
    notFound();
  }

  const uniqueImages = Array.from(new Set(project.images));
  const mainImage = project.mainImageUrl || project.imageUrl || uniqueImages[0] || null;
  const galleryImages = uniqueImages.filter((imageUrl) => imageUrl !== mainImage);
  const descriptionParts = project.description
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <main className="project-details-page">
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
