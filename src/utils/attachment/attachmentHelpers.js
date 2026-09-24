import { Image as ImageIcon, FileText, File, Video, Music } from "lucide-react";

export function isImage(attachment) {
  return attachment?.isImage ?? attachment?.mimeType?.startsWith("image/");
}

export function isPdf(attachment) {
  return attachment?.isPdf ?? attachment?.mimeType === "application/pdf";
}

export function isVideo(attachment) {
  return attachment?.isVideo ?? attachment?.mimeType?.startsWith("video/");
}

export function isAudio(attachment) {
  return attachment?.isAudio ?? attachment?.mimeType?.startsWith("audio/");
}

export function getFileIcon(attachment) {
  if (isImage(attachment)) {
    return <ImageIcon className="h-5 w-5" />;
  }

  if (isPdf(attachment)) {
    return <FileText className="h-5 w-5" />;
  }

  if (isVideo(attachment)) {
    return <Video className="h-5 w-5" />;
  }

  if (isAudio(attachment)) {
    return <Music className="h-5 w-5" />;
  }

  return <File className="h-5 w-5" />;
}

export function getFileExtension(name) {
  if (!name) return "FILE";

  const extension = name.split(".").pop();

  return extension ? extension.toUpperCase() : "FILE";
}

export function formatFileSize(bytes) {
  if (!bytes) return "";

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
}
