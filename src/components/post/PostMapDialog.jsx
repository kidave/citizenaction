"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { MapPinned } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";

const LeafletMap = dynamic(() => import("@/components/geography/LeafletMap"), { ssr: false });

function firstValue(...values) { return values.find((value) => value != null && value !== "") ?? null; }
function geometryOf(value) { return firstValue(value?.geojson, value?.geometry, value?.boundary, value?.geography?.geojson, value?.geography?.geometry); }
function districtName(context, post) { return firstValue(context?.district?.name, context?.district?.district_name, post?.district_name, post?.district?.name); }

export default function PostMapDialog({ post }) {
  const [open, setOpen] = useState(false);
  const [context, setContext] = useState(null);
  const [loading, setLoading] = useState(false);

  const lat = Number(firstValue(post?.lat, post?.latitude));
  const lng = Number(firstValue(post?.lng, post?.longitude, post?.lon));
  const hasLocation = Number.isFinite(lat) && Number.isFinite(lng);

  useEffect(() => {
    if (!open || !post?.id) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_post_public_context", { p_post_id: post.id });
      if (!cancelled && !error) setContext(Array.isArray(data) ? data[0] || null : data || null);
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [open, post?.id]);

  const mapData = useMemo(() => {
    const district = context?.district;
    const jurisdictionRows = Array.isArray(context?.jurisdiction) ? context.jurisdiction : [];
    const governanceRows = Array.isArray(context?.governance) ? context.governance : Array.isArray(post?.governance) ? post.governance : [];
    const boundaries = [];
    const districtGeo = geometryOf(district);
    if (districtGeo) boundaries.push({ id: district?.id || "district", kind: "district", geojson: districtGeo });
    jurisdictionRows.forEach((row, index) => {
      const geo = geometryOf(row);
      if (geo) boundaries.push({ id: row.geography_id || row.id || `jurisdiction-${index}`, kind: "jurisdiction", geojson: geo });
    });
    const markers = governanceRows.map((org) => ({
      id: org.id,
      kind: "governance",
      lat: Number(firstValue(org.office_lat, org.lat, org.latitude)),
      lng: Number(firstValue(org.office_lng, org.lng, org.longitude)),
      image_url: firstValue(org.image_url, org.logo_url),
      label: firstValue(org.name, org.short_name),
    })).filter((marker) => Number.isFinite(marker.lat) && Number.isFinite(marker.lng));
    return { boundaries, markers };
  }, [context, post]);

  if (!hasLocation) return null;
  const title = districtName(context, post) || firstValue(post?.address, "Location");
  const citizenLabel = firstValue(post?.address, districtName(context, post), "Post location");
  const citizenImage = firstValue(post?.author_avatar, post?.avatar_url, post?.author?.avatar_url);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="icon" aria-label="Open map" title="Map">
          <MapPinned className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="flex h-[78dvh] max-h-[720px] w-[96vw] max-w-5xl flex-col gap-0 overflow-hidden p-0">
        <div className="flex shrink-0 items-center justify-center border-b px-4 py-3">
          <DialogTitle className="truncate text-sm font-medium">{title}</DialogTitle>
        </div>
        <div className="min-h-0 flex-1 bg-muted/20 p-2 sm:p-3">
          {loading ? <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Loading map…</div> : (
            <div className="h-full w-full overflow-hidden rounded-lg border">
              <LeafletMap
                lat={lat}
                lng={lng}
                boundaries={mapData.boundaries}
                citizenMarker={{ image_url: citizenImage, label: citizenLabel }}
                markers={mapData.markers}
                showMarker
                zoom={12}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
