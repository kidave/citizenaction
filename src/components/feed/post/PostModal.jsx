"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";

import PostCard from "@/components/feed/post/PostCard";

export default function PostModal({
  post,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}) {
  const handleOpenChange = (nextOpen) => {
    console.log("PostModal open change:", nextOpen);

    onOpenChange?.(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] w-[calc(100%-1rem)] max-w-4xl overflow-y-auto rounded-[28px] p-0">
        {post ? (
          <PostCard
            post={post}
            borderless
            forceExpanded
            disableNavigation
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
