"use client";

import { DateTimePicker } from "@/components/ui/date-time";
import PostEditorTimeline from "./PostEditorTimeline";
import PostLocationSelector from "./PostLocationSelector";

export default function PostEditorMetadata({ editor }) {
  const {
    type,
    date,
    time,
    setDate,
    setTime,
  } = editor;

  const showTime = ["event", "meeting"].includes(type);

  const dateObj = date ? new Date(date) : null;

  const timeObj = time
    ? new Date(`1970-01-01T${time}`)
    : null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* DATE (always) */}
      <div className="flex-shrink-0">
        <DateTimePicker
          value={dateObj}
          onDateChange={(d) =>
            setDate(d ? d.toISOString().split("T")[0] : "")
          }
          mode="date"
        />
      </div>

      {/* TIME (event / meeting only) */}
      {["event", "meeting"].includes(type) && (
        <div className="flex-shrink-0">
          <DateTimePicker
            value={timeObj}
            onDateChange={(d) =>
              setTime(d ? d.toTimeString().slice(0, 5) : "")
            }
            mode="time"
          />
        </div>
      )}

      <div className="flex-shrink-0">
        <PostLocationSelector editor={editor} />
      </div>

      {["report", "update", "event"].includes(type) && (
        <div className="flex-shrink-0">
          <PostEditorTimeline editor={editor} />
        </div>
      )}

    </div>
  );
}