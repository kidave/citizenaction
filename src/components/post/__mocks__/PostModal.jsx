export default function StorybookPostModal({ post, open, onOpenChange }) {
  if (!open) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${post?.title || "Post"} preview`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
    >
      <div className="w-full max-w-lg rounded-lg border bg-background p-6 text-foreground">
        <h2 className="text-lg font-semibold">{post?.title || "Post preview"}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {post?.content || "No additional content."}
        </p>
        <button
          type="button"
          className="mt-4 rounded-md border px-3 py-2 text-sm"
          onClick={() => onOpenChange?.(false)}
        >
          Close post preview
        </button>
      </div>
    </div>
  );
}
