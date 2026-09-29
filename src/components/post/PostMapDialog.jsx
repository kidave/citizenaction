"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { MapPinned } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";

const LeafletMap = dynamic(() => import("@/components/geography/LeafletMap"), { ssr: false });

function firstValue(...values) {
  return values.find((value) => value != null && value !== "") ?? null;
}

function geometryOf(value) {
  if (!value) return null;
  if (value.geojson) return value.geojson;
  if (value.geometry) return value.geometry;
  if (value.boundary) return value.boundary;
  if (value.geography?.geojson) return value.geography.geojson;
  if (value.geography?.geometry) return value.geography.geometry;
  if (value.geography?.boundary) return value.geography.boundary;
  return null;
}

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function districtRows(context, post) {
  const rows = [
    ...asArray(context?.geography),
    ...asArray(context?.district),
    ...asArray(context?.district_boundary),
    ...asArray(context?.districtBoundary),
    ...asArray(post?.district),
    ...asArray(post?.district_boundary),
  ];

  return rows.filter((row) => {
    const relationship = String(row?.relationship_type || "").toLowerCase();
    const source = String(row?.source_type || "").toLowerCase();
    const type = String(row?.geography_type || "").toLowerCase();
    return relationship === "district" || source === "address" || type === "district";
  });
}

function districtName(context, post) {
  const row = districtRows(context, post).find((item) => item?.name || item?.district_name);
  return firstValue(
    row?.name,
    row?.district_name,
    post?.district_name,
    post?.district?.name,
  );
}

function boundaryId(value, fallback) {
  return firstValue(value?.geography_id, value?.id, value?.osm_id, fallback);
}

function collectDistrictBoundary(context, post) {
  const seen = new Set();
  return districtRows(context, post).flatMap((row, index) => {
    const geo = geometryOf(row);
    if (!geo) return [];
    const id = boundaryId(row, `district-${index}`);
    const key = `${id}-${JSON.stringify(geo).slice(0, 120)}`;
    if (seen.has(key)) return [];
    seen.add(key);
    return [{
      id,
      kind: "district",
      geojson: geo,
      name: firstValue(row?.name, row?.district_name),
    }];
  });
}

function collectJurisdictionBoundaries(context) {
  const candidates = [
    ...asArray(context?.jurisdiction),
    ...asArray(context?.jurisdictions),
    ...asArray(context?.governance_jurisdiction),
    ...asArray(context?.governance_jurisdictions),
  ];

  for (const governance of asArray(context?.governance)) {
    candidates.push(...asArray(governance?.jurisdiction));
    candidates.push(...asArray(governance?.jurisdictions));
    candidates.push(...asArray(governance?.geography));
    candidates.push(...asArray(governance?.geographies));
  }

  for (const person of asArray(context?.people)) {
    candidates.push(person?.organization?.jurisdiction);
    candidates.push(...asArray(person?.organization?.geography));
  }

  const seen = new Set();
  return candidates.flatMap((row, index) => {
    const geo = geometryOf(row);
    if (!geo) return [];
    const id = boundaryId(row, `jurisdiction-${index}`);
    const key = `${id}-${JSON.stringify(geo).slice(0, 120)}`;
    if (seen.has(key)) return [];
    seen.add(key);
    return [{
      id,
      kind: "jurisdiction",
      geojson: geo,
      name: firstValue(row?.name, row?.geography?.name),
    }];
  });
}

function collectGovernanceRows(context, post) {
  const rows = [
    ...asArray(context?.governance),
    ...asArray(post?.governance),
    ...asArray(context?.people).map((person) => person?.organization),
  ].filter(Boolean);

  const seen = new Set();
  return rows.filter((row) => {
    const id = firstValue(row?.id, row?.governance_id, row?.organization_id);
    const key = String(id || `${row?.name}-${row?.address}`);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

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
    const boundaries = [
      ...collectDistrictBoundary(context, post),
      ...collectJurisdictionBoundaries(context),
    ];

    const markers = collectGovernanceRows(context, post).flatMap((org, index) => {
      const id = firstValue(org?.id, org?.governance_id, org?.organization_id, `governance-${index}`);
      const marker = {
        id,
        kind: "governance",
        lat: Number(firstValue(org?.office_lat, org?.lat, org?.latitude, org?.office?.lat, org?.address_lat)),
        lng: Number(firstValue(org?.office_lng, org?.lng, org?.longitude, org?.office?.lng, org?.address_lng)),
        image_url: firstValue(org?.image_url, org?.logo_url, org?.avatar_url),
        label: firstValue(org?.name, org?.short_name),
      };
      return Number.isFinite(marker.lat) && Number.isFinite(marker.lng) ? [marker] : [];
    });

    return { boundaries, markers };
  }, [context, post]);

  if (!hasLocation) return null;

  const district = districtName(context, post);
  const title = district || firstValue(post?.address, "Location");
  const citizenLabel = firstValue(post?.address, district, "Post location");
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
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Loading map…</div>
          ) : (
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
