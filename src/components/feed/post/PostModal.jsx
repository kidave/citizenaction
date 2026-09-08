"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import PostCard from "@/components/feed/post/PostCard";

export default function PostModal({ post, open, onOpenChange }) {
  const handleOpenChange = (nextOpen) => {
    onOpenChange?.(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] w-[calc(100%-1rem)] max-w-4xl overflow-y-auto rounded-[28px] p-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {post ? (
          <>
            <PostCard
              post={post}
              borderless
              forceExpanded
              disableNavigation
              canEdit={false}
            />

            <div className="flex justify-end border-t px-5 py-4 sm:px-6">
              <Button asChild>
                <Link
                  href={`/post/${post.slug}`}
                  onClick={() => onOpenChange?.(false)}
                >
                  Open full post
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
