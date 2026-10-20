"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { supabase } from "@/lib/supabase/client";

const LeafletMap = dynamic(() => import("@/components/geography/LeafletMap"), { ssr: false });

export default function GovernanceAppointmentAddressSheet({
  open,
  onOpenChange,
  appointment = null,
  onSaved,
}) {
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setAddress(appointment?.address || "");
    setLat(Number.isFinite(Number(appointment?.lat)) ? Number(appointment.lat) : null);
    setLng(Number.isFinite(Number(appointment?.lng)) ? Number(appointment.lng) : null);
  }, [open, appointment?.appointment_id, appointment?.id]);

  const save = async () => {
    const id = appointment?.appointment_id || appointment?.id;
    if (!id) return toast.error("Save the appointment before adding its address");
    if (!address.trim()) return toast.error("Enter the appointment address");
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return toast.error("Select the address location on the map");
    }

    try {
      setSaving(true);
      const { error } = await supabase
        .from("position_appointment")
        .update({ address: address.trim(), lat, lng })
        .eq("id", id);
      if (error) throw error;
      toast.success("Appointment address saved");
      await onSaved?.();
      onOpenChange?.(false);
    } catch (error) {
      toast.error(error?.message || "Unable to save appointment address");
    } finally {
      setSaving(false);
    }
  };

  const mapLat = Number.isFinite(lat) ? lat : 19.076;
  const mapLng = Number.isFinite(lng) ? lng : 72.8777;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="flex items-center gap-2"><MapPin className="h-4 w-4" />Appointment address</SheetTitle>
        </SheetHeader>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          <div className="space-y-2">
            <Label htmlFor="appointment-address">Full office / posting address</Label>
            <Input id="appointment-address" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Enter the appointment's office or posting address" disabled={saving} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label>Pin the location</Label>
              <span className="text-xs text-muted-foreground">{Number.isFinite(lat) && Number.isFinite(lng) ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : "Click the map to place a marker"}</span>
            </div>
            <div className="h-[360px] overflow-hidden rounded-lg border">
              <LeafletMap
                lat={mapLat}
                lng={mapLng}
                zoom={Number.isFinite(lat) && Number.isFinite(lng) ? 16 : 11}
                showMarker={Number.isFinite(lat) && Number.isFinite(lng)}
                markers={[]}
                onChange={(nextLat, nextLng) => { setLat(nextLat); setLng(nextLng); }}
              />
            </div>
            <p className="text-xs text-muted-foreground">Click the map to place or move the marker. The address text is saved separately; the marker coordinates are stored for reliable map display.</p>
          </div>
        </div>
        <SheetFooter className="flex-row justify-between gap-3 border-t px-5 py-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)} disabled={saving}>Cancel</Button>
          <Button type="button" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save address"}</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
