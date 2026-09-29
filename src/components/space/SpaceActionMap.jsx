"use client";

import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("@/components/geography/LeafletMap"), {
  ssr: false,
});

export default function SpaceActionMap({ posts = [] }) {
  const locatedPosts = posts.filter(
    (post) => Number.isFinite(Number(post?.lat)) && Number.isFinite(Number(post?.lng)),
  );

  const markers = locatedPosts.map((post) => ({
    id: post.id,
    kind: "person",
    lat: Number(post.lat),
    lng: Number(post.lng),
    image_url: post.author_avatar || null,
    label: post.title || post.author_name || "Action",
    popupPost: post,
  }));

  if (!locatedPosts.length) {
    return (
      <div className="flex h-64 items-center justify-center rounded-3xl border bg-muted/30 text-sm text-muted-foreground">
        No actions with a mapped location yet.
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border bg-muted/20">
      <div className="border-b bg-background px-4 py-3">
        <div className="text-sm font-semibold">Actions</div>
        <div className="text-xs text-muted-foreground">Where this Space has taken action</div>
      </div>
      <div className="h-[360px] sm:h-[420px]">
        <LeafletMap markers={markers} fitMarkers zoom={11} />
      </div>
    </section>
  );
}
