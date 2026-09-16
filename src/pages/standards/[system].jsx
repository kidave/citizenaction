// pages/standards/[system].js

import { useMemo, useState } from "react";
import { useRouter } from "next/router";

import {
  Layers3,
  Activity,
  Building2,
  MapPinned,
  Landmark,
} from "lucide-react";

import Topbar from "@/components/navigation/Topbar";
import { Button } from "@/components/ui/button";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import useClassificationSystems from "@/hooks/standards/useClassificationSystems";
import useClassificationDimensions from "@/hooks/standards/useClassificationDimensions";
import useClassificationTree from "@/hooks/standards/useClassificationTree";

import {
  ClassificationTree,
  ClassificationCodeDialog,
  DeleteCodeDialog,
  CodeDetailsCard,
} from "@/components/standards";

const dimensionIcons = {
  function: Layers3,
  activity: Activity,
  structure: Building2,
  site: MapPinned,
  ownership: Landmark,
};

export default function StandardPage() {
  const router = useRouter();

  const { system } = router.query;

  const [selectedDimension, setSelectedDimension] = useState(null);
  const [selectedCode, setSelectedCode] = useState(null);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [inspectorOpen, setInspectorOpen] = useState(false);

  const { data: systems = [] } = useClassificationSystems();

  const currentSystem = useMemo(
    () => systems.find((s) => s.code?.toLowerCase() === system?.toLowerCase()),
    [systems, system],
  );

  const { data: dimensions = [] } = useClassificationDimensions(
    currentSystem?.id,
  );

  const { data: tree = [] } = useClassificationTree(selectedDimension?.id);

  function handleDimensionSelect(dimension) {
    setSelectedDimension(dimension);
    setSelectedCode(null);
    setInspectorOpen(false);
  }

  function handleInspect(code) {
    setSelectedCode(code);
    setInspectorOpen(true);
  }

  function handleInspectorOpenChange(open) {
    setInspectorOpen(open);
  }

  const topbarItems = [
    { label: "Home", href: "/" },
    { label: "Standards", href: "/standards" },
    ...(currentSystem ? [{ label: currentSystem.name }] : []),
    ...(selectedDimension ? [{ label: selectedDimension.name }] : []),
  ];

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Topbar
        items={topbarItems}
        title={selectedDimension?.name || currentSystem?.name || "Standards"}
        containerClassName="max-w-none"
        backHref="/standards"
      />

      <div className="hidden min-h-0 flex-1 overflow-hidden md:block">
        <div className="grid h-full grid-cols-[64px_minmax(0,1fr)]">
          <aside className="h-full border-r bg-muted/20 py-3">
            <TooltipProvider delayDuration={150}>
              <div className="flex flex-col items-center gap-2">
                {dimensions.map((dimension) => {
                  const Icon =
                    dimensionIcons[dimension.code?.toLowerCase()] ?? Layers3;

                  const active = selectedDimension?.id === dimension.id;

                  return (
                    <Tooltip key={dimension.id}>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => handleDimensionSelect(dimension)}
                          className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                            active
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>

                      <TooltipContent side="right">
                        {dimension.name}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </TooltipProvider>
          </aside>

          <ResizablePanelGroup direction="horizontal" className="min-w-0">
            <ResizablePanel defaultSize={42} minSize={25} maxSize={65}>
              <section className="flex h-full min-h-0 flex-col border-r">
                <div className="shrink-0 border-b px-4 py-3">
                  <h2 className="font-medium">Classification Tree</h2>
                </div>

                <div className="min-h-0 flex-1">
                  {selectedDimension ? (
                    <ClassificationTree
                      tree={tree}
                      selected={selectedCode}
                      onInspect={handleInspect}
                    />
                  ) : (
                    <EmptyTreeState />
                  )}
                </div>
              </section>
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={58} minSize={35}>
              <section className="flex h-full min-h-0 flex-col">
                <div className="shrink-0 border-b px-5 py-3">
                  <h2 className="font-medium">Classification</h2>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-5">
                  {selectedCode ? (
                    <CodeDetailsCard code={selectedCode} />
                  ) : (
                    <EmptyInspectorState />
                  )}
                </div>
              </section>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:hidden">
        <div className="shrink-0 border-b bg-background">
          <div className="flex gap-2 overflow-x-auto px-3 py-2">
            {dimensions.map((dimension) => {
              const Icon =
                dimensionIcons[dimension.code?.toLowerCase()] ?? Layers3;

              const active = selectedDimension?.id === dimension.id;

              return (
                <Button
                  key={dimension.id}
                  type="button"
                  variant="ghost"
                  onClick={() => handleDimensionSelect(dimension)}
                  className={`h-9 shrink-0 rounded-xl px-3 ${
                    active
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  <Icon className="mr-2 h-4 w-4" />

                  <span className="max-w-28 truncate">{dimension.name}</span>
                </Button>
              );
            })}
          </div>
        </div>

        <section className="flex min-h-0 flex-1 flex-col">
          <div className="shrink-0 border-b px-4 py-3">
            <h2 className="font-medium">Classification Tree</h2>
          </div>

          <div className="min-h-0 flex-1">
            {selectedDimension ? (
              <ClassificationTree
                tree={tree}
                selected={selectedCode}
                onInspect={handleInspect}
              />
            ) : (
              <EmptyTreeState />
            )}
          </div>
        </section>
      </div>

      <Sheet open={inspectorOpen} onOpenChange={handleInspectorOpenChange}>
        <SheetContent
          side="right"
          className="w-full overflow-y-auto sm:max-w-lg"
        >
          <SheetHeader className="border-b pb-4">
            <SheetTitle>Classification</SheetTitle>
          </SheetHeader>

          <div className="py-5">
            {selectedCode && <CodeDetailsCard code={selectedCode} />}
          </div>
        </SheetContent>
      </Sheet>

      <ClassificationCodeDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        value={selectedCode}
        dimensions={dimensions}
        parents={[]}
        onSave={console.log}
      />

      <DeleteCodeDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        code={selectedCode}
        onDelete={console.log}
      />
    </div>
  );
}

function EmptyTreeState() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <Layers3 className="mb-4 h-10 w-10 text-muted-foreground" />

      <h3 className="font-medium">Select a dimension</h3>

      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        Choose a classification dimension from the left to explore its
        hierarchy.
      </p>
    </div>
  );
}

function EmptyInspectorState() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <Building2 className="mb-4 h-10 w-10 text-muted-foreground" />

      <h3 className="font-medium">No classification selected</h3>

      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Select a classification from the tree to view its description, hierarchy
        and metadata.
      </p>
    </div>
  );
}
