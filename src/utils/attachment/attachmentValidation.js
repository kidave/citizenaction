export function validateAttachments(files, options) {
  const { maxFiles, maxFileSize, allowedTypes } = options;

  if (files.length > maxFiles) {
    throw new Error(`Maximum ${maxFiles} files allowed.`);
  }

  for (const file of files) {
    if (file.size > maxFileSize) {
      throw new Error(`${file.name} exceeds the maximum size.`);
    }

    const valid = allowedTypes.some((type) => {
      if (type.endsWith("/*")) {
        return file.type.startsWith(type.replace("/*", "/"));
      }

      return file.type === type;
    });

    if (!valid) {
      throw new Error(`${file.name} is not supported.`);
    }
  }
}
