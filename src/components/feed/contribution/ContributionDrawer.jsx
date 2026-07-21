"use client";

import { useIsMobile } from "@/hooks/use-mobile";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

import PostContribution from "./PostContribution";

export default function ContributionDrawer({ open, onOpenChange, post }) {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl p-0">
          <DialogHeader className="border-b p-6">
            <DialogTitle>Contributions</DialogTitle>
          </DialogHeader>

          <div className="max-h-[75vh] overflow-y-auto p-6">
            <PostContribution post={post} />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[92vh]">
        <DrawerHeader>
          <DrawerTitle>Contributions</DrawerTitle>
        </DrawerHeader>

        <div className="overflow-y-auto px-4 pb-6">
          <PostContribution post={post} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
