import { updateHeroContentAction } from "@/app/admin/actions";
import ImageField from "@/components/admin/image-field";
import { getHeroContent } from "@/lib/content-store";

export default async function AdminHeroPage() {
  const hero = await getHeroContent();

  return (
    <section className="cms-content-page">
      <div className="cms-page-head">
        <div>
          <h2>Hero</h2>
          <p className="cms-page-subtitle">Manage homepage hero content and global display name.</p>
        </div>
      </div>

      <div className="cms-items">
        <section className="cms-section">
          <form action={updateHeroContentAction} className="cms-form" encType="multipart/form-data">
            <div className="cms-form-group">
              <h3>Identity</h3>
              <input name="name" defaultValue={hero.name} placeholder="Display Name" required />
              <input name="locationLine" defaultValue={hero.locationLine} placeholder="Location line" required />
              <input name="roleLine" defaultValue={hero.roleLine} placeholder="Role line" required />
              <input
                name="availabilityLine"
                defaultValue={hero.availabilityLine}
                placeholder="Availability line"
                required
              />
              <textarea
                name="introText"
                rows={4}
                defaultValue={hero.introText}
                placeholder="Intro text"
                required
              />
            </div>

            <div className="cms-form-group">
              <h3>Contact Details</h3>
              <input
                type="email"
                name="contactEmail"
                defaultValue={hero.contactEmail}
                placeholder="Contact email"
                required
              />
              <input name="contactPhone" defaultValue={hero.contactPhone} placeholder="Phone number" required />
              <input name="contactLocation" defaultValue={hero.contactLocation} placeholder="Location" required />
            </div>

            <div className="cms-form-group">
              <h3>Social Media Links</h3>
              <input name="socialInstagram" defaultValue={hero.socialInstagram} placeholder="Instagram URL" />
              <input name="socialDribbble" defaultValue={hero.socialDribbble} placeholder="Dribbble URL" />
              <input name="socialBehance" defaultValue={hero.socialBehance} placeholder="Behance URL" />
              <input name="socialLinkedIn" defaultValue={hero.socialLinkedIn} placeholder="LinkedIn URL" />
            </div>

            <div className="cms-form-group">
              <h3>Hero Image</h3>
              <ImageField defaultUrl={hero.heroImageUrl ?? ""} />
            </div>

            <button type="submit" className="btn-primary">
              Save Hero Content
            </button>
          </form>
        </section>
      </div>
    </section>
  );
}
