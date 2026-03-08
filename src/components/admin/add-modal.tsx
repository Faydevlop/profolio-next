"use client";

import { createPortal } from "react-dom";
import { createContext, type ReactNode, useContext, useEffect, useState } from "react";

type AddModalProps = {
  title: string;
  triggerLabel: string;
  children: ReactNode;
  triggerClassName?: string;
};

const AddModalContext = createContext<{ closeModal: () => void } | null>(null);

export function useAddModal() {
  return useContext(AddModalContext);
}

export default function AddModal({
  title,
  triggerLabel,
  children,
  triggerClassName = "btn-primary",
}: AddModalProps) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  const openModal = () => {
    setOpen(true);
    requestAnimationFrame(() => setVisible(true));
  };

  const closeModal = () => {
    setVisible(false);
    setTimeout(() => setOpen(false), 220);
  };

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button type="button" className={triggerClassName} onClick={openModal}>
        {triggerLabel}
      </button>

      {open && typeof window !== "undefined"
        ? createPortal(
            <div
              className={`cms-modal-backdrop ${visible ? "is-open" : ""}`}
              role="dialog"
              aria-modal="true"
              aria-label={title}
              onClick={closeModal}
            >
              <div className="cms-modal-card" onClick={(event) => event.stopPropagation()}>
                <div className="cms-modal-head">
                  <h3>{title}</h3>
                  <button type="button" className="btn-secondary" onClick={closeModal}>
                    Close
                  </button>
                </div>
                <AddModalContext.Provider value={{ closeModal }}>
                  <div className="cms-modal-body">{children}</div>
                </AddModalContext.Provider>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
