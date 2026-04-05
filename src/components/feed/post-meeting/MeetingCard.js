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

  async function handleDelete(person) {
    if (!confirm("Delete this entry?")) return;

    await deleteMeetingItem({
      feed_id: meeting.id,
      user_id: person.user_id,
    });
  }

  return (
    <>
      <Card>

        <CardHeader
          className={`space-y-2 ${clickable ? "cursor-pointer" : ""}`}
          onClick={handleNavigate}
        >

          {/* MOBILE TAGS */}
          <div
            className="flex items-center gap-2 flex-wrap sm:hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* SPACE LOGO */}
            {meeting.space_slug && meeting.space_logo && (
              <Link href={`/space/${meeting.space_slug}`}>
                <img
                  src={meeting.space_logo}
                  alt=""
                  className="h-6 w-6 rounded-md border"
                />
              </Link>
            )}

            {/* CLUB BADGE */}
            {meeting.club_name &&
              meeting.scope_type &&
              meeting.scope_code && (
                <Link
                  href={`/space/${meeting.space_slug}/${meeting.scope_type}/${meeting.scope_code}`}
                >
                  <Badge variant="secondary">
                    {meeting.club_name}
                  </Badge>
                </Link>
              )}
          </div>

          {/* TITLE + DESKTOP TAGS */}
          <div className="flex items-start justify-between gap-3">

            {/* TITLE */}
            <CardTitle className="leading-snug break-words">
              {meeting.summary}
            </CardTitle>

            {/* DESKTOP TAGS */}
            <div
              className="hidden sm:flex items-center gap-2 flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              {meeting.space_slug && meeting.space_logo && (
                <Link href={`/space/${meeting.space_slug}`}>
                  <img
                    src={meeting.space_logo}
                    alt=""
                    className="h-6 w-6 rounded-md border"
                  />
                </Link>
              )}

              {meeting.club_name &&
                meeting.scope_type &&
                meeting.scope_code && (
                  <Link
                    href={`/space/${meeting.space_slug}/${meeting.scope_type}/${meeting.scope_code}`}
                  >
                    <Badge variant="secondary">
                      {meeting.club_name}
                    </Badge>
                  </Link>
                )}
            </div>

          </div>

          {/* DESCRIPTION */}
          {meeting.details && (
            <CardDescription className="break-words">
              {meeting.details}
            </CardDescription>
          )}

          {/* ATTENDEES */}
          {meeting.attendees?.length > 0 && (
            <AttendeeAvatarGroup attendees={meeting.attendees} />
          )}

        </CardHeader>

        {/* CONTENT */}
        <CardContent className="space-y-4">

          {meeting.attendees?.map((person, i) => {
            const canEditThis = meeting.can_manage || person.is_self;

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
                        setSelectedItem(person);
                        setIsEditorOpen(true);
                      }}
                      onDelete={() => handleDelete(person)}
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