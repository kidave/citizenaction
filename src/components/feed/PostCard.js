"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { FileText, File, Download, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { FocusCards } from "@/components/ui/focus-cards";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Image from "next/image";
import { UserIdentity } from "@/components/profile/UserIdentity";
import { GovernanceHoverCard } from "@/components/governance/GovernanceHoverCard";
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from "@/components/ui/avatar";

export default function PostCard({ post, canEdit = false, onEdit, onDelete, }) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!post) return null;

  const authorityEntities =
    post.governance_entities?.filter(
      (e) =>
        e.entity_type === "authority" ||
        e.entity_type === "department"
    ) || [];

  const peopleEntities =
    post.governance_entities?.filter(
      (e) =>
        e.entity_type === "designation" ||
        e.entity_type === "person"
    ) || [];

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
        <div className="flex items-start justify-between">

          {/* LEFT SIDE: User + Type */}
          <div className="flex items-start gap-3">
            <UserIdentity
              username={post.author_username}
              name={post.author_name}
              avatar={post.author_avatar}
              createdAt={post.created_at}
            />

            <Badge
              variant="secondary"
              className="text-xs mt-1"
            >
              {post.type?.toUpperCase()}
            </Badge>
          </div>

          {/* RIGHT SIDE: Governance Avatar Groups */}
          {post.governance_entities?.length > 0 && (
            <div className="flex items-center gap-4">

              {/* Authority / Department */}
              {authorityEntities.length > 0 && (
                <AvatarGroup>
                  {authorityEntities.slice(0, 5).map((e) => (
                    <GovernanceHoverCard key={e.id} entity={e}>
                      <Avatar
                        className="
                          h-8 w-8 
                          relative
                          transition-all duration-200
                          hover:scale-110
                          hover:-translate-y-1
                          hover:z-50
                          hover:shadow-lg
                          cursor-pointer
                        "
                      >
                        <AvatarImage src={e.image_url} />
                        <AvatarFallback>G</AvatarFallback>
                      </Avatar>
                    </GovernanceHoverCard>
                  ))}

                  {authorityEntities.length > 5 && (
                    <GovernanceHoverCard entityList={authorityEntities.slice(5)}>
                      <AvatarGroupCount>+{authorityEntities.length - 5}</AvatarGroupCount>
                    </GovernanceHoverCard>
                  )}
                </AvatarGroup>
              )}

              {/* Person / Designation */}
              {peopleEntities.length > 0 && (
                <AvatarGroup>
                  {peopleEntities.slice(0, 5).map((e) => (
                    <GovernanceHoverCard key={e.id} entity={e}>
                      <Avatar className="h-8 w-8 hover:ring-2 hover:ring-primary transition">
                        <AvatarImage src={e.image_url} />
                        <AvatarFallback>P</AvatarFallback>
                      </Avatar>
                    </GovernanceHoverCard>
                  ))}

                  {peopleEntities.length > 5 && (
                    <AvatarGroupCount>
                      +{peopleEntities.length - 5}
                    </AvatarGroupCount>
                  )}
                </AvatarGroup>
              )}
            </div>
          )}
          {/* EDIT / DELETE MENU */}
          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  Edit
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="text-red-500"
                  onClick={onDelete}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>


        {/* Content */}
        <p className="text-sm whitespace-pre-wrap">
          {post.details || post.summary}
        </p>

        {post.status && (
          <Badge variant="outline" className="text-xs">
            {post.status}
          </Badge>
        )}
        {post.metadata && (
          <div className="text-xs text-muted-foreground space-y-1">
            {post.metadata.date && (
              <div>Date: {post.metadata.date}</div>
            )}
            {post.metadata.time && (
              <div>Time: {post.metadata.time}</div>
            )}
            {post.metadata.location && (
              <div>Location: {post.metadata.location}</div>
            )}
            {post.metadata.mode && (
              <div>Mode: {post.metadata.mode}</div>
            )}
          </div>
        )}

        {/* Images */}
        {images.length > 0 && (
          <>
            {/* ---------------- MOBILE (Twitter Style) ---------------- */}
            <div className="md:hidden">
              <div
                className={`
                  grid gap-1 rounded-xl overflow-hidden
                  ${images.length === 1 ? "grid-cols-1" : "grid-cols-2"}
                `}
              >
                {images.slice(0, 4).map((img, index) => {
                  const isThreeLayout =
                    images.length === 3 && index === 2;

                  return (
                    <div
                      key={img.url || index}
                      onClick={() => {
                        setActiveIndex(index);
                        setViewerOpen(true);
                      }}
                      className={`
                        relative w-full cursor-pointer
                        ${images.length === 1 ? "aspect-[16/9]" : "aspect-square"}
                        ${isThreeLayout ? "col-span-2 aspect-[16/9]" : ""}
                      `}
                    >
                      <Image
                        src={img.url}
                        alt=""
                        fill
                        className="object-cover hover:opacity-90 transition"
                      />

                      {images.length > 4 && index === 3 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-lg font-semibold">
                          +{images.length - 4}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ---------------- DESKTOP (FocusCards) ---------------- */}
            <div className="hidden md:block">
              <FocusCards
                cards={images.map((img) => ({
                  src: img.url,
                }))}
                onCardClick={(index) => {
                  setActiveIndex(index);
                  setViewerOpen(true);
                }}
              />
            </div>
          </>
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
