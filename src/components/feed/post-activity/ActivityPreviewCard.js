"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { motion } from "framer-motion";

import {
  CalendarDays,
} from "lucide-react";

import { format } from "date-fns";

import {
  Card,
  CardHeader,
  CardContent,
} from "@/components/ui/card";

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";

import AutoImageCarousel from "@/components/ui/AutoImageCarousel";

import GovernanceAvatarGroups from "@/components/governance/GovernanceAvatarGroups";

import { usePostGovernance } from "@/hooks/feed/usePostGovernance";

const typeStyles = {
  action: "bg-red-50",

  report: "bg-blue-50",

  event: "bg-green-50",

  update: "bg-pink-50",

  meeting: "bg-yellow-50",
};

export default function ActivityPreviewCard({
  post,
}) {
  const router = useRouter();

  const [isHovered, setIsHovered] =
    useState(false);

  const handleNavigate = () => {
    sessionStorage.setItem(
      "feed-scroll",
      window.scrollY.toString()
    );

    router.push(`/post/${post.id}`);
  };

  const startDate =
    post.start_at ||
    post.date ||
    post.created_at;

  const style =
    typeStyles[post.type] || "";

  return (
    <Card
      onClick={handleNavigate}
      onMouseEnter={() =>
        setIsHovered(true)
      }
      onMouseLeave={() =>
        setIsHovered(false)
      }
      className={`
        relative
        group
        cursor-pointer
        overflow-hidden
        hover:shadow-lg
        transition

        ${style}
      `}
    >

      {/* =====================================================
          IMAGE
      ===================================================== */}

      <div className="relative h-40 bg-muted overflow-hidden">

        {post.attachments?.length >
          0 ? (
          <>
            <AutoImageCarousel
              attachments={
                post.attachments
              }
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

            {/* TITLE */}

            <div className="absolute bottom-2 left-2 right-2 text-white text-sm font-medium line-clamp-2">
              {post.summary ||
                "Untitled"}
            </div>

            {/* BADGE */}

            <div
              className="
                absolute
                top-2
                right-2

                bg-black/60
                text-white

                text-[10px]

                px-2
                py-1

                rounded

                backdrop-blur-sm
              "
            >
              {post.type?.toUpperCase()}
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
            {post.type?.toUpperCase()}
          </div>
        )}

      </div>

      {/* =====================================================
          NORMAL CONTENT
      ===================================================== */}

      <motion.div
        animate={{
          opacity:
            isHovered ? 0 : 1,
        }}
        transition={{
          duration: 0.18,
        }}
      >

        <CardHeader className="space-y-2">

          {(post.details ||
            post.summary) && (
            <div className="text-xs text-muted-foreground line-clamp-2">
              {post.details ||
                post.summary}
            </div>
          )}

          {/* DATE */}

          <div className="flex items-center gap-2 text-xs text-muted-foreground">

            <CalendarDays className="h-3.5 w-3.5 shrink-0" />

            <span>
              {format(
                new Date(startDate),
                "d MMMM yyyy"
              )}
            </span>

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

            <AvatarImage
              src={
                post.author_avatar
              }
            />

            <AvatarFallback>
              {post.author_name?.charAt(
                0
              ) || "U"}
            </AvatarFallback>

          </Avatar>

        </div>

        {/* GOVERNANCE */}

        <PostGovernanceEntities
          postId={post.id}
        />

      </CardContent>

      {/* =====================================================
          FULL HOVER OVERLAY
      ===================================================== */}

      <motion.div
        initial={false}
        animate={{
          opacity:
            isHovered ? 1 : 0,
        }}
        transition={{
          duration: 0.22,
        }}
        className="
          absolute
          inset-0

          flex
          flex-col

          bg-background/95
          backdrop-blur-sm

          pointer-events-none
        "
      >

        {/* TOP */}

        <div className="p-4 flex-1 overflow-hidden">

          <div className="text-sm font-semibold line-clamp-2">
            {post.summary ||
              "Untitled"}
          </div>

          <div className="text-xs text-muted-foreground mt-3">

            <div className="line-clamp-[12]">
              {post.details ||
                "No additional details."}
            </div>

          </div>

        </div>

        {/* FOOTER */}

        <CardContent className="flex items-center justify-between">

          {/* AUTHOR */}

          <div className="flex items-center gap-2">

            <Avatar className="h-7 w-7">

              <AvatarImage
                src={
                  post.author_avatar
                }
              />

              <AvatarFallback>
                {post.author_name?.charAt(
                  0
                ) || "U"}
              </AvatarFallback>

            </Avatar>

          </div>

          {/* GOVERNANCE */}

          <PostGovernanceEntities
            postId={post.id}
          />

        </CardContent>

      </motion.div>

    </Card>
  );
}

/* =====================================================
   GOVERNANCE
===================================================== */

function PostGovernanceEntities({
  postId,
}) {
  const {
    data: entities = [],
  } = usePostGovernance(postId);

  if (!entities.length) {
    return null;
  }

  return (
    <GovernanceAvatarGroups
      entities={entities}
    />
  );
}