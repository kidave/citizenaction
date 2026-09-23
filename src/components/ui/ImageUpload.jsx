import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";

function fileExtension(file) {
  const fromName = file?.name?.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName)) return fromName;

  const mime = file?.type?.split("/")[1]?.toLowerCase();
  return mime || "png";
}

function withCacheBust(url) {
  if (!url) return null;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${Date.now()}`;
}

function storagePathFromPublicUrl(url) {
  if (!url) return null;
  const marker = "/storage/v1/object/public/";
  const index = url.indexOf(marker);
  if (index === -1) return null;
  const remainder = url.slice(index + marker.length);
  const slash = remainder.indexOf("/");
  if (slash === -1) return null;
  return {
    bucket: remainder.slice(0, slash),
    path: decodeURIComponent(remainder.slice(slash + 1).split("?")[0]),
  };
}

export default function ImageUpload({
  bucket,
  path,
  value = null,
  onChange,
  label = "Upload image",
  helperText = "PNG, JPG or WebP",
  accept = "image/png,image/jpeg,image/webp",
  disabled = false,
  className = "",
}) {
  const inputRef = useRef(null);
  const objectUrlRef = useRef(null);
  const previousStoragePathRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(withCacheBust(value));
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setPreviewUrl(withCacheBust(value));
    previousStoragePathRef.current = storagePathFromPublicUrl(value);
  }, [value]);

  useEffect(() => () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
  }, []);

  async function handleFile(file) {
    if (!file) return;

    if (!file.type?.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be 5 MB or smaller.");
      return;
    }

    if (!bucket || !path) {
      setError("Image upload is not configured.");
      return;
    }

    setError("");
    setUploading(true);

    const previousValue = value || null;
    const previousStoragePath = storagePathFromPublicUrl(previousValue);
    const localPreview = URL.createObjectURL(file);
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = localPreview;
    setPreviewUrl(localPreview);

    try {
      const extension = fileExtension(file);
      const storagePath = `${path.replace(/^\/+|\/+$/g, "")}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(storagePath, file, {
          upsert: true,
          cacheControl: "3600",
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
      const publicUrl = data?.publicUrl || null;

      if (!publicUrl) {
        throw new Error("Image uploaded, but no public URL was returned.");
      }

      const freshPublicUrl = withCacheBust(publicUrl);

      if (onChange) {
        await onChange(freshPublicUrl, storagePath);
      }

      // Remove the old object when the extension changed (for example logo.jpg -> logo.png).
      if (previousStoragePath?.bucket === bucket && previousStoragePath.path !== storagePath) {
        const { error: removeError } = await supabase.storage
          .from(bucket)
          .remove([previousStoragePath.path]);
        if (removeError) {
          console.warn("Unable to remove previous image:", removeError);
        }
      }

      previousStoragePathRef.current = { bucket, path: storagePath };
      setPreviewUrl(freshPublicUrl);
    } catch (uploadError) {
      setPreviewUrl(previousValue ? withCacheBust(previousValue) : null);
      setError(uploadError?.message || "Unable to upload image.");
    } finally {
      setUploading(false);
    }
  }

  async function clear() {
    setError("");
    setUploading(true);

    try {
      const currentStoragePath = storagePathFromPublicUrl(value);

      if (currentStoragePath?.bucket === bucket && currentStoragePath.path) {
        const { error: removeError } = await supabase.storage
          .from(bucket)
          .remove([currentStoragePath.path]);
        if (removeError) throw removeError;
      }

      if (onChange) {
        await onChange(null, null);
      }
      setPreviewUrl(null);
      previousStoragePathRef.current = null;
      if (inputRef.current) inputRef.current.value = "";
    } catch (clearError) {
      setError(clearError?.message || "Unable to remove image.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={className}>
      <div className="flex items-start gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted/30">
          {previewUrl ? (
            <img key={previewUrl} src={previewUrl} alt="Preview" className="h-full w-full object-contain" />
          ) : (
            <ImagePlus className="h-7 w-7 text-muted-foreground" />
          )}
        </div>

        <div className="min-w-0 space-y-2">
          <div>
            <div className="text-sm font-medium">{label}</div>
            <div className="text-xs text-muted-foreground">{helperText}</div>
          </div>

          <div className="flex flex-wrap gap-2">
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              className="hidden"
              disabled={disabled || uploading}
              onChange={(event) => handleFile(event.target.files?.[0])}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-2 h-4 w-4" />}
              {uploading ? "Uploading..." : previewUrl ? "Change" : "Upload"}
            </Button>

            {previewUrl && !uploading && (
              <Button type="button" variant="ghost" size="sm" onClick={clear} disabled={disabled}>
                <X className="mr-2 h-4 w-4" />
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>

      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </div>
  );
}
