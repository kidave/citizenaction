"use client";

import { useState } from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import AttachmentCard from "./AttachmentCard";

export default function AttachmentCarousel({
  attachments = [],
  onAttachmentClick,
}) {
  const [hovered, setHovered] = useState(null);

  if (!attachments.length) return null;

  // Group attachments into pages of 4
  const mobilePages = [];
  for (let i = 0; i < attachments.length; i += 4) {
    mobilePages.push(attachments.slice(i, i + 4));
  }

  return (
    <>
      {/* ==========================
          MOBILE
      ========================== */}

      <div className="md:hidden">
        <Carousel
          opts={{
            align: "start",
            containScroll: "trimSnaps",
          }}
        >
          <CarouselContent>
            {mobilePages.map((page, pageIndex) => (
              <CarouselItem key={pageIndex}>
                <div className="grid grid-cols-2 gap-1">
                  {page.map((attachment, index) => {
                    const actualIndex = pageIndex * 4 + index;

                    return (
                      <AttachmentCard
                        key={attachment.url ?? actualIndex}
                        attachment={attachment}
                        index={actualIndex}
                        onClick={onAttachmentClick}
                        hovered={null}
                        setHovered={() => {}}
                      />
                    );
                  })}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* ==========================
          DESKTOP
      ========================== */}

      <div className="relative hidden md:block md:px-8">
        <Carousel
          opts={{
            align: "start",
            containScroll: "trimSnaps",
            dragFree: false,
          }}
          className="w-full"
        >
          <CarouselContent className="py-2">
            {attachments.map((attachment, index) => (
              <CarouselItem
                key={attachment.url ?? index}
                className="basis-[50%] pl-6 pr-2 md:basis-[260px] lg:basis-[280px]"
              >
                <AttachmentCard
                  attachment={attachment}
                  index={index}
                  onClick={onAttachmentClick}
                  hovered={hovered}
                  setHovered={setHovered}
                />
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious className="-left-8 hidden lg:flex" />
          <CarouselNext className="-right-8 hidden lg:flex" />
        </Carousel>
      </div>
    </>
  );
}
