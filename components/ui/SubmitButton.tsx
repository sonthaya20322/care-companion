"use client";

import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "./Button";

type SubmitButtonProps = Omit<ComponentProps<typeof Button>, "type" | "loading"> & {
  pendingLabel?: string;
};

/** Submit button that shows a spinner while its parent form's action is running. */
export function SubmitButton({ children, pendingLabel, ...props }: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} {...props}>
      {pending && pendingLabel ? pendingLabel : children}
    </Button>
  );
}
