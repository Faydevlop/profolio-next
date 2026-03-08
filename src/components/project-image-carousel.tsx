"use client";

import { useState, useCallback } from "react";

type ProjectImageCarouselProps = {
    images: string[];
    alt: string;
};

export default function ProjectImageCarousel({ images, alt }: ProjectImageCarouselProps) {
    const [current, setCurrent] = useState(0);

    const goTo = useCallback(
        (index: number) => {
            if (index < 0) setCurrent(images.length - 1);
            else if (index >= images.length) setCurrent(0);
            else setCurrent(index);
        },
        [images.length]
    );

    if (images.length === 0) {
        return <div className="project-hero-empty">No project image added yet.</div>;
    }

    return (
        <div className="carousel-wrap">
            <div className="carousel-viewport">
                {images.map((src, i) => (
                    <img
                        key={src}
                        src={src}
                        alt={`${alt} — image ${i + 1}`}
                        className={`carousel-slide ${i === current ? "is-active" : ""}`}
                    />
                ))}
            </div>

            {images.length > 1 && (
                <>
                    <button
                        className="carousel-arrow carousel-arrow-left"
                        onClick={() => goTo(current - 1)}
                        aria-label="Previous image"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>
                    <button
                        className="carousel-arrow carousel-arrow-right"
                        onClick={() => goTo(current + 1)}
                        aria-label="Next image"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 6 15 12 9 18" />
                        </svg>
                    </button>

                    <div className="carousel-dots">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                className={`carousel-dot ${i === current ? "is-active" : ""}`}
                                onClick={() => setCurrent(i)}
                                aria-label={`Go to image ${i + 1}`}
                            />
                        ))}
                    </div>

                    <span className="carousel-counter">
                        {current + 1} / {images.length}
                    </span>
                </>
            )}
        </div>
    );
}
