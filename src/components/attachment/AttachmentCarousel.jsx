"use client";

import { useEffect, useState } from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import AttachmentCard from "./AttachmentCard";
import LinkCard from "@/components/feed/post/LinkCard";

export default function AttachmentCarousel({
  attachments = [],
  links = [],
  onAttachmentClick,
  onRemove,
  onCreditNameChange,
  removable = false,
  showMetadata = true,
  size = "default",
}) {
  const [hovered, setHovered] = useState(null);
  const [desktopApi, setDesktopApi] = useState(null);

  // ==========================================================
  // Combine attachments + links
  // ==========================================================

  const items = [
    ...attachments.map((attachment, index) => ({
      type: "attachment",
      data: attachment,
      originalIndex: index,
    })),

    ...links.map((link, index) => ({
      type: "link",
      data: link,
      originalIndex: index,
    })),
  ];

  // ==========================================================
  // Keyboard navigation
  // ==========================================================

  useEffect(() => {
    if (!desktopApi) return;

    function handleKeyDown(event) {
      const target = event.target;

      // Don't interfere with typing.
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable
      ) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        desktopApi.scrollPrev();
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        desktopApi.scrollNext();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [desktopApi]);

  if (!items.length) return null;

  // ==========================================================
  // Render item
  // ==========================================================

  const renderItem = (item, key, index) => {
    // --------------------------------------------------------
    // Link
    // --------------------------------------------------------

    if (item.type === "link") {
      return (
        <LinkCard
          key={key}
          link={item.data}
          size={size === "sm" ? "sm" : "default"}
        />
      );
    }

    // --------------------------------------------------------
    // Attachment
    // --------------------------------------------------------

    return (
      <AttachmentCard
        key={key}
        attachment={item.data}
        index={item.originalIndex}
        onClick={onAttachmentClick}
        onRemove={onRemove}
        removable={removable}
        showMetadata={showMetadata}
        onCreditNameChange={onCreditNameChange}
        hovered={hovered}
        setHovered={setHovered}
        size={size}
      />
    );
  };

  // ==========================================================
  // Mobile
  // ==========================================================

  const mobileItems = items;

  return (
    <>
      {/* ======================================================
          MOBILE
          ====================================================== */}

      <div className="md:hidden">
        {/* ====================================================
            1 ITEM
            ==================================================== */}

        {mobileItems.length === 1 && (
          <div>
            {renderItem(mobileItems[0], mobileItems[0].data.id ?? "0", 0)}
          </div>
        )}

        {/* ====================================================
            2 ITEMS
            ==================================================== */}

        {mobileItems.length === 2 && (
          <div className="grid grid-cols-2 gap-1">
            {mobileItems.map((item, index) =>
              renderItem(item, `${item.type}-${item.data.id ?? index}`, index),
            )}
          </div>
        )}

        {/* ====================================================
            3+ ITEMS
            ==================================================== */}

        {mobileItems.length >= 3 && (
          <Carousel
            opts={{
              align: "start",
              containScroll: "trimSnaps",
            }}
            className="w-full"
          >
            <CarouselContent>
              {Array.from({
                length: Math.ceil(mobileItems.length / 2),
              }).map((_, columnIndex) => (
                <CarouselItem key={columnIndex} className="basis-1/2">
                  <div className="flex flex-col gap-1">
                    {[0, 1].map((row) => {
                      const actualIndex = columnIndex * 2 + row;

                      const item = mobileItems[actualIndex];

                      // Empty second slot.
                      if (!item) {
                        return (
                          <div
                            key={row}
                            className={
                              size === "sm" ? "aspect-[4/3]" : "aspect-square"
                            }
                          />
                        );
                      }

                      return renderItem(
                        item,
                        `${item.type}-${item.data.id ?? actualIndex}`,
                        actualIndex,
                      );
                    })}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        )}
      </div>

      {/* ======================================================
          DESKTOP
          ====================================================== */}

      <div className="relative hidden md:block">
        <Carousel
          setApi={setDesktopApi}
          opts={{
            align: "start",
            containScroll: "trimSnaps",
            dragFree: false,
          }}
          className="relative w-full"
        >
          <CarouselContent className="py-2">
            {items.map((item, index) => (
              <CarouselItem
                key={`${item.type}-${item.data.id ?? index}`}
                className="basis-[260px] lg:basis-[280px]"
              >
                {renderItem(
                  item,
                  `${item.type}-${item.data.id ?? index}`,
                  index,
                )}
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Previous */}

          <CarouselPrevious className="absolute left-2 top-1/2 z-20 hidden -translate-y-1/2 lg:flex" />

          {/* Next */}

          <CarouselNext className="absolute right-2 top-1/2 z-20 hidden -translate-y-1/2 lg:flex" />
        </Carousel>
      </div>
    </>
  );
}
