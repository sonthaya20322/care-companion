/** Loading placeholder for area pages; announced once to screen readers. */
export function PageSkeleton() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-4">
      <span className="sr-only">กำลังโหลด...</span>
      <div className="skeleton h-10 w-2/3" />
      <div className="skeleton h-5 w-1/2" />
      <div className="mt-4 grid gap-4">
        <div className="skeleton h-28" />
        <div className="skeleton h-28" />
      </div>
    </div>
  );
}
