import { supabase } from "./client";
import { prepareAttachment } from "@/utils/media/prepareAttachment";
import { getPdfThumbnail } from "@/utils/media/pdfThumbnail";

const BUCKETS = { POST: "post", CONTRIBUTION: "contribution" };

function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function makeFileName(originalName) {
  return `${crypto.randomUUID()}-${sanitizeFileName(originalName || "file")}`;
}

function buildImageTransformUrl(publicUrl, { width, quality = 75 } = {}) {
  if (!publicUrl || !width) return publicUrl;
  try {
    const url = new URL(publicUrl);
    const marker = "/storage/v1/object/public/";
    if (!url.pathname.includes(marker)) return publicUrl;
    url.pathname = url.pathname.replace(marker, "/storage/v1/render/image/public/");
    url.searchParams.set("width", String(width));
    url.searchParams.set("quality", String(quality));
    return url.toString();
  } catch {
    return publicUrl;
  }
}

async function uploadFile(bucket, path, file) {
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: false,
    cacheControl: "31536000",
    contentType: file.type || "application/octet-stream",
  });
  if (error) throw error;

  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

async function uploadAttachment({ bucket, ownerId, file, attachmentId = null }) {
  if (!bucket) throw new Error("Missing bucket");
  if (!ownerId) throw new Error("Missing ownerId");
  if (!file) throw new Error("Missing file");

  const preparedFile = await prepareAttachment(file);
  const fileName = makeFileName(preparedFile.name);
  const storagePath = `${ownerId}/${fileName}`;
  const publicUrl = await uploadFile(bucket, storagePath, preparedFile);
  const isImage = preparedFile.type?.startsWith("image/");

  let thumbnailPath = null;
  let thumbnailUrl = null;

  if (preparedFile.type === "application/pdf" && typeof window !== "undefined") {
    try {
      const thumbnail = await getPdfThumbnail(preparedFile);
      if (thumbnail) {
        const thumbnailName = `${crypto.randomUUID()}-${sanitizeFileName(thumbnail.name)}`;
        thumbnailPath = `${ownerId}/thumbnails/${thumbnailName}`;
        thumbnailUrl = await uploadFile(bucket, thumbnailPath, thumbnail);
      }
    } catch (error) {
      console.warn("PDF thumbnail generation failed; keeping original PDF", error);
    }
  }

  return {
    attachmentId,
    storage_path: storagePath,
    public_url: publicUrl,
    preview_url: isImage
      ? buildImageTransformUrl(publicUrl, { width: 1600, quality: 80 })
      : thumbnailUrl || publicUrl,
    thumbnail_path: thumbnailPath,
    thumbnail_url: thumbnailUrl,
    file_name: preparedFile.name,
    mime_type: preparedFile.type,
    file_size: preparedFile.size,
    width: null,
    height: null,
    duration: null,
    sort_order: null,
  };
}

async function uploadAttachments({ bucket, ownerId, attachments = [] }) {
  if (!Array.isArray(attachments) || attachments.length === 0) return [];
  return Promise.all(
    attachments.map((attachment) =>
      uploadAttachment({
        bucket,
        ownerId,
        file: attachment.file ?? attachment,
        attachmentId: attachment.attachmentId ?? null,
      }),
    ),
  );
}

export function uploadPostAttachments(postId, attachments) {
  return uploadAttachments({ bucket: BUCKETS.POST, ownerId: postId, attachments });
}

export function uploadContributionAttachments(contributionId, attachments) {
  return uploadAttachments({ bucket: BUCKETS.CONTRIBUTION, ownerId: contributionId, attachments });
}

export async function deleteAttachments(bucket, attachments = []) {
  const values = Array.isArray(attachments) ? attachments : [];
  const paths = values
    .map((item) => typeof item === "string" ? item : item?.storage_path)
    .filter(Boolean);
  const thumbnailPaths = values
    .map((item) => typeof item === "string" ? null : item?.thumbnail_path)
    .filter(Boolean);
  const allPaths = [...new Set([...paths, ...thumbnailPaths])];
  if (!allPaths.length) return;
  const { error } = await supabase.storage.from(bucket).remove(allPaths);
  if (error) throw error;
}

async function getAttachmentsForOwner(column, id) {
  const { data, error } = await supabase
    .from("attachment")
    .select("storage_path, thumbnail_path")
    .eq(column, id);
  if (error) throw error;
  return data || [];
}

export async function deletePostAttachmentsByPostId(postId) {
  if (!postId) throw new Error("Missing postId");
  const attachments = await getAttachmentsForOwner("post_id", postId);
  if (attachments.length) await deletePostAttachments(attachments);
}

export async function deleteContributionAttachmentsByContributionId(contributionId) {
  if (!contributionId) throw new Error("Missing contributionId");
  const attachments = await getAttachmentsForOwner("contribution_id", contributionId);
  if (attachments.length) await deleteContributionAttachments(attachments);
}

export function deletePostAttachments(paths) {
  return deleteAttachments(BUCKETS.POST, paths);
}

export function deleteContributionAttachments(paths) {
  return deleteAttachments(BUCKETS.CONTRIBUTION, paths);
}

export function getAttachmentPaths(attachments = []) {
  return attachments.map((attachment) => attachment.storage_path).filter(Boolean);
}

export function getFileCategory(mimeType) {
  if (mimeType?.startsWith("image/")) return "image";
  if (mimeType?.startsWith("video/")) return "video";
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType?.includes("word")) return "document";
  if (mimeType?.includes("spreadsheet") || mimeType?.includes("excel")) return "spreadsheet";
  if (mimeType?.includes("presentation") || mimeType?.includes("powerpoint")) return "presentation";
  if (mimeType?.startsWith("text/")) return "text";
  if (mimeType?.includes("zip") || mimeType?.includes("rar")) return "archive";
  return "file";
}
