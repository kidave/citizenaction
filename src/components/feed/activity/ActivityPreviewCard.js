"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { motion } from "framer-motion";

import { CalendarDays } from "lucide-react";

import { format } from "date-fns";

import { Card, CardHeader, CardContent } from "@/components/ui/card";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import AutoImageCarousel from "@/components/ui/AutoImageCarousel";

import GovernanceAvatarGroups from "@/components/governance/GovernanceAvatarGroups";

import { usePostGovernance } from "@/hooks/feed/usePostGovernance";

const typeStyles = {
  action: "bg-gradient-to-br from-red-100 to-red-50",

  report: "bg-gradient-to-br from-blue-100 to-blue-50",

  event: "bg-gradient-to-br from-green-100 to-green-50",

  update: "bg-gradient-to-br from-pink-100 to-pink-50",

  meeting: "bg-gradient-to-br from-yellow-100 to-yellow-50",
};

export default function ActivityPreviewCard({ post }) {
  const router = useRouter();

  const [isHovered, setIsHovered] = useState(false);

  const handleNavigate = () => {
    sessionStorage.setItem("feed-scroll", window.scrollY.toString());

    router.push(`/post/${post.id}`);
  };

  const startDate = post.start_at || post.date || post.created_at;

  const style = typeStyles[post.type] || "";

  return (
    <Card
      onClick={handleNavigate}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative cursor-pointer overflow-hidden rounded-[28px] transition-all duration-300 ${style} `}
    >
      {/* =====================================================
          IMAGE
      ===================================================== */}

      <div className="relative h-40 overflow-hidden bg-muted">
        {post.attachments?.length > 0 ? (
          <>
            <AutoImageCarousel attachments={post.attachments} />

            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

            {/* TITLE */}

            <div className="absolute bottom-2 left-2 right-2 line-clamp-2 text-sm font-medium text-white">
              {post.summary || "Untitled"}
            </div>

            {/* BADGE */}

            <div className="absolute right-2 top-2 rounded bg-black/60 px-2 py-1 text-[10px] text-white backdrop-blur-sm">
              {post.type?.toUpperCase()}
            </div>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            {post.type?.toUpperCase()}
          </div>
        )}
      </div>

      {/* =====================================================
          NORMAL CONTENT
      ===================================================== */}

      <motion.div
        animate={{
          opacity: isHovered ? 0 : 1,
        }}
        transition={{
          duration: 0.18,
        }}
      >
        <CardHeader className="space-y-2">
          {(post.details || post.summary) && (
            <div className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {post.details || post.summary}
            </div>
          )}

          {/* DATE */}

          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" />

            <span>{format(new Date(startDate), "d MMMM yyyy")}</span>
          </div>
        </CardHeader>
      </motion.div>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <CardContent className="flex items-center justify-between">
        {/* AUTHOR */}

        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={post.author_avatar} />

            <AvatarFallback>
              {post.author_name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* GOVERNANCE */}

        <PostGovernanceEntities postId={post.id} />
      </CardContent>

      {/* =====================================================
          FULL HOVER OVERLAY
      ===================================================== */}

      <motion.div
        initial={false}
        animate={{
          opacity: isHovered ? 1 : 0,
        }}
        transition={{
          duration: 0.22,
        }}
        className="pointer-events-none absolute inset-0 flex flex-col bg-background/100"
      >
        {/* TOP */}

        <div className="flex-1 overflow-hidden p-4">
          <div className="line-clamp-2 text-sm font-semibold">
            {post.summary || "Untitled"}
          </div>

          <div className="mt-4 text-sm leading-relaxed text-muted-foreground">
            <div className="line-clamp-[12]">
              {post.details || "No additional details."}
            </div>
          </div>
        </div>

        {/* FOOTER */}

        <CardContent className="flex items-center justify-between">
          {/* AUTHOR */}

          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7">
              <AvatarImage src={post.author_avatar} />

              <AvatarFallback>
                {post.author_name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* GOVERNANCE */}

          <PostGovernanceEntities postId={post.id} />
        </CardContent>
      </motion.div>
    </Card>
  );
}

/* =====================================================
   GOVERNANCE
===================================================== */

function PostGovernanceEntities({ postId }) {
  const { data: entities = [] } = usePostGovernance(postId);

  if (!entities.length) {
    return null;
  }

  return <GovernanceAvatarGroups entities={entities} />;
}
