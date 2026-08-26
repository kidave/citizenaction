export async function compressImage(
  file,
  { maxWidth = 2400, maxHeight = 2400, quality = 0.82 } = {},
) {
  if (!file?.type?.startsWith("image/")) {
    return file;
  }

  // Do not modify SVG or GIF files.
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);

    const scale = Math.min(
      1,
      maxWidth / bitmap.width,
      maxHeight / bitmap.height,
    );

    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    /*
     * If the image is already reasonably small,
     * don't recompress it unnecessarily.
     */
    if (scale === 1 && file.size <= 1_500_000) {
      bitmap.close();
      return file;
    }

    const canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) {
      bitmap.close();
      return file;
    }

    context.drawImage(bitmap, 0, 0, width, height);

    bitmap.close();

    /*
     * JPEG is appropriate for photographs.
     * Preserve PNG for now because screenshots,
     * diagrams and transparent graphics can degrade
     * badly when converted to JPEG.
     */
    const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";

    const outputQuality = outputType === "image/png" ? undefined : quality;

    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, outputType, outputQuality);
    });

    if (!blob) {
      return file;
    }

    /*
     * If compression somehow made the file larger,
     * keep the original.
     */
    if (blob.size >= file.size) {
      return file;
    }

    const extension = outputType === "image/png" ? "png" : "jpg";

    const name = file.name.replace(/\.[^.]+$/, `.${extension}`);

    return new File([blob], name, {
      type: outputType,
      lastModified: Date.now(),
    });
  } catch (error) {
    console.warn("Image compression failed. Using original file.", error);

    return file;
  }
}
