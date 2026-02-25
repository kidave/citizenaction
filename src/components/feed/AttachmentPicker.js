"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, FileText, File, Paperclip, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB per file
const MAX_TOTAL_SIZE = 5 * 1024 * 1024; // 5MB total
const MAX_IMAGES = 4; // Max 4 images
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp','image/avif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

export default function AttachmentPicker({ attachments = [], onUpload, onRemove }) {
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    
    // Count images in current attachments
    const currentImageCount = attachments.filter(f => f.type?.startsWith('image/')).length;
    
    // Validate files
    const validFiles = [];
    let totalSize = attachments.reduce((sum, f) => sum + (f.size || 0), 0);
    
    for (const file of files) {
      // Check image limit
      if (file.type?.startsWith('image/')) {
        if (currentImageCount + validFiles.filter(f => f.type?.startsWith('image/')).length >= MAX_IMAGES) {
          toast.error(`Maximum ${MAX_IMAGES} images allowed`);
          continue;
        }
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is too large (max 1MB)`);
        continue;
      }

      // Check total size
      if (totalSize + file.size > MAX_TOTAL_SIZE) {
        toast.error(`Total attachments size exceeds 5MB limit`);
        continue;
      }

      // Check file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name} type not supported`);
        continue;
      }

      validFiles.push(file);
      totalSize += file.size;
    }

    if (validFiles.length === 0) return;

    setUploading(true);
    
    // Log files being added
    console.log("📎 Adding files:", validFiles.map(f => ({
      name: f.name,
      type: f.type,
      size: `${(f.size / 1024).toFixed(2)}KB`
    })));
    
    // Pass files to parent
    validFiles.forEach(file => onUpload(file));
    
    setUploading(false);
    toast.success(`${validFiles.length} file(s) added`);
    
    // Clear input
    e.target.value = '';
  };

  const getFilePreview = (file) => {
    if (!file?.type?.startsWith("image/")) return null;

    // 🟢 New uploaded file (real File)
    const isRealFile =
      typeof window !== "undefined" &&
      typeof file === "object" &&
      file !== null &&
      typeof file.name === "string" &&
      typeof file.size === "number" &&
      typeof file.type === "string" &&
      typeof file.arrayBuffer === "function";

    if (isRealFile) {
      try {
        return URL.createObjectURL(file);
      } catch (error) {
        console.error("Preview error:", error);
        return null;
      }
    }

    // 🔵 Existing uploaded file from DB
    if (file.url) {
      return file.url;
    }

    return null;
  };

  const getFileIcon = (file) => {
    if (file.type?.startsWith('image/')) {
      return <ImageIcon className="h-5 w-5 text-blue-600" />;
    }
    if (file.type === 'application/pdf') {
      return <FileText className="h-5 w-5 text-red-600" />;
    }
    return <File className="h-5 w-5 text-gray-600" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full sm:w-auto justify-center sm:justify-start"
          onClick={() =>
            document.getElementById("post-attachment-upload")?.click()
          }
          disabled={uploading}
        >
          {uploading ? (
            <>
              <svg className="h-4 w-4 mr-2 animate-spin" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing...
            </>
          ) : (
            <>
              <Paperclip className="h-4 w-4 mr-2" />
              Add Attachments
            </>
          )}
        </Button>

        <input
          id="post-attachment-upload"
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*, application/*,.pdf,.doc,.docx,.txt"
        />

        <span className="text-xs text-muted-foreground text-center sm:text-left">
          Images (max {MAX_IMAGES}), PDF, Docs (max 1MB each, 5MB total)
        </span>

      </div>

      {/* Attachment Grid */}
      {attachments.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">Attachments ({attachments.length})</h4>
            <span className="text-xs text-muted-foreground">
              {formatFileSize(attachments.reduce((sum, f) => sum + (f.size || 0), 0))} total
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {attachments.map((file, index) => {
              const isImage = file.type?.startsWith('image/');
              const preview = getFilePreview(file);
              
              return (
                <Card key={index} className="relative group overflow-hidden">
                  {/* Preview */}
                  <div className="aspect-square bg-muted">
                    {isImage && preview ? (
                      <div className="relative w-full h-full">
                        <img
                          src={preview}
                          alt={file.name}
                          fill
                          className="w-full h-full object-cover"
                          onLoad={() => {
                            console.log("🖼️ Image loaded:", file.name);
                            URL.revokeObjectURL(preview);
                          }}
                          onError={(e) => {
                            console.error("🖼️ Image failed to load:", file.name, e);
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4">
                        {getFileIcon(file)}
                        <p className="text-xs text-center mt-2 truncate w-full">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      console.log("🗑️ Removing attachment:", file.name);
                      onRemove(index);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>

                  {/* File name overlay for images */}
                  {isImage && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                      {file.name}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}