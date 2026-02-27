"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { FocusCards } from "@/components/ui/focus-cards";
import AttachmentViewer from "@/components/ui/AttachmentViewer";
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

  const attachments = post.attachments || [];

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

        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <FocusCards
            images={attachments.filter((a) =>
              a.type?.startsWith("image/")
            )}
            onCardClick={(index) => {
              setActiveIndex(index);
              setViewerOpen(true);
            }}
          />
        )}

        {/* Non-image files list */}
        {attachments
          .filter((a) => !a.type?.startsWith("image/"))
          .map((file, i) => (
            <div
              key={file.url || i}
              onClick={() => {
                setActiveIndex(
                  attachments.findIndex(
                    (a) => a.url === file.url
                  )
                );
                setViewerOpen(true);
              }}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer"
            >
              <span className="text-sm font-medium">
                {file.name || `Attachment ${i + 1}`}
              </span>
            </div>
          ))
        }
      </Card>

      {/* Fullscreen Viewer */}
      <AttachmentViewer
        attachments={attachments}
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        activeIndex={activeIndex}
      />
    </>
  );
}
