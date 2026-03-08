import { updateSectionVisibilityAction } from "@/app/admin/actions";
import { getSectionVisibility, listContent } from "@/lib/content-store";

export default async function AdminOverviewPage() {
  const { projects, services, blogs, reviews, faqs, enquiries } = await listContent({
    includeHidden: true,
  });
  const visibility = await getSectionVisibility();

  return (
    <section className="cms-content-page">
      <div className="cms-page-head">
        <div>
          <h2>Overview</h2>
          <p className="cms-page-subtitle">
            Navigate from the sidebar to manage each section on separate pages.
          </p>
        </div>
      </div>

      <div className="cms-stats">
        <article className="cms-stat">
          <h3>Projects</h3>
          <p>{projects.length}</p>
        </article>
        <article className="cms-stat">
          <h3>Services</h3>
          <p>{services.length}</p>
        </article>
        <article className="cms-stat">
          <h3>Blogs</h3>
          <p>{blogs.length}</p>
        </article>
        <article className="cms-stat">
          <h3>Reviews</h3>
          <p>{reviews.length}</p>
        </article>
        <article className="cms-stat">
          <h3>FAQ</h3>
          <p>{faqs.length}</p>
        </article>
        <article className="cms-stat">
          <h3>Enquiries</h3>
          <p>{enquiries.length}</p>
        </article>
      </div>

      <section className="cms-section cms-visibility-section">
        <div className="cms-section-head">
          <h2>Section Visibility</h2>
          <p>Hide or show entire website sections from one place.</p>
        </div>

        <form action={updateSectionVisibilityAction} className="cms-form">
          <label className="cms-checkbox-row">
            <input type="checkbox" name="section_hero" defaultChecked={visibility.hero} />
            <span>Show Hero section</span>
          </label>
          <label className="cms-checkbox-row">
            <input type="checkbox" name="section_projects" defaultChecked={visibility.projects} />
            <span>Show Projects section</span>
          </label>
          <label className="cms-checkbox-row">
            <input type="checkbox" name="section_services" defaultChecked={visibility.services} />
            <span>Show Services section</span>
          </label>
          <label className="cms-checkbox-row">
            <input type="checkbox" name="section_blogs" defaultChecked={visibility.blogs} />
            <span>Show Blog section</span>
          </label>
          <label className="cms-checkbox-row">
            <input type="checkbox" name="section_reviews" defaultChecked={visibility.reviews} />
            <span>Show Reviews section</span>
          </label>
          <label className="cms-checkbox-row">
            <input type="checkbox" name="section_faqs" defaultChecked={visibility.faqs} />
            <span>Show FAQ section</span>
          </label>

          <button type="submit" className="btn-primary">
            Save Visibility
          </button>
        </form>
      </section>
    </section>
  );
}
