import * as AlertDialog from "@radix-ui/react-alert-dialog";
import Button from "./Button";

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm
}) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="dialogOverlay" />
        <AlertDialog.Content className="dialogContent">
          <AlertDialog.Title>{title}</AlertDialog.Title>
          <AlertDialog.Description>{description}</AlertDialog.Description>

          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <AlertDialog.Cancel asChild>
              <Button variant="secondary">Cancel</Button>
            </AlertDialog.Cancel>

            <AlertDialog.Action asChild>
              <Button variant="danger" onClick={onConfirm}>
                Confirm
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
