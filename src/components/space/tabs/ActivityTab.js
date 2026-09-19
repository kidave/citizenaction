"use client";

import { useMemo } from "react";

import { useSpaceFeed } from "@/hooks/space/useSpaceFeed";

import ActivityPreviewCard from "@/components/feed/activity/ActivityPreviewCard";

import MeetingSkeleton from "@/components/skeletons/MeetingSkeleton";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function ActivityTab({ spaceId, year, month }) {
  const { data: feed = [], isLoading } = useSpaceFeed(spaceId);

  const getDate = (post) => {
    if (post.start_at) {
      return new Date(post.start_at);
    }

    if (post.date) {
      return new Date(post.date);
    }

    return new Date(post.created_at);
  };

  const finalFeed = useMemo(() => {
    return feed
      .filter((post) => {
        const date = getDate(post);

        const matchYear = year ? date.getFullYear() === Number(year) : true;

        const matchMonth = month !== null ? date.getMonth() === month : true;

        return matchYear && matchMonth;
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [feed, year, month]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <MeetingSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!finalFeed.length ? (
        <Card>
          <CardHeader>
            <CardTitle>No activity</CardTitle>

            <CardDescription>
              No activity found for selected filters.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {finalFeed.map((post) => (
            <ActivityPreviewCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
