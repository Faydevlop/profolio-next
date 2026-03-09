import { v2 as cloudinary } from "cloudinary";
import { getAdminConfig } from "@/lib/setup";

let isConfigured = false;

async function ensureConfigured() {
  if (isConfigured) return;

  const config = await getAdminConfig();

  // Prioritize database config from onboarding
  const cloudName = config?.cloudinaryCloudName || process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = config?.cloudinaryApiKey || process.env.CLOUDINARY_API_KEY;
  const apiSecret = config?.cloudinaryApiSecret || process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
    isConfigured = true;
  }
}

export async function cloudinaryIsConfigured() {
  await ensureConfigured();
  return isConfigured;
}

type UploadableFile = {
  arrayBuffer: () => Promise<ArrayBuffer>;
  size: number;
};

export async function uploadImageToCloudinary(file: UploadableFile) {
  if (!(await cloudinaryIsConfigured())) {
    throw new Error("Cloudinary is not configured. Please complete the setup wizard.");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "myport",
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(error ?? new Error("Failed to upload image to Cloudinary"));
          return;
        }

        resolve(result.secure_url);
      }
    );

    stream.end(buffer);
  });
}

function getCloudinaryPublicIdFromUrl(imageUrl: string) {
  try {
    const parsed = new URL(imageUrl);
    if (!parsed.hostname.includes("res.cloudinary.com")) {
      return null;
    }

    const uploadIndex = parsed.pathname.indexOf("/upload/");
    if (uploadIndex < 0) {
      return null;
    }

    const rawPath = parsed.pathname.slice(uploadIndex + "/upload/".length);
    let segments = rawPath.split("/").filter(Boolean);
    const versionIndex = segments.findIndex((segment) => /^v\d+$/.test(segment));

    if (versionIndex >= 0) {
      segments = segments.slice(versionIndex + 1);
    }

    if (segments.length === 0) {
      return null;
    }

    const lastSegment = segments[segments.length - 1];
    segments[segments.length - 1] = lastSegment.replace(/\.[a-zA-Z0-9]+$/, "");

    return segments.join("/");
  } catch {
    return null;
  }
}

export async function deleteImageFromCloudinaryByUrl(imageUrl: string) {
  if (!imageUrl || !(await cloudinaryIsConfigured())) {
    return false;
  }

  const publicId = getCloudinaryPublicIdFromUrl(imageUrl);
  if (!publicId) {
    return false;
  }

  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true,
  });

  return result.result === "ok" || result.result === "not found";
}
