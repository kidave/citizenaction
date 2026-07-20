"use client";

import { useState } from "react";

import { Row } from "@/components/layout/Row";
import { UserIdentity } from "@/components/profile/UserIdentity";
import PostActions from "@/components/feed/post-card/PostActions";

import { useAuth } from "@/context/AuthContext";

import { useDeleteContribution } from "@/hooks/contribution/useDeleteContribution";
import { usePostContribution } from "@/hooks/feed/usePostContribution";

import ContributionEditorModal from "./ContributionEditorModal";

export default function PostContribution({ post }) {
  const { user } = useAuth();

  const { deleteContribution } = useDeleteContribution();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const {
    data: contributions = [],
    isLoading,
    error,
  } = usePostContribution(post?.id);

  if (!post?.id) return null;

  console.log("Contributions:", contributions);

  const myContribution = contributions.find((c) => c.user_id === user?.id);

  async function handleDelete(contribution) {
    if (!confirm("Delete this contribution?")) return;

    try {
      await deleteContribution(contribution.id);
    } catch (err) {
      console.error(err);
    }
  }

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground">
        Loading contributions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-500">Failed to load contributions.</div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {contributions.map((contribution) => {
          const canEdit = post.can_manage || contribution.user_id === user?.id;

          return (
            <div
              key={contribution.id}
              className="space-y-3 rounded-xl border p-4"
            >
              <Row className="items-center justify-between">
                <UserIdentity
                  username={contribution.username}
                  name={contribution.name || contribution.guest_name}
                  avatar={contribution.avatar_url}
                />

                {canEdit && (
                  <PostActions
                    canEdit
                    onEdit={() => {
                      setSelectedItem(contribution);
                      setIsEditorOpen(true);
                    }}
                    onDelete={() => handleDelete(contribution)}
                  />
                )}
              </Row>

              <div className="space-y-2">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {contribution.contribution_type}
                </div>

                <div className="whitespace-pre-wrap text-sm">
                  {contribution.content}
                </div>

                {contribution.event_date && (
                  <div className="text-xs text-muted-foreground">
                    {new Date(contribution.event_date).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!myContribution && user && (
        <button
          onClick={() => {
            setSelectedItem(null);
            setIsEditorOpen(true);
          }}
          className="mt-4 w-full rounded-md border py-2 text-sm transition-colors hover:bg-muted"
        >
          Add Contribution
        </button>
      )}

      <ContributionEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setSelectedItem(null);
        }}
        contribution={post}
        existingItem={selectedItem}
      />
    </>
  );
}
