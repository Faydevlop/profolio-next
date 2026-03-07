import { getSectionVisibility, listContent } from "@/lib/content-store";
import TransitionLink from "@/components/transition-link";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const sectionVisibility = await getSectionVisibility();
  const { projects } = await listContent();

  return (
    <main className="projects-page">
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
