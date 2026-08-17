"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import {
  CheckCircle2,
  Clock3,
  MoreHorizontal,
  UserMinus,
  UserRoundCog,
  Users,
} from "lucide-react";

import { toast } from "sonner";

import { supabase } from "@/lib/supabase/client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Skeleton } from "@/components/ui/skeleton";

export default function SpaceMembersSettings({ spaceSlug }) {
  const [space, setSpace] = useState(null);

  const [applications, setApplications] = useState([]);

  const [members, setMembers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (!spaceSlug) {
      return;
    }

    async function load() {
      setLoading(true);

      /*
       * ======================================
       * SPACE
       * ======================================
       */

      const { data: spaceData, error: spaceError } = await supabase
        .from("space")
        .select("id, name, slug, owner_user_id")
        .eq("slug", spaceSlug)
        .single();

      if (spaceError) {
        console.error(spaceError);

        toast.error("Unable to load Space.");

        setLoading(false);

        return;
      }

      setSpace(spaceData);

      /*
       * ======================================
       * APPLICATIONS
       * ======================================
       */

      const { data: applicationData, error: applicationError } = await supabase
        .from("space_member_application")
        .select(
          `
          id,
          applicant_user_id,
          message,
          status,
          created_at,
          applicant:applicant_user_id (
            user_id,
            name,
            username,
            avatar_url
          )
        `,
        )
        .eq("space_id", spaceData.id)
        .eq("status", "pending")
        .order("created_at", {
          ascending: true,
        });

      if (applicationError) {
        console.error(applicationError);

        toast.error("Unable to load applications.");

        setLoading(false);

        return;
      }

      setApplications(applicationData || []);

      /*
       * ======================================
       * MEMBERS
       * ======================================
       */

      const { data: memberData, error: memberError } = await supabase
        .from("space_member")
        .select(
          `
          space_id,
          user_id,
          role,
          is_active,
          is_suspended,
          created_at,
          profile:user_id (
            user_id,
            name,
            username,
            avatar_url
          )
        `,
        )
        .eq("space_id", spaceData.id)
        .order("created_at", {
          ascending: true,
        });

      if (memberError) {
        console.error(memberError);

        toast.error("Unable to load members.");

        setLoading(false);

        return;
      }

      setMembers(memberData || []);

      setLoading(false);
    }

    load();
  }, [spaceSlug]);

  /* ========================================
     CHANGE ROLE
  ======================================== */

  async function changeRole(member, role) {
    if (!space) {
      return;
    }

    setActionLoading(`${member.user_id}-role`);

    const { error } = await supabase.rpc("change_space_member_role", {
      p_space_id: space.id,
      p_user_id: member.user_id,
      p_role: role,
    });

    setActionLoading(null);

    if (error) {
      console.error(error);

      toast.error(error.message || "Unable to change member role.");

      return;
    }

    setMembers((current) =>
      current.map((item) =>
        item.user_id === member.user_id
          ? {
              ...item,
              role,
            }
          : item,
      ),
    );

    toast.success("Member role updated.");
  }

  /* ========================================
     SUSPEND
  ======================================== */

  async function toggleSuspension(member) {
    if (!space) {
      return;
    }

    setActionLoading(`${member.user_id}-suspend`);

    const { error } = await supabase.rpc("set_space_member_suspension", {
      p_space_id: space.id,
      p_user_id: member.user_id,
      p_is_suspended: !member.is_suspended,
    });

    setActionLoading(null);

    if (error) {
      console.error(error);

      toast.error(error.message || "Unable to update member.");

      return;
    }

    setMembers((current) =>
      current.map((item) =>
        item.user_id === member.user_id
          ? {
              ...item,
              is_suspended: !item.is_suspended,
            }
          : item,
      ),
    );

    toast.success(
      member.is_suspended ? "Member restored." : "Member suspended.",
    );
  }

  /* ========================================
     REMOVE
  ======================================== */

  async function removeMember(member) {
    if (!space) {
      return;
    }

    if (member.role === "owner") {
      toast.error("The Space owner cannot be removed.");

      return;
    }

    const confirmed = window.confirm(
      `Remove ${member.profile?.name || "this member"} from the Space?`,
    );

    if (!confirmed) {
      return;
    }

    setActionLoading(`${member.user_id}-remove`);

    const { error } = await supabase.rpc("remove_space_member", {
      p_space_id: space.id,
      p_user_id: member.user_id,
    });

    setActionLoading(null);

    if (error) {
      console.error(error);

      toast.error(error.message || "Unable to remove member.");

      return;
    }

    setMembers((current) =>
      current.filter((item) => item.user_id !== member.user_id),
    );

    toast.success("Member removed.");
  }

  /* ========================================
     LOADING
  ======================================== */

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="space-y-4 p-6">
            <Skeleton className="h-5 w-48" />

            <Skeleton className="h-4 w-72" />

            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-6">
            <Skeleton className="h-5 w-32" />

            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!space) {
    return null;
  }

  /* ========================================
     PAGE
  ======================================== */

  return (
    <div className="space-y-6">
      {/* ======================================
          PENDING APPLICATIONS
      ====================================== */}

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Pending applications</CardTitle>

              <CardDescription>
                Review people who want to become members of this Space.
              </CardDescription>
            </div>

            {applications.length > 0 && (
              <Badge variant="secondary">{applications.length}</Badge>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {applications.length === 0 ? (
            <div className="rounded-xl border border-dashed p-6 text-center">
              <Clock3 className="mx-auto h-5 w-5 text-muted-foreground" />

              <p className="mt-2 text-sm font-medium">
                No pending applications
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                New membership applications will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {applications.map((application) => (
                <div
                  key={application.id}
                  className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={application.applicant?.avatar_url || undefined}
                      />

                      <AvatarFallback>
                        {application.applicant?.name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <div className="truncate font-medium">
                        {application.applicant?.name}
                      </div>

                      <div className="truncate text-sm text-muted-foreground">
                        @{application.applicant?.username}
                      </div>
                    </div>
                  </div>

                  <Button asChild size="sm">
                    <Link
                      href={`/space/${space.slug}/admin/application/member/${application.id}`}
                    >
                      Review
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ======================================
          MEMBERS
      ====================================== */}

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>

          <CardDescription>Manage roles and membership access.</CardDescription>
        </CardHeader>

        <CardContent>
          {members.length === 0 ? (
            <div className="rounded-xl border border-dashed p-6 text-center">
              <Users className="mx-auto h-5 w-5 text-muted-foreground" />

              <p className="mt-2 text-sm font-medium">No members</p>
            </div>
          ) : (
            <div className="divide-y">
              {members.map((member) => (
                <div
                  key={member.user_id}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={member.profile?.avatar_url || undefined}
                      />

                      <AvatarFallback>
                        {member.profile?.name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <div className="truncate font-medium">
                        {member.profile?.name}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>@{member.profile?.username}</span>

                        <span>·</span>

                        <span className="capitalize">{member.role}</span>
                      </div>

                      {member.is_suspended && (
                        <div className="mt-1 text-xs text-destructive">
                          Suspended
                        </div>
                      )}
                    </div>
                  </div>

                  {member.role !== "owner" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={!!actionLoading}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => changeRole(member, "admin")}
                        >
                          <UserRoundCog className="mr-2 h-4 w-4" />
                          Make admin
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => changeRole(member, "member")}
                        >
                          <Users className="mr-2 h-4 w-4" />
                          Make member
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => toggleSuspension(member)}
                        >
                          {member.is_suspended
                            ? "Restore member"
                            : "Suspend member"}
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => removeMember(member)}
                        >
                          <UserMinus className="mr-2 h-4 w-4" />
                          Remove member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
