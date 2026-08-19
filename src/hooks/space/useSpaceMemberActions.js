"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";

export function useSpaceMemberActions({ spaceId }) {
  const queryClient = useQueryClient();

  const changeRole = useMutation({
    mutationFn: async ({ userId, role }) => {
      const { error } = await supabase.rpc("change_space_member_role", {
        p_space_id: spaceId,
        p_user_id: userId,
        p_role: role,
      });

      if (error) {
        throw error;
      }

      return {
        userId,
        role,
      };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["space-members", spaceId],
      });
    },
  });

  const toggleSuspension = useMutation({
    mutationFn: async ({ userId, isSuspended }) => {
      const { error } = await supabase.rpc("set_space_member_suspension", {
        p_space_id: spaceId,
        p_user_id: userId,
        p_is_suspended: isSuspended,
      });

      if (error) {
        throw error;
      }

      return {
        userId,
        isSuspended,
      };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["space-members", spaceId],
      });
    },
  });

  const removeMember = useMutation({
    mutationFn: async ({ userId }) => {
      const { error } = await supabase.rpc("remove_space_member", {
        p_space_id: spaceId,
        p_user_id: userId,
      });

      if (error) {
        throw error;
      }

      return userId;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["space-members", spaceId],
      });
    },
  });

  return {
    changeRole,
    toggleSuspension,
    removeMember,

    isChangingRole: changeRole.isPending,

    isTogglingSuspension: toggleSuspension.isPending,

    isRemovingMember: removeMember.isPending,

    isUpdating:
      changeRole.isPending ||
      toggleSuspension.isPending ||
      removeMember.isPending,
  };
}
