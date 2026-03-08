import type { MetadataRoute } from "next";
import { listContent } from "@/lib/content-store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const siteUrl = process.env.SITE_URL || "http://localhost:3000";

    /* Static pages */
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: siteUrl,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1.0,
        },
        {
            url: `${siteUrl}/projects`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.9,
        },
    ];

    /* Dynamic project pages */
    let projectPages: MetadataRoute.Sitemap = [];
    try {
        const { projects } = await listContent();
        projectPages = projects.map((project) => ({
            url: `${siteUrl}/projects/${project.id}`,
            lastModified: new Date(project.createdAt),
            changeFrequency: "monthly" as const,
            priority: 0.7,
        }));
    } catch {
        /* DB unavailable — return static pages only */
    }

    return [...staticPages, ...projectPages];
}
