"use client";

import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "./Button";

type SubmitButtonProps = Omit<ComponentProps<typeof Button>, "type" | "loading"> & {
  pendingLabel?: string;
  /** Pass when the form submits through a transition (useActionForm), which useFormStatus cannot see. */
  pending?: boolean;
};

/** Submit button that shows a spinner while its parent form's action is running. */
export function SubmitButton({ children, pendingLabel, pending: pendingProp, ...props }: SubmitButtonProps) {
  const status = useFormStatus();
  const pending = pendingProp ?? status.pending;
  return (
    <Button type="submit" loading={pending} {...props}>
      {pending && pendingLabel ? pendingLabel : children}
    </Button>
  );
}
