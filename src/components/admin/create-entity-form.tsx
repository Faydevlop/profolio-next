"use client";

import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import {
  INITIAL_CREATE_ACTION_STATE,
  type CreateActionState,
} from "@/app/admin/action-state";
import { useAddModal } from "@/components/admin/add-modal";

type CreateEntityFormProps = {
  action: (
    prevState: CreateActionState,
    formData: FormData,
  ) => Promise<CreateActionState>;
  children: ReactNode;
  submitLabel: string;
  pendingLabel: string;
  pendingWithImageLabel?: string;
  encType?: string;
};

export default function CreateEntityForm({
  action,
  children,
  submitLabel,
  pendingLabel,
  pendingWithImageLabel,
  encType,
}: CreateEntityFormProps) {
  const modalContext = useAddModal();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [hasImageFile, setHasImageFile] = useState(false);
  const [state, formAction, isPending] = useActionState(action, INITIAL_CREATE_ACTION_STATE);

  useEffect(() => {
    if (!state.ok || state.timestamp === 0) {
      return;
    }

    const timerId = setTimeout(() => {
      modalContext?.closeModal();
      formRef.current?.reset();
      setHasImageFile(false);
    }, 900);

    return () => clearTimeout(timerId);
  }, [modalContext, state.ok, state.timestamp]);

  const handleChangeCapture = (event: React.FormEvent<HTMLFormElement>) => {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;

    if (
      target instanceof HTMLInputElement &&
      target.type === "file" &&
      (target.name === "imageFile" || target.name === "projectImageFiles")
    ) {
      setHasImageFile(Boolean(target.files && target.files.length > 0));
    }
  };

  const currentPendingLabel =
    hasImageFile && pendingWithImageLabel ? pendingWithImageLabel : pendingLabel;

  return (
    <form
      ref={formRef}
      action={formAction}
      className="cms-form"
      encType={encType}
      onChangeCapture={handleChangeCapture}
    >
      {children}

      <button type="submit" className="btn-primary" disabled={isPending}>
        {isPending ? "Please wait..." : submitLabel}
      </button>

      {isPending ? <p className="cms-form-status">{currentPendingLabel}</p> : null}

      {state.status ? (
        <div className={`cms-form-feedback ${state.ok ? "is-success" : "is-error"}`}>
          <p>{state.status}</p>
          {state.details.length > 0 ? (
            <ul>
              {state.details.map((line, index) => (
                <li key={`${line}-${index}`}>{line}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
