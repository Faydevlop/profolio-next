import { getDatabase, getDatabaseFromUri } from "@/lib/mongodb";

type HeroContentSettingsDoc = {
    _id: "hero_content";
    [key: string]: unknown;
};

export type AdminConfig = {
    email: string;
    passwordHash: string;
    jwtSecret: string;
    cloudinaryCloudName?: string;
    cloudinaryApiKey?: string;
    cloudinaryApiSecret?: string;
};

type AdminConfigDoc = {
    _id: "admin_config";
    email: string;
    passwordHash: string;
    jwtSecret: string;
    createdAt: Date;
};

/**
 * Returns true if the first-time setup has been completed.
 * Checks for the existence of the admin_config document in MongoDB.
 */
export async function isSetupComplete() {
    try {
        const db = await getDatabase();
        if (!db) return false;
        const config = await db.collection("basicinfo").findOne({ type: "admin_config" });
        return !!config;
    } catch (err) {
        console.error("Error checking setup status:", err);
        return false;
    }
}

/**
 * Reads the admin config (email, password hash, JWT secret) from MongoDB.
 */
export async function getAdminConfig(): Promise<AdminConfig | null> {
    try {
        const db = await getDatabase();
        if (!db) return null;
        const config = await db.collection("basicinfo").findOne({ type: "admin_config" });
        if (!config) return null;

        return {
            email: config.email,
            passwordHash: config.passwordHash,
            jwtSecret: config.jwtSecret,
            cloudinaryCloudName: config.cloudinaryCloudName,
            cloudinaryApiKey: config.cloudinaryApiKey,
            cloudinaryApiSecret: config.cloudinaryApiSecret,
        };
    } catch (err) {
        console.error("Error getting admin config:", err);
        return null;
    }
}

export type SetupInput = {
    name: string;
    siteUrl: string;
    mongoUri: string;
    adminEmail: string;
    passwordHash: string;
    jwtSecret: string;
    cloudinaryCloudName: string;
    cloudinaryApiKey: string;
    cloudinaryApiSecret: string;
};

/**
 * Saves the admin config and seeds initial hero content.
 * Should only be called once during setup.
 */
export async function saveSetupConfig(input: SetupInput) {
    const db = input.mongoUri
        ? await getDatabaseFromUri(input.mongoUri)
        : await getDatabase();

    if (!db) throw new Error("Database not available");

    // 4. Save admin configuration to basicinfo
    await db.collection("basicinfo").updateOne(
        { type: "admin_config" },
        {
            $set: {
                type: "admin_config",
                email: input.adminEmail,
                passwordHash: input.passwordHash,
                jwtSecret: input.jwtSecret,
                mongoUri: input.mongoUri,
                cloudinaryCloudName: input.cloudinaryCloudName,
                cloudinaryApiKey: input.cloudinaryApiKey,
                cloudinaryApiSecret: input.cloudinaryApiSecret,
                updatedAt: new Date(),
            },
        },
        { upsert: true }
    );

    // Seed hero content with user's name
    const heroDoc = await db
        .collection<HeroContentSettingsDoc>("settings")
        .findOne({ _id: "hero_content" });

    if (!heroDoc) {
        await db.collection<HeroContentSettingsDoc>("settings").updateOne(
            { _id: "hero_content" },
            {
                $set: {
                    _id: "hero_content",
                    name: input.name,
                    locationLine: "Based somewhere",
                    roleLine: "Developer & Designer",
                    availabilityLine: "Available for projects",
                    introText: `Hi, I'm ${input.name}. Welcome to my portfolio.`,
                    contactEmail: input.adminEmail,
                    contactPhone: "",
                    contactLocation: "",
                    socialInstagram: "",
                    socialDribbble: "",
                    socialBehance: "",
                    socialLinkedIn: "",
                    heroImageUrl: null,
                    updatedAt: new Date(),
                },
            },
            { upsert: true },
        );
    }
}
