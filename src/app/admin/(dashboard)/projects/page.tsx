import AddModal from "@/components/admin/add-modal";
import ConfirmSubmitButton from "@/components/admin/confirm-submit-button";
import CreateEntityForm from "@/components/admin/create-entity-form";
import ImagePreviewTrigger from "@/components/admin/image-preview-trigger";
import ProjectImagesField from "@/components/admin/project-images-field";
import {
  createProjectAction,
  deleteProjectAction,
  updateProjectAction,
} from "@/app/admin/actions";
import { listContent } from "@/lib/content-store";
import { formatDate } from "../admin-helpers";

export default async function AdminProjectsPage() {
  const { projects } = await listContent({ includeHidden: true });

  return (
    <section className="cms-content-page">
      <div className="cms-page-head">
        <div>
          <h2>Projects</h2>
          <p className="cms-page-subtitle">
            Create new projects and update existing items from one page.
          </p>
        </div>
        <AddModal title="Add Project" triggerLabel="Add Project">
          <CreateEntityForm
            action={createProjectAction}
            submitLabel="Create Project"
            pendingLabel="Creating project..."
            pendingWithImageLabel="Uploading image and creating project..."
            encType="multipart/form-data"
          >
            <input name="title" placeholder="Title" required />
            <input name="category" placeholder="Category" required />
            <input name="year" type="number" placeholder="Year" required />
            <textarea name="description" rows={4} placeholder="Project description" required />
            <input name="stack" placeholder="Tech stack (comma separated)" />
            <input name="gitRepo" placeholder="Git Repository URL" />
            <input name="liveLink" placeholder="Live Project URL" />
            <label className="cms-checkbox-row">
              <input name="hidden" type="checkbox" />
              <span>Hide this project on website</span>
            </label>
            <ProjectImagesField />
          </CreateEntityForm>
        </AddModal>
      </div>

      <div className="cms-items">
        {projects.length === 0 ? <p className="cms-empty">No projects yet.</p> : null}
        <div className="cms-card-grid">
          {projects.map((item) => (
            <article key={item.id} className="cms-media-card">
              <ImagePreviewTrigger src={item.imageUrl} alt={item.title} />

              <div className="cms-media-body">
                <strong>{item.title}</strong>
                <p>
                  {item.category} - {item.year}
                </p>
                <p>{item.description.slice(0, 90)}{item.description.length > 90 ? "..." : ""}</p>
                <p>{item.stack.length > 0 ? item.stack.join(", ") : "No tech stack added"}</p>
                <p>{item.gitRepo ? "Repo added" : "No repo link"} | {item.liveLink ? "Live link added" : "No live link"}</p>
                <p>{item.hidden ? "Hidden on site" : "Visible on site"}</p>
                <span>{formatDate(item.createdAt)}</span>
              </div>

              <div className="cms-media-actions">
                <AddModal
                  title={`Edit Project: ${item.title}`}
                  triggerLabel="Edit"
                  triggerClassName="btn-secondary"
                >
                  <form action={updateProjectAction} className="cms-form" encType="multipart/form-data">
                    <input type="hidden" name="id" value={item.id} />
                    <input name="title" defaultValue={item.title} required />
                    <input name="category" defaultValue={item.category} required />
                    <input name="year" type="number" defaultValue={item.year} required />
                    <textarea name="description" rows={4} defaultValue={item.description} required />
                    <input name="stack" defaultValue={item.stack.join(", ")} />
                    <input name="gitRepo" defaultValue={item.gitRepo ?? ""} placeholder="Git Repository URL" />
                    <input name="liveLink" defaultValue={item.liveLink ?? ""} placeholder="Live Project URL" />
                    <label className="cms-checkbox-row">
                      <input name="hidden" type="checkbox" defaultChecked={item.hidden} />
                      <span>Hide this project on website</span>
                    </label>
                    <ProjectImagesField
                      initialImages={item.images}
                      initialMainImageUrl={item.mainImageUrl}
                    />
                    <button type="submit" className="btn-primary">
                      Save Changes
                    </button>
                  </form>
                </AddModal>

                <form action={deleteProjectAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <ConfirmSubmitButton
                    label="Delete"
                    confirmMessage="Delete this project? This also removes project images from Cloudinary."
                  />
                </form>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
