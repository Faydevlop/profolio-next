import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { isSetupComplete, saveSetupConfig } from "@/lib/setup";
import { setCachedMongoUri } from "@/lib/mongodb";

export async function GET() {
    try {
        const done = await isSetupComplete();
        return NextResponse.json({ ok: true, setupComplete: done });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ ok: true, setupComplete: false, error: message });
    }
}

export async function POST(req: NextRequest) {
    try {
        // Check if setup already complete in DB
        const alreadyDone = await isSetupComplete();
        if (alreadyDone) {
            return NextResponse.json({ ok: false, error: "Setup already complete" }, { status: 403 });
        }

        const {
            mongoUri,
            name,
            adminEmail,
            adminPassword,
            cloudinaryCloudName,
            cloudinaryApiKey,
            cloudinaryApiSecret
        } = await req.json();

        if (
            !mongoUri ||
            !name ||
            !adminEmail ||
            !adminPassword ||
            !cloudinaryCloudName ||
            !cloudinaryApiKey ||
            !cloudinaryApiSecret
        ) {
            return NextResponse.json({ ok: false, error: "All fields are required" }, { status: 400 });
        }

        // 1. Hash the password
        const passwordHash = await bcrypt.hash(adminPassword, 12);

        // 2. Generate JWT Secret
        const jwtSecret = crypto.randomBytes(64).toString("hex");

        // 3. Save to MongoDB (Seed the initial state)
        await saveSetupConfig({
            name: name.trim(),
            siteUrl: "", // Optional during wizard
            mongoUri: mongoUri.trim(), // User explicitly asked to store this in DB
            adminEmail: adminEmail.trim().toLowerCase(),
            passwordHash,
            jwtSecret,
            cloudinaryCloudName: cloudinaryCloudName.trim(),
            cloudinaryApiKey: cloudinaryApiKey.trim(),
            cloudinaryApiSecret: cloudinaryApiSecret.trim(),
        });

        // 4. Save to in-memory cache and HttpOnly cookie for persistence
        setCachedMongoUri(mongoUri.trim());
        const cookieStore = await cookies();
        cookieStore.set("SETUP_MONGO_URI", mongoUri.trim(), {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24 * 365, // 1 year
        });

        return NextResponse.json({
            ok: true,
            message: "Setup complete! Your portfolio is now ready."
        });
    } catch (err) {
        console.error("Setup error:", err);
        return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : "Setup failed" }, { status: 500 });
    }
}
