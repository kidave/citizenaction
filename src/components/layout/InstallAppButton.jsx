"use client";

import { useEffect, useState } from "react";
import { Download, Share } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function InstallAppButton({ onInstalled }) {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [iosDialogOpen, setIosDialogOpen] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    setIsStandalone(standalone);

    const ios =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !window.MSStream;

    setIsIOS(ios);

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt,
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  // Already installed
  if (isStandalone) {
    return null;
  }

  // iPhone / iPad Safari
  if (isIOS) {
    return (
      <>
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          onClick={() => setIosDialogOpen(true)}
        >
          <Share className="h-4 w-4" />
          <span>Add Citizen Action</span>
        </Button>

        <Dialog
          open={iosDialogOpen}
          onOpenChange={setIosDialogOpen}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                Add Citizen Action to your Home Screen
              </DialogTitle>

              <DialogDescription>
                Install Citizen Action on your iPhone for quick access
                and an app-like experience.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                  1
                </div>

                <p className="pt-1 text-sm">
                  Tap the <strong>Share</strong> button in Safari.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                  2
                </div>

                <p className="pt-1 text-sm">
                  Scroll down and select{" "}
                  <strong>Add to Home Screen</strong>.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                  3
                </div>

                <p className="pt-1 text-sm">
                  Tap <strong>Add</strong>.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Android Chrome / supported browsers
  if (installPrompt) {
    const handleInstall = async () => {
      await installPrompt.prompt();

      const { outcome } = await installPrompt.userChoice;

      if (outcome === "accepted") {
        setInstallPrompt(null);
        onInstalled?.();
      }
    };

    return (
      <Button
        type="button"
        variant="outline"
        className="rounded-full"
        onClick={handleInstall}
      >
        <Download className="h-4 w-4" />
        <span>Install Citizen Action</span>
      </Button>
    );
  }

  return null;
}