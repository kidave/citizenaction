"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import GovernanceExplorer from "./GovernanceExplorer";

export default function AuthoritySelectorModal({
  open,
  onOpenChange,
  selected,
  onChange,
  onSubmit,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tag Governance</DialogTitle>
        </DialogHeader>

        <GovernanceExplorer selected={selected} onChange={onChange} />

        <Button
          className="mt-4 w-full"
          onClick={() => {
            onSubmit?.(selected);
            onOpenChange(false);
          }}
        >
          Save
        </Button>
      </DialogContent>
    </Dialog>
  );
}
