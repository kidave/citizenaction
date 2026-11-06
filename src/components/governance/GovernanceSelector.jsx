"use client";

import { useMemo, useState } from "react";
import { ChevronsUpDown, Landmark } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import OrganizationDirectory from "@/components/governance/OrganizationDirectory";
import { getGovernanceInitials, getGovernanceLabel } from "@/utils/governance";

const DOMAIN_TABS = [
  { value: "politics", label: "Politics", domain: "politics" },
  { value: "legislature", label: "Legislature", domain: "legislature" },
  { value: "executive", label: "Executive", domain: "executive" },
  { value: "judiciary", label: "Judiciary", domain: "judiciary" },
  { value: "other", label: "Other", domain: null },
];

export default function GovernanceSelector({ editor }) {
  const [open, setOpen] = useState(false);
  const [domainTab, setDomainTab] = useState("politics");
  const [draftSelection, setDraftSelection] = useState([]);
  const [confirmSwitch, setConfirmSwitch] = useState(null);
  const selected = Array.isArray(editor?.governance) ? editor.governance : [];

  const selectedIds = useMemo(
    () => draftSelection.map((item) => item?.id).filter(Boolean),
    [draftSelection],
  );

  function openSheet() {
    setDraftSelection(selected);
    setDomainTab("politics");
    setOpen(true);
  }

  function closeSheet() {
    setDraftSelection(selected);
    setOpen(false);
  }

  function toggle(entity) {
    setDraftSelection((current) =>
      current.some((item) => item?.id === entity?.id)
        ? current.filter((item) => item?.id !== entity?.id)
        : [...current, entity],
    );
  }

  function save() {
    editor.setSelectedAuthorities?.(draftSelection);
    setOpen(false);
  }

  function requestDomainChange(nextDomain) {
    if (nextDomain === domainTab) return;

    const currentIds = selected.map((item) => item?.id).filter(Boolean);
    const draftIds = draftSelection.map((item) => item?.id).filter(Boolean);
    const dirty =
      currentIds.length !== draftIds.length ||
      currentIds.some((id) => !draftIds.includes(id));

    if (!dirty) {
      setDomainTab(nextDomain);
      return;
    }

    setConfirmSwitch({ nextDomain });
  }

  function discardAndSwitch() {
    const nextDomain = confirmSwitch?.nextDomain;
    setDraftSelection(selected);
    setConfirmSwitch(null);
    if (nextDomain) setDomainTab(nextDomain);
  }

  function saveAndSwitch() {
    const nextDomain = confirmSwitch?.nextDomain;
    editor.setSelectedAuthorities?.(draftSelection);
    setConfirmSwitch(null);
    if (nextDomain) setDomainTab(nextDomain);
  }

  const visible = selected.slice(0, 5);
  const remaining = Math.max(selected.length - 5, 0);
  const activeDomain = DOMAIN_TABS.find((item) => item.value === domainTab);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={openSheet}
        aria-label="Select governance organisations"
        title="Governance"
        className="h-8 gap-1.5 rounded-full px-2.5"
      >
        {selected.length ? (
          <div className="flex shrink-0 -space-x-1">
            {visible.map((entity) => (
              <Avatar key={entity.id} className="h-5 w-5 border border-background">
                <AvatarImage src={entity.image_url || undefined} alt="" />
                <AvatarFallback className="text-[9px]">
                  {getGovernanceInitials(getGovernanceLabel(entity))}
                </AvatarFallback>
              </Avatar>
            ))}
            {remaining > 0 && (
              <Avatar className="h-5 w-5 border border-background">
                <AvatarFallback className="text-[8px]">+{remaining}</AvatarFallback>
              </Avatar>
            )}
          </div>
        ) : (
          <Landmark className="h-3.5 w-3.5 shrink-0" />
        )}
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      </Button>

      <Sheet
        open={open}
        onOpenChange={(nextOpen) => (nextOpen ? setOpen(true) : closeSheet())}
      >
        <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-4xl">
          <SheetHeader className="shrink-0 border-b px-6 py-4">
            <SheetTitle>Governance organisations</SheetTitle>
          </SheetHeader>

          <Tabs
            value={domainTab}
            onValueChange={requestDomainChange}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="shrink-0 overflow-x-auto border-b px-4 py-3 sm:px-6">
              <TabsList className="grid h-auto min-w-[480px] w-full grid-cols-5">
                {DOMAIN_TABS.map(({ value, label }) => (
                  <TabsTrigger key={value} value={value} className="px-2 text-xs sm:text-sm">
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
              <p className="mb-4 text-sm text-muted-foreground">
                Select one or more organisations from {activeDomain?.label || "this domain"}.
              </p>
              <OrganizationDirectory
                key={domainTab}
                domain={activeDomain?.domain}
                selectionMode="checkbox"
                selectedIds={selectedIds}
                onSelect={toggle}
              />
            </div>

            <div className="flex shrink-0 items-center justify-between gap-3 border-t px-6 py-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDraftSelection([])}
                disabled={!draftSelection.length}
              >
                Clear
              </Button>
              <Button type="button" onClick={save}>
                Save
              </Button>
            </div>
          </Tabs>
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={!!confirmSwitch}
        onOpenChange={(nextOpen) => !nextOpen && setConfirmSwitch(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save governance selection?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved governance changes. Save them before switching domains, or discard the changes and continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={discardAndSwitch}>
              Discard &amp; switch
            </AlertDialogCancel>
            <AlertDialogAction onClick={saveAndSwitch}>
              Save &amp; switch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
