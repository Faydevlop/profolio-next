import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify, SignJWT } from "jose";
import { getAdminConfig } from "@/lib/setup";
import bcrypt from "bcryptjs";

export const ADMIN_COOKIE_NAME = "admin_session";

type AdminSessionPayload = {
  email: string;
};

async function getSecret(): Promise<Uint8Array | null> {
  // Try env var first (backward compat for existing installs)
  const envSecret = process.env.ADMIN_JWT_SECRET;
  if (envSecret) {
    return new TextEncoder().encode(envSecret);
  }

  // Fall back to MongoDB-stored secret (new installs via setup wizard)
  const config = await getAdminConfig();
  if (config?.jwtSecret) {
    return new TextEncoder().encode(config.jwtSecret);
  }

  return null;
}

export async function createAdminSession(email: string) {
  const secret = await getSecret();
  if (!secret) throw new Error("No JWT secret configured");

  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const secret = await getSecret();
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    const email = payload.email;

    if (typeof email !== "string") {
      return null;
    }

    return { email };
  } catch {
    return null;
  }
}

export async function requireAdminSession() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}

export async function isValidAdminCredentials(email: string, password: string) {
  // Try env vars first (backward compat for existing installs)
  const envEmail = process.env.ADMIN_EMAIL;
  const envPassword = process.env.ADMIN_PASSWORD;

  if (envEmail && envPassword) {
    return email === envEmail && password === envPassword;
  }

  // Fall back to MongoDB-stored credentials (new installs via setup wizard)
  const config = await getAdminConfig();
  if (!config) return false;

  const emailMatch = email === config.email;
  const passwordMatch = await bcrypt.compare(password, config.passwordHash);
  return emailMatch && passwordMatch;
}
