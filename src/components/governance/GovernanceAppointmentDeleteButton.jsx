"use client";

import { useState } from "react";
import { MoreVertical, Pencil, Trash2, UserRoundPlus, MapPin, MapPinned } from "lucide-react";
import { toast } from "sonner";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase/client";

export default function GovernanceAppointmentDeleteButton({ appointmentId, personName, positionName, onEdit, onEditPosition, onAssignPerson, onManageAddress, onManageGeography, onDeleted }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const remove = async () => {
    try {
      setDeleting(true);
      const { error } = await supabase.rpc("delete_position_appointment", {
        p_appointment_id: appointmentId,
      });
      if (error) throw error;

      toast.success("Appointment deleted");
      setConfirmOpen(false);
      await onDeleted?.();
    } catch (error) {
      toast.error(error?.message || "Unable to delete appointment");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground" aria-label="Appointment actions">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onEditPosition && <DropdownMenuItem onSelect={() => onEditPosition()}><Pencil className="h-4 w-4" />Edit position</DropdownMenuItem>}
          {onAssignPerson && <DropdownMenuItem onSelect={() => onAssignPerson()}><UserRoundPlus className="h-4 w-4" />Assign person</DropdownMenuItem>}
          {onManageAddress && <DropdownMenuItem onSelect={() => onManageAddress()}><MapPin className="h-4 w-4" />Add/Edit address</DropdownMenuItem>}
          {onManageGeography && <DropdownMenuItem onSelect={() => onManageGeography()}><MapPinned className="h-4 w-4" />Add/Edit geography</DropdownMenuItem>}
          <DropdownMenuItem onSelect={() => onEdit?.()}>
            <Pencil className="h-4 w-4" />
            Edit appointment
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => setConfirmOpen(true)}>
            <Trash2 className="h-4 w-4" />
            Delete appointment
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes {personName ? `${personName}'s ` : "the "}{positionName || "position"} appointment from the governance history. The person and position records will remain.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={remove} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete appointment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
