"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useUpsertMeetingItem } from "@/hooks/meeting/useUpsertMeetingItem";

export default function MeetingItemEditorModal({
  isOpen,
  onClose,
  meeting,
  existingItem,
}) {
  const { user } = useAuth();
  const { upsertMeetingItem, isSaving } = useUpsertMeetingItem();

  const [notes, setNotes] = useState("");

  useEffect(() => {
    setNotes(existingItem?.notes || "");
  }, [existingItem]);

  if (!isOpen) return null;

  async function handleSave() {
    if (!notes.trim()) return;

    await upsertMeetingItem({
      feed_id: meeting.id,
      // 🔥 FIX: use selected user when editing
      user_id: existingItem?.user_id || user.id,
      notes,
    });

    onClose();
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">

          {/* Header */}
          <div className="border-b p-4 flex justify-between items-center">
            <div className="font-medium">
              {existingItem
                ? existingItem.is_self
                  ? "Edit your input"
                  : "Edit participant input"
                : "Add your input"}
            </div>

            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>

              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {existingItem ? "Update" : "Add"}
              </Button>
            </div>
          </div>

          {/* Body */}
          <div className="p-4">
            <Textarea
              autoFocus
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
              placeholder="Write your input..."
              className="min-h-[120px] resize-none overflow-hidden"
            />
          </div>

        </Card>
      </div>
    </>
  );
}