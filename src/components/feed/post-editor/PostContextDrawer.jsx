"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Button,
} from "@/components/ui/button";

import InlineLinkInput from "@/components/ui/InlineLinkInput";

import {
  DateTimePicker,
} from "@/components/ui/date-time";

import {
  Settings2,
  MapPin,
  X,
} from "lucide-react";

import PostTypeSelector
from "./PostTypeSelector";

import LocationPickerModal
from "./LocationPickerModal";

import getPostTypeConfig
from "@/utils/feed/getPostTypeConfig";

export default function PostContextDrawer({
  editor,
}) {

  const [open, setOpen] =
    useState(false);

  const config =
    getPostTypeConfig(
      editor.type
    );

  // =====================================================
  // TOOLTIP SUMMARY
  // =====================================================

  const contextSummary =
    useMemo(() => {

      const items = [];

      items.push(
        `Type: ${editor.type}`
      );

      if (
        editor.start_at
      ) {

        items.push(
          `Starts: ${new Date(
            editor.start_at
          ).toLocaleString()}`
        );
      }

      if (
        editor.end_at
      ) {

        items.push(
          `Ends: ${new Date(
            editor.end_at
          ).toLocaleString()}`
        );
      }

      return items;
    }, [
      editor.type,
      editor.start_at,
      editor.end_at,
    ]);

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >

      {/* =====================================================
          TRIGGER
      ===================================================== */}

      <TooltipProvider>

        <Tooltip>

          <TooltipTrigger
            asChild
          >

            <DialogTrigger
              asChild
            >

              <Button
                variant="outline"
                size="icon"
                className="
                  rounded-xl
                "
              >

                <Settings2
                  className="
                    w-4
                    h-4
                  "
                />

              </Button>

            </DialogTrigger>

          </TooltipTrigger>

          <TooltipContent
            side="bottom"
            align="start"
          >

            <div
              className="
                space-y-1
                text-xs
              "
            >

              {contextSummary.map(
                (
                  item,
                  index
                ) => (
                  <div
                    key={index}
                  >
                    {item}
                  </div>
                )
              )}

            </div>

          </TooltipContent>

        </Tooltip>

      </TooltipProvider>

      {/* =====================================================
          MODAL
      ===================================================== */}

      <DialogContent
        className="
          p-0

          sm:max-w-2xl

          overflow-hidden
        "
      >

        <div
            className="
                p-6
                space-y-6
            "
            >

            {/* =====================================================
                TOP BAR
            ===================================================== */}



                {/* TYPE */}
                <PostTypeSelector
                type={editor.type}
                setType={
                    editor.setType
                }
                />

            

            {/* =====================================================
                SCHEDULE
            ===================================================== */}

            <div
                className="
                grid
                grid-cols-1
                sm:grid-cols-2
                gap-4
                "
            >

                {/* START */}
                <div className="space-y-2">

                <div
                    className="
                    text-xs
                    text-muted-foreground
                    "
                >
                    Starts
                </div>

                <div
                    className="
                    h-10
                    "
                >

                    <DateTimePicker
                    value={
                        editor.start_at
                        ? new Date(
                            editor.start_at
                            )
                        : null
                    }
                    onDateChange={(
                        value
                    ) => {

                        editor.setStartAt(
                        value
                            ?.toISOString() ||
                        null
                        );
                    }}
                    mode={
                        config.showTime
                        ? "datetime"
                        : "date"
                    }
                    />

                </div>

                </div>

                {/* END */}
                <div className="space-y-2">

                <div
                    className="
                    text-xs
                    text-muted-foreground
                    "
                >
                    Ends
                </div>

                <div
                    className="
                    h-10
                    "
                >

                    <DateTimePicker
                    value={
                        editor.end_at
                        ? new Date(
                            editor.end_at
                            )
                        : null
                    }
                    onDateChange={(
                        value
                    ) => {

                        editor.setEndAt(
                        value
                            ?.toISOString() ||
                        null
                        );
                    }}
                    mode={
                        config.showTime
                        ? "datetime"
                        : "date"
                    }
                    disabled={
                        ![
                        "report",
                        "event",
                        "meeting",
                        ].includes(
                        editor.type
                        )
                    }
                    />

                </div>

                </div>

            </div>

           {/* =====================================================
                LOCATION + LINK
            ===================================================== */}

            <div
            className="
                flex
                items-end
                gap-3
            "
            >

            {/* =====================================================
                LOCATION
            ===================================================== */}

            <TooltipProvider>

                <Tooltip>

                <TooltipTrigger
                    asChild
                >

                    <div
                    className="
                        shrink-0
                    "
                    >

                    <LocationPickerModal
                        editor={editor}
                    >

                        <Button
                        variant={
                            editor.address
                            ? "default"
                            : "outline"
                        }
                        size="icon"
                        className="
                            h-10
                            w-10
                            rounded-xl
                        "
                        >

                        <MapPin
                            className="
                            w-4
                            h-4
                            "
                        />

                        </Button>

                    </LocationPickerModal>

                    </div>

                </TooltipTrigger>

                <TooltipContent
                    side="top"
                    className="
                    max-w-xs
                    break-words
                    "
                >

                    {editor.address ||
                    "No location selected"}

                </TooltipContent>

                </Tooltip>

            </TooltipProvider>

            {/* =====================================================
                LINK
            ===================================================== */}

            <InlineLinkInput
                value={
                editor.meeting_link
                }
                onChange={
                editor.setMeetingLink
                }
            />

            </div>

        </div>
        {/* =====================================================
            FOOTER
        ===================================================== */}

        <div
        className="
            border-t
            px-6
            py-4

            flex
            items-center
            justify-end
            gap-2
        "
        >

        <DialogClose asChild>

            <Button
            variant="outline"
            >
            Cancel
            </Button>

        </DialogClose>

        <Button
            onClick={() =>
            setOpen(false)
            }
        >
            Save
        </Button>

        </div>

      </DialogContent>

    </Dialog>
  );
}