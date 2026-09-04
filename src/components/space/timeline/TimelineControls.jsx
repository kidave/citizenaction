import {
  ChevronLeft,
  ChevronRight,
  Monitor,
  Rows3,
  Columns3,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { TIMELINE_ORIENTATION } from "@/config/timeline/orientation";

export default function TimelineControls({
  preference,
  onPreferenceChange,
  onPrevious,
  onNext,
  showNavigation = false,
}) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
        Timeline layout
      </div>

      <div className="flex items-center gap-2">
        {/* LAYOUT TOGGLE */}

        <div className="flex items-center gap-1 rounded-full border bg-background/80 p-1 backdrop-blur">
          <Button
            type="button"
            variant={
              preference === TIMELINE_ORIENTATION.AUTO ? "secondary" : "ghost"
            }
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => onPreferenceChange(TIMELINE_ORIENTATION.AUTO)}
            title="Automatic timeline layout"
          >
            <Monitor className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant={
              preference === TIMELINE_ORIENTATION.HORIZONTAL
                ? "secondary"
                : "ghost"
            }
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => onPreferenceChange(TIMELINE_ORIENTATION.HORIZONTAL)}
            title="Horizontal timeline"
          >
            <Columns3 className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant={
              preference === TIMELINE_ORIENTATION.VERTICAL
                ? "secondary"
                : "ghost"
            }
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => onPreferenceChange(TIMELINE_ORIENTATION.VERTICAL)}
            title="Vertical timeline"
          >
            <Rows3 className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* HORIZONTAL NAVIGATION */}

        {showNavigation && (
          <>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={onPrevious}
              aria-label="Previous timeline section"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={onNext}
              aria-label="Next timeline section"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
