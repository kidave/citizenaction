"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import AutoImageCarousel from "@/components/ui/AutoImageCarousel";
import GovernanceAvatarGroups from "@/components/governance/GovernanceAvatarGroups";
import formatPostDate from "@/utils/posts/formatPostDate";

const typeStyles = {
  action: "border-l-4 border-red-500 bg-red-50/30",
  report: "border-l-4 border-blue-500 bg-blue-50/30",
  event: "border-l-4 border-green-500 bg-green-50/30",
  update: "border-l-4 border-pink-500 bg-pink-50/30",
};

export default function ActivityPreviewCard({ post }) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleNavigate = () => {
    sessionStorage.setItem(
      "feed-scroll",
      window.scrollY.toString()
    );
    router.push(`/post/${post.id}`);
  };

  const dateString =
    post.metadata_date || post.sort_date;

  const formattedDate = formatPostDate(
    dateString,
    "absolute"
  );

  const style = typeStyles[post.type] || "";

  return (
    <Card
      onClick={handleNavigate}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group cursor-pointer overflow-hidden hover:shadow-lg transition ${style}`}
    >
      {/* ================= IMAGE AREA ================= */}
      <div className="relative h-40 bg-muted overflow-hidden">

        {/* IMAGE LAYER */}
        {post.attachments?.length > 0 && (
          <motion.div
            animate={{ opacity: isHovered ? 0 : 1 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0"
          >
            <AutoImageCarousel attachments={post.attachments} />

            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

            {/* TITLE ON IMAGE */}
            <div className="absolute bottom-2 left-2 right-2 text-white text-sm font-medium line-clamp-2">
              {post.summary || "Untitled"}
            </div>

            <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded">
              {post.type?.toUpperCase()}
            </div>
          </motion.div>
        )}

        {/* HOVER CONTENT (REPLACES IMAGE) */}
        <motion.div
          initial={false}
          animate={{
            opacity: isHovered ? 1 : 0,
          }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0 p-3 flex flex-col bg-background"
        >
          {/* TITLE moves to top */}
          <div className="text-sm font-semibold line-clamp-2">
            {post.summary || "Untitled"}
          </div>

          {/* DETAILS expand inside fixed height */}
          <div className="text-xs text-muted-foreground mt-1 overflow-hidden">
            <div className="line-clamp-7">
              {post.details}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ================= CONTENT (unchanged) ================= */}
      <motion.div
        animate={{ opacity: isHovered ? 0 : 1 }}
        transition={{ duration: 0.2 }}
      >
        <CardHeader className="space-y-1">
          {(post.details || post.summary) && (
            <div className="text-xs text-muted-foreground line-clamp-2">
              {post.details || post.summary}
            </div>
          )}
        </CardHeader>
      </motion.div>

      {/* ================= FOOTER ================= */}
      <CardContent className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={post.author_avatar} />
            <AvatarFallback>
              {post.author_name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </div>

        <GovernanceAvatarGroups
          entities={post.governance_entities}
        />
      </CardContent>

      {/* DATE */}
      <div className="px-4 pb-3 text-xs text-muted-foreground">
        {formattedDate}
      </div>
    </Card>
  );
}