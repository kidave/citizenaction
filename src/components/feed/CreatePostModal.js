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
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import FieldInfo from "@/components/ui/FieldInfo";
import { DateTimePicker } from "@/components/ui/date-time";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
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
  const now = new Date();
  const defaultTime = now.toTimeString().slice(0, 5); // HH:MM
  const [date, setDate] = useState(initialData?.metadata?.date || "");
  const [time, setTime] = useState(initialData?.metadata?.time || defaultTime);
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
            status: type === "meeting" ? null : status,
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

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    onClick={() => setAuthorityOpen(true)}
                    className="justify-start"
                  >
                    Tag Authority
                </Button>
                <FieldInfo
                  text="Tag the authority, department, designation, or person related to this action, report, or meeting. This links your post to the concerned authority."
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
                  onValueChange={(v) => v && setType(v)}
                  variant="outline"
                >

                  {/* ACTION */}
                  <ToggleGroupItem
                    value="action"
                    className="rounded-none first:rounded-l-md border-r-0"
                  >
                    <HoverCard openDelay={50} closeDelay={50}>
                      <HoverCardTrigger asChild>
                        <span className="cursor-pointer">
                          Action
                        </span>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-64 text-sm">
                        Document civic initiatives, efforts taken or actions implemented.
                      </HoverCardContent>
                    </HoverCard>
                  </ToggleGroupItem>

                  {/* REPORT */}
                  <ToggleGroupItem
                    value="report"
                    className="rounded-none border-r-0"
                  >
                    <HoverCard openDelay={50} closeDelay={50}>
                      <HoverCardTrigger asChild>
                        <span className="cursor-pointer">
                          Report
                        </span>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-64 text-sm">
                        Document complaints, proposals or policy recommendations submitted to authorities.
                      </HoverCardContent>
                    </HoverCard>
                  </ToggleGroupItem>

                  {/* MEETING */}
                  <ToggleGroupItem
                    value="meeting"
                    className="rounded-none last:rounded-r-md"
                  >
                    <HoverCard openDelay={50} closeDelay={50}>
                      <HoverCardTrigger asChild>
                        <span className="cursor-pointer">
                          Meeting
                        </span>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-64 text-sm">
                        Record meetings with officials.
                      </HoverCardContent>
                    </HoverCard>
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

              {/* DATE + TIME */}
              <Field className="col-span-2 lg:col-span-2">
                <FieldLabel className="flex items-center gap-2">
                  Date & Time
                  <FieldInfo
                    text={
                      type === "meeting"
                        ? "Date and time of the meeting."
                        : type === "report"
                        ? "Date when the report was submitted."
                        : "Date relevant to this civic action."
                    }
                  />
                </FieldLabel>

                <DateTimePicker
                  date={date}
                  time={time}
                  onDateChange={setDate}
                  onTimeChange={setTime}
                />
              </Field>

              {/* LOCATION */}
              <Field>
                <FieldLabel className="flex items-center gap-2">
                  Location
                  <FieldInfo
                    text={
                      type === "meeting"
                        ? "Location of the meeting."
                        : type === "report"
                        ? "Area or locality this report concerns."
                        : "Area where this civic action is focused."
                    }
                  />
                </FieldLabel>

                <Input
                  placeholder="Enter location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </Field>

              {/* STATUS */}
              {type !== "meeting" && (
                <Field>
                  <FieldLabel className="flex items-center gap-2">
                    Status
                    <FieldInfo
                      text={
                        type === "report"
                          ? "Outcome or progress update of the submitted report."
                          : "Current progress or impact of this civic action."
                      }
                    />
                  </FieldLabel>

                  <Input
                    placeholder="Current status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  />
                </Field>
              )}
            </div>

            {/* FIXED HEIGHT EXTRA SECTION */}
            <Textarea
              placeholder="Document your action."
              value={content}
              onChange={(e) => {
                setContent(e.target.value)
                e.target.style.height = "auto"
                e.target.style.height = e.target.scrollHeight + "px"
              }}
              className="min-h-[180px] md:min-h-[140px] resize-none overflow-hidden"
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
