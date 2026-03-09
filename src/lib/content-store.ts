import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/mongodb";

export type ProjectItem = {
  id: string;
  title: string;
  category: string;
  year: number;
  description: string;
  stack: string[];
  images: string[];
  mainImageUrl: string | null;
  gitRepo: string | null;
  liveLink: string | null;
  hidden: boolean;
  imageUrl: string | null;
  createdAt: string;
};

export type ServiceItem = {
  id: string;
  sortOrder: number;
  title: string;
  description: string;
  imageUrl: string | null;
  hidden: boolean;
  createdAt: string;
};

export type BlogItem = {
  id: string;
  title: string;
  excerpt: string;
  meta: string;
  content: string | null;
  imageUrl: string | null;
  hidden: boolean;
  createdAt: string;
};

export type ReviewItem = {
  id: string;
  name: string;
  role: string;
  quote: string;
  imageUrl: string | null;
  hidden: boolean;
  createdAt: string;
};

export type FaqItem = {
  id: string;
  sortOrder: number;
  question: string;
  answer: string;
  hidden: boolean;
  createdAt: string;
};

export type EnquiryStatus = "NEW" | "IN_PROGRESS" | "RESOLVED";

export type EnquiryItem = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: EnquiryStatus;
  createdAt: string;
};

type StoreResult = {
  projects: ProjectItem[];
  services: ServiceItem[];
  blogs: BlogItem[];
  reviews: ReviewItem[];
  faqs: FaqItem[];
  enquiries: EnquiryItem[];
};

export type SectionVisibility = {
  hero: boolean;
  projects: boolean;
  services: boolean;
  blogs: boolean;
  reviews: boolean;
  faqs: boolean;
};

type SectionVisibilityDoc = {
  _id: "section_visibility";
  hero: boolean;
  projects: boolean;
  services: boolean;
  blogs: boolean;
  reviews: boolean;
  faqs: boolean;
  updatedAt?: Date;
};

export type HeroContent = {
  name: string;
  locationLine: string;
  roleLine: string;
  availabilityLine: string;
  introText: string;
  contactEmail: string;
  contactPhone: string;
  contactLocation: string;
  socialInstagram: string;
  socialDribbble: string;
  socialBehance: string;
  socialLinkedIn: string;
  heroImageUrl: string | null;
};

type HeroContentDoc = {
  _id: "hero_content";
  name: string;
  locationLine: string;
  roleLine: string;
  availabilityLine: string;
  introText: string;
  contactEmail: string;
  contactPhone: string;
  contactLocation: string;
  socialInstagram: string;
  socialDribbble: string;
  socialBehance: string;
  socialLinkedIn: string;
  heroImageUrl: string | null;
  updatedAt?: Date;
};

const emptyStore: StoreResult = {
  projects: [],
  services: [],
  blogs: [],
  reviews: [],
  faqs: [],
  enquiries: [],
};

const defaultSectionVisibility: SectionVisibility = {
  hero: true,
  projects: true,
  services: true,
  blogs: true,
  reviews: true,
  faqs: true,
};

const defaultHeroContent: HeroContent = {
  name: "FAYIS NAM",
  locationLine: "Based in New York",
  roleLine: "UI Designer & Art Director",
  availabilityLine: "Available for projects",
  introText:
    "A visionary Art Director from New York, showcases a portfolio of visually stunning campaigns that blend artistry and innovation.",
  contactEmail: "fayis@gmail.com",
  contactPhone: "+1 123 456 7890",
  contactLocation: "New York, US",
  socialInstagram: "https://instagram.com",
  socialDribbble: "https://dribbble.com",
  socialBehance: "https://behance.net",
  socialLinkedIn: "https://linkedin.com",
  heroImageUrl: null,
};

type RawDoc = {
  _id: ObjectId;
  [key: string]: unknown;
};

function toObjectId(id: string) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  return new ObjectId(id);
}

function toIso(input: Date | string | undefined) {
  if (input instanceof Date) {
    return input.toISOString();
  }

  if (typeof input === "string") {
    return input;
  }

  return new Date().toISOString();
}

function toBool(input: unknown, fallback = false) {
  if (typeof input === "boolean") {
    return input;
  }

  if (typeof input === "string") {
    return input.toLowerCase() === "true";
  }

  if (typeof input === "number") {
    return input === 1;
  }

  return fallback;
}

function normalizeSectionVisibility(input: Partial<Record<keyof SectionVisibility, unknown>>): SectionVisibility {
  return {
    hero: toBool(input.hero, defaultSectionVisibility.hero),
    projects: toBool(input.projects, defaultSectionVisibility.projects),
    services: toBool(input.services, defaultSectionVisibility.services),
    blogs: toBool(input.blogs, defaultSectionVisibility.blogs),
    reviews: toBool(input.reviews, defaultSectionVisibility.reviews),
    faqs: toBool(input.faqs, defaultSectionVisibility.faqs),
  };
}

function mapHeroContent(input: Partial<Record<keyof HeroContent, unknown>>): HeroContent {
  return {
    name: String(input.name ?? defaultHeroContent.name),
    locationLine: String(input.locationLine ?? defaultHeroContent.locationLine),
    roleLine: String(input.roleLine ?? defaultHeroContent.roleLine),
    availabilityLine: String(input.availabilityLine ?? defaultHeroContent.availabilityLine),
    introText: String(input.introText ?? defaultHeroContent.introText),
    contactEmail: String(input.contactEmail ?? defaultHeroContent.contactEmail),
    contactPhone: String(input.contactPhone ?? defaultHeroContent.contactPhone),
    contactLocation: String(input.contactLocation ?? defaultHeroContent.contactLocation),
    socialInstagram: String(input.socialInstagram ?? defaultHeroContent.socialInstagram),
    socialDribbble: String(input.socialDribbble ?? defaultHeroContent.socialDribbble),
    socialBehance: String(input.socialBehance ?? defaultHeroContent.socialBehance),
    socialLinkedIn: String(input.socialLinkedIn ?? defaultHeroContent.socialLinkedIn),
    heroImageUrl: input.heroImageUrl ? String(input.heroImageUrl) : defaultHeroContent.heroImageUrl,
  };
}

function mapProjectItem(item: RawDoc): ProjectItem {
  const rawImages = Array.isArray(item.images)
    ? item.images
      .map((value) => String(value ?? "").trim())
      .filter((value) => value.length > 0)
    : [];
  const legacyImageUrl = item.imageUrl ? String(item.imageUrl) : "";
  const mainImageValue = item.mainImageUrl ? String(item.mainImageUrl) : "";
  const images = rawImages.length > 0 ? rawImages : legacyImageUrl ? [legacyImageUrl] : [];
  const mainImageUrl = mainImageValue || legacyImageUrl || images[0] || null;

  return {
    id: String(item._id),
    title: String(item.title ?? ""),
    category: String(item.category ?? ""),
    year: Number(item.year ?? 0),
    description: String(item.description ?? ""),
    stack: Array.isArray(item.stack)
      ? item.stack
        .map((value) => String(value ?? "").trim())
        .filter((value) => value.length > 0)
      : [],
    images,
    mainImageUrl,
    gitRepo: item.gitRepo ? String(item.gitRepo) : null,
    liveLink: item.liveLink ? String(item.liveLink) : null,
    hidden: toBool(item.hidden, false),
    imageUrl: mainImageUrl,
    createdAt: toIso(item.createdAt as Date | string | undefined),
  };
}

function mapServiceItem(item: RawDoc): ServiceItem {
  return {
    id: String(item._id),
    sortOrder: Number(item.sortOrder ?? 0),
    title: String(item.title ?? ""),
    description: String(item.description ?? ""),
    imageUrl: item.imageUrl ? String(item.imageUrl) : null,
    hidden: toBool(item.hidden, false),
    createdAt: toIso(item.createdAt as Date | string | undefined),
  };
}

function mapBlogItem(item: RawDoc): BlogItem {
  return {
    id: String(item._id),
    title: String(item.title ?? ""),
    excerpt: String(item.excerpt ?? ""),
    meta: String(item.meta ?? ""),
    content: item.content ? String(item.content) : null,
    imageUrl: item.imageUrl ? String(item.imageUrl) : null,
    hidden: toBool(item.hidden, false),
    createdAt: toIso(item.createdAt as Date | string | undefined),
  };
}

function mapReviewItem(item: RawDoc): ReviewItem {
  return {
    id: String(item._id),
    name: String(item.name ?? ""),
    role: String(item.role ?? ""),
    quote: String(item.quote ?? ""),
    imageUrl: item.imageUrl ? String(item.imageUrl) : null,
    hidden: toBool(item.hidden, false),
    createdAt: toIso(item.createdAt as Date | string | undefined),
  };
}

function mapFaqItem(item: RawDoc): FaqItem {
  return {
    id: String(item._id),
    sortOrder: Number(item.sortOrder ?? 0),
    question: String(item.question ?? ""),
    answer: String(item.answer ?? ""),
    hidden: toBool(item.hidden, false),
    createdAt: toIso(item.createdAt as Date | string | undefined),
  };
}

function mapEnquiryItem(item: RawDoc): EnquiryItem {
  return {
    id: String(item._id),
    name: String(item.name ?? ""),
    email: String(item.email ?? ""),
    phone: item.phone ? String(item.phone) : null,
    subject: item.subject ? String(item.subject) : null,
    message: String(item.message ?? ""),
    status: String(item.status ?? "NEW") as EnquiryStatus,
    createdAt: toIso(item.createdAt as Date | string | undefined),
  };
}

export async function listContent(options: { includeHidden?: boolean } = {}): Promise<StoreResult> {
  const includeHidden = options.includeHidden ?? false;

  try {
    const db = await getDatabase();
    if (!db) return emptyStore;

    const [projectsRaw, servicesRaw, blogsRaw, reviewsRaw, faqsRaw, enquiriesRaw] = await Promise.all([
      db.collection("projects").find().sort({ createdAt: -1 }).toArray(),
      db.collection("services").find().sort({ sortOrder: 1, createdAt: -1 }).toArray(),
      db.collection("blogs").find().sort({ createdAt: -1 }).toArray(),
      db.collection("reviews").find().sort({ createdAt: -1 }).toArray(),
      db.collection("faqs").find().sort({ sortOrder: 1, createdAt: -1 }).toArray(),
      db.collection("enquiries").find().sort({ createdAt: -1 }).toArray(),
    ]);

    const projects = projectsRaw.map((item) => mapProjectItem(item as unknown as RawDoc));
    const services = servicesRaw.map((item) => mapServiceItem(item as unknown as RawDoc));
    const blogs = blogsRaw.map((item) => mapBlogItem(item as unknown as RawDoc));
    const reviews = reviewsRaw.map((item) => mapReviewItem(item as unknown as RawDoc));
    const faqs = faqsRaw.map((item) => mapFaqItem(item as unknown as RawDoc));

    return {
      projects: includeHidden ? projects : projects.filter((item) => !item.hidden),
      services: includeHidden ? services : services.filter((item) => !item.hidden),
      blogs: includeHidden ? blogs : blogs.filter((item) => !item.hidden),
      reviews: includeHidden ? reviews : reviews.filter((item) => !item.hidden),
      faqs: includeHidden ? faqs : faqs.filter((item) => !item.hidden),
      enquiries: enquiriesRaw.map((item) => mapEnquiryItem(item as unknown as RawDoc)),
    };
  } catch {
    return emptyStore;
  }
}

export async function getSectionVisibility() {
  try {
    const db = await getDatabase();
    if (!db) return defaultSectionVisibility;
    const settings = await db.collection<SectionVisibilityDoc>("settings").findOne({ _id: "section_visibility" });
    if (!settings) {
      return defaultSectionVisibility;
    }

    return normalizeSectionVisibility(settings as Partial<Record<keyof SectionVisibility, unknown>>);
  } catch {
    return defaultSectionVisibility;
  }
}

export async function updateSectionVisibility(input: SectionVisibility) {
  const db = await getDatabase();
  if (!db) return;

  await db.collection<SectionVisibilityDoc>("settings").updateOne(
    { _id: "section_visibility" },
    {
      $set: {
        ...input,
        updatedAt: new Date(),
      },
    },
    { upsert: true },
  );
}

export async function getHeroContent() {
  try {
    const db = await getDatabase();
    if (!db) return defaultHeroContent;
    const settings = await db.collection<HeroContentDoc>("settings").findOne({ _id: "hero_content" });
    if (!settings) {
      return defaultHeroContent;
    }

    return mapHeroContent(settings as Partial<Record<keyof HeroContent, unknown>>);
  } catch {
    return defaultHeroContent;
  }
}

export async function updateHeroContent(input: HeroContent) {
  const db = await getDatabase();
  if (!db) return;
  const normalized = mapHeroContent(input as Partial<Record<keyof HeroContent, unknown>>);

  await db.collection<HeroContentDoc>("settings").updateOne(
    { _id: "hero_content" },
    {
      $set: {
        ...normalized,
        updatedAt: new Date(),
      },
    },
    { upsert: true },
  );
}

export async function getProjectById(id: string) {
  const db = await getDatabase();
  if (!db) return null;
  const objectId = toObjectId(id);
  if (!objectId) return null;

  const item = await db.collection("projects").findOne({ _id: objectId });
  if (!item) return null;

  return mapProjectItem(item as unknown as RawDoc);
}

export type ProjectInput = Omit<ProjectItem, "id" | "createdAt">;

export async function addProject(input: ProjectInput) {
  const db = await getDatabase();
  if (!db) return;
  await db.collection("projects").insertOne({
    ...input,
    createdAt: new Date(),
  });
}

export async function updateProject(id: string, input: ProjectInput) {
  const db = await getDatabase();
  if (!db) return;
  const objectId = toObjectId(id);
  if (!objectId) return;

  await db.collection("projects").updateOne(
    { _id: objectId },
    {
      $set: {
        ...input,
      },
    },
  );
}

export async function deleteProject(id: string) {
  const db = await getDatabase();
  if (!db) return;
  const objectId = toObjectId(id);
  if (!objectId) return;
  await db.collection("projects").deleteOne({ _id: objectId });
}

export async function addService(input: Omit<ServiceItem, "id" | "createdAt">) {
  const db = await getDatabase();
  if (!db) return;
  await db.collection("services").insertOne({
    ...input,
    createdAt: new Date(),
  });
}

export async function getServiceById(id: string) {
  const db = await getDatabase();
  if (!db) return null;
  const objectId = toObjectId(id);
  if (!objectId) return null;

  const item = await db.collection("services").findOne({ _id: objectId });
  if (!item) return null;

  return mapServiceItem(item as unknown as RawDoc);
}

export async function updateService(id: string, input: Omit<ServiceItem, "id" | "createdAt">) {
  const db = await getDatabase();
  if (!db) return;
  const objectId = toObjectId(id);
  if (!objectId) return;

  await db.collection("services").updateOne(
    { _id: objectId },
    {
      $set: {
        ...input,
      },
    },
  );
}

export async function deleteService(id: string) {
  const db = await getDatabase();
  if (!db) return;
  const objectId = toObjectId(id);
  if (!objectId) return;
  await db.collection("services").deleteOne({ _id: objectId });
}

export async function addBlog(input: Omit<BlogItem, "id" | "createdAt">) {
  const db = await getDatabase();
  if (!db) return;
  await db.collection("blogs").insertOne({
    ...input,
    createdAt: new Date(),
  });
}

export async function getBlogById(id: string) {
  const db = await getDatabase();
  if (!db) return null;
  const objectId = toObjectId(id);
  if (!objectId) return null;

  const item = await db.collection("blogs").findOne({ _id: objectId });
  if (!item) return null;

  return mapBlogItem(item as unknown as RawDoc);
}

export async function updateBlog(id: string, input: Omit<BlogItem, "id" | "createdAt">) {
  const db = await getDatabase();
  if (!db) return;
  const objectId = toObjectId(id);
  if (!objectId) return;

  await db.collection("blogs").updateOne(
    { _id: objectId },
    {
      $set: {
        ...input,
      },
    },
  );
}

export async function deleteBlog(id: string) {
  const db = await getDatabase();
  if (!db) return;
  const objectId = toObjectId(id);
  if (!objectId) return;
  await db.collection("blogs").deleteOne({ _id: objectId });
}

export async function addReview(input: Omit<ReviewItem, "id" | "createdAt">) {
  const db = await getDatabase();
  if (!db) return;
  await db.collection("reviews").insertOne({
    ...input,
    createdAt: new Date(),
  });
}

export async function getReviewById(id: string) {
  const db = await getDatabase();
  if (!db) return null;
  const objectId = toObjectId(id);
  if (!objectId) return null;

  const item = await db.collection("reviews").findOne({ _id: objectId });
  if (!item) return null;

  return mapReviewItem(item as unknown as RawDoc);
}

export async function updateReview(id: string, input: Omit<ReviewItem, "id" | "createdAt">) {
  const db = await getDatabase();
  if (!db) return;
  const objectId = toObjectId(id);
  if (!objectId) return;

  await db.collection("reviews").updateOne(
    { _id: objectId },
    {
      $set: {
        ...input,
      },
    },
  );
}

export async function deleteReview(id: string) {
  const db = await getDatabase();
  if (!db) return;
  const objectId = toObjectId(id);
  if (!objectId) return;
  await db.collection("reviews").deleteOne({ _id: objectId });
}

export async function addFaq(input: Omit<FaqItem, "id" | "createdAt">) {
  const db = await getDatabase();
  if (!db) return;
  await db.collection("faqs").insertOne({
    ...input,
    createdAt: new Date(),
  });
}

export async function updateFaq(id: string, input: Omit<FaqItem, "id" | "createdAt">) {
  const db = await getDatabase();
  if (!db) return;
  const objectId = toObjectId(id);
  if (!objectId) return;

  await db.collection("faqs").updateOne(
    { _id: objectId },
    {
      $set: {
        ...input,
      },
    },
  );
}

export async function deleteFaq(id: string) {
  const db = await getDatabase();
  if (!db) return;
  const objectId = toObjectId(id);
  if (!objectId) return;
  await db.collection("faqs").deleteOne({ _id: objectId });
}

export async function addEnquiry(input: Omit<EnquiryItem, "id" | "createdAt" | "status">) {
  const db = await getDatabase();
  if (!db) return;
  await db.collection("enquiries").insertOne({
    ...input,
    status: "NEW",
    createdAt: new Date(),
  });
}

export async function updateEnquiryStatus(id: string, status: EnquiryStatus) {
  const db = await getDatabase();
  if (!db) return;
  const objectId = toObjectId(id);
  if (!objectId) return;
  await db.collection("enquiries").updateOne(
    { _id: objectId },
    {
      $set: {
        status,
      },
    },
  );
}

export async function deleteEnquiry(id: string) {
  const db = await getDatabase();
  if (!db) return;
  const objectId = toObjectId(id);
  if (!objectId) return;
  await db.collection("enquiries").deleteOne({ _id: objectId });
}
