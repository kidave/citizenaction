"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FileText, Link2, MapPin } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EditorAddress from "@/components/editor/EditorAddress";
import AddGeographyDialog from "@/components/geography/AddGeographyDialog";
import GovernanceResources from "@/components/governance/GovernanceResources";
import { useGovernanceEntityDetails } from "@/hooks/governance/useGovernanceEntityDetails";
import { supabase } from "@/lib/supabase/client";

export default function GovernanceEditorFooter({
  governanceId = null,
  entityName = "",
  busy = false,
  onCancel,
  onSave,
  saveLabel = "Save changes",
  createLabel = "Create",
  isEditing = false,
  showAddress = true,
  showGeography = true,
}) {
  const [addressOpen, setAddressOpen] = useState(false);
  const [geographyOpen, setGeographyOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const initialAddressRef = useRef(true);
  const addressSaveTimerRef = useRef(null);

  const { data: detailsData, refetch: refetchDetails } = useGovernanceEntityDetails(governanceId, Boolean(governanceId));

  useEffect(() => {
    if (!governanceId) return;

    let cancelled = false;
    supabase
      .from("governance")
      .select("address,metadata")
      .eq("id", governanceId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled || error || !data) return;
        const metadata = data.metadata || {};
        setAddress(data.address || "");
        setLat(metadata.office_lat == null ? null : Number(metadata.office_lat));
        setLng(metadata.office_lng == null ? null : Number(metadata.office_lng));
        initialAddressRef.current = true;
      });

    return () => {
      cancelled = true;
    };
  }, [governanceId]);

  useEffect(() => {
    if (!addressOpen || !governanceId) return undefined;
    if (initialAddressRef.current) {
      initialAddressRef.current = false;
      return undefined;
    }

    if (addressSaveTimerRef.current) clearTimeout(addressSaveTimerRef.current);

    addressSaveTimerRef.current = setTimeout(async () => {
      const { error } = await supabase.rpc("update_governance_location", {
        p_governance_id: governanceId,
        p_address: address || null,
        p_lat: lat ?? null,
        p_lng: lng ?? null,
      });

      if (error) toast.error(error.message || "Unable to save address");
      else {
        await refetchDetails();
      }
    }, 400);

    return () => {
      if (addressSaveTimerRef.current) clearTimeout(addressSaveTimerRef.current);
    };
  }, [addressOpen, governanceId, address, lat, lng, refetchDetails]);

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

  const resources = detailsData || { attachments: [], links: [] };
  const refreshResources = async () => {
    await refetchDetails();
  };
  const canManageResources = Boolean(governanceId);

  return (
    <>
      <div className="shrink-0 border-t bg-background px-5 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          {showAddress && <Button type="button" variant="ghost" size="sm" disabled={!canManageResources || busy} onClick={() => setAddressOpen(true)}>
            <MapPin className="mr-1.5 h-4 w-4" /> Address
          </Button>}
          {showGeography && <Button type="button" variant="ghost" size="sm" disabled={!canManageResources || busy} onClick={() => setGeographyOpen(true)}>
            <MapPin className="mr-1.5 h-4 w-4" /> Geography
          </Button>}
          <Button type="button" variant="ghost" size="sm" disabled={!canManageResources || busy} onClick={() => setResourcesOpen(true)}>
            <FileText className="mr-1.5 h-4 w-4" /> Files & links
          </Button>
          <span className="ml-auto text-xs text-muted-foreground">
            {governanceId
              ? resources.attachments.length + " file" + (resources.attachments.length === 1 ? "" : "s") + " · " + resources.links.length + " link" + (resources.links.length === 1 ? "" : "s")
              : "Save first to add resources"}
          </span>
        </div>
      </div>

      <div className="shrink-0 border-t bg-background px-5 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>Cancel</Button>
          <Button type="button" onClick={onSave} disabled={busy}>
            {busy ? "Saving..." : isEditing ? saveLabel : createLabel}
          </Button>
        </div>
      </div>

      <EditorAddress editor={editor} openOverride={addressOpen} onOpenChange={setAddressOpen} initialQuery={address} />

      <AddGeographyDialog
        open={geographyOpen}
        onOpenChange={setGeographyOpen}
        governanceId={governanceId}
        entityName={entityName}
        onSaved={refreshResources}
      />

      <Dialog open={resourcesOpen} onOpenChange={setResourcesOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Link2 className="h-4 w-4" /> Files & links</DialogTitle></DialogHeader>
          <GovernanceResources
            governanceId={governanceId}
            attachments={resources.attachments}
            links={resources.links}
            canEdit={canManageResources}
            onChanged={refreshResources}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
