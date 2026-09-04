import { TIMELINE_ORIENTATION } from "@/config/timeline/orientation";

export default function TimelineProgressRail({
  progress,
  color,
  orientation = TIMELINE_ORIENTATION.HORIZONTAL,
}) {
  const isVertical = orientation === TIMELINE_ORIENTATION.VERTICAL;

  return (
    <div
      className={
        isVertical
          ? "pointer-events-none absolute inset-y-0 left-1/2 z-0 hidden w-px -translate-x-1/2 md:block"
          : "pointer-events-none absolute left-0 right-0 top-[340px] z-0 h-[3px]"
      }
      aria-hidden="true"
    >
      {/* BASE RAIL */}

      <div
        className={
          isVertical
            ? "absolute inset-0 w-px bg-border/80"
            : "absolute inset-0 h-[3px] rounded-full bg-muted/90"
        }
      />

      {/* PROGRESS */}

      <div
        className={
          isVertical
            ? "absolute left-0 top-0 w-px origin-top overflow-hidden"
            : "absolute left-0 top-0 h-[3px] origin-left overflow-hidden rounded-full"
        }
        style={
          isVertical
            ? {
                height: `${progress * 100}%`,
              }
            : {
                width: `${progress * 100}%`,
              }
        }
      >
        <div
          className={
            isVertical
              ? "absolute inset-0 w-px"
              : "absolute inset-0 h-[3px] rounded-full"
          }
          style={{
            background: color.line,
            boxShadow: `0 0 12px ${color.glow}`,
          }}
        />

        {/* MOVING HIGHLIGHT */}

        <div
          className={
            isVertical
              ? "absolute left-1/2 top-0 h-20 w-5 -translate-x-1/2 bg-gradient-to-b from-transparent via-white/80 to-transparent blur-[2px]"
              : "absolute left-0 top-1/2 h-5 w-20 -translate-y-1/2 bg-gradient-to-r from-transparent via-white/80 to-transparent blur-[2px]"
          }
        />
      </div>
    </div>
  );
}
