"use client";

import { useMemo, useState } from "react";

import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";

import "yet-another-react-lightbox/styles.css";

import AttachmentCarousel from "@/components/attachment/AttachmentCarousel";

function normalizeAttachment(attachment) {
  if (!attachment) return null;

  const publicUrl =
    attachment.public_url ||
    attachment.publicUrl ||
    attachment.url ||
    attachment.preview_url ||
    null;

  const mimeType = attachment.mime_type || attachment.type || "";

  return {
    ...attachment,
    public_url: publicUrl,
    mime_type: mimeType,
  };
}

export default function PostAttachments({ attachments = [], links = [] }) {
  const [openImages, setOpenImages] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  const normalizedAttachments = useMemo(
    () => attachments.map(normalizeAttachment).filter(Boolean),
    [attachments],
  );

  const images = useMemo(() => {
    return normalizedAttachments.filter((attachment) =>
      attachment?.mime_type?.startsWith("image/"),
    );
  }, [normalizedAttachments]);

  const imageSlides = useMemo(() => {
    return images
      .filter((image) => image.public_url)
      .map((image) => ({
        src: image.public_url,
        alt: image.file_name || "",
        width: image.width || undefined,
        height: image.height || undefined,
      }));
  }, [images]);

  if (!normalizedAttachments.length && !links.length) {
    return null;
  }

  const handleAttachmentClick = (index) => {
    const attachment = normalizedAttachments[index];

    if (!attachment?.public_url) return;

    const mime = attachment.mime_type || "";
    const extension = attachment.file_name?.split(".").pop()?.toLowerCase();

    const isImage = mime.startsWith("image/");
    const isPdf = mime === "application/pdf" || extension === "pdf";

    if (isImage) {
      const imageIndex = images.findIndex(
        (image) => image.public_url === attachment.public_url,
      );

      setStartIndex(imageIndex >= 0 ? imageIndex : 0);
      setOpenImages(true);
      return;
    }

    if (isPdf) {
      window.open(attachment.public_url, "_blank", "noopener,noreferrer");

      return;
    }

    // Other file types can also be opened directly.
    window.open(attachment.public_url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <AttachmentCarousel
        attachments={normalizedAttachments}
        links={links}
        showMetadata={false}
        onAttachmentClick={handleAttachmentClick}
      />

      <Lightbox
        open={openImages}
        close={() => setOpenImages(false)}
        index={startIndex}
        slides={imageSlides}
        plugins={[Zoom]}
        carousel={{ finite: true }}
        render={{
          buttonPrev: imageSlides.length > 1 ? undefined : () => null,
          buttonNext: imageSlides.length > 1 ? undefined : () => null,
        }}
      />
    </>
  );
}
