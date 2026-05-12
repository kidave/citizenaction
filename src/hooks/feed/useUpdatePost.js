"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { uploadPostAttachment } from "@/lib/supabase/storage";
import { toast } from "sonner";

export function useUpdatePost() {

  const queryClient = useQueryClient();

  const mutation = useMutation({

      mutationFn:
        async ({
          postId,
          postData,
        }) => {

          const isGlobal =
            !postData.spaces ||
            postData.spaces.length === 0;

          let uploadedAttachments =
            [];

          // =========================
          // ATTACHMENTS
          // =========================

          if (
            postData.attachments
              ?.length > 0
          ) {

            const uploadPromises =
              postData.attachments.map(
                async (file) => {

                  if (
                    file?.url
                  ) {
                    return file;
                  }

                  return await
                    uploadPostAttachment(
                      file,
                      postData.author_id
                    );
                }
              );

            uploadedAttachments =
              await Promise.all(
                uploadPromises
              );
          }

          // =========================
          // UPDATE FEED
          // =========================

          const { error } =
            await supabase
              .from("feed")
              .update({

                type:
                  postData.type,

                details:
                  postData.details,

                summary:
                  postData.summary,

                attachments:
                  uploadedAttachments,

                metadata:
                  postData.metadata ??
                  null,

                is_global:
                  isGlobal,

                start_at:
                  postData.start_at ??
                  null,

                end_at:
                  postData.end_at ??
                  null,

                lat:
                  postData.lat ??
                  null,

                lng:
                  postData.lng ??
                  null,

                address:
                  postData.address ??
                  null,

                meeting_link:
                  postData.meeting_link ??
                  null,
              })
              .eq(
                "id",
                postId
              );

          if (error) {
            throw error;
          }

          // =========================
          // RESET FEED SPACES
          // =========================

          const {
            error:
              deleteSpacesError,
          } = await supabase
            .from(
              "feed_space"
            )
            .delete()
            .eq(
              "feed_id",
              postId
            );

          if (
            deleteSpacesError
          ) {
            throw deleteSpacesError;
          }

          // =========================
          // INSERT FEED SPACES
          // =========================

          if (
            postData.spaces
              ?.length > 0
          ) {

            const rows =
              postData.spaces.map(
                (space) => ({
                  feed_id:
                    postId,

                  space_id:
                    space.id,
                })
              );

            const {
              error:
                insertSpacesError,
            } = await supabase
              .from(
                "feed_space"
              )
              .insert(rows);

            if (
              insertSpacesError
            ) {
              throw insertSpacesError;
            }
          }

          // =========================
          // RESET GOVERNANCE TAGS
          // =========================

          const {
            error:
              deleteGovError,
          } = await supabase
            .from(
              "feed_governance_entities"
            )
            .delete()
            .eq(
              "feed_id",
              postId
            );

          if (
            deleteGovError
          ) {
            throw deleteGovError;
          }

          // =========================
          // INSERT GOVERNANCE TAGS
          // =========================

          if (
            postData
              .governance_entities
              ?.length > 0
          ) {

            const rows =
              postData
                .governance_entities
                .map((e) => ({
                  feed_id:
                    postId,

                  governance_entity_id:
                    e.id,
                }));

            const {
              error:
                insertGovError,
            } = await supabase
              .from(
                "feed_governance_entities"
              )
              .insert(rows);

            if (
              insertGovError
            ) {
              throw insertGovError;
            }
          }

          return true;
        },

      onSuccess: () => {

        queryClient
          .invalidateQueries({
            queryKey: ["feed"],
          });

        toast.success(
          "Post updated successfully"
        );
      },

      onError: (error) => {

        console.error(error);

        toast.error(
          error.message ||
          "Failed to update post"
        );
      },
    });

  return {
    updatePost:
      mutation.mutateAsync,

    isUpdating:
      mutation.isPending,
  };
}