type WorkItem = {
  title: string;
  category: string;
  year: string;
};

type ServiceItem = {
  index: string;
  title: string;
  description: string;
};

type ReviewItem = {
  name: string;
  role: string;
  quote: string;
};

type BlogItem = {
  title: string;
  excerpt: string;
  meta: string;
};

const works: WorkItem[] = [
  { title: "Bright Leaf", category: "Branding", year: "2026" },
  { title: "Macbook Mockup", category: "UI Design", year: "2025" },
  { title: "Green App", category: "Product", year: "2026" },
  { title: "Yellow OS", category: "Mobile", year: "2025" },
  { title: "Neon Admin", category: "SaaS", year: "2026" },
  { title: "Craftwork", category: "Campaign", year: "2024" },
];

const services: ServiceItem[] = [
  {
    index: "01",
    title: "Branding Identity",
    description:
      "Positioning, visual language, and art direction for products that need a distinct voice.",
  },
  {
    index: "02",
    title: "Product Design",
    description:
      "Website and app experiences with clear hierarchy, faster flows, and conversion-focused UI.",
  },
  {
    index: "03",
    title: "Web Development",
    description:
      "Next.js websites with reusable components, smooth interactions, and strong performance.",
  },
  {
    index: "04",
    title: "Digital Marketing",
    description:
      "Landing pages and campaign creatives built for measurable growth and better quality leads.",
  },
];

const reviews: ReviewItem[] = [
  {
    name: "Marcus Lee",
    role: "Founder, Orbin",
    quote:
      "The new site instantly improved how clients perceived us. The structure and polish feel premium.",
  },
  {
    name: "Kira Grant",
    role: "Marketing Lead, NeoCom",
    quote:
      "Fast delivery, clean process, and excellent communication from kickoff to launch.",
  },
  {
    name: "Jared Hall",
    role: "CEO, Fluxline",
    quote:
      "Our conversion rate moved up after launch. The design system also made updates much easier.",
  },
  {
    name: "Emil Rowe",
    role: "Product Manager, Avra",
    quote:
      "Exactly the direction we wanted: minimal, sharp, and deeply practical for a growing team.",
  },
];

const blogItems: BlogItem[] = [
  {
    title: "Designing for speed without losing personality",
    excerpt:
      "A practical framework for balancing aesthetics, performance, and project constraints.",
    meta: "Design - 7 min read",
  },
  {
    title: "How I structure scalable Next.js portfolios",
    excerpt:
      "From sections to components to content strategy, a reusable setup for client projects.",
    meta: "Development - 9 min read",
  },
  {
    title: "Art direction cues that elevate product pages",
    excerpt:
      "Simple visual decisions that create depth, trust, and stronger conversion moments.",
    meta: "Branding - 6 min read",
  },
];

function ImageSlot({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <div className={`image-slot ${className ?? ""}`}>
      <span>{label}</span>
    </div>
  );
}

export default function Home() {
  return (
    <main className="portfolio">
      <div className="page-shell">
        <header className="topbar">
          <p className="brand">Miller.S</p>
          <nav aria-label="Primary">
            <a href="#work">Work</a>
            <a href="#services">Services</a>
            <a href="#reviews">Reviews</a>
            <a href="#blog">Blog</a>
          </nav>
          <a className="talk-btn" href="#contact">
            Let&apos;s talk
          </a>
        </header>

        <section className="hero" id="home">
          <h1 className="hero-name">Miller Smith</h1>
          <div className="hero-meta">
            <p>Based in New York</p>
            <p>UI Designer &amp; Art Director</p>
            <p>Available for projects</p>
          </div>
          <p className="hero-intro">
            [A visionary Art Director from New York, showcases a portfolio of
            visually stunning campaigns that blend artistry and innovation]
          </p>
          <ImageSlot label="Portrait Image Placeholder" className="portrait-slot" />
        </section>

        <section className="section-block" id="work">
          <div className="section-head">
            <h2>Selected Works</h2>
            <p>Selected projects spanning branding, digital products, and campaigns.</p>
          </div>
          <div className="work-grid">
            {works.map((work) => (
              <article className="work-card" key={work.title}>
                <ImageSlot label="Project Image Placeholder" className="work-slot" />
                <div className="card-meta">
                  <h3>{work.title}</h3>
                  <p>
                    {work.category} - {work.year}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section-block services-block" id="services">
          <div className="section-head">
            <h2>Best Services</h2>
            <p>End-to-end creative and development support for high-growth brands.</p>
          </div>
          <div className="service-list">
            {services.map((service) => (
              <article className="service-row" key={service.title}>
                <p className="service-index">{service.index}</p>
                <div className="service-copy">
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </div>
                <div className="service-thumbs">
                  <ImageSlot label="Image" className="thumb-slot" />
                  <ImageSlot label="Image" className="thumb-slot" />
                  <ImageSlot label="Image" className="thumb-slot" />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="partners-block">
          <div className="partner-copy">
            <h2>120+ Trusted Partners</h2>
            <p>
              Teams across SaaS, e-commerce, and startups trust my process to
              ship clear and memorable digital experiences.
            </p>
          </div>
          <div className="logo-grid">
            {Array.from({ length: 8 }).map((_, index) => (
              <div className="logo-item" key={`logo-${index + 1}`}>
                Logo
              </div>
            ))}
          </div>
        </section>

        <section className="section-block" id="reviews">
          <div className="section-head">
            <h2>Clients Reviews</h2>
            <p>Feedback from recent collaborations and shipped projects.</p>
          </div>
          <div className="review-grid">
            {reviews.map((review) => (
              <article className="review-card" key={review.name}>
                <ImageSlot label="Client Image Placeholder" className="review-slot" />
                <p className="quote">{review.quote}</p>
                <div className="review-meta">
                  <h3>{review.name}</h3>
                  <p>{review.role}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="faq-block">
          <div className="faq-copy">
            <h2>FAQ</h2>
            <p>
              Common questions about process, timelines, and what is needed to
              start your project.
            </p>
          </div>
          <div className="faq-list">
            <details open>
              <summary>Can you work with references of our existing designs?</summary>
              <p>
                Yes. I can align with your current brand language, then extend
                it into a cleaner and more scalable system.
              </p>
            </details>
            <details>
              <summary>What is the typical timeline for a portfolio build?</summary>
              <p>Most projects take 2 to 5 weeks depending on scope and content readiness.</p>
            </details>
            <details>
              <summary>Do you offer both design and development?</summary>
              <p>
                Yes. Design, component system, and Next.js implementation can
                be handled in one workflow.
              </p>
            </details>
            <details>
              <summary>What do I need before we begin?</summary>
              <p>
                Brand assets, copy direction, and sample references are enough
                to start the first iteration.
              </p>
            </details>
          </div>
        </section>

        <section className="section-block" id="blog">
          <div className="section-head">
            <h2>Blog &amp; Articles</h2>
            <p>Insights around digital design, strategy, and modern web builds.</p>
          </div>
          <div className="blog-grid">
            {blogItems.map((post) => (
              <article className="blog-card" key={post.title}>
                <ImageSlot label="Blog Image Placeholder" className="blog-slot" />
                <p className="blog-meta">{post.meta}</p>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
              </article>
            ))}
          </div>
        </section>

        <footer className="footer" id="contact">
          <div className="footer-top">
            <p className="footer-cta">
              Have any project ideas in your mind?
              <span>Let&apos;s connect.</span>
            </p>
            <a className="footer-mail" href="mailto:miller@gmail.com">
              miller@gmail.com
            </a>
          </div>

          <div className="footer-links">
            <div>
              <h3>Menu</h3>
              <a href="#home">Home</a>
              <a href="#work">Projects</a>
              <a href="#services">Services</a>
              <a href="#blog">Blog</a>
            </div>
            <div>
              <h3>Social</h3>
              <a href="https://instagram.com" target="_blank" rel="noreferrer">
                Instagram
              </a>
              <a href="https://dribbble.com" target="_blank" rel="noreferrer">
                Dribbble
              </a>
              <a href="https://behance.net" target="_blank" rel="noreferrer">
                Behance
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            </div>
            <div>
              <h3>Contact</h3>
              <a href="mailto:miller@gmail.com">miller@gmail.com</a>
              <a href="tel:+11234567890">+1 123 456 7890</a>
              <span>New York, US</span>
            </div>
          </div>

          <h2 className="footer-name">Miller Smith</h2>
        </footer>
      </div>
    </main>
  );
}
