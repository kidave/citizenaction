import { supabase } from "./client";

const POST_BUCKET = "post";
const CONTRIBUTION_BUCKET = "contribution";

function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function makeFileName(originalName) {
  const safeName = sanitizeFileName(originalName || "file");
  const unique = crypto.randomUUID();
  return `${unique}-${safeName}`;
}

async function uploadToBucket({ bucket, folderId, file }) {
  if (!file) throw new Error("Missing file for upload");
  if (!folderId) throw new Error("Missing folderId for attachment upload");

  const fileName = makeFileName(file.name);
  const path = `${folderId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      upsert: false,
      cacheControl: "3600",
      contentType: file.type || "application/octet-stream",
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  return {
    storage_path: path,
    public_url: data.publicUrl,
    file_name: file.name,
    mime_type: file.type,
    file_size: file.size,
    width: null,
    height: null,
    duration: null,
    sort_order: null,
  };
}

export async function uploadPostAttachment(postId, file) {
  return uploadToBucket({
    bucket: POST_BUCKET,
    folderId: postId,
    file,
  });
}

export async function uploadContributionAttachment(contributionId, file) {
  return uploadToBucket({
    bucket: CONTRIBUTION_BUCKET,
    folderId: contributionId,
    file,
  });
}

export async function uploadPostAttachments(postId, attachments = []) {
  if (!Array.isArray(attachments) || attachments.length === 0) return [];
  return Promise.all(
    attachments.map((attachment) =>
      uploadPostAttachment(postId, attachment?.file ?? attachment),
    ),
  );
}

export async function uploadContributionAttachments(
  contributionId,
  attachments = [],
) {
  if (!Array.isArray(attachments) || attachments.length === 0) return [];
  return Promise.all(
    attachments.map((attachment) =>
      uploadContributionAttachment(
        contributionId,
        attachment?.file ?? attachment,
      ),
    ),
  );
}

export async function deletePostAttachments(paths = []) {
  const validPaths = paths.filter(Boolean);
  if (!validPaths.length) return true;

  const { error } = await supabase.storage.from(POST_BUCKET).remove(validPaths);
  if (error) throw error;

  return true;
}

export async function deleteContributionAttachments(paths = []) {
  const validPaths = paths.filter(Boolean);
  if (!validPaths.length) return true;

  const { error } = await supabase.storage
    .from(CONTRIBUTION_BUCKET)
    .remove(validPaths);

  if (error) throw error;

  return true;
}

export function getAttachmentPaths(attachments = []) {
  return attachments.map((attachment) => attachment?.path).filter(Boolean);
}

export function getFileCategory(mimeType) {
  if (mimeType?.startsWith("image/")) return "image";
  if (mimeType?.startsWith("video/")) return "video";
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType?.includes("word")) return "document";
  if (mimeType?.includes("spreadsheet") || mimeType?.includes("excel"))
    return "spreadsheet";
  if (mimeType?.includes("presentation") || mimeType?.includes("powerpoint"))
    return "presentation";
  if (mimeType?.startsWith("text/")) return "text";
  if (mimeType?.includes("zip") || mimeType?.includes("rar")) return "archive";
  return "file";
}
