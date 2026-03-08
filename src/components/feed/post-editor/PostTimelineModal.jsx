"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";

import PostTimelineRecordModal from "./PostTimelineRecordModal";

export default function PostTimelineModal({
  open,
  onOpenChange,
  editor,
}) {
  const {
    timeline,
    removeTimelineEntry,
    addTimelineEntry,
    updateTimelineEntry,
  } = editor;

  const [recordModal, setRecordModal] = useState({
    open: false,
    mode: null, // "insert" | "edit"
    index: null,
  });

  const [deleteIndex, setDeleteIndex] = useState(null);

  function openInsert(index) {
    setRecordModal({
      open: true,
      mode: "insert",
      index,
    });
  }

  function openEdit(index) {
    setRecordModal({
      open: true,
      mode: "edit",
      index,
    });
  }

  function handleSave(entry) {
    if (recordModal.mode === "edit") {
      updateTimelineEntry(recordModal.index, entry);
    } else {
      addTimelineEntry(entry, recordModal.index);
    }

    setRecordModal({ open: false, mode: null, index: null });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xl">

          <DialogHeader>
            <DialogTitle>Timeline History</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto">

            {/* Insert at Top */}
            <div className="flex justify-center">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => openInsert(0)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Record
              </Button>
            </div>

            {timeline.map((item, index) => (
              <div
                key={`${item.at}-${index}`}
                className="border rounded-md p-3 flex justify-between items-start"
              >
                <div>
                  <div className="text-sm font-medium">
                    {item.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(item.at).toLocaleString()}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => openEdit(index)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setDeleteIndex(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>

                {/* Insert after */}
                <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="bg-background border rounded-full"
                    onClick={() => openInsert(index + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

          </div>

        </DialogContent>
      </Dialog>

      {deleteIndex !== null && (
      <Dialog
        open={true}
        onOpenChange={() => setDeleteIndex(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Timeline Record?</DialogTitle>
          </DialogHeader>

          <div className="text-sm text-muted-foreground">
            This record will be permanently removed from the timeline.
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="ghost"
              onClick={() => setDeleteIndex(null)}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={() => {
                removeTimelineEntry(deleteIndex);
                setDeleteIndex(null);
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )}

      <PostTimelineRecordModal
        open={recordModal.open}
        onOpenChange={(open) =>
          setRecordModal((prev) => ({ ...prev, open }))
        }
        existing={
          recordModal.mode === "edit"
            ? timeline[recordModal.index]
            : null
        }
        onSave={handleSave}
      />
    </>
  );
}