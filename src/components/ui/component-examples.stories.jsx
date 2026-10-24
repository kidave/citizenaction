import { useState } from "react";
import { fn } from "storybook/test";

import { Button } from "./button";
import ConfirmDialog from "./ConfirmDialog";
import CopyField from "./CopyField";
import InlineLinkInput from "./InlineLinkInput";
import MenuButton from "./MenuButton";
import ScrollButton from "./ScrollButton";

function InlineLinkExample() {
  const [value, setValue] = useState("https://citizenaction.in/projects");

  return (
    <div className="space-y-3">
      <InlineLinkInput value={value} onChange={setValue} />
      <p className="text-sm text-muted-foreground">
        Saved URL: {value || "No link"}
      </p>
    </div>
  );
}

function ConfirmDialogExample({ onConfirm }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Open confirmation
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        onConfirm={onConfirm}
        title="Remove this draft?"
        description="This only demonstrates the confirmation UI; no data is changed."
      />
    </>
  );
}

const meta = {
  title: "UI Primitives/Utilities",
  tags: ["!autodocs", "!manifest"],
  parameters: {
    layout: "centered",
  },
};

export default meta;

export const CopyFieldValue = {
  render: () => (
    <div className="w-80">
      <CopyField label="Reference number" value="CA-2025-0148" />
    </div>
  ),
};

export const EditableLink = {
  render: () => <InlineLinkExample />,
};

export const ConfirmDialogFlow = {
  args: {
    onConfirm: fn(),
  },
  render: (args) => <ConfirmDialogExample onConfirm={args.onConfirm} />,
};

export const MenuActions = {
  args: {
    onEdit: fn(),
    onDelete: fn(),
    onAddRelation: fn(),
    onAddGeography: fn(),
  },
  render: (args) => <MenuButton {...args} />,
};

export const ScrollControls = {
  render: () => (
    <div className="relative h-72 w-80 overflow-y-auto rounded-lg border p-4">
      <p className="text-sm">
        Scroll controls respond to the preview window scroll position.
      </p>
      <div className="mt-96 rounded-md bg-muted p-4 text-sm">
        More content below the initial viewport.
      </div>
      <ScrollButton showAfter={40} />
    </div>
  ),
};
