"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { FileText, File, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { FocusCards } from "@/components/ui/focus-cards";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import Image from "next/image";

export default function PostCard({ post }) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!post) return null;

  const getAttachmentIcon = (attachment) => {
    if (attachment.type?.startsWith("image/")) return null;
    if (attachment.type === "application/pdf")
      return <FileText className="h-5 w-5 text-red-600" />;
    return <File className="h-5 w-5 text-gray-600" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024)
      return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const images =
    post.attachments?.filter((a) =>
      a.type?.startsWith("image/")
    ) || [];

  const files =
    post.attachments?.filter(
      (a) => !a.type?.startsWith("image/")
    ) || [];

  return (
    <>
      <Card className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.author_avatar} />
            <AvatarFallback>
              {post.author_name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold">
                {post.author_name || "Anonymous"}
              </span>
              <Badge variant="secondary" className="text-xs">
                {post.type?.toUpperCase()}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDistanceToNow(
                new Date(post.created_at)
              )}{" "}
              ago
            </div>
          </div>
        </div>

        {/* Content */}
        <p className="text-sm whitespace-pre-wrap">
          {post.details || post.summary}
        </p>

        {/* FocusCards Image Grid */}
        {images.length > 0 && (
          <FocusCards
            cards={images.map((img) => ({
              src: img.url,
            }))}
            onCardClick={(index) => {
              setActiveIndex(index);
              setViewerOpen(true);
            }}
          />
        )}

        {/* File Attachments */}
        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file, i) => (
              <a
                key={file.url || i}
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                {getAttachmentIcon(file)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {file.name || `Attachment ${i + 1}`}
                  </p>
                  {file.size && (
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  )}
                </div>
                <Download className="h-4 w-4 text-muted-foreground" />
              </a>
            ))}
          </div>
        )}
      </Card>

      {/* Fullscreen Viewer */}
      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="max-w-6xl p-0 bg-black border-none">
          <div className="relative flex items-center justify-center">

            {/* LEFT */}
            {images.length > 1 && (
              <button
                onClick={() =>
                  setActiveIndex((prev) =>
                    prev === 0
                      ? images.length - 1
                      : prev - 1
                  )
                }
                className="absolute left-4 z-10 bg-black/50 p-2 rounded-full text-white"
              >
                <ChevronLeft />
              </button>
            )}

            {/* IMAGE */}
            <div className="relative w-full h-[80vh]">
              <Image
                src={images[activeIndex]?.url}
                alt=""
                fill
                className="object-contain"
              />
            </div>

            {/* RIGHT */}
            {images.length > 1 && (
              <button
                onClick={() =>
                  setActiveIndex((prev) =>
                    prev === images.length - 1
                      ? 0
                      : prev + 1
                  )
                }
                className="absolute right-4 z-10 bg-black/50 p-2 rounded-full text-white"
              >
                <ChevronRight />
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
