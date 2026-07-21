"use client";

import { useState } from "react";

import ContributionCard from "@/components/feed/contribution/ContributionCard";
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
      {!myContribution && user && (
        <button
          onClick={() => {
            setSelectedContribution(null);
            setIsEditorOpen(true);
          }}
          className="mb-4 w-full rounded-xl border py-3 text-sm font-medium hover:bg-muted"
        >
          Add Contribution
        </button>
      )}

      <div className="space-y-4 pb-4">
        {contributions.map((contribution) => {
          const canEdit =
            post.can_manage || contribution.author_id === user?.id;

          return (
            <ContributionCard
              key={contribution.id}
              contribution={contribution}
              post={post}
              canEdit={canEdit}
              onEdit={() => {
                setSelectedContribution(contribution);
                setIsEditorOpen(true);
              }}
              onDelete={() => handleDelete(contribution)}
              onContribute={() => {
                setSelectedContribution(null);
                setIsEditorOpen(true);
              }}
            />
          );
        })}
      </div>

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
