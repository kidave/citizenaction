"use client";

import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ArrowLeft, CheckCircle2, Clock3, XCircle } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Separator } from "@/components/ui/separator";

import { Textarea } from "@/components/ui/textarea";

export default function SpaceApplicationAdminPage() {
  const router = useRouter();

  const { id } = router.query;

  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [application, setApplication] = useState(null);

  const [categories, setCategories] = useState([]);

  const [categoryId, setCategoryId] = useState("");

  const [adminNotes, setAdminNotes] = useState("");

  /* ========================================
     LOAD
  ======================================== */

  useEffect(() => {
    if (!router.isReady || !user || !id) {
      return;
    }

    async function loadApplication() {
      setLoading(true);

      /* ==============================
         CHECK ADMIN
      ============================== */

      const { data: profile, error: profileError } = await supabase
        .from("profile")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (profileError || profile?.role !== "admin") {
        router.replace("/404");
        return;
      }

      /* ==============================
         LOAD APPLICATION
      ============================== */

      const { data: applicationData, error: applicationError } = await supabase
        .from("space_application")
        .select(
          `
          *,
          official_category:category_id (
            id,
            name,
            slug
          )
        `,
        )
        .eq("id", id)
        .single();

      if (applicationError || !applicationData) {
        router.replace("/404");
        return;
      }

      /* ==============================
         LOAD CATEGORIES
      ============================== */

      const { data: categoryData, error: categoryError } = await supabase
        .from("category")
        .select(
          `
          id,
          name,
          slug,
          description,
          sort_order
        `,
        )
        .order("sort_order", {
          ascending: true,
        });

      if (categoryError) {
        toast.error("Unable to load categories");
        setLoading(false);
        return;
      }

      setApplication(applicationData);

      setCategories(categoryData || []);

      setCategoryId(applicationData.category_id || "");

      setAdminNotes(applicationData.admin_notes || "");

      setLoading(false);
    }

    loadApplication();
  }, [id, user, router, router.isReady]);

  /* ========================================
     SELECTED CATEGORY
  ======================================== */

  const selectedCategory = useMemo(() => {
    return categories.find((category) => category.id === categoryId);
  }, [categories, categoryId]);

  /* ========================================
     APPROVE
  ======================================== */

  async function approveApplication() {
    if (!application) {
      return;
    }

    if (!categoryId) {
      toast.error("Select an official category before approving");

      return;
    }

    setSaving(true);

    const { data, error } = await supabase.rpc("approve_space_application", {
      p_application_id: application.id,
      p_category_id: categoryId,
      p_admin_notes: adminNotes.trim() || null,
    });

    if (error) {
      console.error(error);

      toast.error(error.message);

      setSaving(false);

      return;
    }

    setApplication((current) => ({
      ...current,

      ...(data || {}),

      status: "approved",

      category_id: categoryId,

      official_category: selectedCategory,

      admin_notes: adminNotes.trim() || null,

      reviewed_by: user.id,

      reviewed_at: new Date().toISOString(),
    }));

    toast.success("Space application approved");

    setSaving(false);
  }

  /* ========================================
     REJECT
  ======================================== */

  async function rejectApplication() {
    if (!application) {
      return;
    }

    setSaving(true);

    const { data, error } = await supabase.rpc("reject_space_application", {
      p_application_id: application.id,
      p_admin_notes: adminNotes.trim() || null,
    });

    if (error) {
      console.error(error);

      toast.error(error.message);

      setSaving(false);

      return;
    }

    setApplication((current) => ({
      ...current,

      ...(data || {}),

      status: "rejected",

      admin_notes: adminNotes.trim() || null,

      reviewed_by: user.id,

      reviewed_at: new Date().toISOString(),
    }));

    toast.success("Space application rejected");

    setSaving(false);
  }

  /* ========================================
     LOADING
  ======================================== */

  if (authLoading || loading) {
    return <PageLoader />;
  }

  if (!user || !application) {
    return null;
  }

  const isPending = application.status === "pending";

  /* ========================================
     PAGE
  ======================================== */

  return (
    <>
      <Head>
        <title>Review {application.proposed_name}</title>
      </Head>

      <div className="min-h-dvh bg-muted/30 px-4 py-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* ==================================
              BACK
          ================================== */}

          <Button variant="ghost" asChild className="px-0">
            <Link href="/admin/application/space">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to applications
            </Link>
          </Button>

          {/* ==================================
              APPLICATION
          ================================== */}

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="text-2xl">
                    {application.proposed_name}
                  </CardTitle>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Application #{application.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>

                <StatusBadge status={application.status} />
              </div>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* ==================================
                  APPLICANT INFORMATION
              ================================== */}

              <section className="space-y-5">
                <div>
                  <h2 className="font-semibold">Applicant information</h2>

                  <p className="text-sm text-muted-foreground">
                    Review what the applicant submitted before assigning the
                    official category.
                  </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <InfoItem
                    label="Organization / Initiative"
                    value={application.proposed_name}
                  />

                  <InfoItem
                    label="Requested URL"
                    value={`/${application.proposed_slug}`}
                  />

                  <InfoItem label="Contact email" value={application.email} />

                  <InfoItem
                    label="Contact number"
                    value={application.contact_number}
                  />

                  <InfoItem
                    label="Website"
                    value={application.website || "—"}
                  />

                  <InfoItem
                    label="Address"
                    value={application.address || "—"}
                  />

                  {/* ============================
                      APPLICANT CATEGORY
                  ============================ */}

                  <div className="sm:col-span-2">
                    <InfoItem
                      label="What they say they stand for"
                      value={application.category || "—"}
                    />
                  </div>

                  {/* ============================
                      DESCRIPTION
                  ============================ */}

                  <div className="sm:col-span-2">
                    <InfoItem
                      label="What does the organization do?"
                      value={application.description || "—"}
                    />
                  </div>

                  {/* ============================
                      JUSTIFICATION
                  ============================ */}

                  <div className="sm:col-span-2">
                    <InfoItem
                      label="Why should this Space exist?"
                      value={application.justification || "—"}
                    />
                  </div>
                </div>
              </section>

              <Separator />

              {/* ==================================
                  CATEGORY
              ================================== */}

              <section className="space-y-5">
                <div>
                  <h2 className="font-semibold">Official classification</h2>

                  <p className="text-sm text-muted-foreground">
                    The applicants text is not restricted to a predefined
                    category. Select the official Citizen Action category that
                    best represents the Space.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Citizen Action category</Label>

                  <Select
                    value={categoryId}
                    onValueChange={setCategoryId}
                    disabled={!isPending || saving}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>

                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedCategory?.description && (
                    <p className="text-sm text-muted-foreground">
                      {selectedCategory.description}
                    </p>
                  )}
                </div>
              </section>

              {/* ==================================
                  ADMIN NOTES
              ================================== */}

              <section className="space-y-2">
                <Label>Admin notes</Label>

                <Textarea
                  value={adminNotes}
                  onChange={(event) => setAdminNotes(event.target.value)}
                  placeholder="Add review notes, decision context, or follow-up information..."
                  rows={5}
                  disabled={!isPending || saving}
                />
              </section>

              {/* ==================================
                  REVIEWED STATUS
              ================================== */}

              {!isPending && <ReviewStatus application={application} />}

              {/* ==================================
                  ACTIONS
              ================================== */}

              {isPending && (
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <Button
                    variant="destructive"
                    onClick={rejectApplication}
                    disabled={saving}
                  >
                    <XCircle className="mr-2 h-4 w-4" />

                    {saving ? "Saving..." : "Reject application"}
                  </Button>

                  <Button
                    onClick={approveApplication}
                    disabled={saving || !categoryId}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />

                    {saving ? "Saving..." : "Approve application"}
                  </Button>
                </div>
              )}

              {/* ==================================
                  VISIT SPACE
              ================================== */}

              {application.status === "approved" && (
                <Button asChild>
                  <Link href={`/space/${application.proposed_slug}`}>
                    Visit Space
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

/* ========================================
   STATUS BADGE
======================================== */

function StatusBadge({ status }) {
  if (status === "approved") {
    return (
      <Badge variant="secondary" className="gap-1.5">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Approved
      </Badge>
    );
  }

  if (status === "rejected") {
    return (
      <Badge variant="destructive" className="gap-1.5">
        <XCircle className="h-3.5 w-3.5" />
        Rejected
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1.5">
      <Clock3 className="h-3.5 w-3.5" />
      Pending
    </Badge>
  );
}

/* ========================================
   REVIEW STATUS
======================================== */

function ReviewStatus({ application }) {
  const approved = application.status === "approved";

  return (
    <Alert variant={approved ? "success" : "destructive"}>
      {approved ? <CheckCircle2 /> : <XCircle />}

      <AlertTitle>Application {approved ? "approved" : "rejected"}</AlertTitle>

      <AlertDescription>
        {application.reviewed_at
          ? `Reviewed on ${new Intl.DateTimeFormat("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            }).format(new Date(application.reviewed_at))}.`
          : "This application has already been reviewed."}
      </AlertDescription>
    </Alert>
  );
}

/* ========================================
   INFO ITEM
======================================== */

function InfoItem({ label, value }) {
  return (
    <div>
      <div className="text-sm text-muted-foreground">{label}</div>

      <div className="mt-1 whitespace-pre-wrap font-medium">{value}</div>
    </div>
  );
}

/* ========================================
   LOADER
======================================== */

function PageLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
    </div>
  );
}
