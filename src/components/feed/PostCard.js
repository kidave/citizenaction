"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  FileText,
  Paperclip,
  Share2,
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
  const router = useRouter();

  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);

  if (!post) return null;

  const attachments = post.attachments || [];

  const authorityEntities =
    post.governance_entities?.filter(
      (e) =>
        e.entity_type === "authority" ||
        e.entity_type === "department"
    ) || [];

  /* =========================
     CONTENT TRUNCATION
  ========================== */

  const content = post.details || post.summary || "";
  const isLong = content.length > 280;

  /* =========================
     DATE HELPERS
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

  /* =========================
     NAVIGATION
  ========================== */

  const handleCardClick = () => {
    sessionStorage.setItem(
      "feed-scroll",
      window.scrollY.toString()
    );

    router.push(`/post/${post.id}`);
  };

  /* ========================= */

  const handleShare = async (e) => {
    e.stopPropagation();

    const url = `${window.location.origin}/post/${post.id}`;
    const title = post.summary || "Citizen Action Post";
    const text = (post.details || "").slice(0, 120);

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <>
      <Card
        className="p-5 space-y-4 cursor-pointer transition-colors"
        onClick={handleCardClick}
      >
        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="flex items-start gap-3 min-w-0 justify-between">
            <UserIdentity
              username={post.author_username}
              name={post.author_name}
              avatar={post.author_avatar}
              createdAt={post.created_at}
            />

            <Badge
              variant="secondary"
              className="text-xs shrink-0 mt-2"
            >
              {post.type?.toUpperCase()}
            </Badge>

            
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 md:justify-start">
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>

            {authorityEntities.length > 0 && (
              <AvatarGroup>
                {authorityEntities.slice(0, 5).map((e) => (
                  <GovernanceHoverCard key={e.id} entity={e}>
                    <Avatar
                      className="h-7 w-7"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <AvatarImage src={e.image_url} />
                      <AvatarFallback>G</AvatarFallback>
                    </Avatar>
                  </GovernanceHoverCard>
                ))}
              </AvatarGroup>
            )}

            {canEdit && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.();
                    }}
                  >
                    Edit
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.();
                    }}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* ================= CONTENT ================= */}
        <div
          className="text-sm whitespace-pre-wrap"
        >
          {expanded || !isLong
            ? content
            : content.slice(0, 280) + "..."}

          {isLong && (
            <span
              className="ml-2 text-primary font-medium hover:underline cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
            >
              {expanded ? "Show less" : "Show more"}
            </span>
          )}
        </div>

        {/* ================= METADATA ================= */}
        {(post.metadata || post.status) && (
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {post.metadata?.date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(post.metadata.date)}
              </div>
            )}

            {post.metadata?.time && (
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatTime(
                  post.metadata.date,
                  post.metadata.time
                )}
              </div>
            )}

            {post.metadata?.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate max-w-[150px]">
                  {post.metadata.location}
                </span>
              </div>
            )}

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

        {/* ================= IMAGE ATTACHMENTS ================= */}
        {attachments.length > 0 && (
          <div onClick={(e) => e.stopPropagation()}>
            <FocusCards
              images={attachments.filter((a) =>
                a.type?.startsWith("image/")
              )}
              onCardClick={(index) => {
                setActiveIndex(index);
                setViewerOpen(true);
              }}
            />
          </div>
        )}

        {/* ================= FILE ATTACHMENTS ================= */}
        {attachments.filter((a) => !a.type?.startsWith("image/"))
          .length > 0 && (
          <div
            className="flex flex-wrap gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {attachments
              .filter((a) => !a.type?.startsWith("image/"))
              .map((file, i) => {
                const isPdf =
                  file.type === "application/pdf";

                return (
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
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/40 hover:bg-muted text-xs cursor-pointer transition-colors"
                  >
                    {isPdf ? (
                      <FileText className="h-3.5 w-3.5 text-red-500" />
                    ) : (
                      <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                    )}

                    <span className="max-w-[140px] truncate font-medium">
                      {file.name || `File ${i + 1}`}
                    </span>
                  </div>
                );
              })}
          </div>
        )}
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