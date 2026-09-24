"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import AuthCard from "./AuthCard";

export function LoginModal({ open, onOpenChange, post, action = "continue" }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 sm:max-w-md">
        <AuthCard
          variant="modal"
          post={post}
          action={action}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
