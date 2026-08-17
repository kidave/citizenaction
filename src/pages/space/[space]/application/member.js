"use client";

import { useEffect, useState } from "react";

import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import { Users } from "lucide-react";

import { toast } from "sonner";

import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

import BackButton from "@/components/ui/back-button";

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

export default function SpaceMemberApplicationPage() {
  const router = useRouter();

  /*
   * ========================================
   * ROUTE
   * ========================================
   *
   * pages/space/[space]/application/member.js
   *
   * Therefore:
   *
   * router.query.space
   */

  const { space: spaceSlug } = router.query;

  const { user, loading: authLoading } = useAuth();

  const [space, setSpace] = useState(null);

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  /* ========================================
     LOAD SPACE
  ======================================== */

  useEffect(() => {
    if (!router.isReady || !spaceSlug) {
      return;
    }

    async function loadSpace() {
      setLoading(true);

      const { data, error } = await supabase
        .from("space")
        .select(
          `
          id,
          name,
          slug,
          description,
          logo_url
        `,
        )
        .eq("slug", spaceSlug)
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        console.error("Failed to load Space:", error);

        toast.error("Unable to load this Space.");

        setLoading(false);

        return;
      }

      if (!data) {
        router.replace("/404");

        return;
      }

      setSpace(data);

      setLoading(false);
    }

    loadSpace();
  }, [router.isReady, spaceSlug, router]);

  /* ========================================
     LOADING
  ======================================== */

  if (authLoading || loading) {
    return <PageLoader />;
  }

  /* ========================================
     NOT LOGGED IN
  ======================================== */

  if (!user) {
    return (
      <>
        <Head>
          <title>Become a Member</title>
        </Head>

        <div className="flex min-h-dvh items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardContent className="space-y-5 p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-semibold">Sign in required</h1>

                <p className="text-sm text-muted-foreground">
                  You need to sign in before applying to become a member of this
                  Space.
                </p>
              </div>

              <Button asChild className="w-full">
                <Link href={`/space/${spaceSlug}`}>Back to Space</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  /* ========================================
     SPACE
  ======================================== */

  if (!space) {
    return null;
  }

  /* ========================================
     SUBMIT
  ======================================== */

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (trimmedMessage.length < 10) {
      toast.error("Please tell us a little more about why you want to join.");

      return;
    }

    setSubmitting(true);

    const { data, error } = await supabase.rpc("apply_to_space", {
      p_space_id: space.id,
      p_message: trimmedMessage,
    });

    setSubmitting(false);

    if (error) {
      console.error("Membership application failed:", error);

      toast.error(error.message || "Unable to submit your application.");

      setSubmitting(false);

      return;
    }

    toast.success("Your membership application has been submitted.");

    router.push(`/space/${space.slug}/application/member/${data.id}`);
  }

  /* ========================================
     PAGE
  ======================================== */

  return (
    <>
      <Head>
        <title>Become a Member · {space.name}</title>
      </Head>

      <div className="min-h-dvh bg-muted/30 px-4 py-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* ==================================
              BACK
          ================================== */}

          <BackButton label="Back" />

          {/* ==================================
              SPACE HEADER
          ================================== */}

          <Card>
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-4">
                {/* ==============================
                    SPACE LOGO
                ============================== */}

                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border bg-muted">
                  {space.logo_url ? (
                    <img
                      src={space.logo_url}
                      alt={`${space.name} logo`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Users className="h-7 w-7 text-muted-foreground" />
                  )}
                </div>

                {/* ==============================
                    SPACE INFORMATION
                ============================== */}

                <div className="min-w-0">
                  <h1 className="truncate text-2xl font-semibold tracking-tight">
                    {space.name}
                  </h1>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Become a member
                  </p>
                </div>
              </div>

              {space.description && (
                <p className="mt-6 text-sm leading-6 text-muted-foreground">
                  {space.description}
                </p>
              )}
            </CardContent>
          </Card>

          {/* ==================================
              APPLICATION
          ================================== */}

          <Card>
            <CardHeader>
              <CardTitle>Become a member</CardTitle>

              <CardDescription>
                Tell the Space administrators a little about why you want to
                join and how you would like to participate.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* ==============================
                    MESSAGE
                ============================== */}

                <div className="space-y-2">
                  <Label htmlFor="message">
                    Why do you want to become a member?
                  </Label>

                  <Textarea
                    id="message"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Tell us about your interest in this Space, what you would like to contribute, or why this community matters to you..."
                    rows={7}
                    maxLength={1000}
                    disabled={submitting}
                  />

                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Minimum 10 characters</span>

                    <span>{message.length}/1000</span>
                  </div>
                </div>

                {/* ==============================
                    ACTIONS
                ============================== */}

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    asChild
                    disabled={submitting}
                  >
                    <Link href={`/space/${space.slug}`}>Cancel</Link>
                  </Button>

                  <Button
                    type="submit"
                    disabled={submitting || message.trim().length < 10}
                  >
                    {submitting ? "Submitting..." : "Apply to become a member"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

/* ========================================
   PAGE LOADER
======================================== */

function PageLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
    </div>
  );
}
