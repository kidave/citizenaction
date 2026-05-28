import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useMyProfile } from "@/hooks/user/useMyProfile";
import { useGeographicScopes } from "@/hooks/geography/useGeographicScopes";
import { authFetch } from "@/lib/fetch";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import ScopeSelector from "@/components/shared/ScopeSelector";

/* ---------------------------------- */
/* Schema */
/* ---------------------------------- */

import { clubCreateSchema } from "@/schemas/clubCreate";

/* ---------------------------------- */
/* Page */
/* ---------------------------------- */

export default function CreateClubPage() {
  const router = useRouter();
  const { space: slug } = router.query;

  const { user, loading: authLoading } = useAuth();
  useRequireAuth();

  const { data: profile, isLoading: profileLoading } = useMyProfile();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(clubCreateSchema),
    defaultValues: {
      description: "",
      scope_type: "city",
      scope_code: "",
      contact_email: "",
      contact_phone: "",
    },
  });

  /* ---------------------------------- */
  /* Autofill contact info from profile */
  /* ---------------------------------- */

  useEffect(() => {
    if (!profile) return;

    if (profile.email) {
      form.setValue("contact_email", profile.email);
    }
    if (profile.mobile || profile.phone) {
      form.setValue("contact_phone", profile.mobile || profile.phone);
    }
  }, [profile, form]);

  const scopeType = form.watch("scope_type");
  const scopeCode = form.watch("scope_code");

  const { data: scopes = [], isLoading: scopesLoading } = useGeographicScopes({
    type: scopeType,
    parentCode: null,
    enabled: !!scopeType,
  });

  const selectedScope = scopes?.find((s) => s.code === scopeCode);

  const scopeLogo = selectedScope?.logo_url;
  const scopeCover = selectedScope?.cover_url;
  const scopeName = selectedScope?.name;

  /* ---------------------------------- */
  /* Submit */
  /* ---------------------------------- */

  const onSubmit = async (values) => {
    if (!slug) return;

    setIsSubmitting(true);

    try {
      await authFetch(`/api/space/${slug}/club`, {
        method: "POST",
        body: JSON.stringify({
          ...values,
          name: null,
        }),
      });

      toast.success("Club created successfully!");
      router.push(`/space/${slug}`);
    } catch (error) {
      toast.error(error.message || "Failed to create club");
      console.error("Create club error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------------------------- */
  /* Loading states */
  /* ---------------------------------- */

  if (authLoading || profileLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8 flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) return null;
  if (!slug) {
    return (
      <div className="flex h-64 items-center justify-center">
        Loading space…
      </div>
    );
  }

  /* ---------------------------------- */
  /* Render */
  /* ---------------------------------- */

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <Link
          href={`/space/${slug}`}
          className="inline-flex items-center justify-center rounded-md border p-2 hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div>
          <h1 className="text-2xl font-semibold">Create Club</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <p className="text-sm text-muted-foreground">
            Creating a club which will represent a geographic area within {slug}
            .
          </p>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Geographic Scope */}
              <FormField
                control={form.control}
                name="scope_type"
                render={() => (
                  <ScopeSelector
                    value={{
                      scope_type: form.watch("scope_type"),
                      scope_code: form.watch("scope_code"),
                    }}
                    onChange={({ scope_type, scope_code }) => {
                      form.setValue("scope_type", scope_type, {
                        shouldValidate: true,
                      });
                      form.setValue("scope_code", scope_code, {
                        shouldValidate: true,
                      });
                    }}
                  />
                )}
              />

              {/* Hidden scope_code */}
              <FormField
                control={form.control}
                name="scope_code"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input type="hidden" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Purpose, responsibilities, or focus of this club"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contact_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="club@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+91 9876543210"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Public Club Preview */}
              <div className="space-y-3 rounded-md border bg-muted/30 p-4 text-sm">
                <div>
                  <p className="font-medium">Club Identity</p>
                  <p className="text-muted-foreground">
                    This is how the club will appear publicly once created.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  {scopeLogo && (
                    <Image
                      src={scopeLogo}
                      alt="Scope logo"
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-md border bg-background object-contain"
                    />
                  )}

                  <div>
                    <p className="font-medium">
                      {scopeName || "Selected Geographic Area"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Club name and branding are derived from the selected
                      geographic area.
                    </p>
                  </div>
                </div>

                <div className="space-y-1 border-t pt-2">
                  <p>
                    Name:{" "}
                    <span className="font-medium">
                      {profile?.name || "Not set"}
                    </span>
                  </p>
                  <p>
                    Email:{" "}
                    <span className="font-medium">
                      {form.watch("contact_email") || "Not set"}
                    </span>
                  </p>
                  <p>
                    Phone:{" "}
                    <span className="font-medium">
                      {form.watch("contact_phone") || "Not set"}
                    </span>
                  </p>
                </div>

                <p className="text-xs text-muted-foreground">
                  You can update contact details or customise the club name
                  later from the club settings.
                  <br />
                  If you want to create a club without public contact info just
                  leave the fields blank.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Club"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
