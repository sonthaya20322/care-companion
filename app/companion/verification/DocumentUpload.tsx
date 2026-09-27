"use client";

import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { buttonClasses } from "@/components/ui/Button";
import { FormStatus } from "@/components/ui/FormStatus";
import { errorMessages } from "@/lib/domain/errors";
import { createClient } from "@/lib/supabase/client";
import { setIdentityDocument } from "./actions";

const MAX_BYTES = 5 * 1024 * 1024;
const extensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

export function DocumentUpload({ userId, hasDocument, disabled }: { userId: string; hasDocument: boolean; disabled: boolean }) {
  const inputId = useId();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ ok?: boolean; message?: string }>({});
  const locked = disabled || pending;

  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const ext = extensions[file.type];
    if (!ext) return setStatus({ message: errorMessages.INVALID_FILE });
    if (file.size > MAX_BYTES) return setStatus({ message: `${errorMessages.FILE_TOO_LARGE} (ไม่เกิน 5 MB)` });

    startTransition(async () => {
      const path = `${userId}/id-${Date.now()}.${ext}`;
      const { error } = await createClient()
        .storage.from("companion-documents")
        .upload(path, file, { contentType: file.type });
      if (error) {
        console.error("document upload failed", { message: error.message });
        setStatus({ message: errorMessages.UPLOAD_FAILED });
        return;
      }
      const result = await setIdentityDocument(path);
      setStatus(result);
      if (result.ok) router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <label
        htmlFor={inputId}
        className={buttonClasses(
          hasDocument ? "secondary" : "primary",
          "md",
          `has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-sora-600 ${
            locked ? "pointer-events-none opacity-60" : "cursor-pointer"
          }`,
        )}
      >
        {pending ? "กำลังอัปโหลด..." : hasDocument ? "เปลี่ยนไฟล์เอกสาร" : "อัปโหลดเอกสาร"}
        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="sr-only"
          onChange={onChange}
          disabled={locked}
        />
      </label>
      <p className="text-sm text-sumi-soft">รูปถ่ายบัตรประชาชนหรือเอกสารราชการที่มีรูปถ่าย (JPG, PNG, WEBP, PDF ไม่เกิน 5 MB)</p>
      <FormStatus ok={status.ok} message={status.message} />
    </div>
  );
}
