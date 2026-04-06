"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import AuthorityExplorer from "./AuthorityExplorer";

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
          <DialogTitle>Select Authority</DialogTitle>
        </DialogHeader>

        <AuthorityExplorer
          selected={selected}
          onChange={onChange}
        />

        <Button
          className="w-full mt-4"
          onClick={() => {
            onSubmit(selected);
            onOpenChange(false);
          }}
        >
          Save
        </Button>

      </DialogContent>
    </Dialog>
  );
}