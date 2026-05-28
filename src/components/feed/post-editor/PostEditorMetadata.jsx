"use client";

import { useMemo } from "react";

import { DateTimePicker } from "@/components/ui/date-time";

import PostLocationSelector from "./PostLocationSelector";

import PostTypeSelector from "./PostTypeSelector";

import getPostTypeConfig from "@/utils/feed/getPostTypeConfig";

export default function PostEditorMetadata({ editor }) {
  const {
    type,
    setType,

    start_at,
    setStartAt,

    end_at,
    setEndAt,
  } = editor;

  const config = getPostTypeConfig(type);

  // =====================================================
  // STABLE DATE OBJECTS
  // =====================================================

  const startDate = useMemo(() => {
    return start_at ? new Date(start_at) : null;
  }, [start_at]);

  const endDate = useMemo(() => {
    return end_at ? new Date(end_at) : null;
  }, [end_at]);

  // =====================================================
  // UPDATE START
  // =====================================================

  function handleStartChange(value) {
    if (!value) {
      setStartAt(null);
      return;
    }

    setStartAt(value.toISOString());
  }

  // =====================================================
  // UPDATE END
  // =====================================================

  function handleEndChange(value) {
    if (!value) {
      setEndAt(null);
      return;
    }

    setEndAt(value.toISOString());
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* TYPE */}

      <PostTypeSelector type={type} setType={setType} />

      {/* START */}

      <DateTimePicker
        value={startDate}
        onDateChange={handleStartChange}
        mode={config.showTime ? "datetime" : "date"}
      />

      {/* END */}

      {config.lifecycle && (
        <DateTimePicker
          value={endDate}
          onDateChange={handleEndChange}
          mode={config.showTime ? "datetime" : "date"}
        />
      )}

      {/* LOCATION */}

      {config.showAddress && <PostLocationSelector editor={editor} />}
    </div>
  );
}
