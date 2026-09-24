"use client";

import { MoreHorizontal, UserMinus, UserRoundCog, Users } from "lucide-react";

import { toast } from "sonner";

import { useSpaces } from "@/hooks/space/useSpaces";
import { useSpaceMembers } from "@/hooks/space/useSpaceMembers";
import { useSpaceMemberActions } from "@/hooks/space/useSpaceMemberActions";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Skeleton } from "@/components/ui/skeleton";

export default function SpaceMembersSettings({ spaceSlug }) {
  /* ========================================
     SPACE
  ======================================== */

  const {
    data: space,
    isLoading: spaceLoading,
    error: spaceError,
  } = useSpaces({
    slug: spaceSlug,
    privateAccess: true,
    enabled: !!spaceSlug,
  });

  /* ========================================
     MEMBERS
  ======================================== */

  const {
    data: members = [],
    isLoading: membersLoading,
    error: membersError,
  } = useSpaceMembers({
    spaceId: space?.id,
    enabled: !!space?.id,
  });

  /* ========================================
     MEMBER ACTIONS
  ======================================== */

  const { changeRole, toggleSuspension, removeMember, isUpdating } =
    useSpaceMemberActions({
      spaceId: space?.id,
    });

  /* ========================================
     LOADING
  ======================================== */

  if (spaceLoading || membersLoading) {
    return <MembersSettingsSkeleton />;
  }

  /* ========================================
     SPACE ERROR
  ======================================== */

  if (spaceError) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="font-medium">Unable to load Space</p>

          <p className="mt-1 text-sm text-muted-foreground">
            {spaceError.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  /* ========================================
     MEMBERS ERROR
  ======================================== */

  if (membersError) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="font-medium">Unable to load members</p>

          <p className="mt-1 text-sm text-muted-foreground">
            {membersError.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!space) {
    return null;
  }

  /* ========================================
     CHANGE ROLE
  ======================================== */

  async function handleChangeRole(member, role) {
    try {
      await changeRole.mutateAsync({
        userId: member.user_id,
        role,
      });

      toast.success(
        role === "admin" ? "Member made admin." : "Member made member.",
      );
    } catch (error) {
      console.error(error);

      toast.error(error?.message || "Unable to change member role.");
    }
  }

  /* ========================================
     SUSPEND / RESTORE
  ======================================== */

  async function handleToggleSuspension(member) {
    try {
      await toggleSuspension.mutateAsync({
        userId: member.user_id,
        isSuspended: !member.is_suspended,
      });

      toast.success(
        member.is_suspended ? "Member restored." : "Member suspended.",
      );
    } catch (error) {
      console.error(error);

      toast.error(error?.message || "Unable to update member.");
    }
  }

  /* ========================================
     REMOVE
  ======================================== */

  async function handleRemoveMember(member) {
    if (member.role === "owner") {
      toast.error("The Space owner cannot be removed.");

      return;
    }

    const memberName = member.name || member.username || "this member";

    const confirmed = window.confirm(
      `Remove ${memberName} from ${space.name}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await removeMember.mutateAsync({
        userId: member.user_id,
      });

      toast.success("Member removed.");
    } catch (error) {
      console.error(error);

      toast.error(error?.message || "Unable to remove member.");
    }
  }

  /* ========================================
     PAGE
  ======================================== */

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Members</CardTitle>

        <CardDescription>Manage roles and membership access.</CardDescription>
      </CardHeader>

      <CardContent>
        {members.length === 0 ? (
          <div className="rounded-xl border border-dashed p-6 text-center">
            <Users className="mx-auto h-5 w-5 text-muted-foreground" />

            <p className="mt-2 text-sm font-medium">No members</p>

            <p className="mt-1 text-xs text-muted-foreground">
              Members who join this Space will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {members.map((member) => {
              const displayName =
                member.name || member.username || "Unknown user";

              const initials =
                displayName
                  .split(" ")
                  .map((part) => part?.[0] || "")
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() || "U";

              return (
                <div
                  key={member.user_id}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  {/* ==================================
                      MEMBER
                  ================================== */}

                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage
                        src={member.avatar_url || undefined}
                        alt={displayName}
                      />

                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <div className="truncate font-medium">{displayName}</div>

                      {member.username && (
                        <div className="truncate text-sm text-muted-foreground">
                          @{member.username}
                        </div>
                      )}

                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        {member.role && (
                          <span className="capitalize">{member.role}</span>
                        )}

                        {member.is_suspended && (
                          <>
                            <span>·</span>

                            <span className="text-destructive">Suspended</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ==================================
                      ACTIONS
                  ================================== */}

                  {member.role !== "owner" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isUpdating}
                          aria-label={`Actions for ${displayName}`}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        {/* MAKE ADMIN */}

                        <DropdownMenuItem
                          disabled={isUpdating || member.role === "admin"}
                          onClick={() => handleChangeRole(member, "admin")}
                        >
                          <UserRoundCog className="mr-2 h-4 w-4" />
                          Make admin
                        </DropdownMenuItem>

                        {/* MAKE MEMBER */}

                        <DropdownMenuItem
                          disabled={isUpdating || member.role === "member"}
                          onClick={() => handleChangeRole(member, "member")}
                        >
                          <Users className="mr-2 h-4 w-4" />
                          Make member
                        </DropdownMenuItem>

                        {/* SUSPEND / RESTORE */}

                        <DropdownMenuItem
                          disabled={isUpdating}
                          onClick={() => handleToggleSuspension(member)}
                        >
                          {member.is_suspended
                            ? "Restore member"
                            : "Suspend member"}
                        </DropdownMenuItem>

                        {/* REMOVE */}

                        <DropdownMenuItem
                          disabled={isUpdating}
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleRemoveMember(member)}
                        >
                          <UserMinus className="mr-2 h-4 w-4" />
                          Remove member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ============================================
   SKELETON
============================================ */

function MembersSettingsSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader>
        <Skeleton className="h-5 w-32" />

        <Skeleton className="h-4 w-72" />
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />

          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />

            <Skeleton className="h-3 w-24" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />

          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />

            <Skeleton className="h-3 w-24" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />

          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />

            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
