import { useMemo, useState } from "react";

import { useRouter } from "next/router";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import { Card, CardContent } from "@/components/ui/card";

import useClassificationSystems from "@/hooks/standards/useClassificationSystems";

import useClassificationDimensions from "@/hooks/standards/useClassificationDimensions";

import useClassificationCodes from "@/hooks/standards/useClassificationCodes";

import useClassificationTree from "@/hooks/standards/useClassificationTree";

import {
  ClassificationDimensionSidebar,
  ClassificationBreadcrumb,
  ClassificationTree,
  ClassificationCodeTable,
  CodeDetailsCard,
  StandardsToolbar,
  ClassificationCodeDialog,
  DeleteCodeDialog,
} from "@/components/standards";

export default function StandardPage() {
  const router = useRouter();

  const { system } = router.query;

  const [selectedDimension, setSelectedDimension] = useState(null);

  const [selectedCode, setSelectedCode] = useState(null);

  const [search, setSearch] = useState("");

  const [editOpen, setEditOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: systems = [] } = useClassificationSystems();

  const currentSystem = useMemo(() => {
    return systems.find((s) => s.code.toLowerCase() === system);
  }, [systems, system]);

  const { data: dimensions = [] } = useClassificationDimensions(
    currentSystem?.id,
  );

  const { data: rows = [] } = useClassificationCodes(selectedDimension?.id);

  const { data: tree = [] } = useClassificationTree(selectedDimension?.id);

  const filtered = useMemo(() => {
    if (!search) return rows;

    const s = search.toLowerCase();

    return rows.filter(
      (r) => r.title.toLowerCase().includes(s) || r.code.includes(s),
    );
  }, [rows, search]);

  return (
    <div className="h-[calc(100vh-65px)]">
      <div className="border-b p-4">
        <ClassificationBreadcrumb
          system={currentSystem}
          dimension={selectedDimension}
        />
      </div>

      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={15} minSize={10}>
          <ClassificationDimensionSidebar
            dimensions={dimensions}
            selected={selectedDimension}
            onSelect={setSelectedDimension}
          />
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize={25}>
          <ClassificationTree
            tree={tree}
            selected={selectedCode}
            onSelect={setSelectedCode}
          />
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize={60}>
          <div className="space-y-4 p-4">
            <StandardsToolbar
              search={search}
              setSearch={setSearch}
              canEdit={true}
              onCreate={() => setEditOpen(true)}
            />

            <Card>
              <CardContent className="p-0">
                <ClassificationCodeTable
                  rows={filtered}
                  canEdit
                  onEdit={(code) => {
                    setSelectedCode(code);
                    setEditOpen(true);
                  }}
                  onDelete={(code) => {
                    setSelectedCode(code);
                    setDeleteOpen(true);
                  }}
                />
              </CardContent>
            </Card>

            <CodeDetailsCard code={selectedCode} />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      <ClassificationCodeDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        value={selectedCode}
        dimensions={dimensions}
        parents={rows}
        onSave={(values) => {
          console.log(values);
        }}
      />

      <DeleteCodeDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        code={selectedCode}
        onDelete={(row) => {
          console.log(row);
        }}
      />
    </div>
  );
}
