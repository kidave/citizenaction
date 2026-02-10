"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea"; // Added Shadcn Textarea
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { useCreatePost } from "@/hooks/useCreatePost";
import AttachmentPicker from "./AttachmentPicker";
import { toast } from "sonner"; // Assuming you have sonner for notifications

export default function CreatePost() {
  const { user } = useAuth();
  const { createPost } = useCreatePost();

  const [category, setCategory] = useState("observation");
  const [content, setContent] = useState(""); // Simple state for textarea
  const [attachments, setAttachments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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
        // Assuming these are placeholders or need to be dynamic based on your app
        geo_scope_type: "country",
        geo_scope_code: "IN",
        action_category: category,
        summary: content.slice(0, 200), // First 200 chars for summary
        details: content, // Full text for details
        attachments,
      });

      // Clear form on success
      setContent("");
      setAttachments([]);
      setCategory("observation");
      toast.success("Post created successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create post.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="p-4 space-y-4">
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger>
          <SelectValue placeholder="Select Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="complaint">Complaint</SelectItem>
          <SelectItem value="meeting">Meeting</SelectItem>
          <SelectItem value="event">Event</SelectItem>
          <SelectItem value="media">Media</SelectItem>
          <SelectItem value="observation">Observation</SelectItem>
          <SelectItem value="requirement">Requirement</SelectItem>
        </SelectContent>
      </Select>

      {/* SIMPLE TEXTAREA INSTEAD OF EDITOR.JS */}
      <Textarea
        placeholder="Share what happened…"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[120px]"
      />

      <AttachmentPicker
        onUpload={(file) =>
          setAttachments((prev) => [...prev, file])
        }
      />

      <Button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? "Posting..." : "Post"}
      </Button>
    </Card>
  );
}