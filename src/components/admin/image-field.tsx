"use client";

import { useEffect, useRef, useState } from "react";

type ImageFieldProps = {
  defaultUrl?: string;
  urlName?: string;
  fileName?: string;
  urlPlaceholder?: string;
};

export default function ImageField({
  defaultUrl = "",
  urlName = "imageUrl",
  fileName = "imageFile",
  urlPlaceholder = "Image URL (optional)",
}: ImageFieldProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [urlValue, setUrlValue] = useState(defaultUrl);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (filePreviewUrl && filePreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setFilePreviewUrl((previous) => {
        if (previous && previous.startsWith("blob:")) {
          URL.revokeObjectURL(previous);
        }
        return null;
      });
      return;
    }

    const nextPreview = URL.createObjectURL(file);
    setFilePreviewUrl((previous) => {
      if (previous && previous.startsWith("blob:")) {
        URL.revokeObjectURL(previous);
      }
      return nextPreview;
    });
  };

  const clearFileSelection = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setFilePreviewUrl((previous) => {
      if (previous && previous.startsWith("blob:")) {
        URL.revokeObjectURL(previous);
      }
      return null;
    });
  };

  const clearUrlValue = () => {
    setUrlValue("");
  };

  const previewUrl = filePreviewUrl ?? (urlValue.trim() ? urlValue.trim() : null);

  return (
    <div className="cms-image-field">
      <input
        name={urlName}
        placeholder={urlPlaceholder}
        value={urlValue}
        onChange={(event) => setUrlValue(event.target.value)}
      />
      <input
        ref={fileInputRef}
        name={fileName}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />

      <div className="cms-image-preview">
        {previewUrl ? <img src={previewUrl} alt="Selected preview" /> : <span>No image selected</span>}
      </div>

      <div className="cms-image-actions">
        <button type="button" className="btn-secondary" onClick={clearFileSelection}>
          Deselect File
        </button>
        <button type="button" className="btn-secondary" onClick={clearUrlValue}>
          Clear URL
        </button>
      </div>
    </div>
  );
}
