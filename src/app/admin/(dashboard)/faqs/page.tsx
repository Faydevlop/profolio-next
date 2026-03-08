import AddModal from "@/components/admin/add-modal";
import CreateEntityForm from "@/components/admin/create-entity-form";
import { createFaqAction, deleteFaqAction, updateFaqAction } from "@/app/admin/actions";
import { listContent } from "@/lib/content-store";
import { formatDate } from "../admin-helpers";

export default async function AdminFaqsPage() {
  const { faqs } = await listContent({ includeHidden: true });

  return (
    <section className="cms-content-page">
      <div className="cms-page-head">
        <div>
          <h2>FAQ</h2>
          <p className="cms-page-subtitle">Control questions, answers, and display order.</p>
        </div>
        <AddModal title="Add FAQ" triggerLabel="Add FAQ">
          <CreateEntityForm
            action={createFaqAction}
            submitLabel="Create FAQ"
            pendingLabel="Creating FAQ..."
          >
            <input name="sortOrder" type="number" placeholder="Order" defaultValue={0} />
            <input name="question" placeholder="Question" required />
            <textarea name="answer" rows={4} placeholder="Answer" required />
            <label className="cms-checkbox-row">
              <input name="hidden" type="checkbox" />
              <span>Hide this FAQ on website</span>
            </label>
          </CreateEntityForm>
        </AddModal>
      </div>

      <div className="cms-items">
        {faqs.length === 0 ? <p className="cms-empty">No FAQ items yet.</p> : null}
        {faqs.map((item) => (
          <details key={item.id} className="cms-item">
            <summary className="cms-item-summary">
              <div>
                <strong>
                  {item.sortOrder}. {item.question}
                </strong>
                <p>{item.answer.slice(0, 85)}{item.answer.length > 85 ? "..." : ""}</p>
                <p>{item.hidden ? "Hidden on site" : "Visible on site"}</p>
              </div>
              <span>{formatDate(item.createdAt)}</span>
            </summary>
            <div className="cms-item-body">
              <form action={updateFaqAction} className="cms-form">
                <input type="hidden" name="id" value={item.id} />
                <input name="sortOrder" type="number" defaultValue={item.sortOrder} required />
                <input name="question" defaultValue={item.question} required />
                <textarea name="answer" rows={4} defaultValue={item.answer} required />
                <label className="cms-checkbox-row">
                  <input name="hidden" type="checkbox" defaultChecked={item.hidden} />
                  <span>Hide this FAQ on website</span>
                </label>
                <button type="submit" className="btn-primary">
                  Update
                </button>
              </form>
              <form action={deleteFaqAction}>
                <input type="hidden" name="id" value={item.id} />
                <button type="submit" className="btn-danger">
                  Delete
                </button>
              </form>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
