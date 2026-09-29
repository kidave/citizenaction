"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, PanelsTopLeft } from "lucide-react";
import { toast } from "sonner";

import ImagePicker from "@/components/attachment/ImagePicker";
import DocumentPicker from "@/components/attachment/DocumentPicker";
import EditorAddress from "@/components/editor/EditorAddress";
import LinkManager from "@/components/link/LinkManager";
import AddGeographyDialog from "@/components/geography/AddGeographyDialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function GovernanceEditorResources({
  governanceId = null,
  entityName = "",
  address,
  lat = null,
  lng = null,
  onAddressChange,
  onLocationChange,
  links = [],
  onLinksChange,
  onFiles,
  geographyId = null,
  onGeographySaved,
  disabled = false,
}) {
  const [addressOpen, setAddressOpen] = useState(false);
  const [geographyOpen, setGeographyOpen] = useState(false);
  const [location, setLocation] = useState({
    address: address || "",
    lat,
    lng,
  });
  const initialLocationRef = useRef(true);
  const saveTimerRef = useRef(null);

  useEffect(() => {
    setLocation({ address: address || "", lat: lat ?? null, lng: lng ?? null });
    initialLocationRef.current = true;
  }, [address, lat, lng]);

  useEffect(() => {
    if (!governanceId || initialLocationRef.current) {
      initialLocationRef.current = false;
      return undefined;
    }

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      const { error } = await import("@/lib/supabase/client").then(({ supabase }) =>
        supabase.rpc("update_governance_location", {
          p_governance_id: governanceId,
          p_address: location.address || null,
          p_lat: location.lat ?? null,
          p_lng: location.lng ?? null,
        })
      );
      if (error) toast.error(error.message || "Unable to save office location");
    }, 350);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [governanceId, location.address, location.lat, location.lng]);

  const editor = {
    address: location.address,
    lat: location.lat,
    lng: location.lng,
    setAddress: (value) => {
      const next = { ...location, address: value || "" };
      setLocation(next);
      onAddressChange?.(next.address);
      onLocationChange?.(next);
    },
    setLat: (value) => {
      setLocation((current) => {
        const next = { ...current, lat: value };
        onLocationChange?.(next);
        return next;
      });
    },
    setLng: (value) => {
      setLocation((current) => {
        const next = { ...current, lng: value };
        onLocationChange?.(next);
        return next;
      });
    },
  };

  const iconButtonClass = (active) =>
    `h-9 w-9 shrink-0 ${active ? "bg-muted text-foreground hover:bg-muted/80" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"}`;

  return (
    <>
      <TooltipProvider>
        <div className="flex min-w-0 items-center gap-0.5">
          <ImagePicker accept="image/*" onUpload={onFiles} disabled={disabled} />
          <DocumentPicker
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
            onUpload={onFiles}
            disabled={disabled}
          />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={iconButtonClass(Boolean(address))}
                onClick={() => setAddressOpen(true)}
                disabled={disabled}
                aria-label={address ? "Change office address" : "Add office address"}
              >
                <MapPin className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-sm">
              <p>{address || "Add office address"}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={iconButtonClass(Boolean(geographyId))}
                onClick={() => setGeographyOpen(true)}
                disabled={disabled || !governanceId}
                aria-label={geographyId ? "Change jurisdiction" : "Add jurisdiction"}
              >
                <PanelsTopLeft className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {geographyId ? "Change jurisdiction" : "Add jurisdiction"}
            </TooltipContent>
          </Tooltip>

          <LinkManager value={links} onChange={onLinksChange} />
        </div>
      </TooltipProvider>

      <EditorAddress
        editor={editor}
        openOverride={addressOpen}
        onOpenChange={setAddressOpen}
        initialQuery={address || ""}
      />

      {governanceId && (
        <AddGeographyDialog
          open={geographyOpen}
          onOpenChange={setGeographyOpen}
          governanceId={governanceId}
          entityName={entityName}
          onSaved={onGeographySaved}
        />
      )}
    </>
  );
}
