"use client";

import { useEffect, useState } from "react";

type ImagePreviewTriggerProps = {
  src: string | null;
  alt: string;
  placeholder?: string;
};

export default function ImagePreviewTrigger({
  src,
  alt,
  placeholder = "No image",
}: ImagePreviewTriggerProps) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  const openPreview = () => {
    if (!src) return;
    setOpen(true);
    requestAnimationFrame(() => setVisible(true));
  };

  const closePreview = () => {
    setVisible(false);
    setTimeout(() => setOpen(false), 220);
  };

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePreview();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!src) {
    return <div className="cms-media-thumb">{placeholder}</div>;
  }

  return (
    <>
      <button
        type="button"
        className="cms-media-thumb cms-media-thumb-button"
        onClick={openPreview}
        aria-label={`Preview ${alt}`}
      >
        <img src={src} alt={alt} />
      </button>

      {open ? (
        <div
          className={`cms-image-lightbox ${visible ? "is-open" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-label={`Preview ${alt}`}
          onClick={closePreview}
        >
          <div className="cms-image-lightbox-card" onClick={(event) => event.stopPropagation()}>
            <div className="cms-image-lightbox-head">
              <strong>{alt}</strong>
              <button type="button" className="btn-secondary" onClick={closePreview}>
                Close
              </button>
            </div>
            <img src={src} alt={alt} />
          </div>
        </div>
      ) : null}
    </>
  );
}
