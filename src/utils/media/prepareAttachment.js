import { compressImage } from "./compressImage";

export async function prepareAttachment(file) {
  if (!file) {
    return file;
  }

  if (file.type?.startsWith("image/")) {
    return compressImage(file);
  }

  // PDFs are intentionally left untouched for now.
  if (file.type === "application/pdf") {
    return file;
  }

  return file;
}
