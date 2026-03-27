"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Row } from "@/components/layout/Row";
import { UserIdentity } from "@/components/profile/UserIdentity";
import AttendeeAvatarGroup from "./AttendeeAvatarGroup";

import { useAuth } from "@/context/AuthContext";
import PostActions from "@/components/feed/post-card/PostActions";

import { useDeleteMeetingItem } from "@/hooks/meeting/useDeleteMeetingItem";
import MeetingItemEditorModal from "@/components/feed/post-meeting/MeetingItemEditorModal";

export default function MeetingCard({ meeting, clickable = true }) {
  const router = useRouter();
  const { user } = useAuth();

  const { deleteMeetingItem } = useDeleteMeetingItem();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleNavigate = () => {
    if (clickable) {
      router.push(`/meeting/${meeting.id}`);
    }
  };

  const myItem = meeting.attendees?.find((p) => p.is_self);

  async function handleDelete() {
    if (!confirm("Delete your entry?")) return;

    await deleteMeetingItem({
      feed_id: meeting.id,
      user_id: user.id,
    });
  }

  return (
    <>
      <Card>

        {/* HEADER */}
        <CardHeader
          className={`space-y-2 relative ${clickable ? "cursor-pointer" : ""}`}
          onClick={handleNavigate}
        >

          {/* TAGS */}
          <div
            className="absolute top-4 right-4 flex flex-wrap gap-2 max-w-[60%] justify-end"
            onClick={(e) => e.stopPropagation()}
          >
            {meeting.space_name && meeting.space_slug && (
              <Link href={`/space/${meeting.space_slug}`}>
                <Badge variant="outline">{meeting.space_name}</Badge>
              </Link>
            )}

            {meeting.club_name && meeting.space_slug && meeting.club_id && (
              <Link
                href={`/space/${meeting.space_slug}/${meeting.scope_type}/${meeting.scope_code}`}
              >
                <Badge variant="secondary">{meeting.club_name}</Badge>
              </Link>
            )}
          </div>

          {/* TITLE */}
          <CardTitle className="pr-28 leading-snug">
            {meeting.summary}
          </CardTitle>

          {/* DESCRIPTION */}
          {meeting.details && (
            <CardDescription>
              {meeting.details}
            </CardDescription>
          )}

          {/* ATTENDEE AVATARS */}
          {meeting.attendees?.length > 0 && (
            <AttendeeAvatarGroup attendees={meeting.attendees} />
          )}

        </CardHeader>

        {/* CONTENT */}
        <CardContent className="space-y-4">

          {meeting.attendees?.map((person, i) => {
            const canEditThis = person.is_self;

            return (
              <div
                key={i}
                className="border rounded-md p-3 text-sm space-y-2"
              >
                <Row className="items-center justify-between">

                  <UserIdentity
                    username={person.username}
                    name={person.name}
                    avatar={person.avatar}
                  />

                  {canEditThis && (
                    <PostActions
                      canEdit
                      onEdit={() => {
                        setSelectedItem(myItem);
                        setIsEditorOpen(true);
                      }}
                      onDelete={handleDelete}
                    />
                  )}

                </Row>

                {person.notes && (
                  <div className="text-muted-foreground whitespace-pre-wrap">
                    {person.notes}
                  </div>
                )}
              </div>
            );
          })}

          {/* ADD INPUT */}
          {!myItem && user && (
            <button
              onClick={() => {
                setSelectedItem(null);
                setIsEditorOpen(true);
              }}
              className="w-full border rounded-md py-2 text-sm hover:bg-muted transition-colors"
            >
              Add your input
            </button>
          )}

        </CardContent>

      </Card>

      {/* MODAL */}
      <MeetingItemEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setSelectedItem(null);
        }}
        meeting={meeting}
        existingItem={selectedItem}
      />
    </>
  );
}