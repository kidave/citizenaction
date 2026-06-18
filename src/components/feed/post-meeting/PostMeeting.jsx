"use client";

import { useState } from "react";
import { Row } from "@/components/layout/Row";
import { UserIdentity } from "@/components/profile/UserIdentity";
import PostActions from "@/components/feed/post-card/PostActions";
import { useAuth } from "@/context/AuthContext";
import { useDeleteMeetingItem } from "@/hooks/meeting/useDeleteMeetingItem";
import MeetingItemEditorModal from "./MeetingItemEditorModal";
import { usePostMeeting } from "@/hooks/feed/usePostMeeting";

export default function PostMeeting({ post }) {
  const { user } = useAuth();
  const { deleteMeetingItem } = useDeleteMeetingItem();

  const postId = post?.id;

  const { data: attendees = [], isLoading } = usePostMeeting(postId);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  if (!postId) return null;

  const myItem = attendees.find((p) => p.user_id === user?.id);

  async function handleDelete(person) {
    if (!confirm("Delete this entry?")) return;

    try {
      await deleteMeetingItem(person.id);
    } catch (error) {
      console.error(error);
    }
  }

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground">Loading attendees...</div>
    );
  }

  return (
    <>
      {/* ITEMS */}
      <div className="mb-4 space-y-3">
        {attendees.map((person) => {
          const p = person.profile;

          const canEditThis = post.can_manage || person.user_id === user?.id;

          return (
            <div key={person.id} className="space-y-2 rounded-md p-2 text-sm">
              <Row className="items-center justify-between">
                <UserIdentity
                  username={p?.username || person.guest_name}
                  name={p?.name || person.guest_name}
                  avatar={p?.avatar_url}
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

              {(person.notes || person.guest_designation) && (
                <div className="whitespace-pre-wrap">{person.notes}</div>
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
          className="w-full rounded-md border py-2 text-sm transition-colors hover:bg-muted"
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
        meeting={post}
        existingItem={selectedItem}
      />
    </>
  );
}
