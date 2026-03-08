"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DateTimePicker } from "@/components/ui/date-time";
import { Field, FieldLabel } from "@/components/ui/field";

export default function PostTimelineRecordModal({
  open,
  onOpenChange,
  existing,
  onSave,
}) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!existing) {
      const now = new Date();
      setDate(now.toISOString().split("T")[0]);
      setTime(now.toTimeString().slice(0, 5));
      setTitle("");
      setDescription("");
      return;
    }

    const parsed = new Date(existing.at);
    setDate(parsed.toISOString().split("T")[0]);
    setTime(parsed.toTimeString().slice(0, 5));
    setTitle(existing.title || "");
    setDescription(existing.description || "");
  }, [existing]);

  function handleSubmit() {
    if (!date || !time || !title.trim()) return;

    const parsed = new Date(`${date}T${time}`);
    if (isNaN(parsed.getTime())) return;

    const entry = {
      at: parsed.toISOString(),
      title: title.trim(),
      description: description.trim(),
      variant: "default",
    };

    onSave(entry);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>

        <DialogHeader>
          <DialogTitle>
            {existing ? "Edit Timeline Record" : "Add Timeline Record"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">

          <Field>
            <FieldLabel>Date & Time</FieldLabel>
            <DateTimePicker
              date={date}
              time={time}
              onDateChange={setDate}
              onTimeChange={setTime}
            />
          </Field>

          <Field>
            <FieldLabel>Title</FieldLabel>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Record title"
            />
          </Field>

          <Field>
            <FieldLabel>Description</FieldLabel>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details"
            />
          </Field>

          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button onClick={handleSubmit}>
              Save
            </Button>
          </div>

        </div>

      </DialogContent>
    </Dialog>
  );
}