"use client";

import { useState } from "react";

import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";
import { format } from "date-fns";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import AutoImageCarousel from "@/components/attachment/AutoImageCarousel";
import GovernanceAvatarGroup from "@/components/governance/GovernanceAvatarGroup";
import PostModal from "@/components/post/PostModal";

import {
  TIMELINE_FALLBACK_IMAGES,
  TIMELINE_NATURAL_TEXT,
} from "@/config/timeline";

import { getActivityDate } from "@/utils/activity";

function pickVariant(post, items) {
  if (!items?.length) return "A moment worth keeping";
  const key = String(post.id || post.slug || post.title || "activity");
  let hash = 0;
  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) >>> 0;
  }
  return items[hash % items.length];
}

export default function ActivityPreviewCard({
  post,
  onSelect,
  className = "",
  variant = "default",
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!post) return null;

  const isMap = variant === "map";
  const attachments = Array.isArray(post.attachments) ? post.attachments : [];
  const governance = Array.isArray(post.governance) ? post.governance : [];
  const parsedDate = getActivityDate(post);
  const naturalItems = TIMELINE_NATURAL_TEXT.post || ["A moment worth keeping"];
  const natural = pickVariant(post, naturalItems);
  const fallbackImage = TIMELINE_FALLBACK_IMAGES.post;
  const authorInitial = post.author_name?.charAt(0)?.toUpperCase() || "U";

  const handleClick = () => {
    onSelect?.(post);
    setIsModalOpen(true);
  };

  if (isMap) {
    return (
      <>
        <Card
          onClick={handleClick}
          className={[
            "w-[170px] max-w-[calc(100vw-64px)] cursor-pointer overflow-hidden rounded-xl bg-background shadow-md",
            className,
          ].join(" ")}
        >
          {attachments.length > 0 ? (
            <div className="relative h-14 overflow-hidden bg-muted">
              <AutoImageCarousel attachments={attachments} />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="pointer-events-none absolute inset-x-2 bottom-1 line-clamp-2 text-[9px] font-semibold leading-tight text-white">
                {post.title || "Untitled"}
              </div>
            </div>
          ) : (
            <div className="border-b px-2 pt-2">
              <div className="line-clamp-2 text-[10px] font-semibold leading-tight">
                {post.title || "Untitled"}
              </div>
            </div>
          )}

          <CardContent className="space-y-1.5 p-2">
            {post.content ? (
              <div className="line-clamp-2 text-[9px] leading-snug text-muted-foreground">
                {post.content}
              </div>
            ) : null}

            <div className="flex items-center justify-between gap-1">
              <div className="flex min-w-0 items-center gap-1">
                <Avatar className="h-4 w-4 shrink-0">
                  <AvatarImage src={post.author_avatar} alt={post.author_name || ""} />
                  <AvatarFallback className="text-[7px]">{authorInitial}</AvatarFallback>
                </Avatar>
                <span className="truncate text-[8px] font-medium">
                  {post.author_name || "Citizen"}
                </span>
              </div>
              {governance.length > 0 ? <GovernanceAvatarGroup authorities={governance} /> : null}
            </div>

            {parsedDate ? (
              <div className="flex items-center gap-1 border-t pt-1 text-[8px] text-muted-foreground">
                <CalendarDays className="h-2.5 w-2.5 shrink-0" />
                <span>{format(parsedDate, "d MMM yyyy")}</span>
              </div>
            ) : null}
          </CardContent>
        </Card>
        <PostModal post={post} open={isModalOpen} onOpenChange={setIsModalOpen} />
      </>
    );
  }

  return (
    <>
      <Card
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={["group relative cursor-pointer overflow-hidden rounded-[28px] bg-muted transition-all duration-300", className].join(" ")}
      >
        <div className="relative h-40 overflow-hidden bg-background">
          {attachments.length > 0 ? (
            <>
              <AutoImageCarousel attachments={attachments} />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
              <div className="pointer-events-none absolute inset-x-3 bottom-3">
                <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/70">{natural}</div>
                <div className="mt-1 line-clamp-2 text-[17px] font-semibold leading-tight text-white">{post.title || "Untitled"}</div>
              </div>
            </>
          ) : fallbackImage ? (
            <>
              <img src={fallbackImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
              <div className="pointer-events-none absolute inset-x-3 bottom-3">
                <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/70">{natural}</div>
                <div className="mt-1 line-clamp-2 text-[17px] font-semibold leading-tight text-white">{post.title || "Untitled"}</div>
              </div>
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center"><span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">POST</span></div>
          )}
        </div>

        <motion.div initial={false} animate={{ opacity: isHovered ? 0 : 1 }} transition={{ duration: 0.18 }}>
          <div className="space-y-2 p-4 text-sm">
            {(post.content || post.title) && <div className="line-clamp-2 leading-relaxed">{post.content || post.title}</div>}
            {parsedDate ? <div className="flex items-center gap-2 text-xs font-medium"><CalendarDays className="h-3.5 w-3.5 shrink-0" /><span>{format(parsedDate, "d MMMM yyyy")}</span></div> : null}
          </div>
        </motion.div>

        <CardContent className="flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <Avatar className="h-7 w-7"><AvatarImage src={post.author_avatar} alt={post.author_name || ""} /><AvatarFallback>{authorInitial}</AvatarFallback></Avatar>
            {post.author_name ? <span className="max-w-[120px] truncate text-xs font-medium">{post.author_name}</span> : null}
          </div>
          {governance.length > 0 ? <GovernanceAvatarGroup authorities={governance} /> : null}
        </CardContent>

        <motion.div initial={false} animate={{ opacity: isHovered ? 1 : 0 }} transition={{ duration: 0.22 }} className="pointer-events-none absolute inset-0 flex flex-col bg-muted">
          <div className="flex-1 overflow-hidden p-4"><div className="line-clamp-2 text-lg font-semibold">{post.title || "Untitled"}</div><div className="mt-2 text-sm leading-relaxed"><div className="line-clamp-[12]">{post.content || "No additional content."}</div></div></div>
          <CardContent className="flex items-center justify-between"><div className="flex min-w-0 items-center gap-2"><Avatar className="h-7 w-7"><AvatarImage src={post.author_avatar} alt={post.author_name || ""} /><AvatarFallback>{authorInitial}</AvatarFallback></Avatar>{post.author_name ? <span className="max-w-[120px] truncate text-xs font-medium">{post.author_name}</span> : null}</div>{governance.length > 0 ? <GovernanceAvatarGroup authorities={governance} /> : null}</CardContent>
        </motion.div>
      </Card>
      <PostModal post={post} open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}
