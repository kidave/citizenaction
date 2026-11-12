import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";
import { Button } from "./button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "./hover-card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

function DialogExample() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open project details</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Project details</DialogTitle>
          <DialogDescription>
            Review the project information before continuing.
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Public feedback remains open until 30 April.
        </p>
        <DialogFooter>
          <Button>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ConfirmDialogExample({ onConfirm }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Delete draft
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this draft?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep draft</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirm}>
              Delete draft
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

const meta = {
  title: "Overlays",
  tags: ["!autodocs", "!manifest"],
  parameters: {
    layout: "centered",
  },
};

export default meta;

export const DialogExampleStory = {
  name: "Dialog",
  render: () => <DialogExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: "Open project details" }),
    );
    await expect(
      within(document.body).getByRole("dialog", { name: "Project details" }),
    ).toBeInTheDocument();
  },
};

export const ConfirmationDialog = {
  args: {
    onConfirm: fn(),
  },
  render: (args) => <ConfirmDialogExample onConfirm={args.onConfirm} />,
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "Delete draft" }),
    );
    await expect(
      within(document.body).getByRole("alertdialog", {
        name: "Delete this draft?",
      }),
    ).toBeInTheDocument();
  },
};

export const DropdownMenuExample = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Project actions</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Project</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Edit details</DropdownMenuItem>
        <DropdownMenuItem>Share project</DropdownMenuItem>
        <DropdownMenuItem disabled>Archive (unavailable)</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const PopoverExample = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Choose a location</Button>
      </PopoverTrigger>
      <PopoverContent align="start">
        <div className="space-y-1">
          <h4 className="text-sm font-medium">Local area</h4>
          <p className="text-sm text-muted-foreground">
            Select a neighborhood to filter community updates.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const SheetExample = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open project panel</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Project panel</SheetTitle>
          <SheetDescription>
            Review the project summary and recent activity.
          </SheetDescription>
        </SheetHeader>
        <SheetFooter className="mt-6">
          <Button>View project</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const DrawerExample = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open mobile details</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Community feedback</DrawerTitle>
          <DrawerDescription>
            Add a note to the public discussion.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <Button>Continue</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

export const TooltipExample = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Share</Button>
        </TooltipTrigger>
        <TooltipContent>Copy a link to this project</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const HoverCardExample = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">About this organization</Button>
      </HoverCardTrigger>
      <HoverCardContent>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold">Community Planning Office</h4>
          <p className="text-sm text-muted-foreground">
            Supporting accessible, inclusive neighborhood projects.
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};

export const ContextMenuExample = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-32 w-64 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
        Right-click for actions
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>Open proposal</ContextMenuItem>
        <ContextMenuItem>Copy link</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

export const CommandPalette = {
  render: () => (
    <Command className="w-full max-w-sm rounded-lg border shadow-md">
      <CommandInput placeholder="Search actions..." />
      <CommandList>
        <CommandEmpty>No matching actions.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>Browse proposals</CommandItem>
          <CommandItem>View local spaces</CommandItem>
          <CommandItem>Open governance directory</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};
