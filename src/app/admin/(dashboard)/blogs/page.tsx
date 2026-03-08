import AddModal from "@/components/admin/add-modal";
import CreateEntityForm from "@/components/admin/create-entity-form";
import ImageField from "@/components/admin/image-field";
import ImagePreviewTrigger from "@/components/admin/image-preview-trigger";
import { createBlogAction, deleteBlogAction, updateBlogAction } from "@/app/admin/actions";
import { listContent } from "@/lib/content-store";
import { formatDate } from "../admin-helpers";

export default async function AdminBlogsPage() {
  const { blogs } = await listContent({ includeHidden: true });

  return (
    <section className="cms-content-page">
      <div className="cms-page-head">
        <div>
          <h2>Blogs</h2>
          <p className="cms-page-subtitle">Create and edit blog cards shown in portfolio.</p>
        </div>
        <AddModal title="Add Blog Post" triggerLabel="Add Blog">
          <CreateEntityForm
            action={createBlogAction}
            submitLabel="Create Blog"
            pendingLabel="Creating blog..."
            pendingWithImageLabel="Uploading image and creating blog..."
            encType="multipart/form-data"
          >
            <input name="title" placeholder="Title" required />
            <input name="meta" placeholder="Meta (Design - 7 min read)" required />
            <textarea name="excerpt" rows={3} placeholder="Excerpt" required />
            <textarea name="content" rows={4} placeholder="Content (optional)" />
            <label className="cms-checkbox-row">
              <input name="hidden" type="checkbox" />
              <span>Hide this blog on website</span>
            </label>
            <ImageField />
          </CreateEntityForm>
        </AddModal>
      </div>

      <div className="cms-items">
        {blogs.length === 0 ? <p className="cms-empty">No blogs yet.</p> : null}
        <div className="cms-card-grid">
          {blogs.map((item) => (
            <article key={item.id} className="cms-media-card">
              <ImagePreviewTrigger src={item.imageUrl} alt={item.title} />

              <div className="cms-media-body">
                <strong>{item.title}</strong>
                <p>{item.meta}</p>
                <p>{item.hidden ? "Hidden on site" : "Visible on site"}</p>
                <span>{formatDate(item.createdAt)}</span>
              </div>

              <div className="cms-media-actions">
                <AddModal
                  title={`Edit Blog: ${item.title}`}
                  triggerLabel="Edit"
                  triggerClassName="btn-secondary"
                >
                  <form action={updateBlogAction} className="cms-form" encType="multipart/form-data">
                    <input type="hidden" name="id" value={item.id} />
                    <input name="title" defaultValue={item.title} required />
                    <input name="meta" defaultValue={item.meta} required />
                    <textarea name="excerpt" rows={3} defaultValue={item.excerpt} required />
                    <textarea name="content" rows={5} defaultValue={item.content ?? ""} />
                    <label className="cms-checkbox-row">
                      <input name="hidden" type="checkbox" defaultChecked={item.hidden} />
                      <span>Hide this blog on website</span>
                    </label>
                    <ImageField defaultUrl={item.imageUrl ?? ""} />
                    <button type="submit" className="btn-primary">
                      Save Changes
                    </button>
                  </form>
                </AddModal>

                <form action={deleteBlogAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <button type="submit" className="btn-danger">
                    Delete
                  </button>
                </form>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
