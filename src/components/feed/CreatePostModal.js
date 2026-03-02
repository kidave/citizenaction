"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from "@/components/ui/avatar";
import AuthoritySearchModal from "@/components/governance/AuthoritySearchModal";
import FieldInfo from "@/components/ui/FieldInfo";

import { useAuth } from "@/context/AuthContext";
import { useMyProfile } from "@/hooks/useMyProfile";
import { useCreatePost } from "@/hooks/useCreatePost";
import { useFeed } from "@/hooks/useFeed";

import AttachmentPicker from "./AttachmentPicker";
import { toast } from "sonner";
import Image from "next/image";

export default function CreatePostModal({ isOpen, onClose, initialData = null }) {
  const { user } = useAuth();
  const { data: profile } = useMyProfile();
  const { createPost } = useCreatePost();
  const { refetch } = useFeed();

  const scopeType = "country";
  const scopeCode = "IN";

  const [type, setType] = useState(initialData?.type || "action");
  const [content, setContent] = useState(initialData?.details || "");
  const [attachments, setAttachments] = useState(initialData?.attachments || []);
  const [authorityOpen, setAuthorityOpen] = useState(false);
  const [selectedAuthorities, setSelectedAuthorities] = useState(initialData?.governance_entities || []);
  const [date, setDate] = useState(initialData?.metadata?.date || "");
  const [time, setTime] = useState(initialData?.metadata?.time || "");
  const [location, setLocation] = useState(initialData?.metadata?.location || "");
  const [status, setStatus] = useState(initialData?.status || "");
  
  if (!isOpen) return null;

  async function handleSubmit() {
    if (!content.trim()) {
      toast.error("Enter content.");
      return;
    }

    try {
      if (initialData) {
        /* ================= UPDATE FEED ================= */

        const { error: updateError } = await supabase
          .from("feed")
          .update({
            type,
            details: content,
            summary: content.slice(0, 200),
            attachments,
            status,
            metadata: {
              date,
              time,
              location,
            },
          })
          .eq("id", initialData.id);

        if (updateError) throw updateError;

        /* ================= REPLACE TAGS ================= */

        await supabase
          .from("feed_governance_entities")
          .delete()
          .eq("feed_id", initialData.id);

        if (selectedAuthorities.length > 0) {
          const relations = selectedAuthorities.map((e) => ({
            feed_id: initialData.id,
            governance_entity_id: e.id, // ← ONLY THIS NOW
          }));

          const { error: relationError } = await supabase
            .from("feed_governance_entities")
            .insert(relations);

          if (relationError) throw relationError;
        }

        toast.success("Post updated successfully");
      } else {
        /* ================= CREATE POST ================= */

        await createPost({
          author_id: user.id,
          scope_type: scopeType,
          scope_code: scopeCode,
          type,
          summary: content.slice(0, 200),
          details: content,
          attachments,
          governance_entities: selectedAuthorities,
          status,
          metadata: {
            date,
            time,
            location,
          },
        });

        toast.success("Post created successfully");
      }

      await refetch();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Something went wrong");
    }
  }

  async function handleDelete(id) {
    await supabase.from("feed").delete().eq("id", id);
    refetch();
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col">

          {/* HEADER */}
          <div className="border-b p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image
                  src={
                    profile?.avatar_url ||
                    "/user1.png"
                  }
                  width={32}
                  height={32}
                  className="rounded-full"
                  alt=""
                />
                <div className="text-sm font-medium">
                  {profile?.name}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmit}
                >
                  {initialData ? "Update" : "Post"}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    onClick={() => setAuthorityOpen(true)}
                    className="justify-start"
                  >
                    Tag Authority
                </Button>
                <FieldInfo
                  text="Tag the authority, department, designation, or person related to this action, report, or event. This links your post to the concerned authority."
                />

                {selectedAuthorities.length > 0 && (
                  <AvatarGroup>
                    {selectedAuthorities.map((e) => (
                      <Avatar key={e.id} className="h-6 w-6">
                        <AvatarImage src={e.image_url} />
                        <AvatarFallback>
                          {e.label?.charAt(0) || "G"}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </AvatarGroup>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <ToggleGroup
                  type="single"
                  value={type}
                  onValueChange={(v) =>
                    v && setType(v)
                  }
                  variant="outline"
                >
                  <ToggleGroupItem value="action" className="rounded-none first:rounded-l-md last:rounded-r-md border-r-0 last:border-r">
                    Action
                  </ToggleGroupItem>
                  <ToggleGroupItem value="report" className="rounded-none border-r-0 last:border-r">
                    Report
                  </ToggleGroupItem>
                  <ToggleGroupItem value="event" className="rounded-none last:rounded-r-md">
                    Event
                  </ToggleGroupItem>
                </ToggleGroup>
                <FieldInfo
                  text={
                    type === "action"
                      ? "Use Action to document civic initiatives, efforts taken, or actions implemented."
                      : type === "report"
                      ? "Use Report to document complaints, issues, proposals, policy recommendations, or suggestions submitted to authorities."
                      : "Use Event to record meetings, workshops, student engagements, consultations, community walks, or civic gatherings."
                  }
                />
              </div>
            </div>
          </div>

          {/* BODY */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  Date
                  <FieldInfo
                    text={
                      type === "event"
                        ? "Date when the event was or will be conducted."
                        : type === "report"
                        ? "Date when the report was submitted or filed."
                        : "Date relevant to this civic action."
                    }
                  />
                </div>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  Time
                  <FieldInfo
                    text={
                      type === "event"
                        ? "Time when the event was or will be conducted."
                        : "Optional time relevant to this update."
                    }
                  />
                </div>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  Location
                  <FieldInfo
                    text={
                      type === "event"
                        ? "Location where the event was or will be conducted."
                        : type === "report"
                        ? "Area or locality this report concerns."
                        : "Area or locality this action focuses on."
                    }
                  />
                </div>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  Status
                  <FieldInfo
                    text="Current outcome or progress status of this action or report."
                  />
                </div>
                <Input
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                />
              </div>

            </div>

            {/* FIXED HEIGHT EXTRA SECTION */}
            
            <Textarea
              placeholder="Document your civic action..."
              value={content}
              onChange={(e) =>
                setContent(e.target.value)
              }
              className="min-h-[120px]"
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
                  prev.filter(
                    (_, i) => i !== index
                  )
                )
              }
            />
          </div>
        </Card>
      </div>

      <AuthoritySearchModal
        open={authorityOpen}
        onOpenChange={setAuthorityOpen}
        selected={selectedAuthorities}
        onChange={setSelectedAuthorities}
      />
    </>
  );
}
