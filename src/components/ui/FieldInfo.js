"use client";

import { useState, useEffect } from "react";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Info } from "lucide-react";

export default function FieldInfo({ text }) {
  const [isMobile, setIsMobile] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () =>
      setIsMobile(window.innerWidth < 768);

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () =>
      window.removeEventListener("resize", checkMobile);
  }, []);

  if (!text) return null;

  // ---------- MOBILE → TAP DIALOG ----------
  if (isMobile) {
    return (
      <div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
          className="text-muted-foreground hover:text-foreground transition"
        >
          <Info className="h-4 w-4" />
        </button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Information</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              {text}
            </p>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ---------- DESKTOP → HOVER ----------
  return (
    <HoverCard openDelay={150}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground transition"
          onClick={(e) => e.stopPropagation()}
        >
          <Info className="h-4 w-4" />
        </button>
      </HoverCardTrigger>

      <HoverCardContent className="w-72 text-sm text-muted-foreground">
        {text}
      </HoverCardContent>
    </HoverCard>
  );
}