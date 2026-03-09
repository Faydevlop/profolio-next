import { createEnquiryAction } from "@/app/actions/public-actions";
import { getHeroContent, getSectionVisibility, listContent } from "@/lib/content-store";
import TransitionLink from "@/components/transition-link";
import ReviewQuote from "@/components/review-quote";
import { isSetupComplete } from "@/lib/setup";
import SetupWizard from "@/components/setup-wizard";


type PageProps = {
  searchParams: Promise<{ enquiry?: string }>;
};

type MediaSlotProps = {
  className?: string;
  imageUrl?: string | null;
  alt?: string;
};
function MediaSlot({ className, imageUrl, alt }: MediaSlotProps) {
  const slotClassName = `image-slot ${className ?? ""} ${imageUrl ? "has-image" : "is-empty"}`.trim();

  return (
    <div className={slotClassName}>
      {imageUrl ? <img src={imageUrl} alt={alt ?? "Portfolio image"} /> : <span>Image placeholder</span>}
    </div>
  );
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;

  // First-time setup: show wizard if setup not complete
  const setupDone = await isSetupComplete();
  if (!setupDone) {
    return <SetupWizard />;
  }

  const sectionVisibility = await getSectionVisibility();

  const hero = await getHeroContent();
  const { projects: projectsDb, services: servicesDb, blogs: blogsDb, reviews: reviewsDb, faqs: faqsDb } =
    await listContent();

  const projects = projectsDb;
  const services = servicesDb;
  const blogs = blogsDb;
  const reviews = reviewsDb;
  const faqs = faqsDb;

  const siteUrl = process.env.SITE_URL || "http://localhost:3000";

  /* ── JSON-LD: Person + ProfessionalService ── */
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": ["Person", "ProfessionalService"],
    name: hero.name,
    alternateName: "Fayis Namiyath",
    jobTitle: hero.roleLine,
    description: hero.introText,
    url: siteUrl,
    email: hero.contactEmail,
    telephone: hero.contactPhone,
    image: hero.heroImageUrl || undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: hero.contactLocation,
      addressRegion: "Kerala",
      addressCountry: "IN",
    },
    sameAs: [
      hero.socialInstagram,
      hero.socialDribbble,
      hero.socialBehance,
      hero.socialLinkedIn,
    ].filter(Boolean),
    knowsAbout: [
      "Web Development",
      "Web Design",
      "UI/UX Design",
      "React",
      "Next.js",
      "Node.js",
      "Full-Stack Development",
      "JavaScript",
      "TypeScript",
      "MongoDB",
      "Frontend Development",
      "Responsive Design",
    ],
    areaServed: [
      { "@type": "Country", name: "India" },
      { "@type": "State", name: "Kerala" },
    ],
    priceRange: "$$",
  };

  /* ── JSON-LD: WebSite with SearchAction ── */
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: `${hero.name} — Portfolio`,
    alternateName: "Fayis Namiyath Portfolio",
    url: siteUrl,
    description:
      "Professional portfolio of Fayis Namiyath — a top-rated full-stack web developer and UI/UX designer from Kerala, India.",
    author: {
      "@type": "Person",
      name: hero.name,
    },
  };

  /* ── JSON-LD: FAQPage (when FAQs are visible) ── */
  const faqJsonLd =
    sectionVisibility.faqs && faqs.length > 0
      ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      }
      : null;

  /* ── JSON-LD: BreadcrumbList ── */
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
    ],
  };

  return (
    <main className="portfolio">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      {faqJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
          }}
        />
      ) : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <div className="page-shell">
        <header className="topbar">
          <p className="brand">{hero.name}</p>
          <nav aria-label="Primary">
            {sectionVisibility.projects ? <a href="#work">Work</a> : null}
            {sectionVisibility.services ? <a href="#services">Services</a> : null}
            {sectionVisibility.reviews ? <a href="#reviews">Reviews</a> : null}
            {sectionVisibility.blogs ? <a href="#blog">Blog</a> : null}
          </nav>
          <a className="talk-btn" href="#contact">
            Let&apos;s talk
          </a>
        </header>

        {sectionVisibility.hero ? (
          <section className="hero" id="home">
            <h1 className="hero-name">{hero.name}</h1>
            <div className="hero-meta">
              <p>{hero.locationLine}</p>
              <p>{hero.roleLine}</p>
              <p>{hero.availabilityLine}</p>
            </div>
            <p className="hero-intro">{hero.introText}</p>
            <MediaSlot className="portrait-slot" imageUrl={hero.heroImageUrl} alt={hero.name} />
          </section>
        ) : null}

        {sectionVisibility.projects ? (
          <section className="section-block" id="work">
            <div className="section-head">
              <h2>Selected Works</h2>
              <p>Selected projects spanning branding, digital products, and campaigns.</p>
              <TransitionLink className="section-link-btn" href="/projects">
                See all projects
              </TransitionLink>
            </div>
            <div className="work-grid">
              {projects.length === 0 ? <p className="section-empty">No projects added yet.</p> : null}
              {projects.map((work) => (
                <article className="work-card" key={work.id}>
                  <TransitionLink href="/projects">
                    <MediaSlot
                      className="work-slot"
                      imageUrl={work.imageUrl}
                      alt={work.title}
                    />
                  </TransitionLink>
                  <div className="card-meta">
                    <h3>
                      <TransitionLink href="/projects">{work.title}</TransitionLink>
                    </h3>
                    <p>
                      {work.category} - {work.year}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {sectionVisibility.services ? (
          <section className="section-block services-block" id="services">
            <div className="section-head">
              <h2>Best Services</h2>
              <p>End-to-end creative and development support for high-growth brands.</p>
            </div>
            <div className="service-list">
              {services.length === 0 ? <p className="section-empty">No services added yet.</p> : null}
              {services.map((service, idx) => (
                <article className="service-row" key={service.id}>
                  <p className="service-index">{String(service.sortOrder || idx + 1).padStart(2, "0")}</p>
                  <div className="service-copy">
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                  </div>
                  <div className="service-thumbs">
                    <MediaSlot
                      className="thumb-slot"
                      imageUrl={service.imageUrl}
                      alt={service.title}
                    />
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {sectionVisibility.reviews ? (
          <section className="section-block" id="reviews">
            <div className="section-head">
              <h2>Clients Reviews</h2>
              <p>Feedback from recent collaborations and shipped projects.</p>
            </div>
            <div className="review-grid">
              {reviews.length === 0 ? <p className="section-empty">No client reviews added yet.</p> : null}
              {reviews.map((review) => (
                <article className="review-card" key={review.id}>
                  <MediaSlot
                    className="review-slot"
                    imageUrl={review.imageUrl}
                    alt={review.name}
                  />
                  <ReviewQuote text={review.quote} />
                  <div className="review-meta">
                    <h3>{review.name}</h3>
                    <p>{review.role}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {sectionVisibility.faqs ? (
          <section className="faq-block">
            <div className="faq-copy">
              <h2>FAQ</h2>
              <p>Common questions about process, timelines, and what is needed to start your project.</p>
            </div>
            <div className="faq-list">
              {faqs.length === 0 ? <p className="section-empty">No FAQ items added yet.</p> : null}
              {faqs.map((item, index) => (
                <details key={item.id} open={index === 0}>
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </section>
        ) : null}

        {sectionVisibility.blogs ? (
          <section className="section-block" id="blog">
            <div className="section-head">
              <h2>Blog &amp; Articles</h2>
              <p>Insights around digital design, strategy, and modern web builds.</p>
            </div>
            <div className="blog-grid">
              {blogs.length === 0 ? <p className="section-empty">No blog posts added yet.</p> : null}
              {blogs.map((post) => (
                <article className="blog-card" key={post.id}>
                  <MediaSlot
                    className="blog-slot"
                    imageUrl={post.imageUrl}
                    alt={post.title}
                  />
                  <p className="blog-meta">{post.meta}</p>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <footer className="footer" id="contact">
          <div className="footer-top">
            <p className="footer-cta">
              Have any project ideas in your mind?
              <span>Let&apos;s connect.</span>
            </p>
            <a className="footer-mail" href={`mailto:${hero.contactEmail}`}>
              {hero.contactEmail}
            </a>
          </div>

          <form action={createEnquiryAction} className="enquiry-form">
            <h3>Send Enquiry</h3>
            <div className="enquiry-grid">
              <input name="name" placeholder="Your name" required />
              <input name="email" type="email" placeholder="Email" required />
              <input name="phone" placeholder="Phone (optional)" />
              <input name="subject" placeholder="Subject (optional)" />
              <textarea name="message" placeholder="Your message" rows={4} required />
            </div>
            <button type="submit">Send Message</button>
            {params.enquiry === "sent" ? <p className="enquiry-success">Enquiry sent successfully.</p> : null}
            {params.enquiry === "error" ? (
              <p className="enquiry-error">Name, email, and message are required.</p>
            ) : null}
          </form>

          <div className="footer-links">
            <div>
              <h3>Menu</h3>
              <a href="#home">Home</a>
              {sectionVisibility.projects ? <a href="#work">Projects</a> : null}
              {sectionVisibility.services ? <a href="#services">Services</a> : null}
              {sectionVisibility.blogs ? <a href="#blog">Blog</a> : null}
            </div>
            <div>
              <h3>Social</h3>
              {hero.socialInstagram ? (
                <a href={hero.socialInstagram} target="_blank" rel="noreferrer">
                  Instagram
                </a>
              ) : null}
              {hero.socialDribbble ? (
                <a href={hero.socialDribbble} target="_blank" rel="noreferrer">
                  Dribbble
                </a>
              ) : null}
              {hero.socialBehance ? (
                <a href={hero.socialBehance} target="_blank" rel="noreferrer">
                  Behance
                </a>
              ) : null}
              {hero.socialLinkedIn ? (
                <a href={hero.socialLinkedIn} target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
              ) : null}
            </div>
            <div>
              <h3>Contact</h3>
              <a href={`mailto:${hero.contactEmail}`}>{hero.contactEmail}</a>
              <a href={`tel:${hero.contactPhone.replace(/\s+/g, "")}`}>{hero.contactPhone}</a>
              <span>{hero.contactLocation}</span>
            </div>
          </div>

          <h2 className="footer-name">{hero.name}</h2>
        </footer>
      </div>
    </main>
  );
}
