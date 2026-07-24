// components/auth/LoginModal.jsx

import { Dialog, DialogContent } from "@/components/ui/dialog";
import AuthCard from "./AuthCard";

export function LoginModal({
  open,
  onOpenChange,
  redirectPath,
  message = "You need to sign in to continue",
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 sm:max-w-md">
        <AuthCard
          variant="modal"
          message={message}
          redirectPath={redirectPath}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
