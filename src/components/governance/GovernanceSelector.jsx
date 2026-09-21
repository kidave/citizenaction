"use client";

import { useMemo, useState } from "react";
import { ChevronsUpDown, Landmark } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import OrganizationDirectory from "@/components/governance/OrganizationDirectory";
import PositionDirectory from "@/components/governance/PositionDirectory";
import PersonDirectory from "@/components/governance/PersonDirectory";
import { getGovernanceInitials, getGovernanceLabel } from "@/utils/governance";

const TABS = [["organizations","Organizations"],["positions","Positions"],["people","People"]];

export default function GovernanceSelector({ editor }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("organizations");
  const [draftSelection, setDraftSelection] = useState([]);
  const [confirmSwitch, setConfirmSwitch] = useState(null);
  const selected = Array.isArray(editor?.governance) ? editor.governance : [];

  const selectedIds = useMemo(() => draftSelection.map((item) => item?.id).filter(Boolean), [draftSelection]);

  function openSheet() {
    setDraftSelection(selected);
    setTab("organizations");
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

  function requestTabChange(nextTab) {
    if (nextTab === tab) return;
    const currentIds = selected.map((item) => item?.id).filter(Boolean);
    const draftIds = draftSelection.map((item) => item?.id).filter(Boolean);
    const dirty = currentIds.length !== draftIds.length || currentIds.some((id) => !draftIds.includes(id));
    if (!dirty) {
      setTab(nextTab);
      return;
    }
    setConfirmSwitch({ nextTab });
  }

  function discardAndSwitch() {
    const nextTab = confirmSwitch?.nextTab;
    setDraftSelection(selected);
    setConfirmSwitch(null);
    if (nextTab) setTab(nextTab);
  }

  function saveAndSwitch() {
    const nextTab = confirmSwitch?.nextTab;
    editor.setSelectedAuthorities?.(draftSelection);
    setConfirmSwitch(null);
    if (nextTab) setTab(nextTab);
  }

  const visible = selected.slice(0, 10);
  const mobileRemaining = Math.max(selected.length - 5, 0);
  const desktopRemaining = Math.max(selected.length - 10, 0);

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={openSheet} aria-label="Select governance" title="Governance" className="h-8 gap-1.5 rounded-full px-2.5">
        {selected.length ? (
          <div className="flex shrink-0 -space-x-1">
            {visible.map((entity, index) => (
              <Avatar key={entity.id} className={"h-5 w-5 border border-background " + (index >= 5 ? "hidden sm:flex" : "")}>
                <AvatarImage src={entity.image_url || undefined} alt="" />
                <AvatarFallback className="text-[9px]">{getGovernanceInitials(getGovernanceLabel(entity))}</AvatarFallback>
              </Avatar>
            ))}
            {mobileRemaining > 0 && <Avatar className="h-5 w-5 sm:hidden"><AvatarFallback className="text-[8px]">+{mobileRemaining}</AvatarFallback></Avatar>}
            {desktopRemaining > 0 && <Avatar className="hidden h-5 w-5 sm:flex"><AvatarFallback className="text-[8px]">+{desktopRemaining}</AvatarFallback></Avatar>}
          </div>
        ) : (
          <Landmark className="h-3.5 w-3.5 shrink-0" />
        )}
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      </Button>

      <Sheet open={open} onOpenChange={(nextOpen) => nextOpen ? setOpen(true) : closeSheet()}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-4xl">
          <SheetHeader className="shrink-0 border-b px-6 py-4"><SheetTitle>Governance</SheetTitle></SheetHeader>
          <Tabs value={tab} onValueChange={requestTabChange} className="flex min-h-0 flex-1 flex-col">
            <div className="shrink-0 border-b px-6 py-3">
              <TabsList className="w-max">
                {TABS.map(([value,label]) => <TabsTrigger key={value} value={value}>{label}</TabsTrigger>)}
              </TabsList>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
              {tab === "organizations" ? (
                <OrganizationDirectory selectionMode="checkbox" selectedIds={selectedIds} onSelect={toggle} />
              ) : tab === "positions" ? (
                <PositionDirectory selectionMode="checkbox" selectedIds={selectedIds} onSelect={toggle} />
              ) : (
                <PersonDirectory selectionMode="checkbox" selectedIds={selectedIds} onSelect={toggle} />
              )}
            </div>
            <div className="flex shrink-0 items-center justify-between gap-3 border-t px-6 py-3">
              <Button type="button" variant="ghost" onClick={() => setDraftSelection([])} disabled={!draftSelection.length}>Clear</Button>
              <Button type="button" onClick={save}>Save</Button>
            </div>
          </Tabs>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!confirmSwitch} onOpenChange={(nextOpen) => !nextOpen && setConfirmSwitch(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save governance selection?</AlertDialogTitle>
            <AlertDialogDescription>You have unsaved governance changes. Save them before switching tabs, or discard the changes and continue.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={discardAndSwitch}>Discard &amp; switch</AlertDialogCancel>
            <AlertDialogAction onClick={saveAndSwitch}>Save &amp; switch</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
