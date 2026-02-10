"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PostCard({ author, role, content, time }) {
  return (
    <Card className="p-4 space-y-3">
      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src="/user1.png" />
            <AvatarFallback>{author[0]}</AvatarFallback>
          </Avatar>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{author}</span>
              {role && (
                <Badge variant="outline" className="text-xs">
                  {role}
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {time}
            </span>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <p className="text-sm leading-relaxed">
        {content}
      </p>

      {/* ACTIONS (future-ready) */}
      <div className="flex gap-4 pt-2 text-xs text-muted-foreground">
        <button className="hover:underline">Like</button>
        <button className="hover:underline">Comment</button>
        <button className="hover:underline">Share</button>
      </div>
    </Card>
  );
}
