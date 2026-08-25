import { supabase } from "./client";

const BUCKETS = {
  POST: "post",
  CONTRIBUTION: "contribution",
};

function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function makeFileName(originalName) {
  const safeName = sanitizeFileName(originalName || "file");

  return `${crypto.randomUUID()}-${safeName}`;
}

function buildImageTransformUrl(publicUrl, { width, quality = 75 } = {}) {
  if (!publicUrl || !width) {
    return publicUrl;
  }

  try {
    const url = new URL(publicUrl);

    const marker = "/storage/v1/object/public/";
    const markerIndex = url.pathname.indexOf(marker);

    if (markerIndex === -1) {
      return publicUrl;
    }

    url.pathname = url.pathname.replace(
      marker,
      "/storage/v1/render/image/public/",
    );

    url.searchParams.set("width", String(width));
    url.searchParams.set("quality", String(quality));

    return url.toString();
  } catch {
    return publicUrl;
  }
}

async function uploadAttachment({
  bucket,
  ownerId,
  file,
  attachmentId = null,
}) {
  if (!bucket) {
    throw new Error("Missing bucket");
  }

  if (!ownerId) {
    throw new Error("Missing ownerId");
  }

  if (!file) {
    throw new Error("Missing file");
  }

  const fileName = makeFileName(file.name);
  const storagePath = `${ownerId}/${fileName}`;

  const { error } = await supabase.storage.from(bucket).upload(
    storagePath,
    file,
    {
      upsert: false,
      cacheControl: "31536000",
      contentType: file.type || "application/octet-stream",
    },
  );

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);

  const publicUrl = data.publicUrl;
  const isImage = file.type?.startsWith("image/");

  return {
    attachmentId,

    storage_path: storagePath,

    public_url: publicUrl,

    preview_url: isImage
      ? buildImageTransformUrl(publicUrl, { width: 1600, quality: 80 })
      : publicUrl,

    file_name: file.name,

    mime_type: file.type,

    file_size: file.size,

    width: null,

    height: null,

    duration: null,

    sort_order: null,
  };
}

async function uploadAttachments({ bucket, ownerId, attachments = [] }) {
  if (!Array.isArray(attachments) || attachments.length === 0) {
    return [];
  }

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
  return uploadAttachments({
    bucket: BUCKETS.POST,
    ownerId: postId,
    attachments,
  });
}

export function uploadContributionAttachments(contributionId, attachments) {
  return uploadAttachments({
    bucket: BUCKETS.CONTRIBUTION,
    ownerId: contributionId,
    attachments,
  });
}

export async function deleteAttachments(bucket, paths = []) {
  const validPaths = paths.filter(Boolean);

  if (!validPaths.length) {
    return;
  }

  const { error } = await supabase.storage.from(bucket).remove(validPaths);

  if (error) {
    throw error;
  }
}

export async function deletePostAttachmentsByPostId(postId) {
  if (!postId) {
    throw new Error("Missing postId");
  }

  const { data, error } = await supabase
    .from("attachment")
    .select("storage_path")
    .eq("post_id", postId);

  if (error) {
    throw error;
  }

  const paths = getAttachmentPaths(data);

  if (!paths.length) {
    return;
  }

  await deletePostAttachments(paths);
}

export async function deleteContributionAttachmentsByContributionId(
  contributionId,
) {
  if (!contributionId) {
    throw new Error("Missing contributionId");
  }

  const { data, error } = await supabase
    .from("attachment")
    .select("storage_path")
    .eq("contribution_id", contributionId);

  if (error) {
    throw error;
  }

  const paths = getAttachmentPaths(data);

  if (!paths.length) {
    return;
  }

  await deleteContributionAttachments(paths);
}

export function deletePostAttachments(paths) {
  return deleteAttachments(BUCKETS.POST, paths);
}

export function deleteContributionAttachments(paths) {
  return deleteAttachments(BUCKETS.CONTRIBUTION, paths);
}

export function getAttachmentPaths(attachments = []) {
  return attachments
    .map((attachment) => attachment.storage_path)
    .filter(Boolean);
}

export function getFileCategory(mimeType) {
  if (mimeType?.startsWith("image/")) {
    return "image";
  }

  if (mimeType?.startsWith("video/")) {
    return "video";
  }

  if (mimeType === "application/pdf") {
    return "pdf";
  }

  if (mimeType?.includes("word")) {
    return "document";
  }

  if (mimeType?.includes("spreadsheet")) {
    return "spreadsheet";
  }

  if (mimeType?.includes("excel")) {
    return "spreadsheet";
  }

  if (mimeType?.includes("presentation")) {
    return "presentation";
  }

  if (mimeType?.includes("powerpoint")) {
    return "presentation";
  }

  if (mimeType?.startsWith("text/")) {
    return "text";
  }

  if (mimeType?.includes("zip")) {
    return "archive";
  }

  if (mimeType?.includes("rar")) {
    return "archive";
  }

  return "file";
}
