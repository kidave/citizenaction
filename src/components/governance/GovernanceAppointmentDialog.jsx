"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { BriefcaseBusiness, UserRound } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import ImageUpload from "@/components/ui/ImageUpload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/lib/supabase/client";
import { getGovernanceInitials } from "@/utils/governance";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function GovernanceAppointmentDialog({
  open,
  onOpenChange,
  mode = "position",
  organizationId = null,
  positionId = null,
  personId = null,
  record = null,
  onSaved,
}) {
  const positionMode = mode === "position";
  const personMode = mode === "person";
  const draftId = useId().replace(/:/g, "");

  const [organizations, setOrganizations] = useState([]);
  const [positions, setPositions] = useState([]);
  const [people, setPeople] = useState([]);
  const [selectedPositionId, setSelectedPositionId] = useState(
    positionId || "",
  );
  const [selectedPersonId, setSelectedPersonId] = useState(personId || "");
  const [personChoice, setPersonChoice] = useState("existing");
  const [newPersonName, setNewPersonName] = useState("");
  const [newPersonImageUrl, setNewPersonImageUrl] = useState("");
  const [startedAt, setStartedAt] = useState(today());
  const [endedAt, setEndedAt] = useState("");
  const [isPrimary, setIsPrimary] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const creatingPerson = positionMode && personChoice === "create";

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setLoading(true);
    setSelectedPositionId(record?.position_id || positionId || "");
    setSelectedPersonId(record?.person_id || personId || "");
    setPersonChoice(record?.person_id || personId ? "existing" : "existing");
    setNewPersonName("");
    setNewPersonImageUrl("");
    setStartedAt(
      record?.started_at ? String(record.started_at).slice(0, 10) : today(),
    );
    setEndedAt(record?.ended_at ? String(record.ended_at).slice(0, 10) : "");
    setIsPrimary(record?.is_primary ?? true);

    const load = async () => {
      const [organizationResult, positionResult, peopleResult] =
        await Promise.all([
          supabase
            .from("governance")
            .select("id,name,short_name,slug,type,status,image_url")
            .neq("status", "deleted")
            .order("name")
            .limit(500),
          supabase
            .from("position")
            .select("id,name,slug,appointing_organization_id")
            .order("name")
            .limit(1000),
          supabase
            .from("person")
            .select("id,name,slug,image_url,profile_user_id")
            .order("name")
            .limit(1000),
        ]);

      if (cancelled) return;
      setLoading(false);

      if (organizationResult.error)
        return toast.error(organizationResult.error.message);
      if (positionResult.error)
        return toast.error(positionResult.error.message);
      if (peopleResult.error) return toast.error(peopleResult.error.message);

      setOrganizations(organizationResult.data || []);
      setPositions(positionResult.data || []);
      setPeople(peopleResult.data || []);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [open, organizationId, positionId, personId, record?.id]);

  const positionOptions = useMemo(
    () => positions.map((item) => {
      const organization = organizations.find((org) => org.id === item.appointing_organization_id);
      return {
        value: item.id,
        label: item.name,
        searchValue: (item.name || "") + " " + (organization?.name || "") + " " + (organization?.short_name || ""),
        organizationName: organization?.name || "Organization",
        organizationImageUrl: organization?.image_url || null,
      };
    }),
    [positions, organizations],
  );

  const peopleOptions = useMemo(
    () =>
      people.map((item) => ({
        value: item.id,
        label: item.name,
        searchValue: item.name,
        imageUrl: item.image_url || null,
      })),
    [people],
  );

  const selectedPosition = positions.find(
    (item) => item.id === selectedPositionId,
  );
  const selectedOrganization = selectedPosition
    ? organizations.find((item) => item.id === selectedPosition.appointing_organization_id)
    : organizationId
      ? organizations.find((item) => item.id === organizationId)
      : null;
  const selectedPerson = people.find((item) => item.id === selectedPersonId);

  const save = async () => {
    const finalOrganizationId = positionMode
      ? organizationId
      : selectedPosition?.appointing_organization_id;
    const finalPositionId = positionMode
      ? positionId || selectedPositionId
      : selectedPositionId;

    if (!finalOrganizationId) return toast.error("Organization is required");
    if (!finalPositionId) return toast.error("Position is required");
    if (personMode && !personId) return toast.error("Person is required");
    if (positionMode && !creatingPerson && !selectedPersonId)
      return toast.error("Choose an existing person or create a new person");
    if (creatingPerson && !newPersonName.trim())
      return toast.error("Person name is required");
    if (!startedAt) return toast.error("Start date is required");
    if (endedAt && endedAt < startedAt)
      return toast.error("End date cannot be earlier than start date");

    try {
      setSaving(true);

      let result;
      if (creatingPerson) {
        result = await supabase.rpc("create_person_appointment", {
          p_organization_id: finalOrganizationId,
          p_position_id: finalPositionId,
          p_started_at: `${startedAt}T00:00:00Z`,
          p_name: newPersonName.trim(),
          p_biography: null,
          p_website: null,
          p_image_url: newPersonImageUrl || null,
          p_profile_user_id: null,
          p_ended_at: endedAt ? `${endedAt}T23:59:59.999Z` : null,
          p_is_primary: isPrimary,
          p_notes: null,
        });
      } else {
        const finalPersonId = personMode ? personId : selectedPersonId;
        result = await supabase.rpc("upsert_organization", {
          p_id: record?.appointment_id || record?.id || null,
          p_governance_id: finalOrganizationId,
          p_person_name: selectedPerson?.name || "",
          p_person_governance_id: finalPersonId,
          p_position_name: selectedPosition?.name || "Position",
          p_position_governance_id: finalPositionId,
          p_started_at: `${startedAt}T00:00:00Z`,
          p_ended_at: endedAt ? `${endedAt}T23:59:59.999Z` : null,
          p_is_vacant: false,
          p_is_primary: isPrimary,
          p_reports_to_id: null,
          p_notes: null,
        });
      }

      if (result.error) throw result.error;

      toast.success(
        positionMode ? "Person added to position" : "Experience added",
      );
      await onSaved?.(result.data);
      onOpenChange?.(false);
    } catch (error) {
      toast.error(error?.message || "Unable to save appointment");
    } finally {
      setSaving(false);
    }
  };

  const isEditing = Boolean(record?.appointment_id || record?.id);
  const title = isEditing
    ? "Edit appointment"
    : positionMode
      ? "Add person to position"
      : "Add experience";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full max-w-none flex-col gap-0 overflow-x-hidden p-0 sm:max-w-xl"
      >
        <SheetHeader className="border-b px-5 py-4 sm:px-6">
          <SheetTitle className="flex items-center gap-2">
            {positionMode ? (
              <UserRound className="h-4 w-4" />
            ) : (
              <BriefcaseBusiness className="h-4 w-4" />
            )}
            {title}
          </SheetTitle>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-5 py-5 sm:px-6">
          {loading ? (
            <div className="space-y-3 py-4">
              <div className="h-9 animate-pulse rounded-md bg-muted" />
              <div className="h-9 animate-pulse rounded-md bg-muted" />
              <div className="h-20 animate-pulse rounded-md bg-muted" />
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {positionMode ? (
                <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                  <Avatar className="h-10 w-10 rounded-lg">
                    <AvatarImage src={selectedOrganization?.image_url || undefined} alt="" />
                    <AvatarFallback className="rounded-lg">
                      {getGovernanceInitials(selectedOrganization?.name || "Organization")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">Position</div>
                    <div className="truncate text-sm font-medium">{selectedPosition?.name || "Position"}</div>
                    <div className="truncate text-xs text-muted-foreground">{selectedOrganization?.name || "Organization"}</div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="text-xs text-muted-foreground">Person</div>
                  <div className="mt-1 text-sm font-medium">
                    {selectedPerson?.name || "Person"}
                  </div>
                </div>
              )}

              {personMode && (
                <div className="space-y-2">
                  <Label>Position</Label>
                  <SearchableSelect
                    value={selectedPositionId}
                    onValueChange={setSelectedPositionId}
                    options={positionOptions}
                    placeholder="Choose a position"
                    searchPlaceholder="Search positions or organizations..."
                    emptyText="No positions found."
                    disabled={saving}
                    renderOption={(option) => (
                      <div className="flex min-w-0 items-center gap-2">
                        <Avatar className="h-7 w-7 shrink-0 rounded-md"><AvatarImage src={option.organizationImageUrl || undefined} alt="" /><AvatarFallback className="rounded-md text-[9px]">{getGovernanceInitials(option.organizationName)}</AvatarFallback></Avatar>
                        <div className="min-w-0"><div className="truncate text-sm">{option.label}</div><div className="truncate text-[11px] text-muted-foreground">{option.organizationName}</div></div>
                      </div>
                    )}
                    renderValue={(option) => (
                      <div className="flex min-w-0 items-center gap-2">
                        <Avatar className="h-6 w-6 shrink-0 rounded-md"><AvatarImage src={option.organizationImageUrl || undefined} alt="" /><AvatarFallback className="rounded-md text-[8px]">{getGovernanceInitials(option.organizationName)}</AvatarFallback></Avatar>
                        <div className="min-w-0"><div className="truncate text-sm">{option.label}</div><div className="truncate text-[10px] text-muted-foreground">{option.organizationName}</div></div>
                      </div>
                    )}
                  />
                </div>
              )}
              {positionMode && (
                <div className="space-y-3">
                  <Label>Person</Label>
                  <RadioGroup
                    value={personChoice}
                    onValueChange={setPersonChoice}
                    className="grid gap-2 sm:grid-cols-2"
                    disabled={saving}
                  >
                    <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3">
                      <RadioGroupItem value="existing" className="mt-0.5" />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium">Add existing person</span>
                        <span className="block text-xs text-muted-foreground">Choose someone already in Citizen Action.</span>
                      </span>
                    </label>
                    <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3">
                      <RadioGroupItem value="create" className="mt-0.5" />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium">Create new person</span>
                        <span className="block text-xs text-muted-foreground">Create the person and add them to this position.</span>
                      </span>
                    </label>
                  </RadioGroup>
                  {personChoice === "existing" && (
                    <SearchableSelect
                      value={selectedPersonId}
                      onValueChange={setSelectedPersonId}
                      options={peopleOptions}
                      placeholder="Choose a person"
                      searchPlaceholder="Search people..."
                      emptyText="No people found."
                      disabled={saving}
                      renderOption={(option) => (
                        <div className="flex min-w-0 items-center gap-2">
                          <Avatar className="h-7 w-7 shrink-0 rounded-md"><AvatarImage src={option.imageUrl || undefined} alt="" /><AvatarFallback className="rounded-md text-[9px]">{getGovernanceInitials(option.label)}</AvatarFallback></Avatar>
                          <span className="min-w-0 truncate">{option.label}</span>
                        </div>
                      )}
                      renderValue={(option) => (
                        <div className="flex min-w-0 items-center gap-2">
                          <Avatar className="h-6 w-6 shrink-0 rounded-md"><AvatarImage src={option.imageUrl || undefined} alt="" /><AvatarFallback className="rounded-md text-[8px]">{getGovernanceInitials(option.label)}</AvatarFallback></Avatar>
                          <span className="min-w-0 truncate">{option.label}</span>
                        </div>
                      )}
                    />
                  )}
                </div>
              )}

              {creatingPerson && (
                <div className="space-y-4 rounded-lg border p-4">
                  <div className="text-sm font-medium">New person</div>
                  <ImageUpload
                    bucket="governance"
                    path={`governance/person/draft-${draftId}`}
                    value={newPersonImageUrl || null}
                    onChange={(value) => setNewPersonImageUrl(value || "")}
                    label="Person image"
                    helperText="PNG, JPG or WebP · up to 5 MB"
                    disabled={saving}
                  />
                  <div className="space-y-2">
                    <Label htmlFor="governance-appointment-new-person">
                      Name
                    </Label>
                    <Input
                      id="governance-appointment-new-person"
                      value={newPersonName}
                      onChange={(event) => setNewPersonName(event.target.value)}
                      placeholder="e.g. Jane Doe"
                      disabled={saving}
                      autoFocus
                    />
                  </div>
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Start date</Label>
                  <Input
                    type="date"
                    value={startedAt}
                    onChange={(event) => setStartedAt(event.target.value)}
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End date</Label>
                  <Input
                    type="date"
                    value={endedAt}
                    onChange={(event) => setEndedAt(event.target.value)}
                    disabled={saving}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <div className="text-sm font-medium">Primary appointment</div>
                  <div className="text-xs text-muted-foreground">
                    Use this for the person’s current or principal appointment.
                  </div>
                </div>
                <Checkbox
                  checked={isPrimary}
                  disabled={saving}
                  onCheckedChange={(checked) => setIsPrimary(!!checked)}
                />
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="flex-row items-center justify-between gap-3 border-t px-5 py-4 sm:px-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange?.(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="button" onClick={save} disabled={saving || loading}>
            {saving
              ? "Saving..."
              : isEditing
                ? "Save changes"
                : positionMode
                  ? "Add person"
                  : "Add experience"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
