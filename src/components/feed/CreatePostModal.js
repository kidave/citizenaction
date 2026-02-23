"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import AuthoritySearchModal from "@/components/governance/AuthoritySearchModal";

import { useAuth } from "@/context/AuthContext";
import { useMyProfile } from "@/hooks/useMyProfile";
import { useCreatePost } from "@/hooks/useCreatePost";
import { useFeed } from "@/hooks/useFeed";

import AttachmentPicker from "./AttachmentPicker";
import { toast } from "sonner";
import Image from "next/image";
import { X } from "lucide-react";

export default function CreatePostModal({
  isOpen,
  onClose,
}) {
  const { user } = useAuth();
  const { data: profile } =
    useMyProfile();
  const { createPost } =
    useCreatePost();
  const { refetch } =
    useFeed();

  const scopeType = "country";
  const scopeCode = "IN";

  const [type, setType] =
    useState("action");
  const [content, setContent] =
    useState("");
  const [attachments, setAttachments] =
    useState([]);

  const [authorityOpen,
    setAuthorityOpen] =
    useState(false);
  const [selectedAuthorities, setSelectedAuthorities] = useState([]);

  const [date, setDate] =
    useState("");
  const [time, setTime] =
    useState("");
  const [location, setLocation] =
    useState("");
  const [mode, setMode] =
    useState("offline");
  const [status, setStatus] =
    useState("");

  async function handleSubmit() {
    if (!content.trim()) {
      toast.error("Enter content.");
      return;
    }

    await createPost({
      author_id: user.id,
      scope_type: scopeType,
      scope_code: scopeCode,
      type,
      summary: content.slice(0, 200),
      details: content,
      attachments,
      governance_entity_id:
        selectedAuthorities[0]?.id || null,
      governance_entity_type:
        selectedAuthorities[0]?.entity_type || null,
      status:
        type === "report"
          ? status
          : null,
      metadata: {
        date,
        time,
        location,
        mode:
          type === "meeting"
            ? mode
            : null,
      },
    });

    await refetch();
    onClose();
  }

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col">

          {/* HEADER */}
          <div className="p-4 border-b space-y-3">
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
                  Post
                </Button>
              </div>
            </div>

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
              <ToggleGroupItem value="meeting" className="rounded-none last:rounded-r-md">
                Meeting
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* BODY */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            {/* SINGLE LINE COMMON FIELDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => setAuthorityOpen(true)}
                  className="justify-start"
                >
                  Tag Authority
                </Button>

                {selectedAuthorities.length > 0 && (
                  <div className="flex gap-2">
                    {selectedAuthorities.map((entity) => (
                      <div
                        key={entity.id}
                        className="flex items-center bg-muted text-xs overflow-hidden text-ellipsis whitespace-nowrap px-1 py-1"
                      >
                        
                        <button
                          onClick={() =>
                            setSelectedAuthorities((prev) =>
                              prev.filter((e) => e.id !== entity.id)
                            )
                          }
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3 mr-1" />
                        </button>
                        {entity.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Input
                type="date"
                value={date}
                onChange={(e) =>
                  setDate(
                    e.target.value
                  )
                }
              />

              <Input
                type="time"
                value={time}
                onChange={(e) =>
                  setTime(
                    e.target.value
                  )
                }
              />

              <Input
                placeholder="Location"
                value={location}
                onChange={(e) =>
                  setLocation(
                    e.target.value
                  )
                }
              />
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

            <div className="min-h-[60px] space-y-3">

              {type === "meeting" && (
                <ToggleGroup
                  type="single"
                  value={mode}
                  onValueChange={(v) =>
                    v && setMode(v)
                  }
                  variant="outline"
                >
                  <ToggleGroupItem value="offline" className="rounded-none first:rounded-l-md last:rounded-r-md border-r-0 last:border-r">
                    Offline
                  </ToggleGroupItem>
                  <ToggleGroupItem value="online" className="rounded-none last:rounded-r-md">
                    Online
                  </ToggleGroupItem>
                </ToggleGroup>
              )}

              {type === "report" && (
                <Input
                  placeholder="Status"
                  value={status}
                  onChange={(e) =>
                    setStatus(
                      e.target.value
                    )
                  }
                />
              )}
            </div>

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
        onSelect={(entity) => {
          setSelectedAuthorities((prev) => {
            if (prev.find((e) => e.id === entity.id)) return prev;
            return [...prev, entity];
          });
        }}
      />

    </>
  );
}
