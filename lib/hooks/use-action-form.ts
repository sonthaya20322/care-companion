"use client";

import { useActionState, useEffect, useRef, useState, useTransition, type FormEvent } from "react";

/**
 * useActionState for forms that must keep what the user typed when the server rejects it.
 * A native `<form action>` makes React reset every uncontrolled field after the action runs, so the
 * submit goes through a transition instead. Keep `action={formAction}` on the form as the no-JS path.
 * After a failed submit the first invalid field (`aria-invalid="true"` or `data-error-anchor`) is
 * scrolled into view and focused.
 */
export function useActionForm<State extends object>(
  action: (state: Awaited<State>, formData: FormData) => State | Promise<State>,
  initialState: Awaited<State>,
  options: { resetOnSuccess?: boolean } = {},
) {
  const [state, formAction] = useActionState(action, initialState);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [firstState] = useState(state);
  const { resetOnSuccess = false } = options;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const formData = new FormData(event.currentTarget, submitter);
    startTransition(() => formAction(formData));
  }

  useEffect(() => {
    const form = formRef.current;
    if (!form || state === firstState) return;
    if ("ok" in state && state.ok) {
      if (resetOnSuccess) form.reset();
      return;
    }
    const target = form.querySelector<HTMLElement>('[aria-invalid="true"], [data-error-anchor]');
    if (!target) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ block: "center", behavior: smooth ? "smooth" : "auto" });
    target.focus({ preventScroll: true });
  }, [state, firstState, resetOnSuccess]);

  return { state, formAction, pending, formRef, handleSubmit };
}
