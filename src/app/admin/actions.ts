"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  clearAdminSession,
  createAdminSession,
  getAdminSession,
  isValidAdminCredentials,
  requireAdminSession,
} from "@/lib/auth";
import { deleteImageFromCloudinaryByUrl, uploadImageToCloudinary } from "@/lib/cloudinary";
import {
  addBlog,
  addFaq,
  addProject,
  addReview,
  addService,
  deleteBlog,
  deleteEnquiry,
  deleteFaq,
  deleteProject,
  deleteReview,
  deleteService,
  getBlogById,
  getHeroContent,
  getProjectById,
  getReviewById,
  getServiceById,
  type HeroContent,
  type EnquiryStatus,
  type SectionVisibility,
  updateHeroContent,
  updateSectionVisibility,
  updateBlog,
  updateEnquiryStatus,
  updateFaq,
  updateProject,
  updateReview,
  updateService,
} from "@/lib/content-store";
import { type CreateActionState } from "./action-state";

function revalidateAdminPages() {
  const paths = [
    "/",
    "/projects",
    "/admin",
    "/admin/projects",
    "/admin/hero",
    "/admin/services",
    "/admin/blogs",
    "/admin/reviews",
    "/admin/faqs",
    "/admin/enquiries",
  ];

  for (const path of paths) {
    revalidatePath(path);
  }
}

function successState(status: string, details: string[]): CreateActionState {
  return {
    ok: true,
    status,
    details,
    timestamp: Date.now(),
  };
}

function errorState(status: string, details: string[]): CreateActionState {
  return {
    ok: false,
    status,
    details,
    timestamp: Date.now(),
  };
}

function parseErrorMessage(error: unknown) {
  if (typeof error === "string" && error.trim()) {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const maybeError = error as {
      message?: unknown;
      digest?: unknown;
      cause?: unknown;
    };

    if (typeof maybeError.message === "string" && maybeError.message.trim()) {
      return maybeError.message;
    }

    if (typeof maybeError.digest === "string" && maybeError.digest.includes("NEXT_REDIRECT")) {
      return "Session expired. Please login again.";
    }

    if (maybeError.cause instanceof Error) {
      return maybeError.cause.message;
    }
  }

  return "Unexpected error";
}

async function ensureCreateSessionState() {
  const session = await getAdminSession();

  if (!session) {
    return errorState("Session expired.", ["Please login again and retry this action."]);
  }

  return null;
}

type UploadCandidate = {
  arrayBuffer: () => Promise<ArrayBuffer>;
  size: number;
};

function toUploadCandidate(value: FormDataEntryValue | null): UploadCandidate | null {
  if (!value || typeof value === "string") {
    return null;
  }

  const maybeFile = value as Partial<UploadCandidate>;
  if (typeof maybeFile.arrayBuffer !== "function") {
    return null;
  }

  const size = typeof maybeFile.size === "number" ? maybeFile.size : Number(maybeFile.size ?? 0);
  if (!Number.isFinite(size) || size <= 0) {
    return null;
  }

  return {
    arrayBuffer: maybeFile.arrayBuffer.bind(value),
    size,
  };
}

async function cleanupCloudinaryImage(imageUrl: string | null) {
  if (!imageUrl) {
    return;
  }

  try {
    await deleteImageFromCloudinaryByUrl(imageUrl);
  } catch {
    // Ignore cleanup errors to avoid blocking content updates/deletes.
  }
}

function uniqueStrings(values: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const normalized = value.trim();
    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    result.push(normalized);
  }

  return result;
}

function parseJsonStringArray(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return uniqueStrings(parsed.map((item) => String(item ?? "")));
  } catch {
    return [];
  }
}

function parseStackInput(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return [];
  }

  return uniqueStrings(value.split(/[\n,]/g));
}

function parseCheckboxInput(formData: FormData, name: string) {
  return formData.get(name) === "on";
}

function listProjectImageUrls(project: {
  imageUrl?: string | null;
  mainImageUrl?: string | null;
  images?: string[];
}) {
  return uniqueStrings([
    ...(Array.isArray(project.images) ? project.images : []),
    project.mainImageUrl ?? "",
    project.imageUrl ?? "",
  ]);
}

async function resolveProjectImagesInput(formData: FormData) {
  const existingImages = parseJsonStringArray(formData.get("existingProjectImages"));
  const addedImageUrls = parseJsonStringArray(formData.get("addedProjectImageUrls"));

  const uploadCandidates = formData
    .getAll("projectImageFiles")
    .map((item) => toUploadCandidate(item))
    .filter((item): item is UploadCandidate => item !== null);

  const uploadedUrls =
    uploadCandidates.length > 0
      ? await Promise.all(uploadCandidates.map((file) => uploadImageToCloudinary(file)))
      : [];

  const images = uniqueStrings([...existingImages, ...addedImageUrls, ...uploadedUrls]);
  const mainCandidate = String(formData.get("mainImageCandidate") ?? "").trim();

  let mainImageUrl: string | null = null;
  if (mainCandidate.startsWith("existing:")) {
    const index = Number(mainCandidate.replace("existing:", ""));
    mainImageUrl = Number.isInteger(index) ? existingImages[index] ?? null : null;
  } else if (mainCandidate.startsWith("url:")) {
    const index = Number(mainCandidate.replace("url:", ""));
    mainImageUrl = Number.isInteger(index) ? addedImageUrls[index] ?? null : null;
  } else if (mainCandidate.startsWith("file:")) {
    const index = Number(mainCandidate.replace("file:", ""));
    mainImageUrl = Number.isInteger(index) ? uploadedUrls[index] ?? null : null;
  } else if (images.includes(mainCandidate)) {
    mainImageUrl = mainCandidate;
  }

  if (!mainImageUrl) {
    mainImageUrl = images[0] ?? null;
  }

  return {
    images,
    mainImageUrl,
    uploadedCount: uploadedUrls.length,
    addedUrlCount: addedImageUrls.length,
  };
}

async function resolveImageInput(formData: FormData) {
  const imageFile = toUploadCandidate(formData.get("imageFile"));
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();

  if (imageFile) {
    const uploadedUrl = await uploadImageToCloudinary(imageFile);

    return {
      imageUrl: uploadedUrl,
      source: "uploaded" as const,
    };
  }

  if (imageUrl) {
    return {
      imageUrl,
      source: "url" as const,
    };
  }

  return {
    imageUrl: null,
    source: "none" as const,
  };
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "").trim();

  if (!isValidAdminCredentials(email, password)) {
    redirect("/admin/login?error=invalid");
  }

  await createAdminSession(email);
  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function createProjectAction(
  _prevState: CreateActionState,
  formData: FormData,
): Promise<CreateActionState> {
  try {
    const sessionError = await ensureCreateSessionState();
    if (sessionError) {
      return sessionError;
    }

    const title = String(formData.get("title") ?? "").trim();
    const category = String(formData.get("category") ?? "").trim();
    const year = Number(String(formData.get("year") ?? "").trim() || "0");
    const description = String(formData.get("description") ?? "").trim();
    const stack = parseStackInput(formData.get("stack"));
    const gitRepo = String(formData.get("gitRepo") ?? "").trim();
    const liveLink = String(formData.get("liveLink") ?? "").trim();
    const hidden = parseCheckboxInput(formData, "hidden");
    const projectImages = await resolveProjectImagesInput(formData);

    if (!title || !category || year <= 0 || !description) {
      return errorState("Could not create project.", [
        "Title, category, year, and description are required.",
      ]);
    }

    await addProject({
      title,
      category,
      year,
      description,
      stack,
      images: projectImages.images,
      mainImageUrl: projectImages.mainImageUrl,
      gitRepo: gitRepo || null,
      liveLink: liveLink || null,
      hidden,
      imageUrl: projectImages.mainImageUrl,
    });

    const details: string[] = [];
    if (projectImages.uploadedCount > 0) {
      details.push(`${projectImages.uploadedCount} image(s) uploaded to Cloudinary.`);
    }
    if (projectImages.addedUrlCount > 0) {
      details.push(`${projectImages.addedUrlCount} image URL(s) attached.`);
    }
    if (projectImages.mainImageUrl) {
      details.push("Main image selected.");
    }
    details.push("Project created successfully.");

    revalidateAdminPages();
    return successState("Project created.", details);
  } catch (error) {
    return errorState("Could not create project.", [parseErrorMessage(error)]);
  }
}

export async function deleteProjectAction(formData: FormData) {
  await requireAdminSession();
  const id = String(formData.get("id") ?? "");

  if (!id) return;

  const existing = await getProjectById(id);
  const imagesToDelete = existing ? listProjectImageUrls(existing) : [];

  await deleteProject(id);

  for (const imageUrl of imagesToDelete) {
    await cleanupCloudinaryImage(imageUrl);
  }

  revalidateAdminPages();
}

export async function updateProjectAction(formData: FormData) {
  await requireAdminSession();

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const year = Number(String(formData.get("year") ?? "").trim() || "0");
  const description = String(formData.get("description") ?? "").trim();
  const stack = parseStackInput(formData.get("stack"));
  const gitRepo = String(formData.get("gitRepo") ?? "").trim();
  const liveLink = String(formData.get("liveLink") ?? "").trim();
  const hidden = parseCheckboxInput(formData, "hidden");
  const projectImages = await resolveProjectImagesInput(formData);

  if (!id || !title || !category || year <= 0 || !description) {
    return;
  }

  const existing = await getProjectById(id);
  if (!existing) {
    return;
  }

  const previousImages = listProjectImageUrls(existing);

  await updateProject(id, {
    title,
    category,
    year,
    description,
    stack,
    images: projectImages.images,
    mainImageUrl: projectImages.mainImageUrl,
    gitRepo: gitRepo || null,
    liveLink: liveLink || null,
    hidden,
    imageUrl: projectImages.mainImageUrl,
  });

  const nextImages = listProjectImageUrls({
    images: projectImages.images,
    mainImageUrl: projectImages.mainImageUrl,
    imageUrl: projectImages.mainImageUrl,
  });
  const removedImages = previousImages.filter((imageUrl) => !nextImages.includes(imageUrl));

  for (const imageUrl of removedImages) {
    await cleanupCloudinaryImage(imageUrl);
  }

  revalidateAdminPages();
}

export async function createServiceAction(
  _prevState: CreateActionState,
  formData: FormData,
): Promise<CreateActionState> {
  try {
    const sessionError = await ensureCreateSessionState();
    if (sessionError) {
      return sessionError;
    }

    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const sortOrder = Number(String(formData.get("sortOrder") ?? "").trim() || "0");
    const hidden = parseCheckboxInput(formData, "hidden");
    const image = await resolveImageInput(formData);

    if (!title || !description) {
      return errorState("Could not create service.", ["Title and description are required."]);
    }

    await addService({
      title,
      description,
      sortOrder,
      hidden,
      imageUrl: image.imageUrl,
    });

    const details: string[] = [];
    if (image.source === "uploaded") {
      details.push("Image uploaded to Cloudinary.");
    } else if (image.source === "url") {
      details.push("Image URL attached.");
    }
    details.push("Service created successfully.");

    revalidateAdminPages();
    return successState("Service created.", details);
  } catch (error) {
    return errorState("Could not create service.", [parseErrorMessage(error)]);
  }
}

export async function deleteServiceAction(formData: FormData) {
  await requireAdminSession();
  const id = String(formData.get("id") ?? "");

  if (!id) return;

  const existing = await getServiceById(id);
  await deleteService(id);
  await cleanupCloudinaryImage(existing?.imageUrl ?? null);
  revalidateAdminPages();
}

export async function updateServiceAction(formData: FormData) {
  await requireAdminSession();

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const sortOrder = Number(String(formData.get("sortOrder") ?? "").trim() || "0");
  const hidden = parseCheckboxInput(formData, "hidden");
  const image = await resolveImageInput(formData);

  if (!id || !title || !description) {
    return;
  }

  const existing = await getServiceById(id);

  await updateService(id, {
    title,
    description,
    sortOrder,
    hidden,
    imageUrl: image.imageUrl,
  });

  if (existing?.imageUrl && existing.imageUrl !== image.imageUrl) {
    await cleanupCloudinaryImage(existing.imageUrl);
  }

  revalidateAdminPages();
}

export async function createBlogAction(
  _prevState: CreateActionState,
  formData: FormData,
): Promise<CreateActionState> {
  try {
    const sessionError = await ensureCreateSessionState();
    if (sessionError) {
      return sessionError;
    }

    const title = String(formData.get("title") ?? "").trim();
    const excerpt = String(formData.get("excerpt") ?? "").trim();
    const meta = String(formData.get("meta") ?? "").trim();
    const content = String(formData.get("content") ?? "").trim();
    const hidden = parseCheckboxInput(formData, "hidden");
    const image = await resolveImageInput(formData);

    if (!title || !excerpt || !meta) {
      return errorState("Could not create blog.", ["Title, excerpt, and meta are required."]);
    }

    await addBlog({
      title,
      excerpt,
      meta,
      content: content || null,
      hidden,
      imageUrl: image.imageUrl,
    });

    const details: string[] = [];
    if (image.source === "uploaded") {
      details.push("Image uploaded to Cloudinary.");
    } else if (image.source === "url") {
      details.push("Image URL attached.");
    }
    details.push("Blog created successfully.");

    revalidateAdminPages();
    return successState("Blog created.", details);
  } catch (error) {
    return errorState("Could not create blog.", [parseErrorMessage(error)]);
  }
}

export async function deleteBlogAction(formData: FormData) {
  await requireAdminSession();
  const id = String(formData.get("id") ?? "");

  if (!id) return;

  const existing = await getBlogById(id);
  await deleteBlog(id);
  await cleanupCloudinaryImage(existing?.imageUrl ?? null);
  revalidateAdminPages();
}

export async function updateBlogAction(formData: FormData) {
  await requireAdminSession();

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const meta = String(formData.get("meta") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const hidden = parseCheckboxInput(formData, "hidden");
  const image = await resolveImageInput(formData);

  if (!id || !title || !excerpt || !meta) {
    return;
  }

  const existing = await getBlogById(id);

  await updateBlog(id, {
    title,
    excerpt,
    meta,
    content: content || null,
    hidden,
    imageUrl: image.imageUrl,
  });

  if (existing?.imageUrl && existing.imageUrl !== image.imageUrl) {
    await cleanupCloudinaryImage(existing.imageUrl);
  }

  revalidateAdminPages();
}

export async function createReviewAction(
  _prevState: CreateActionState,
  formData: FormData,
): Promise<CreateActionState> {
  try {
    const sessionError = await ensureCreateSessionState();
    if (sessionError) {
      return sessionError;
    }

    const name = String(formData.get("name") ?? "").trim();
    const role = String(formData.get("role") ?? "").trim();
    const quote = String(formData.get("quote") ?? "").trim();
    const hidden = parseCheckboxInput(formData, "hidden");
    const image = await resolveImageInput(formData);

    if (!name || !role || !quote) {
      return errorState("Could not create review.", ["Name, role, and quote are required."]);
    }

    await addReview({
      name,
      role,
      quote,
      hidden,
      imageUrl: image.imageUrl,
    });

    const details: string[] = [];
    if (image.source === "uploaded") {
      details.push("Image uploaded to Cloudinary.");
    } else if (image.source === "url") {
      details.push("Image URL attached.");
    }
    details.push("Review created successfully.");

    revalidateAdminPages();
    return successState("Review created.", details);
  } catch (error) {
    return errorState("Could not create review.", [parseErrorMessage(error)]);
  }
}

export async function deleteReviewAction(formData: FormData) {
  await requireAdminSession();
  const id = String(formData.get("id") ?? "");

  if (!id) return;

  const existing = await getReviewById(id);
  await deleteReview(id);
  await cleanupCloudinaryImage(existing?.imageUrl ?? null);
  revalidateAdminPages();
}

export async function updateReviewAction(formData: FormData) {
  await requireAdminSession();

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  const quote = String(formData.get("quote") ?? "").trim();
  const hidden = parseCheckboxInput(formData, "hidden");
  const image = await resolveImageInput(formData);

  if (!id || !name || !role || !quote) {
    return;
  }

  const existing = await getReviewById(id);

  await updateReview(id, {
    name,
    role,
    quote,
    hidden,
    imageUrl: image.imageUrl,
  });

  if (existing?.imageUrl && existing.imageUrl !== image.imageUrl) {
    await cleanupCloudinaryImage(existing.imageUrl);
  }

  revalidateAdminPages();
}

export async function createFaqAction(
  _prevState: CreateActionState,
  formData: FormData,
): Promise<CreateActionState> {
  try {
    const sessionError = await ensureCreateSessionState();
    if (sessionError) {
      return sessionError;
    }

    const question = String(formData.get("question") ?? "").trim();
    const answer = String(formData.get("answer") ?? "").trim();
    const sortOrder = Number(String(formData.get("sortOrder") ?? "").trim() || "0");
    const hidden = parseCheckboxInput(formData, "hidden");

    if (!question || !answer) {
      return errorState("Could not create FAQ.", ["Question and answer are required."]);
    }

    await addFaq({
      question,
      answer,
      sortOrder,
      hidden,
    });

    revalidateAdminPages();
    return successState("FAQ created.", ["FAQ item created successfully."]);
  } catch (error) {
    return errorState("Could not create FAQ.", [parseErrorMessage(error)]);
  }
}

export async function deleteFaqAction(formData: FormData) {
  await requireAdminSession();
  const id = String(formData.get("id") ?? "");

  if (!id) return;

  await deleteFaq(id);
  revalidateAdminPages();
}

export async function updateFaqAction(formData: FormData) {
  await requireAdminSession();

  const id = String(formData.get("id") ?? "").trim();
  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  const sortOrder = Number(String(formData.get("sortOrder") ?? "").trim() || "0");
  const hidden = parseCheckboxInput(formData, "hidden");

  if (!id || !question || !answer) {
    return;
  }

  await updateFaq(id, {
    question,
    answer,
    sortOrder,
    hidden,
  });

  revalidateAdminPages();
}

export async function updateEnquiryStatusAction(formData: FormData) {
  await requireAdminSession();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!id || !["NEW", "IN_PROGRESS", "RESOLVED"].includes(status)) {
    return;
  }

  await updateEnquiryStatus(id, status as EnquiryStatus);

  revalidateAdminPages();
}

export async function deleteEnquiryAction(formData: FormData) {
  await requireAdminSession();
  const id = String(formData.get("id") ?? "");

  if (!id) return;

  await deleteEnquiry(id);
  revalidateAdminPages();
}

export async function updateSectionVisibilityAction(formData: FormData) {
  await requireAdminSession();

  const visibility: SectionVisibility = {
    hero: parseCheckboxInput(formData, "section_hero"),
    projects: parseCheckboxInput(formData, "section_projects"),
    services: parseCheckboxInput(formData, "section_services"),
    blogs: parseCheckboxInput(formData, "section_blogs"),
    reviews: parseCheckboxInput(formData, "section_reviews"),
    faqs: parseCheckboxInput(formData, "section_faqs"),
  };

  await updateSectionVisibility(visibility);
  revalidateAdminPages();
}

export async function updateHeroContentAction(formData: FormData) {
  await requireAdminSession();

  const currentHero = await getHeroContent();
  const image = await resolveImageInput(formData);
  const nextHeroImageUrl =
    image.source === "none" ? currentHero.heroImageUrl : image.imageUrl;

  const payload: HeroContent = {
    name: String(formData.get("name") ?? "").trim() || "FAYIS NAM",
    locationLine: String(formData.get("locationLine") ?? "").trim() || "Based in New York",
    roleLine: String(formData.get("roleLine") ?? "").trim() || "UI Designer & Art Director",
    availabilityLine: String(formData.get("availabilityLine") ?? "").trim() || "Available for projects",
    introText:
      String(formData.get("introText") ?? "").trim() ||
      "A visionary Art Director from New York, showcases a portfolio of visually stunning campaigns that blend artistry and innovation.",
    contactEmail: String(formData.get("contactEmail") ?? "").trim() || "fayis@gmail.com",
    contactPhone: String(formData.get("contactPhone") ?? "").trim() || "+1 123 456 7890",
    contactLocation: String(formData.get("contactLocation") ?? "").trim() || "New York, US",
    socialInstagram: String(formData.get("socialInstagram") ?? "").trim() || "https://instagram.com",
    socialDribbble: String(formData.get("socialDribbble") ?? "").trim() || "https://dribbble.com",
    socialBehance: String(formData.get("socialBehance") ?? "").trim() || "https://behance.net",
    socialLinkedIn: String(formData.get("socialLinkedIn") ?? "").trim() || "https://linkedin.com",
    heroImageUrl: nextHeroImageUrl,
  };

  await updateHeroContent(payload);

  if (currentHero.heroImageUrl && currentHero.heroImageUrl !== payload.heroImageUrl) {
    await cleanupCloudinaryImage(currentHero.heroImageUrl);
  }

  revalidateAdminPages();
}
