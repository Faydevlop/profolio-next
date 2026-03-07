"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";

type ProjectImagesFieldProps = {
  initialImages?: string[];
  initialMainImageUrl?: string | null;
};

type PreviewFile = {
  name: string;
  previewUrl: string;
};

function truncateFileName(name: string, maxChars = 5) {
  const normalized = name.trim();
  if (!normalized) {
    return "";
  }

  if (normalized.length <= maxChars) {
    return normalized;
  }

  return `${normalized.slice(0, maxChars)}...`;
}

export default function ProjectImagesField({
  initialImages = [],
  initialMainImageUrl = null,
}: ProjectImagesFieldProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>(initialImages);
  const [addedUrls, setAddedUrls] = useState<string[]>([]);
  const [newUrlValue, setNewUrlValue] = useState("");
  const [previewFiles, setPreviewFiles] = useState<PreviewFile[]>([]);
  const [mainImageCandidate, setMainImageCandidate] = useState(() => {
    if (initialMainImageUrl) {
      const foundIndex = initialImages.findIndex((url) => url === initialMainImageUrl);
      if (foundIndex >= 0) {
        return `existing:${foundIndex}`;
      }
    }

    if (initialImages.length > 0) {
      return "existing:0";
    }

    return "";
  });

  useEffect(() => {
    return () => {
      for (const file of previewFiles) {
        URL.revokeObjectURL(file.previewUrl);
      }
    };
  }, [previewFiles]);

  const syncPreviewFilesFromInput = (files: File[]) => {
    setPreviewFiles((previous) => {
      for (const item of previous) {
        URL.revokeObjectURL(item.previewUrl);
      }

      return files.map((file) => ({
        name: file.name,
        previewUrl: URL.createObjectURL(file),
      }));
    });
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    syncPreviewFilesFromInput(files);
  };

  const removeFileAtIndex = (index: number) => {
    if (!fileInputRef.current) {
      return;
    }

    const nextFiles = Array.from(fileInputRef.current.files ?? []).filter((_, itemIndex) => itemIndex !== index);
    const dataTransfer = new DataTransfer();

    for (const file of nextFiles) {
      dataTransfer.items.add(file);
    }

    fileInputRef.current.files = dataTransfer.files;
    syncPreviewFilesFromInput(nextFiles);
  };

  const addImageUrl = () => {
    const value = newUrlValue.trim();
    if (!value) {
      return;
    }

    if (existingImages.includes(value) || addedUrls.includes(value)) {
      setNewUrlValue("");
      return;
    }

    setAddedUrls((previous) => [...previous, value]);
    setNewUrlValue("");
  };

  const candidates = [
    ...existingImages.map((url, index) => ({
      token: `existing:${index}`,
      url,
      label: `Saved ${index + 1}`,
      displayLabel: `Saved ${index + 1}`,
      removable: true,
      remove: () =>
        setExistingImages((previous) => previous.filter((_, itemIndex) => itemIndex !== index)),
    })),
    ...addedUrls.map((url, index) => ({
      token: `url:${index}`,
      url,
      label: `URL ${index + 1}`,
      displayLabel: `URL ${index + 1}`,
      removable: true,
      remove: () => setAddedUrls((previous) => previous.filter((_, itemIndex) => itemIndex !== index)),
    })),
    ...previewFiles.map((file, index) => ({
      token: `file:${index}`,
      url: file.previewUrl,
      label: file.name || `Upload ${index + 1}`,
      displayLabel: file.name ? truncateFileName(file.name) : `Upload ${index + 1}`,
      removable: true,
      remove: () => removeFileAtIndex(index),
    })),
  ];

  const hasSelectedMain = candidates.some((candidate) => candidate.token === mainImageCandidate);
  const effectiveMainImageCandidate = hasSelectedMain
    ? mainImageCandidate
    : (candidates[0]?.token ?? "");

  return (
    <div className="cms-project-images-field">
      <input
        ref={fileInputRef}
        name="projectImageFiles"
        type="file"
        accept="image/*"
        multiple
        onChange={onFileChange}
      />

      <div className="cms-inline-form cms-project-image-url-row">
        <input
          value={newUrlValue}
          onChange={(event) => setNewUrlValue(event.target.value)}
          placeholder="Add image URL"
        />
        <button type="button" className="btn-secondary" onClick={addImageUrl}>
          Add URL
        </button>
      </div>

      <input type="hidden" name="existingProjectImages" value={JSON.stringify(existingImages)} />
      <input type="hidden" name="addedProjectImageUrls" value={JSON.stringify(addedUrls)} />
      <input type="hidden" name="mainImageCandidate" value={effectiveMainImageCandidate} />

      <div className="cms-project-image-grid">
        {candidates.length === 0 ? <p className="cms-empty">No images selected.</p> : null}

        {candidates.map((candidate) => (
          <div className="cms-project-image-item" key={candidate.token}>
            <button
              type="button"
              className={`cms-project-main-select ${
                effectiveMainImageCandidate === candidate.token ? "is-selected" : ""
              }`}
              onClick={() => setMainImageCandidate(candidate.token)}
            >
              <span>{effectiveMainImageCandidate === candidate.token ? "Main Image" : "Set as Main"}</span>
            </button>
            <div className="cms-project-image-thumb">
              <img src={candidate.url} alt={candidate.label} />
            </div>
            <p title={candidate.label}>{candidate.displayLabel}</p>
            {candidate.removable ? (
              <button type="button" className="btn-secondary" onClick={candidate.remove}>
                Remove
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
