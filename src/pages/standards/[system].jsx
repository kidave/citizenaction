import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  Layers3,
  Activity,
  Building2,
  MapPinned,
  Landmark,
} from "lucide-react";
import BackButton from "@/components/ui/back-button";

import useClassificationSystems from "@/hooks/standards/useClassificationSystems";
import useClassificationDimensions from "@/hooks/standards/useClassificationDimensions";
import useClassificationTree from "@/hooks/standards/useClassificationTree";

import {
  ClassificationBreadcrumb,
  ClassificationTree,
  ClassificationCodeDialog,
  DeleteCodeDialog,
  CodeDetailsCard,
} from "@/components/standards";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  const { data: systems = [] } = useClassificationSystems();

  const currentSystem = useMemo(
    () => systems.find((s) => s.code.toLowerCase() === system),
    [systems, system],
  );

  const { data: dimensions = [] } = useClassificationDimensions(
    currentSystem?.id,
  );

  const { data: tree = [] } = useClassificationTree(selectedDimension?.id);

  return (
    <div className="flex h-dvh flex-col">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <BackButton />

          <ClassificationBreadcrumb
            system={currentSystem}
            dimension={selectedDimension}
          />
        </div>
      </div>

      {/* Layout */}
      <div className="grid min-h-0 flex-1 grid-cols-[64px_520px_1fr] overflow-hidden">
        {/* Dimension Rail */}
        <aside className="border-r bg-muted/20 py-3">
          <TooltipProvider delayDuration={150}>
            <div className="flex flex-col items-center gap-2">
              {dimensions.map((dimension) => {
                const Icon =
                  dimensionIcons[dimension.code?.toLowerCase()] ?? Layers3;

                const active = selectedDimension?.id === dimension.id;

                return (
                  <Tooltip key={dimension.id}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setSelectedDimension(dimension)}
                        className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                          active
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </button>
                    </TooltipTrigger>

                    <TooltipContent side="right">
                      <p>{dimension.name}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </TooltipProvider>
        </aside>

        {/* Tree */}
        <section className="flex min-h-0 flex-col border-r">
          <div className="border-b px-4 py-3">
            <h2 className="font-medium">Classification Tree</h2>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {selectedDimension ? (
              <ClassificationTree
                tree={tree}
                selected={selectedCode}
                onSelect={setSelectedCode}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <Layers3 className="mb-4 h-10 w-10 text-muted-foreground" />

                <h3 className="font-medium">Select a dimension</h3>

                <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                  Choose a classification dimension from the left to explore its
                  hierarchy.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Inspector */}
        <section className="flex min-h-0 flex-col">
          <div className="border-b px-5 py-3">
            <h2 className="font-medium">Inspector</h2>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            {selectedCode ? (
              <CodeDetailsCard code={selectedCode} />
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <Building2 className="mb-4 h-10 w-10 text-muted-foreground" />

                <h3 className="font-medium">No classification selected</h3>

                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Select a classification from the tree to view its description,
                  hierarchy and metadata.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      <footer className="border-t bg-muted/20 px-6 py-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{currentSystem?.name}</span>

              {currentSystem?.version && (
                <span className="rounded bg-muted px-2 py-0.5 text-xs">
                  v{currentSystem.version}
                </span>
              )}
            </div>

            <p className="max-w-4xl text-sm text-muted-foreground">
              {currentSystem?.description}
            </p>
          </div>

          <div className="text-right text-xs text-muted-foreground">
            <div>{dimensions.length} Dimensions</div>
            <div>{tree.length} Root Classifications</div>
          </div>
        </div>
      </footer>

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
