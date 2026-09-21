"use client";

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

  if (!items.length) return null;

  return (
    <div className="w-full min-w-0 overflow-hidden">
      <div className="flex w-max min-w-full gap-2 overflow-x-auto px-1 py-1 pb-2 [scrollbar-width:thin]">
        {items.map((item, index) => {
          const key = `${item.type}-${item.data.id ?? index}`;

          if (item.type === "link") {
            return (
              <div key={key} className="w-[180px] shrink-0 sm:w-[200px]">
                <LinkCard
                  link={item.data}
                  size={size === "sm" || size === "compact" ? "sm" : "default"}
                />
              </div>
            );
          }

          return (
            <div key={key} className="w-[180px] shrink-0 sm:w-[200px]">
              <AttachmentCard
                attachment={item.data}
                index={item.originalIndex}
                onClick={onAttachmentClick}
                onRemove={onRemove}
                removable={removable}
                showMetadata={showMetadata}
                onCreditNameChange={onCreditNameChange}
                size={size}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
