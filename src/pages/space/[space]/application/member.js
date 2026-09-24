"use client";

import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Users } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import { useSpaces } from "@/hooks/space/useSpaces";
import { useApplyToSpace } from "@/hooks/space/useApplyToSpace";
import ApplicationTopbar from "@/components/application/ApplicationTopbar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function SpaceMemberApplicationPage() {
  const router = useRouter();
  const { space: spaceSlug } = router.query;
  const { user, loading: authLoading } = useAuth();
  const { data: space, isLoading: spaceLoading, isError: spaceError } =
    useSpaces({
      slug: spaceSlug,
    });
  const { applyToSpace, isApplying } = useApplyToSpace();
  const [message, setMessage] = useState("");

  const loading = authLoading || spaceLoading;

  if (loading) return <PageLoader />;

  if (spaceError) {
    toast.error("Unable to load this Space.");
    return null;
  }

  if (!space) {
    router.replace("/404");
    return null;
  }

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

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmedMessage = message.trim();

    if (trimmedMessage.length < 100) {
      toast.error(
        "Please write at least 100 characters about why you want to join."
      );
      return;
    }

    try {
      const data = await applyToSpace({
        spaceId: space.id,
        message: trimmedMessage,
      });

      toast.success("Your membership application has been submitted.");
      router.push(`/space/${space.slug}/application/member/${data.id}`);
    } catch (error) {
      console.error("Membership application failed:", error);
      toast.error(error?.message || "Unable to submit your application.");
    }
  }

  return (
    <>
      <Head>
        <title>Become a Member · {space.name}</title>
      </Head>

      <ApplicationTopbar
        items={[
          { label: "Home", href: "/" },
          { label: "Spaces", href: "/space" },
          { label: space.name, href: `/space/${space.slug}` },
          { label: "Become a Member" },
        ]}
        title="Become a Member"
        backHref={`/space/${space.slug}`}
      />

      <div className="min-h-dvh bg-muted/30 px-4 py-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <Card>
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-4">
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

          <Card>
            <CardHeader>
              <CardTitle>Become a member</CardTitle>
              <CardDescription>
                Your response will be publicly displayed if your membership is
                approved. Please write something you are comfortable sharing
                publicly.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Introduce yourself to the community and share why you would like to be part of this Space."
                    rows={7}
                    maxLength={1000}
                    disabled={isApplying}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Minimum 100 characters</span>
                    <span>{message.length}/1000</span>
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    asChild
                    disabled={isApplying}
                  >
                    <Link href={`/space/${space.slug}`}>Cancel</Link>
                  </Button>
                  <Button
                    type="submit"
                    disabled={isApplying || message.trim().length < 100}
                  >
                    {isApplying ? "Submitting..." : "Apply to become a member"}
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

function PageLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
    </div>
  );
}
