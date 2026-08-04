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
  onRemove,
  onCreditNameChange,
  removable = false,
  showMetadata = true,
}) {
  const [hovered, setHovered] = useState(null);

  if (!attachments.length) return null;

  const mobilePages = [];

  for (let i = 0; i < attachments.length; i += 4) {
    mobilePages.push(attachments.slice(i, i + 4));
  }

  return (
    <>
      {/* Mobile */}
      <div className="md:hidden">
        {/* 1 image */}
        {attachments.length === 1 && (
          <AttachmentCard
            attachment={attachments[0]}
            index={0}
            onClick={onAttachmentClick}
            onRemove={onRemove}
            removable={removable}
            showMetadata={showMetadata}
            hovered={null}
            setHovered={() => {}}
          />
        )}

        {/* 2 images */}
        {attachments.length === 2 && (
          <div className="grid grid-cols-2 gap-1">
            {attachments.map((attachment, index) => (
              <AttachmentCard
                key={attachment.url ?? index}
                attachment={attachment}
                index={index}
                onClick={onAttachmentClick}
                onRemove={onRemove}
                removable={removable}
                showMetadata={showMetadata}
                hovered={null}
                setHovered={() => {}}
              />
            ))}
          </div>
        )}

        {/* 3+ images */}
        {attachments.length >= 3 && (
          <Carousel
            opts={{
              align: "start",
              containScroll: "trimSnaps",
            }}
          >
            <CarouselContent>
              {Array.from({
                length: Math.ceil(attachments.length / 2),
              }).map((_, columnIndex) => (
                <CarouselItem key={columnIndex} className="basis-1/2 pl-1">
                  <div className="flex flex-col gap-1">
                    {[0, 1].map((row) => {
                      const actualIndex = columnIndex * 2 + row;
                      const attachment = attachments[actualIndex];

                      if (!attachment) {
                        return <div key={row} className="aspect-square" />;
                      }

                      return (
                        <AttachmentCard
                          key={attachment.url ?? actualIndex}
                          attachment={attachment}
                          index={actualIndex}
                          onClick={onAttachmentClick}
                          onRemove={onRemove}
                          removable={removable}
                          showMetadata={showMetadata}
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
        )}
      </div>

      {/* Desktop */}

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
                  onRemove={onRemove}
                  removable={removable}
                  showMetadata={showMetadata}
                  onCreditNameChange={onCreditNameChange}
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
