"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { useMyProfile } from "@/hooks/useMyProfile";
import { useCreatePost } from "@/hooks/useCreatePost";
import { useFeed } from "@/hooks/useFeed";
import AttachmentPicker from "./AttachmentPicker";
import { toast } from "sonner";
import { X } from "lucide-react";
import Image from "next/image";

export default function CreatePostModal({
  isOpen,
  onClose,
  initialContent = "",
}) {
  const { user } = useAuth();
  const {
    data: profile,
    isLoading: profileLoading,
  } = useMyProfile();



  const { createPost } = useCreatePost();
  const { refetch } = useFeed();

  const [category, setCategory] = useState("action");
  const [content, setContent] = useState(initialContent);
  const [attachments, setAttachments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  /* ---------------- ESCAPE CLOSE ---------------- */

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  /* ---------------- SUBMIT ---------------- */

  async function handleSubmit() {
    if (!content.trim()) {
      toast.error("Please enter some content for your post.");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to post.");
      return;
    }

    setIsLoading(true);

    try {
      await createPost({
        author_id: user.id,
        scope_type: "country",
        scope_code: "IN",
        type: category,
        summary: content.slice(0, 200),
        details: content,
        attachments,
      });

      setContent("");
      setAttachments([]);
      onClose();

      await refetch();

      toast.success("Post published!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create post.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <>
      {/* BACKDROP */}
      <div
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in-0 zoom-in-95 duration-200">
          
          {/* USER INFO HEADER */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Image
                  src={
                    profile?.avatar_url || "/user1.png"
                  }
                  className="h-10 w-10 rounded-full"
                  width={40}
                  height={40}
                  alt="Your profile"
                />

                <div>
                  <div className="font-medium">
                    {profile?.name || "User"}
                  </div>

                  <Select
                    value={category}
                    onValueChange={setCategory}
                  >
                    <SelectTrigger className="h-8 w-auto border-none p-0 text-sm">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="action">
                        Action
                      </SelectItem>
                      <SelectItem value="report">
                        Report
                      </SelectItem>
                      <SelectItem value="meeting">
                        Meeting
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* CONTENT AREA */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              <Textarea
                placeholder="Document your action!"
                value={content}
                onChange={(e) =>
                  setContent(e.target.value)
                }
                className="min-h-[120px] border-none text-lg p-0 resize-none focus-visible:ring-0"
                autoFocus
              />

              <AttachmentPicker
                attachments={attachments}
                onUpload={(file) =>
                  setAttachments((prev) => [
                    ...prev,
                    file,
                  ])
                }
                onRemove={(index) =>
                  setAttachments((prev) =>
                    prev.filter((_, i) => i !== index)
                  )
                }
              />
            </div>
          </div>

          {/* FOOTER */}
          <div className="p-6 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Your post will be visible to the community
              </div>

              <Button
                onClick={handleSubmit}
                disabled={
                  isLoading ||
                  !content.trim() ||
                  profileLoading
                }
                className="px-8"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="h-4 w-4 mr-2 animate-spin"
                      viewBox="0 0 24 24"
                    >
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
                        d="M4 12a8 8 0 018-8V0C5.373 
                           0 0 5.373 0 12h4zm2 
                           5.291A7.962 7.962 
                           0 014 12H0c0 3.042 
                           1.135 5.824 3 
                           7.938l3-2.647z"
                      />
                    </svg>
                    Posting...
                  </>
                ) : (
                  "Post"
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
