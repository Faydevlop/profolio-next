import {
  deleteEnquiryAction,
  updateEnquiryStatusAction,
} from "@/app/admin/actions";
import { listContent } from "@/lib/content-store";
import { formatDate } from "../admin-helpers";

export default async function AdminEnquiriesPage() {
  const { enquiries } = await listContent({ includeHidden: true });

  return (
    <section className="cms-content-page">
      <div className="cms-page-head">
        <div>
          <h2>Enquiries</h2>
          <p className="cms-page-subtitle">
            Review incoming leads and update status workflow.
          </p>
        </div>
      </div>

      <div className="cms-items">
        {enquiries.length === 0 ? <p className="cms-empty">No enquiries yet.</p> : null}
        {enquiries.map((item) => (
          <article key={item.id} className="cms-enquiry">
            <div className="cms-enquiry-head">
              <div>
                <strong>{item.name}</strong>
                <p>
                  {item.email}
                  {item.phone ? ` - ${item.phone}` : ""}
                </p>
              </div>
              <span>{formatDate(item.createdAt)}</span>
            </div>
            <p className="cms-enquiry-subject">{item.subject || "No subject"}</p>
            <p className="cms-enquiry-message">{item.message}</p>
            <div className="cms-inline-actions">
              <form action={updateEnquiryStatusAction} className="cms-inline-form">
                <input type="hidden" name="id" value={item.id} />
                <select name="status" defaultValue={item.status}>
                  <option value="NEW">NEW</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                </select>
                <button type="submit" className="btn-secondary">
                  Update Status
                </button>
              </form>
              <form action={deleteEnquiryAction}>
                <input type="hidden" name="id" value={item.id} />
                <button type="submit" className="btn-danger">
                  Delete
                </button>
              </form>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
