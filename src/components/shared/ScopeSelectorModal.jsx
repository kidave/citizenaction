"use client";

import { useEffect, useRef, useState } from "react";

import ScopeSelector from "./ScopeSelector";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

export default function ScopeSelectorModal({
  open,
  onClose,
  value,
  onSave,

  // ✅ NEW: modal controls behavior
  levels = ["region", "city", "ward"],
}) {
  const [tempScope, setTempScope] = useState(null);

  const latestValueRef = useRef(value);

  /* ---------------- KEEP LATEST VALUE ---------------- */
  useEffect(() => {
    latestValueRef.current = value;
  }, [value]);

  /* ---------------- INIT TEMP STATE ---------------- */
  useEffect(() => {
    if (!open) return;

    setTempScope(latestValueRef.current);
  }, [open]);

  /* ---------------- UI ---------------- */

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="
          w-full 
          max-w-2xl 
          max-h-[90vh] 
          flex 
          flex-col
        "
      >
        <DialogTitle>Select Location</DialogTitle>

        <div className="flex-1 overflow-y-auto pt-4">

          {!tempScope ? (
            <div className="text-sm text-muted-foreground py-10 text-center">
              Loading location...
            </div>
          ) : (
            <ScopeSelector
              value={tempScope}
              onChange={setTempScope}
              levels={levels}
              containerClassName="flex flex-col gap-4"
              itemClassName="w-full"
            />
          )}

        </div>

        <div className="flex justify-between items-center pt-4 border-t mt-2">

          <Button
            onClick={() =>
              setTempScope({
                scope_type: null,
                scope_code: null,
                scope_name: null,
              })
            }
            variant="link"
          >
            Reset
          </Button>

          <div className="flex gap-2">
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>

            <Button
              onClick={() => {
                onSave(tempScope);
                onClose();
              }}
              size="sm"
            >
              <Save/> Save
            </Button>
          </div>

        </div>

      </DialogContent>
    </Dialog>
  );
}