"use client";

import { useState } from "react";
import { format, parseISO, isValid, isAfter, isBefore } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Calendar,
  Clock,
  MapPin,
} from "lucide-react";
import { FocusCards } from "@/components/ui/focus-cards";
import AttachmentViewer from "@/components/ui/AttachmentViewer";
import { UserIdentity } from "@/components/profile/UserIdentity";
import { GovernanceHoverCard } from "@/components/governance/GovernanceHoverCard";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from "@/components/ui/avatar";

export default function PostCard({
  post,
  canEdit = false,
  onEdit,
  onDelete,
}) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!post) return null;

  const attachments = post.attachments || [];

  const authorityEntities =
    post.governance_entities?.filter(
      (e) =>
        e.entity_type === "authority" ||
        e.entity_type === "department"
    ) || [];

  /* =========================
     DATE & TIME HELPERS
  ========================== */

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const parsed = parseISO(dateString);
    if (!isValid(parsed)) return "";
    return format(parsed, "d MMMM yyyy");
  };

  const formatTime = (date, time) => {
    if (!date || !time) return "";
    const parsed = new Date(`${date}T${time}`);
    if (!isValid(parsed)) return "";
    return format(parsed, "h:mm a");
  };

  const getMeetingStatus = (date, time) => {
    if (!date || !time) return null;

    const meetingDate = new Date(`${date}T${time}`);
    if (!isValid(meetingDate)) return null;

    const now = new Date();

    if (isAfter(meetingDate, now)) return "Upcoming";
    if (isBefore(meetingDate, now)) return "Completed";
    return "Ongoing";
  };

  const meetingStatus = getMeetingStatus(
    post.metadata?.date,
    post.metadata?.time
  );

  /* ========================= */

  return (
    <>
      <Card className="p-5 space-y-4">

        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">

          {/* LEFT: Avatar + Name */}
          <div className="flex items-start gap-3 min-w-0 justify-between">
            <UserIdentity
              username={post.author_username}
              name={post.author_name}
              avatar={post.author_avatar}
              createdAt={post.created_at}
            />

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

          {/* RIGHT: Type + Authorities */}
          <div className="flex flex-wrap items-center justify-end gap-2 md:justify-start">

            <Badge
              variant="secondary"
              className="text-xs shrink-0"
            >
              {post.type?.toUpperCase()}
            </Badge>

            {authorityEntities.length > 0 && (
              <AvatarGroup>
                {authorityEntities.slice(0, 5).map((e) => (
                  <GovernanceHoverCard key={e.id} entity={e}>
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={e.image_url} />
                      <AvatarFallback>G</AvatarFallback>
                    </Avatar>
                  </GovernanceHoverCard>
                ))}
              </AvatarGroup>
            )}
          </div>
        </div>

        {/* ================= CONTENT ================= */}
        <p className="text-sm whitespace-pre-wrap">
          {post.details || post.summary}
        </p>

        {/* ================= METADATA ================= */}
        {(post.metadata || post.status) && (
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">

            {/* Date */}
            {post.metadata?.date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(post.metadata.date)}
              </div>
            )}

            {/* Time */}
            {post.metadata?.time && (
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatTime(
                  post.metadata.date,
                  post.metadata.time
                )}
              </div>
            )}

            {/* Location */}
            {post.metadata?.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate max-w-[150px]">
                  {post.metadata.location}
                </span>
              </div>
            )}

            {/* Auto Meeting Status */}
            {meetingStatus && (
              <>
                <span className="opacity-40">•</span>
                <span
                  className={`font-medium ${
                    meetingStatus === "Upcoming"
                      ? "text-blue-600"
                      : meetingStatus === "Ongoing"
                      ? "text-green-600"
                      : "text-muted-foreground"
                  }`}
                >
                  {meetingStatus}
                </span>
              </>
            )}

            {/* Reporting Status (Submitted, Pending etc.) */}
            {post.status && (
              <>
                <span className="opacity-40">•</span>
                <span className="font-medium text-foreground">
                  {post.status}
                </span>
              </>
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

      {/* ================= VIEWER ================= */}
      <AttachmentViewer
        attachments={attachments}
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        activeIndex={activeIndex}
      />
    </>
  );
}