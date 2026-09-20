"use client";
import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import ImagePicker from "@/components/attachment/ImagePicker";
import DocumentPicker from "@/components/attachment/DocumentPicker";
import EditorAddress from "@/components/feed/editor/EditorAddress";
import LinkManager from "@/components/feed/editor/LinkManager";
import { Button } from "@/components/ui/button";

export default function GovernanceEditorResources({ address, onAddressChange, links, onLinksChange, onFiles, disabled = false }) {
  const [addressOpen, setAddressOpen] = useState(false);
  const [location, setLocation] = useState({ address: address || "", lat: null, lng: null });
  useEffect(() => { setLocation((current) => ({ ...current, address: address || "" })); }, [address]);
  const editor = {
    address: location.address, lat: location.lat, lng: location.lng,
    setAddress: (value) => { setLocation((current) => ({ ...current, address: value || "" })); onAddressChange?.(value || ""); },
    setLat: (value) => setLocation((current) => ({ ...current, lat: value })),
    setLng: (value) => setLocation((current) => ({ ...current, lng: value })),
  };
  return (
    <>
      <div className="flex min-w-0 items-center gap-1">
        <ImagePicker accept="image/*" onUpload={onFiles} disabled={disabled} />
        <DocumentPicker accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt" onUpload={onFiles} disabled={disabled} />
        <Button type="button" variant={address ? "secondary" : "ghost"} size="icon" className="shrink-0" onClick={() => setAddressOpen(true)} disabled={disabled} aria-label={address ? "Change office address" : "Add office address"} title={address ? "Change office address" : "Add office address"}><MapPin className="h-5 w-5" /></Button>
        <LinkManager value={links} onChange={onLinksChange} />
      </div>
      <EditorAddress editor={editor} openOverride={addressOpen} onOpenChange={setAddressOpen} initialQuery={address || ""} />
    </>
  );
}