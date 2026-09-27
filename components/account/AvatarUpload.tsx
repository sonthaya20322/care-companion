"use client";

import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { setAvatar } from "@/app/account/actions";
import { Avatar } from "@/components/Avatar";
import { buttonClasses } from "@/components/ui/Button";
import { FormStatus } from "@/components/ui/FormStatus";
import { errorMessages } from "@/lib/domain/errors";
import { createClient } from "@/lib/supabase/client";

const MAX_BYTES = 2 * 1024 * 1024;
const extensions: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export function AvatarUpload({ userId, name, avatarUrl }: { userId: string; name: string; avatarUrl: string | null }) {
  const inputId = useId();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ ok?: boolean; message?: string }>({});

  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const ext = extensions[file.type];
    if (!ext) return setStatus({ message: errorMessages.INVALID_FILE });
    if (file.size > MAX_BYTES) return setStatus({ message: `${errorMessages.FILE_TOO_LARGE} (ไม่เกิน 2 MB)` });

    startTransition(async () => {
      const path = `${userId}/avatar-${Date.now()}.${ext}`;
      const { error } = await createClient().storage.from("avatars").upload(path, file, { contentType: file.type });
      if (error) {
        console.error("avatar upload failed", { message: error.message });
        setStatus({ message: errorMessages.UPLOAD_FAILED });
        return;
      }
      const result = await setAvatar(path);
      setStatus(result);
      if (result.ok) router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-5">
      <Avatar name={name} src={avatarUrl} size="lg" />
      <div className="flex flex-col items-start gap-2">
        <label
          htmlFor={inputId}
          className={buttonClasses(
            "secondary",
            "md",
            `has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-sora-600 has-[:focus-visible]:outline ${
              pending ? "pointer-events-none opacity-60" : "cursor-pointer"
            }`,
          )}
        >
          {pending ? "กำลังอัปโหลด..." : "เปลี่ยนรูปโปรไฟล์"}
          <input
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={onChange}
            disabled={pending}
          />
        </label>
        <p className="text-sm text-sumi-soft">JPG, PNG หรือ WEBP ไม่เกิน 2 MB ควรเห็นใบหน้าชัดเจน</p>
        <FormStatus ok={status.ok} message={status.message} />
      </div>
    </div>
  );
}
