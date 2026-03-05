"use client";

import { Field, FieldLabel } from "@/components/ui/field";
import FieldInfo from "@/components/ui/FieldInfo";
import { DateTimePicker } from "@/components/ui/date-time";

import PostLocationSelector from "./PostLocationSelector";
import PostStatusSelector from "./PostStatusSelector";

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
      <PostStatusSelector editor={editor} />

    </div>
  );
}