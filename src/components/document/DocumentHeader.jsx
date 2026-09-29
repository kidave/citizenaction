"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserIdentity } from "@/components/user/UserIdentity";
import GovernanceAvatarGroup from "@/components/governance/GovernanceAvatarGroup";
import SpaceAvatarGroup from "@/components/space/SpaceAvatarGroup";
import MenuButton from "@/components/ui/MenuButton";
import formatDate from "@/utils/date/formatDate";

const LeafletMap = dynamic(() => import("@/components/geography/LeafletMap"), { ssr: false });

function asNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function getOfficeAddress(org) {
  return org?.office_address || org?.address || org?.head_office_address || org?.location_address || null;
}

export default function DocumentHeader({ post, publicContext, canEdit, onEdit, onDelete }) {
  const [mapOpen, setMapOpen] = useState(false);
  const [resolvedOfficeCoords, setResolvedOfficeCoords] = useState({});
  const governance = Array.isArray(post?.governance) ? post.governance : [];
  const spaces = Array.isArray(post?.spaces) ? post.spaces : [];
  const categories = Array.isArray(publicContext?.categories) ? publicContext.categories : [];
  const geography = Array.isArray(publicContext?.geography) ? publicContext.geography : [];
  const governanceContext = Array.isArray(publicContext?.governance) ? publicContext.governance : [];
  const peopleContext = Array.isArray(publicContext?.people) ? publicContext.people : [];

  const district = geography.find(
    (item) => item?.relationship_type === "district" || item?.source_type === "address" || item?.geography_type === "district",
  );

  const boundaries = useMemo(() => {
    const result = [];
    const seen = new Set();

    for (const item of geography) {
      const isDistrict = item?.relationship_type === "district" || item?.source_type === "address" || item?.geography_type === "district";
      if (!isDistrict || !item?.geojson) continue;
      const id = `district-${item.id}`;
      if (seen.has(id)) continue;
      seen.add(id);
      result.push({ id, kind: "district", name: item.name, label: item.name, geojson: item.geojson, osm_id: item.osm_id, osm_type: item.osm_type });
    }

    for (const org of governanceContext) {
      const jurisdiction = org?.jurisdiction;
      if (!jurisdiction?.geojson) continue;
      const id = `jurisdiction-${jurisdiction.id}`;
      if (seen.has(id)) continue;
      seen.add(id);
      result.push({ id, kind: "jurisdiction", name: jurisdiction.name || org.name, label: jurisdiction.name || org.name, geojson: jurisdiction.geojson, osm_id: jurisdiction.osm_id, osm_type: jurisdiction.osm_type });
    }

    for (const person of peopleContext) {
      const jurisdiction = person?.organization?.jurisdiction;
      if (!jurisdiction?.geojson) continue;
      const id = `jurisdiction-${jurisdiction.id}`;
      if (seen.has(id)) continue;
      seen.add(id);
      result.push({ id, kind: "jurisdiction", name: jurisdiction.name || person.organization.name, label: jurisdiction.name || person.organization.name, geojson: jurisdiction.geojson, osm_id: jurisdiction.osm_id, osm_type: jurisdiction.osm_type });
    }

    return result;
  }, [geography, governanceContext, peopleContext]);

  useEffect(() => {
    const organizations = [
      ...governanceContext,
      ...peopleContext.map((person) => person?.organization).filter(Boolean),
    ];
    const unique = new Map();
    for (const org of organizations) {
      const address = getOfficeAddress(org);
      if (!org?.id || !address || asNumber(org.office_lat) != null && asNumber(org.office_lng) != null) continue;
      unique.set(org.id, { id: org.id, address });
    }
    if (!unique.size) return;

    let cancelled = false;
    Promise.all(
      [...unique.values()].map(async ({ id, address }) => {
        try {
          const response = await fetch(`/api/osm?q=${encodeURIComponent(address)}`);
          if (!response.ok) return null;
          const data = await response.json();
          const first = Array.isArray(data) ? data[0] : data?.results?.[0];
          const lat = asNumber(first?.lat);
          const lng = asNumber(first?.lon ?? first?.lng);
          if (lat == null || lng == null) return null;
          return [id, { lat, lng }];
        } catch {
          return null;
        }
      }),
    ).then((results) => {
      if (cancelled) return;
      setResolvedOfficeCoords((previous) => {
        const next = { ...previous };
        for (const result of results) if (result) next[result[0]] = result[1];
        return next;
      });
    });

    return () => { cancelled = true; };
  }, [governanceContext, peopleContext]);

  const markers = useMemo(() => {
    const result = [];
    const seen = new Set();

    for (const org of governanceContext) {
      const resolved = resolvedOfficeCoords[org.id];
      const lat = asNumber(org?.office_lat) ?? resolved?.lat;
      const lng = asNumber(org?.office_lng) ?? resolved?.lng;
      if (lat == null || lng == null) continue;
      const id = `governance-${org.id}`;
      if (seen.has(id)) continue;
      seen.add(id);
      result.push({ id, kind: "governance", lat, lng, image_url: org.image_url, label: org.short_name || org.name });
    }

    for (const person of peopleContext) {
      const org = person?.organization;
      if (!org) continue;
      const resolved = resolvedOfficeCoords[org.id];
      const lat = asNumber(org?.office_lat) ?? resolved?.lat;
      const lng = asNumber(org?.office_lng) ?? resolved?.lng;
      if (lat == null || lng == null) continue;
      const id = `person-${person.id}`;
      if (seen.has(id)) continue;
      seen.add(id);
      result.push({ id, kind: "person", lat, lng, image_url: person.image_url || org.image_url, label: person.position_name ? `${person.name} · ${person.position_name}` : person.name });
    }

    return result;
  }, [governanceContext, peopleContext, resolvedOfficeCoords]);

  const hasMap = Number.isFinite(Number(post?.lat)) && Number.isFinite(Number(post?.lng));
  const citizenMarker = useMemo(() => ({
    image_url: post?.author_avatar || null,
    label: post?.address || district?.name || "Post location",
  }), [post?.author_avatar, post?.address, district?.name]);
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
            <UserIdentity username={post.author_username} name={post.author_name} avatar={post.author_avatar} createdAt={formatDate(post.created_at)} />
            {(spaces.length > 0 || governance.length > 0) && (
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {spaces.length > 0 && <SpaceAvatarGroup spaces={spaces} />}
                {governance.length > 0 && <GovernanceAvatarGroup authorities={governance} />}
              </div>
            )}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => <span key={category.id || category.name} className="rounded-md bg-muted px-2.5 py-1 text-sm text-muted-foreground">{category.name}</span>)}
              </div>
            )}
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2">
            {canEdit && <MenuButton onEdit={onEdit} onDelete={onDelete} />}
            {hasMap && (
              <div role="button" tabIndex={0} onClick={openMap} onKeyDown={handleMapKeyDown} className="group relative h-32 w-52 cursor-pointer overflow-hidden rounded-xl border bg-muted text-left outline-none transition hover:ring-2 hover:ring-ring/40 focus-visible:ring-2 focus-visible:ring-ring sm:h-36 sm:w-60" aria-label="Open location map">
                <LeafletMap lat={Number(post.lat)} lng={Number(post.lng)} boundaries={boundaries} markers={markers} citizenMarker={citizenMarker} showMarker zoom={11} />
                <div className="absolute inset-0 z-20" aria-hidden="true" />
                <div className="absolute inset-x-0 bottom-0 z-30 bg-background/85 px-3 py-2 text-xs text-muted-foreground backdrop-blur-sm">{district?.name || post.address || "View location"}</div>
              </div>
            )}
          </div>
        </div>
      </header>

      <Dialog open={mapOpen} onOpenChange={setMapOpen}>
        <DialogContent className="flex h-[85dvh] max-h-[85dvh] w-[calc(100%-1rem)] max-w-5xl flex-col gap-0 overflow-hidden p-0 sm:w-[calc(100%-2rem)]">
          <DialogHeader className="shrink-0 border-b px-5 py-4"><DialogTitle>{district?.name || post.address || "Location"}</DialogTitle></DialogHeader>
          <div className="min-h-0 flex-1"><LeafletMap lat={Number(post.lat)} lng={Number(post.lng)} boundaries={boundaries} markers={markers} citizenMarker={citizenMarker} showMarker zoom={11} /></div>
        </DialogContent>
      </Dialog>
    </>
  );
}
