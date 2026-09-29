"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserIdentity } from "@/components/user/UserIdentity";
import GovernanceAvatarGroup from "@/components/governance/GovernanceAvatarGroup";
import SpaceAvatarGroup from "@/components/space/SpaceAvatarGroup";
import MenuButton from "@/components/ui/MenuButton";
import formatDate from "@/utils/date/formatDate";

const LeafletMap = dynamic(() => import("@/components/geography/LeafletMap"), { ssr: false });

export default function DocumentHeader({ post, publicContext, canEdit, onEdit, onDelete }) {
  const [mapOpen, setMapOpen] = useState(false);
  const governance = post?.governance ?? [];
  const spaces = Array.isArray(post?.spaces) ? post.spaces : [];
  const categories = Array.isArray(publicContext?.categories) ? publicContext.categories : [];
  const geography = Array.isArray(publicContext?.geography) ? publicContext.geography : [];
  const district = geography.find((item) => item?.relationship_type === "district" || item?.source_type === "address" || item?.geography_type === "district")?.name || null;
  const boundaries = geography
    .filter((item) => item?.geojson)
    .map((item) => ({
      ...item,
      osm_id: item.osm_id || item.id,
      osm_type: item.osm_type || "relation",
    }));
  const hasMap = Number.isFinite(Number(post?.lat)) && Number.isFinite(Number(post?.lng));

  const openMap = () => setMapOpen(true);
  const handleMapKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openMap();
    }
  };

  return (
    <>
      <header className="border-b pb-5">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0 flex-1 space-y-4">
            <UserIdentity
              username={post.author_username}
              name={post.author_name}
              avatar={post.author_avatar}
              createdAt={formatDate(post.created_at)}
            />

            {(spaces.length > 0 || governance.length > 0) && (
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {spaces.length > 0 && <SpaceAvatarGroup spaces={spaces} />}
                {governance.length > 0 && <GovernanceAvatarGroup authorities={governance} />}
              </div>
            )}

            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <span key={category.id || category.name} className="rounded-md bg-muted px-2.5 py-1 text-sm text-muted-foreground">
                    {category.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2">
            {canEdit && <MenuButton onEdit={onEdit} onDelete={onDelete} />}
            {hasMap && (
              <div
                role="button"
                tabIndex={0}
                onClick={openMap}
                onKeyDown={handleMapKeyDown}
                className="group relative h-32 w-52 cursor-pointer overflow-hidden rounded-xl border bg-muted text-left outline-none transition hover:ring-2 hover:ring-ring/40 focus-visible:ring-2 focus-visible:ring-ring sm:h-36 sm:w-60"
                aria-label="Open location map"
              >
                <LeafletMap
                  lat={Number(post.lat)}
                  lng={Number(post.lng)}
                  boundaries={boundaries}
                  showMarker
                  zoom={11}
                />
                <div className="absolute inset-0 z-20" aria-hidden="true" />
                <div className="absolute inset-x-0 bottom-0 z-30 bg-background/85 px-3 py-2 text-xs text-muted-foreground backdrop-blur-sm">
                  {district || post.address || "View location"}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <Dialog open={mapOpen} onOpenChange={setMapOpen}>
        <DialogContent className="flex h-[85dvh] max-h-[85dvh] w-[calc(100%-1rem)] max-w-5xl flex-col gap-0 overflow-hidden p-0 sm:w-[calc(100%-2rem)]">
          <DialogHeader className="shrink-0 border-b px-5 py-4">
            <DialogTitle>{post.address || district || "Location"}</DialogTitle>
          </DialogHeader>
          <div className="min-h-0 flex-1">
            <LeafletMap
              lat={Number(post.lat)}
              lng={Number(post.lng)}
              boundaries={boundaries}
              showMarker
              zoom={11}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
