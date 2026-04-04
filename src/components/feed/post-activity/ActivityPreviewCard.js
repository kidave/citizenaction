"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import GovernanceAvatarGroups from "@/components/governance/GovernanceAvatarGroups";
import formatPostDate from "@/utils/posts/formatPostDate";

// ✅ ADD THIS
const typeStyles = {
  action: "border-l-4 border-red-500 bg-red-50/30",
  report: "border-l-4 border-blue-500 bg-blue-50/30",
  event: "border-l-4 border-green-500 bg-green-50/30",
  update: "border-l-4 border-pink-500 bg-pink-50/30",
};

export default function ActivityPreviewCard({ post }) {
  const router = useRouter();

  const handleNavigate = () => {
    sessionStorage.setItem(
      "feed-scroll",
      window.scrollY.toString()
    );

    if (post.type === "meeting") {
      router.push(`/meeting/${post.id}`);
    } else {
      router.push(`/post/${post.id}`);
    }
  };

  // ✅ SAFE image extraction
  let image = null;

  if (Array.isArray(post.attachments) && post.attachments.length > 0) {
    const first = post.attachments[0];

    if (typeof first === "string") {
      image = first;
    } else if (typeof first === "object" && first?.url) {
      image = first.url;
    }
  }

  // ✅ date
  const dateString =
    post.metadata_date || post.sort_date;

  const formattedDate = formatPostDate(
    dateString,
    "absolute"
  );

  // ✅ APPLY STYLE
  const style = typeStyles[post.type] || "";

  return (
    <Card
      onClick={handleNavigate}
      className={`group cursor-pointer overflow-hidden hover:shadow-lg transition ${style}`}
    >
      {/* IMAGE */}
      <div className="relative h-40 bg-muted overflow-hidden">
        {image ? (
          <>
            <Image
              src={image}
              alt="activity"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

            <div className="absolute bottom-2 left-2 right-2 text-white text-sm font-medium line-clamp-2">
              {post.summary || "Untitled"}
            </div>

            <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded">
              {post.type?.toUpperCase()}
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
            {post.type?.toUpperCase() || "POST"}
          </div>
        )}
      </div>

      {/* CONTENT */}
      <CardHeader className="space-y-1">
        {(post.details || post.summary) && (
          <div className="text-sm font-medium line-clamp-2">
            {post.details || post.summary}
          </div>
        )}
      </CardHeader>

      {/* FOOTER */}
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