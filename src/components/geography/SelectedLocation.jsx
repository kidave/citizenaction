"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";

export default function SelectedLocation({
  address,
  open,
  isMobile,
  onOpenChange,
  onUseLocation,
  onClear,
}) {
  if (!open) return null;

  const content = (
    <>
      <div className="min-w-0">
        <div className="truncate text-base font-medium">
          {address || "Selected location"}
        </div>

        {!address && (
          <div className="mt-1 text-sm text-muted-foreground">
            Finding the address…
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Button type="button" className="flex-1" onClick={onUseLocation}>
          Use location
        </Button>

        <Button type="button" variant="outline" onClick={onClear}>
          Clear
        </Button>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="z-[1100] max-h-[45vh] border-t bg-background px-4 pb-6">
          <DrawerHeader className="sr-only">
            <DrawerTitle>Selected location</DrawerTitle>

            <DrawerDescription>
              Review the location before adding it to the post.
            </DrawerDescription>
          </DrawerHeader>

          <div className="mx-auto mb-4 mt-1 h-1.5 w-10 rounded-full bg-muted" />

          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <div className="absolute bottom-4 left-1/2 z-[1000] w-[520px] -translate-x-1/2">
      <Card className="rounded-2xl border bg-background/95 shadow-2xl backdrop-blur">
        <CardContent className="p-4">{content}</CardContent>
      </Card>
    </div>
  );
}
