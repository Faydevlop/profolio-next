"use client";

import type { MouseEvent } from "react";

type ConfirmSubmitButtonProps = {
  label: string;
  className?: string;
  confirmMessage?: string;
};

export default function ConfirmSubmitButton({
  label,
  className = "btn-danger",
  confirmMessage = "Are you sure?",
}: ConfirmSubmitButtonProps) {
  const onClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (!window.confirm(confirmMessage)) {
      event.preventDefault();
    }
  };

  return (
    <button type="submit" className={className} onClick={onClick}>
      {label}
    </button>
  );
}
