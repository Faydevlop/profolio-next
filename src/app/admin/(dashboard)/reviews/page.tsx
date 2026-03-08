import AddModal from "@/components/admin/add-modal";
import CreateEntityForm from "@/components/admin/create-entity-form";
import ImageField from "@/components/admin/image-field";
import ImagePreviewTrigger from "@/components/admin/image-preview-trigger";
import {
  createReviewAction,
  deleteReviewAction,
  updateReviewAction,
} from "@/app/admin/actions";
import { listContent } from "@/lib/content-store";
import { formatDate } from "../admin-helpers";

export default async function AdminReviewsPage() {
  const { reviews } = await listContent({ includeHidden: true });

  return (
    <section className="cms-content-page">
      <div className="cms-page-head">
        <div>
          <h2>Client Reviews</h2>
          <p className="cms-page-subtitle">Maintain testimonial content and client details.</p>
        </div>
        <AddModal title="Add Client Review" triggerLabel="Add Review">
          <CreateEntityForm
            action={createReviewAction}
            submitLabel="Create Review"
            pendingLabel="Creating review..."
            pendingWithImageLabel="Uploading image and creating review..."
            encType="multipart/form-data"
          >
            <input name="name" placeholder="Client Name" required />
            <input name="role" placeholder="Role" required />
            <textarea name="quote" rows={3} placeholder="Quote" required />
            <label className="cms-checkbox-row">
              <input name="hidden" type="checkbox" />
              <span>Hide this review on website</span>
            </label>
            <ImageField />
          </CreateEntityForm>
        </AddModal>
      </div>

      <div className="cms-items">
        {reviews.length === 0 ? <p className="cms-empty">No reviews yet.</p> : null}
        <div className="cms-card-grid">
          {reviews.map((item) => (
            <article key={item.id} className="cms-media-card">
              <ImagePreviewTrigger src={item.imageUrl} alt={item.name} />

              <div className="cms-media-body">
                <strong>{item.name}</strong>
                <p>{item.role}</p>
                <p>{item.hidden ? "Hidden on site" : "Visible on site"}</p>
                <span>{formatDate(item.createdAt)}</span>
              </div>

              <div className="cms-media-actions">
                <AddModal
                  title={`Edit Review: ${item.name}`}
                  triggerLabel="Edit"
                  triggerClassName="btn-secondary"
                >
                  <form action={updateReviewAction} className="cms-form" encType="multipart/form-data">
                    <input type="hidden" name="id" value={item.id} />
                    <input name="name" defaultValue={item.name} required />
                    <input name="role" defaultValue={item.role} required />
                    <textarea name="quote" rows={4} defaultValue={item.quote} required />
                    <label className="cms-checkbox-row">
                      <input name="hidden" type="checkbox" defaultChecked={item.hidden} />
                      <span>Hide this review on website</span>
                    </label>
                    <ImageField defaultUrl={item.imageUrl ?? ""} />
                    <button type="submit" className="btn-primary">
                      Save Changes
                    </button>
                  </form>
                </AddModal>

                <form action={deleteReviewAction}>
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
