"use client";

import { useRouter } from "next/router";

import { Card } from "@/components/ui/card";

function getPreviewUrl(attachment) {
  if (!attachment) return null;

  const mime = attachment.mime_type || "";
  const fileName = attachment.file_name || "";
  const extension = fileName.split(".").pop()?.toLowerCase();

  // Direct image
  if (mime.startsWith("image/") && attachment.public_url) {
    return attachment.public_url;
  }

  // PDF thumbnail
  if (
    (mime === "application/pdf" || extension === "pdf") &&
    attachment.thumbnail_url
  ) {
    return attachment.thumbnail_url;
  }

  return null;
}

function AttachmentPreview({ attachments }) {
  const candidates = Array.isArray(attachments)
    ? attachments
        .map((attachment) => ({
          attachment,
          url: getPreviewUrl(attachment),
        }))
        .filter((item) => item.url)
    : [];

  const [firstCandidate] = candidates;

  if (!firstCandidate) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted">
        <span className="text-4xl text-muted-foreground/30">+</span>
      </div>
    );
  }

  return (
    <img
      src={firstCandidate.url}
      alt=""
      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
      onError={(event) => {
        // Try the next usable attachment if the first preview fails.
        const currentIndex = candidates.findIndex(
          (item) => item.url === event.currentTarget.src,
        );

        const nextCandidate = candidates[currentIndex + 1];

        if (nextCandidate) {
          event.currentTarget.src = nextCandidate.url;
          return;
        }

        // Nothing else can be displayed.
        event.currentTarget.style.display = "none";

        const fallback = event.currentTarget.parentElement?.querySelector(
          "[data-preview-fallback]",
        );

        fallback?.classList.remove("hidden");
      }}
    />
  );
}

export default function UserPostCard({ post }) {
  const router = useRouter();

  if (!post) {
    return null;
  }

  const hasAttachments =
    Array.isArray(post.attachments) && post.attachments.length > 0;

  const handleNavigate = () => {
    if (!post.slug) return;

    router.push(`/post/${post.slug}`);
  };

  return (
    <Card
      onClick={handleNavigate}
      className="group relative aspect-[3/4] cursor-pointer overflow-hidden rounded-none border-0 bg-muted p-0 shadow-none"
    >
      {/* IMAGE / ATTACHMENT PREVIEW */}

      <div className="absolute inset-0">
        {hasAttachments ? (
          <>
            <AttachmentPreview attachments={post.attachments} />

            <div
              data-preview-fallback
              className="absolute inset-0 hidden items-center justify-center bg-muted"
            >
              <span className="text-4xl text-muted-foreground/30">+</span>
            </div>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <span className="text-4xl text-muted-foreground/30">+</span>
          </div>
        )}
      </div>

      {/* BOTTOM GRADIENT */}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-black/70 to-transparent" />

      {/* TITLE */}

      <div className="absolute inset-x-0 bottom-0 z-20 min-w-0 p-3 text-white">
        <p className="truncate text-sm font-semibold leading-tight">
          {post.title || "Untitled"}
        </p>
      </div>

      {/* HOVER */}

      <div className="pointer-events-none absolute inset-0 z-10 bg-black/0 transition-colors duration-200 group-hover:bg-black/10" />
    </Card>
  );
}
