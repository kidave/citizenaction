"use client";

import { useState } from "react";

import { Row } from "@/components/layout/Row";
import { UserIdentity } from "@/components/profile/UserIdentity";
import PostActions from "@/components/feed/post/PostActions";
import EditorModal from "@/components/feed/editor/EditorModal";

import { useAuth } from "@/context/AuthContext";

import { useDeleteContribution } from "@/hooks/contribution/useDeleteContribution";
import { usePostContribution } from "@/hooks/feed/usePostContribution";

export default function PostContribution({ post }) {
  const { user } = useAuth();

  const { deleteContribution } = useDeleteContribution();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedContribution, setSelectedContribution] = useState(null);

  const {
    data: contributions = [],
    isLoading,
    error,
  } = usePostContribution(post?.id);

  if (!post?.id) return null;

  const myContribution = contributions.find((c) => c.author_id === user?.id);

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
          const canEdit =
            post.can_manage || contribution.author_id === user?.id;

          return (
            <div
              key={contribution.id}
              className="space-y-4 rounded-xl border p-4"
            >
              <Row className="items-center justify-between">
                <UserIdentity
                  username={contribution.username}
                  name={contribution.name}
                  avatar={contribution.avatar_url}
                />

                {canEdit && (
                  <PostActions
                    canEdit
                    onEdit={() => {
                      setSelectedContribution(contribution);
                      setIsEditorOpen(true);
                    }}
                    onDelete={() => handleDelete(contribution)}
                  />
                )}
              </Row>

              {contribution.title && (
                <h4 className="font-semibold">{contribution.title}</h4>
              )}

              {contribution.content && (
                <div className="whitespace-pre-wrap text-sm">
                  {contribution.content}
                </div>
              )}

              {contribution.start_at && (
                <div className="text-xs text-muted-foreground">
                  {new Date(contribution.start_at).toLocaleDateString()}
                </div>
              )}

              {contribution.address && (
                <div className="text-xs text-muted-foreground">
                  {contribution.address}
                </div>
              )}

              {/* Attachments will go here */}
            </div>
          );
        })}
      </div>

      {!myContribution && user && (
        <button
          onClick={() => {
            setSelectedContribution(null);
            setIsEditorOpen(true);
          }}
          className="mt-4 w-full rounded-md border py-2 text-sm transition-colors hover:bg-muted"
        >
          Add Contribution
        </button>
      )}

      <EditorModal
        mode="contribution"
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setSelectedContribution(null);
        }}
        item={selectedContribution}
        post={post}
      />
    </>
  );
}
