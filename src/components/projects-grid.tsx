"use client";

import { useState } from "react";
import TransitionLink from "@/components/transition-link";

type ProjectCardData = {
    id: string;
    title: string;
    category: string;
    year: number;
    description: string;
    stack: string[];
    imageUrl: string | null;
    gitRepo: string | null;
    liveLink: string | null;
};
 
type ProjectsGridProps = {
    projects: ProjectCardData[];
    totalCategories: number;
    totalTechnologies: number;
};

export default function ProjectsGrid({ projects, totalCategories, totalTechnologies }: ProjectsGridProps) {
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");

    /* Derive unique categories */
    const categories = ["All", ...Array.from(new Set(projects.map((p) => p.category).filter(Boolean)))];

    /* Filter projects */
    const filtered = projects.filter((p) => {
        const matchesSearch =
            search.trim() === "" ||
            p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.description.toLowerCase().includes(search.toLowerCase()) ||
            p.stack.some((s) => s.toLowerCase().includes(search.toLowerCase())) ||
            p.category.toLowerCase().includes(search.toLowerCase());

        const matchesCategory = activeCategory === "All" || p.category === activeCategory;

        return matchesSearch && matchesCategory;
    });

    return (
        <>
            {/* Stats row with search & filters inline */}
            <div className="projects-hero-stats">
                <div className="projects-stat">
                    <span className="projects-stat-number">{projects.length}</span>
                    <span className="projects-stat-label">Projects</span>
                </div>
                <div className="projects-stat">
                    <span className="projects-stat-number">{totalCategories}</span>
                    <span className="projects-stat-label">Categories</span>
                </div>
                <div className="projects-stat">
                    <span className="projects-stat-number">{totalTechnologies}</span>
                    <span className="projects-stat-label">Technologies</span>
                </div>

                {/* Search + Filters — same line, pushed right */}
                <div className="projects-toolbar">
                    <div className="projects-search-wrap">
                        <svg className="projects-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            className="projects-search-input"
                            placeholder="Search projects..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button className="projects-search-clear" onClick={() => setSearch("")} aria-label="Clear search">
                                ✕
                            </button>
                        )}
                    </div>

                    <div className="projects-filter-pills">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                className={`projects-filter-pill ${activeCategory === cat ? "is-active" : ""}`}
                                onClick={() => setActiveCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Results count */}
            <div className="projects-results-bar">
                <span className="projects-results-count">
                    {filtered.length} {filtered.length === 1 ? "project" : "projects"}
                    {activeCategory !== "All" ? ` in ${activeCategory}` : ""}
                    {search ? ` matching "${search}"` : ""}
                </span>
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
                <div className="projects-empty-state">
                    <p>No projects match your search.</p>
                    <button onClick={() => { setSearch(""); setActiveCategory("All"); }}>Clear filters</button>
                </div>
            ) : (
                <div className="projects-grid">
                    {filtered.map((project) => (
                        <article key={project.id} className="project-card">
                            <TransitionLink href={`/projects/${project.id}`} className="project-card-image">
                                {project.imageUrl ? (
                                    <img src={project.imageUrl} alt={project.title} />
                                ) : (
                                    <span className="project-card-placeholder">No image</span>
                                )}
                                <div className="project-card-overlay">
                                    <span>View project →</span>
                                </div>
                            </TransitionLink>
                            <div className="project-card-body">
                                <div className="project-card-top">
                                    <span className="project-card-category">{project.category}</span>
                                    <span className="project-card-year">{project.year}</span>
                                </div>
                                <h2>
                                    <TransitionLink href={`/projects/${project.id}`}>{project.title}</TransitionLink>
                                </h2>
                                <p className="project-card-desc">
                                    {project.description.slice(0, 120)}
                                    {project.description.length > 120 ? "..." : ""}
                                </p>
                                {project.stack.length > 0 ? (
                                    <div className="project-card-stack">
                                        {project.stack.slice(0, 4).map((tech) => (
                                            <span key={tech} className="project-stack-pill">{tech}</span>
                                        ))}
                                        {project.stack.length > 4 ? (
                                            <span className="project-stack-pill is-more">+{project.stack.length - 4}</span>
                                        ) : null}
                                    </div>
                                ) : null}
                                <div className="project-card-links">
                                    {project.liveLink ? (
                                        <a href={project.liveLink} target="_blank" rel="noreferrer" className="project-card-link">
                                            ↗ Live
                                        </a>
                                    ) : null}
                                    {project.gitRepo ? (
                                        <a href={project.gitRepo} target="_blank" rel="noreferrer" className="project-card-link">
                                            ↗ Code
                                        </a>
                                    ) : null}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </>
    );
}
