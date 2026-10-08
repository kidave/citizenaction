"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import AddGeographyDialog from "@/components/geography/AddGeographyDialog";
import EditorAddress from "@/components/editor/EditorAddress";
import LinkManager from "@/components/link/LinkManager";

const RESOURCE_CONFIG = {
  governance: {
    table: "governance",
    key: "governance_id",
    addressRpc: "update_governance_location",
    supportsGeography: true,
    supportsLinks: true,
  },
  position: {
    table: "position",
    key: "position_id",
    supportsGeography: true,
    supportsLinks: true,
  },
  person: {
    table: "person",
    key: "person_id",
    supportsGeography: false,
    supportsLinks: false,
  },
};

export default function GovernanceResourceDialogs({
  entity,
  entityType = "governance",
  addressOpen = false,
  onAddressOpenChange,
  geographyOpen = false,
  onGeographyOpenChange,
  linksOpen = false,
  onLinksOpenChange,
  onSaved,
}) {
  const config = RESOURCE_CONFIG[entityType] || RESOURCE_CONFIG.governance;
  const [address, setAddress] = useState(entity?.address || "");
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [links, setLinks] = useState([]);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const initialAddressRef = useRef(true);
  const addressSaveTimerRef = useRef(null);

  useEffect(() => {
    const metadata = entity?.metadata || {};
    setAddress(entity?.address || "");
    setLat(metadata.office_lat == null ? null : Number(metadata.office_lat));
    setLng(metadata.office_lng == null ? null : Number(metadata.office_lng));
    initialAddressRef.current = true;
  }, [entity, entityType]);

  useEffect(() => {
    if (!entity?.id || (!addressOpen && !geographyOpen && !linksOpen)) return undefined;

    let cancelled = false;
    supabase
      .from(config.table)
      .select(config.supportsGeography ? "id,address,metadata,geography_id" : "id,address,metadata")
      .eq("id", entity.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled || error || !data) return;
        const metadata = data.metadata || {};
        setAddress(data.address || "");
        setLat(metadata.office_lat == null ? null : Number(metadata.office_lat));
        setLng(metadata.office_lng == null ? null : Number(metadata.office_lng));
      });

    return () => {
      cancelled = true;
    };
  }, [entity?.id, entityType, config.table, addressOpen, geographyOpen, linksOpen]);

  useEffect(() => {
    if (!addressOpen || !entity?.id) return undefined;
    if (initialAddressRef.current) {
      initialAddressRef.current = false;
      return undefined;
    }

    if (addressSaveTimerRef.current) clearTimeout(addressSaveTimerRef.current);

    addressSaveTimerRef.current = setTimeout(async () => {
      let error = null;

      if (config.addressRpc) {
        ({ error } = await supabase.rpc(config.addressRpc, {
          p_governance_id: entity.id,
          p_address: address || null,
          p_lat: lat ?? null,
          p_lng: lng ?? null,
        }));
      } else {
        const { data: current, error: readError } = await supabase
          .from(config.table)
          .select("metadata")
          .eq("id", entity.id)
          .maybeSingle();

        if (readError) {
          error = readError;
        } else {
          const metadata = { ...(current?.metadata || {}), office_lat: lat ?? null, office_lng: lng ?? null };
          ({ error } = await supabase
            .from(config.table)
            .update({ address: address || null, metadata })
            .eq("id", entity.id));
        }
      }

      if (error) toast.error(error.message || "Unable to save address");
      else await onSaved?.();
    }, 400);

    return () => {
      if (addressSaveTimerRef.current) clearTimeout(addressSaveTimerRef.current);
    };
  }, [addressOpen, entity?.id, address, lat, lng, entityType, config.addressRpc, config.table, onSaved]);

  useEffect(() => {
    if (!linksOpen || !entity?.id) return undefined;

    let cancelled = false;
    setLoadingLinks(true);

    supabase
      .from("link")
      .select("id,url,title,sort_order")
      .eq(config.key, entity.id)
      .order("sort_order", { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) toast.error(error.message || "Unable to load links");
        setLinks(data || []);
        setLoadingLinks(false);
      });

    return () => {
      cancelled = true;
    };
  }, [linksOpen, entity?.id, config.key, config.supportsLinks]);

  const editor = useMemo(
    () => ({
      address,
      lat,
      lng,
      setAddress: (value) => setAddress(value || ""),
      setLat: (value) => setLat(value ?? null),
      setLng: (value) => setLng(value ?? null),
    }),
    [address, lat, lng],
  );

  const saveLinks = async (nextLinks) => {
    if (!entity?.id) return;
    setLinks(nextLinks);

    const { error: deleteError } = await supabase
      .from("link")
      .delete()
      .eq(config.key, entity.id);

    if (deleteError) {
      toast.error(deleteError.message || "Unable to save links");
      return;
    }

    if (nextLinks.length) {
      const { error } = await supabase.from("link").insert(
        nextLinks.map((link, index) => ({
          id: link.id || crypto.randomUUID(),
          [config.key]: entity.id,
          url: link.url,
          title: link.title || link.url,
          sort_order: index,
        })),
      );

      if (error) {
        toast.error(error.message || "Unable to save links");
        return;
      }
    }

    await onSaved?.();
  };

  if (!entity) return null;

  return (
    <>
      <EditorAddress
        editor={editor}
        openOverride={addressOpen}
        onOpenChange={onAddressOpenChange}
        initialQuery={address}
      />

      <AddGeographyDialog
        open={geographyOpen}
        onOpenChange={onGeographyOpenChange}
        entityId={entity.id}
        entityType={entityType}
        entityName={entity.name}
        onSaved={onSaved}
      />

      <LinkManager
        value={links}
        onChange={saveLinks}
        openOverride={linksOpen}
        onOpenChange={onLinksOpenChange}
      />

      {loadingLinks ? null : null}
    </>
  );
}
