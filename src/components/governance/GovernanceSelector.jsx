"use client";

import { useMemo, useState } from "react";
import { ChevronsUpDown, Landmark } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OrganizationDirectory from "@/components/governance/OrganizationDirectory";
import PositionDirectory from "@/components/governance/PositionDirectory";
import {
  getGovernanceInitials,
  getGovernanceLabel,
} from "@/utils/governance";

const GOVERNANCE_SELECTOR_TABS = [
  ["organizations", "Organizations"],
  ["positions", "Positions"],
];

export default function GovernanceSelector({ editor }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("organizations");

  const selected = Array.isArray(editor?.governance) ? editor.governance : [];
  const selectedIds = useMemo(
    () => selected.map((item) => item?.id).filter(Boolean),
    [selected],
  );

  function toggleGovernance(entity) {
    const exists = selected.some((item) => item?.id === entity?.id);

    const next = exists
      ? selected.filter((item) => item?.id !== entity?.id)
      : [...selected, entity];

    editor.setSelectedAuthorities?.(next);
  }

  const visibleSelected = selected.slice(0, 2);
  const remaining = Math.max(selected.length - visibleSelected.length, 0);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-8 max-w-[210px] gap-1.5 rounded-full px-2.5"
      >
        {selected.length ? (
          <div className="flex shrink-0 -space-x-1">
            {visibleSelected.map((entity) => (
              <Avatar
                key={entity.id}
                className="h-5 w-5 border border-background"
              >
                <AvatarImage src={entity.image_url || undefined} alt="" />
                <AvatarFallback className="text-[9px]">
                  {getGovernanceInitials(getGovernanceLabel(entity))}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
        ) : (
          <Landmark className="h-3.5 w-3.5 shrink-0" />
        )}

        {remaining > 0 && (
          <span className="text-[10px] text-muted-foreground">
            +{remaining}
          </span>
        )}

        <span className="hidden truncate text-xs sm:inline">Governance</span>
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 p-0 sm:max-w-3xl"
        >
          <SheetHeader className="shrink-0 border-b px-6 py-4">
            <SheetTitle>Governance</SheetTitle>
          </SheetHeader>

          <Tabs
            value={tab}
            onValueChange={setTab}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="shrink-0 border-b px-6 py-3">
              <TabsList className="w-max">
                {GOVERNANCE_SELECTOR_TABS.map(([value, label]) => (
                  <TabsTrigger key={value} value={value}>
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
              {tab === "organizations" ? (
                <OrganizationDirectory
                  selectionMode="checkbox"
                  selectedIds={selectedIds}
                  onSelect={toggleGovernance}
                />
              ) : (
                <PositionDirectory
                  selectionMode="checkbox"
                  selectedIds={selectedIds}
                  onSelect={toggleGovernance}
                />
              )}
            </div>
          </Tabs>
        </SheetContent>
      </Sheet>
    </>
  );
}
