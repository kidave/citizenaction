"use client";

import { useEffect, useMemo, useState } from "react";

import Head from "next/head";
import { useRouter } from "next/router";

import { CheckCircle2, XCircle, Users } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

import PageHeader from "@/components/layout/PageHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function MemberApplicationReviewPage() {
  const router = useRouter();
  const { space: spaceSlug, id } = router.query;
  const { user, loading: authLoading } = useAuth();

  const [application, setApplication] = useState(null);
  const [space, setSpace] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [publicAnnouncementNote, setPublicAnnouncementNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!router.isReady || !spaceSlug || !id || !user) return;

    async function loadApplication() {
      setLoading(true);

      const { data, error } = await supabase
        .from("space_member_application")
        .select(`
          id,
          space_id,
          applicant_user_id,
          message,
          status,
          admin_notes,
          reviewed_at,
          created_at,
          applicant:applicant_user_id (
            user_id,
            name,
            username,
            avatar_url
          ),
          space:space_id (
            id,
            name,
            slug,
            logo_url
          )
        `)
        .eq("id", id)
        .single();

      if (error || !data) {
        if (process.env.NODE_ENV !== "production") console.error(error);
        toast.error("Application not found.");
        router.replace(`/space/${spaceSlug}/admin`);
        return;
      }

      setApplication(data);
      setSpace(data.space);
      setAdminNotes(data.admin_notes || "");
      setPublicAnnouncementNote(
        `We are happy to announce and welcome ${data.applicant?.name || "our new member"} to the ${data.space?.name || "Space"} team.`,
      );
      setLoading(false);
    }

    loadApplication();
  }, [router.isReady, spaceSlug, id, user, router]);

  const announcementPreview = useMemo(() => {
    const note = publicAnnouncementNote.trim();
    const message = application?.message?.trim();
    return [note, message ? `Why I\u0027m here:\n“${message}”` : ""]
      .filter(Boolean)
      .join("\n\n");
  }, [publicAnnouncementNote, application?.message]);

  async function publishAnnouncement() {
    const note = publicAnnouncementNote.trim();
    if (!note) throw new Error("Add a public announcement note before approving.");

    const content = [
      note,
      application.message?.trim()
        ? `Why I\u0027m here:\n“${application.message.trim()}”`
        : null,
    ]
      .filter(Boolean)
      .join("\n\n");

    const { data, error } = await supabase.rpc("create_post", {
      p_type: "post",
      p_space_ids: [application.space_id],
      p_title: `Welcome ${application.applicant?.name || "our new member"} to ${space.name}`,
      p_content: content,
      p_content_json: null,
      p_content_format: "text",
      p_metadata: {
        kind: "membership_announcement",
        space_member_application_id: application.id,
        member_user_id: application.applicant_user_id,
        public_announcement_note: note,
      },
      p_start_at: null,
      p_end_at: null,
      p_lat: null,
      p_lng: null,
      p_address: null,
      p_governance_ids: [],
    });

    if (error) throw error;
    return data;
  }

  async function handleReview(action) {
    setSubmitting(true);

    try {
      const { error } = await supabase.rpc("review_space_member_application", {
        p_application_id: id,
        p_action: action,
        p_admin_notes: adminNotes.trim() || null,
      });

      if (error) throw error;

      if (action === "approve") {
        try {
          await publishAnnouncement();
          toast.success("Member approved and announcement published.");
        } catch (announcementError) {
          if (process.env.NODE_ENV !== "production") {
            console.error("Membership announcement failed:", announcementError);
          }
          toast.warning(
            "Member approved, but the public announcement could not be published. You can publish it as a normal post.",
          );
        }
      } else {
        toast.success("Application rejected.");
      }

      router.push(`/space/${spaceSlug}/admin`);
    } catch (error) {
      if (process.env.NODE_ENV !== "production") console.error(error);
      toast.error(error?.message || "Unable to review application.");
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || loading) return <PageLoader />;
  if (!user || !application || !space) return null;

  return (
    <>
      <Head>
        <title>Review Application · {space.name}</title>
      </Head>

      <div className="min-h-dvh bg-muted/30">
        <PageHeader
          items={[
            { label: "Home", href: "/" },
            { label: space.name, href: `/space/${space.slug}` },
            { label: "Administration", href: `/space/${space.slug}/admin` },
            { label: "Membership application" },
          ]}
        />

        <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border bg-muted">
                  {space.logo_url ? (
                    <img src={space.logo_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Users className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-semibold">{space.name}</h1>
                  <p className="text-sm text-muted-foreground">Membership application</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Applicant</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 overflow-hidden rounded-full border bg-muted">
                  {application.applicant?.avatar_url ? (
                    <img src={application.applicant.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-semibold">
                      {application.applicant?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-medium">{application.applicant?.name}</div>
                  <div className="text-sm text-muted-foreground">@{application.applicant?.username}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Why they want to join</CardTitle>
              <CardDescription>Submitted {formatDate(application.created_at)}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border bg-muted/30 p-4">
                <p className="whitespace-pre-wrap text-sm leading-6">{application.message}</p>
              </div>
            </CardContent>
          </Card>

          {application.status === "pending" ? (
            <Card>
              <CardHeader>
                <CardTitle>Review application</CardTitle>
                <CardDescription>
                  Approval adds the user as a member and publishes a normal Space post introducing them.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="public-announcement-note">Public announcement note</Label>
                  <Textarea
                    id="public-announcement-note"
                    value={publicAnnouncementNote}
                    onChange={(event) => setPublicAnnouncementNote(event.target.value)}
                    placeholder="We are happy to announce and invite this member to our team..."
                    rows={4}
                    disabled={submitting}
                  />
                  <p className="text-xs leading-5 text-muted-foreground">
                    This text will be published publicly in the Space feed. The applicant message will appear below it as their introduction.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-notes">Internal admin notes</Label>
                  <Textarea
                    id="admin-notes"
                    value={adminNotes}
                    onChange={(event) => setAdminNotes(event.target.value)}
                    placeholder="Optional internal note..."
                    rows={4}
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Public post preview</div>
                  <div className="rounded-xl border bg-muted/30 p-4">
                    <p className="whitespace-pre-wrap text-sm leading-6">{announcementPreview}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <Button variant="destructive" disabled={submitting} onClick={() => handleReview("reject")}>
                    <XCircle className="mr-2 h-4 w-4" />
                    {submitting ? "Processing..." : "Reject"}
                  </Button>
                  <Button disabled={submitting || !publicAnnouncementNote.trim()} onClick={() => handleReview("approve")}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {submitting ? "Processing..." : "Approve & announce"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Alert>
              <Users />
              <AlertTitle>Application already reviewed</AlertTitle>
              <AlertDescription>This application is already {application.status}.</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </>
  );
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function PageLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
    </div>
  );
}
