import AddModal from "@/components/admin/add-modal";
import CreateEntityForm from "@/components/admin/create-entity-form";
import ImageField from "@/components/admin/image-field";
import ImagePreviewTrigger from "@/components/admin/image-preview-trigger";
import {
  createServiceAction,
  deleteServiceAction,
  updateServiceAction,
} from "@/app/admin/actions";
import { listContent } from "@/lib/content-store";
import { formatDate } from "../admin-helpers";

export default async function AdminServicesPage() {
  const { services } = await listContent({ includeHidden: true });

  return (
    <section className="cms-content-page">
      <div className="cms-page-head">
        <div>
          <h2>Services</h2>
          <p className="cms-page-subtitle">Manage service list, order, and images.</p>
        </div>
        <AddModal title="Add Service" triggerLabel="Add Service">
          <CreateEntityForm
            action={createServiceAction}
            submitLabel="Create Service"
            pendingLabel="Creating service..."
            pendingWithImageLabel="Uploading image and creating service..."
            encType="multipart/form-data"
          >
            <input name="sortOrder" type="number" placeholder="Order" defaultValue={0} />
            <input name="title" placeholder="Title" required />
            <textarea name="description" rows={3} placeholder="Description" required />
            <label className="cms-checkbox-row">
              <input name="hidden" type="checkbox" />
              <span>Hide this service on website</span>
            </label>
            <ImageField />
          </CreateEntityForm>
        </AddModal>
      </div>

      <div className="cms-items">
        {services.length === 0 ? <p className="cms-empty">No services yet.</p> : null}
        <div className="cms-card-grid">
          {services.map((item) => (
            <article key={item.id} className="cms-media-card">
              <ImagePreviewTrigger src={item.imageUrl} alt={item.title} />

              <div className="cms-media-body">
                <strong>
                  {item.sortOrder}. {item.title}
                </strong>
                <p>{item.description.slice(0, 80)}{item.description.length > 80 ? "..." : ""}</p>
                <p>{item.hidden ? "Hidden on site" : "Visible on site"}</p>
                <span>{formatDate(item.createdAt)}</span>
              </div>

              <div className="cms-media-actions">
                <AddModal
                  title={`Edit Service: ${item.title}`}
                  triggerLabel="Edit"
                  triggerClassName="btn-secondary"
                >
                  <form action={updateServiceAction} className="cms-form" encType="multipart/form-data">
                    <input type="hidden" name="id" value={item.id} />
                    <input name="sortOrder" type="number" defaultValue={item.sortOrder} required />
                    <input name="title" defaultValue={item.title} required />
                    <textarea name="description" rows={4} defaultValue={item.description} required />
                    <label className="cms-checkbox-row">
                      <input name="hidden" type="checkbox" defaultChecked={item.hidden} />
                      <span>Hide this service on website</span>
                    </label>
                    <ImageField defaultUrl={item.imageUrl ?? ""} />
                    <button type="submit" className="btn-primary">
                      Save Changes
                    </button>
                  </form>
                </AddModal>

                <form action={deleteServiceAction}>
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
