export function createPreview(file) {
  if (file.type.startsWith("image/")) {
    return URL.createObjectURL(file);
  }

  return null;
}
