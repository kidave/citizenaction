"use client";

import { useState } from "react";
import { Row } from "@/components/layout/Row";
import { UserIdentity } from "@/components/profile/UserIdentity";
import PostActions from "@/components/feed/post-card/PostActions";
import AttendeeAvatarGroup from "./AttendeeAvatarGroup";
import { useAuth } from "@/context/AuthContext";
import { useDeleteMeetingItem } from "@/hooks/meeting/useDeleteMeetingItem";
import MeetingItemEditorModal from "./MeetingItemEditorModal";

export default function PostMeeting({ meeting }) {
  const { user } = useAuth();
  const { deleteMeetingItem } = useDeleteMeetingItem();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const attendees = meeting.meeting_attendees || [];

  const myItem = attendees.find((p) => p.is_self);

  async function handleDelete(person) {
    if (!confirm("Delete this entry?")) return;

    await deleteMeetingItem({
      feed_id: meeting.id,
      user_id: person.user_id,
    });
  }

  return (
    <>
      {/* ATTENDEES */}
      {attendees.length > 0 && (
        <AttendeeAvatarGroup attendees={attendees} />
      )}

      {/* ITEMS */}
      <div className="space-y-3">
        {attendees.map((person, i) => {
          const canEditThis = meeting.can_manage || person.is_self;

          return (
            <div
              key={i}
              className="border rounded-md p-3 text-sm space-y-2"
            >
              <Row className="items-center justify-between">
                <UserIdentity
                  username={person.username || person.name}
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
      </div>

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