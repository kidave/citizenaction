"use client";

import { Field, FieldLabel } from "@/components/ui/field";
import FieldInfo from "@/components/ui/FieldInfo";
import { DateTimePicker } from "@/components/ui/date-time";

import PostLocationSelector from "./PostLocationSelector";
import PostEditorTimeline from "./PostEditorTimeline";

export default function PostEditorMetadata({ editor }) {

  const {
    date,
    time,
    setDate,
    setTime,
    type
  } = editor;

  const infoText =
    type === "meeting"
      ? "Date and time of the meeting."
      : type === "report"
      ? "Date when the report was submitted."
      : "Date relevant to this civic action.";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

      <Field className="col-span-2">
        <FieldLabel className="flex items-center gap-2">
          Date & Time
          <span className="text-xs text-muted-foreground">
            (defaults to now)
          </span>
          <FieldInfo text={infoText} />
        </FieldLabel>

        <DateTimePicker
          date={date}
          time={time}
          onDateChange={setDate}
          onTimeChange={setTime}
        />
      </Field>

      <PostLocationSelector editor={editor} />
      <PostEditorTimeline editor={editor} />

    </div>
  );
}