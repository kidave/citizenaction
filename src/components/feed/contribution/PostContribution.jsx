"use client";

import { useState } from "react";
import { toast } from "sonner";

import ContributionCard from "@/components/feed/contribution/ContributionCard";
import EditorModal from "@/components/feed/editor/EditorModal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

import { useDeleteContribution } from "@/hooks/contribution/useDeleteContribution";
import { useContribution } from "@/hooks/feed/useContribution";

export default function PostContribution({ post }) {
  const { user } = useAuth();

  const { deleteContribution } = useDeleteContribution();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedContribution, setSelectedContribution] = useState(null);

  const {
    data: contributions = [],
    isLoading,
    error,
  } = useContribution(post?.id);

  if (!post?.id) return null;

  const myContribution = contributions.find(
    (contribution) => contribution.author_id === user?.id,
  );

  async function handleDelete(contribution) {
    if (!confirm("Delete this contribution?")) return;

    try {
      await deleteContribution(contribution);
    } catch (error) {
      console.error("Failed to delete contribution", {
        message: error?.message,
        code: error?.code,
      });
    }
  }

  if (isLoading) {
    return (
      <div className="text-md text-muted-foreground">
        Loading contributions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-md text-red-500">Failed to load contributions.</div>
    );
  }

  return (
    <div id="post-contributions">
      {!myContribution && user && (
        <Button
          onClick={() => {
            setSelectedContribution(null);
            setIsEditorOpen(true);
          }}
          className="mb-4 w-full rounded-xl py-3"
        >
          Document your contribution
        </Button>
      )}

      <div className="space-y-4 pb-4">
        {contributions.map((contribution) => {
          const canEdit =
            contribution.can_manage || contribution.author_id === user?.id;

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
    </div>
  );
}
