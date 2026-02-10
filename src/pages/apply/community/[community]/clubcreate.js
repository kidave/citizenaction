import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { authFetch } from "@/lib/fetch";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
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

const clubSchema = z.object({
  name: z.string().min(2, "Club name is required"),
  description: z.string().optional(),
  scope_type: z.string().min(1, "Scope type is required"),
  scope_code: z.string().min(1, "Geographic scope is required"),
  contact_email: z.string().email().optional().or(z.literal("")),
  contact_phone: z.string().optional(),
});

/* ---------------------------------- */
/* Page */
/* ---------------------------------- */

export default function CreateClubPage() {
  const router = useRouter();
  const { community: slug } = router.query;

  const { user, loading: authLoading } = useAuth();
  useRequireAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const form = useForm({
    resolver: zodResolver(clubSchema),
    defaultValues: {
      name: "",
      description: "",
      scope_type: "city",
      scope_code: "",
      contact_email: user?.email || "",
      contact_phone: "",
    },
  });

  /* ---------------------------------- */
  /* Load profile */
  /* ---------------------------------- */

  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      try {
        const data = await authFetch("/api/profile/getProfile");
        setProfile(data);

        if (data?.email) {
          form.setValue("contact_email", data.email);
        }
        if (data?.mobile || data?.phone) {
          form.setValue("contact_phone", data.mobile || data.phone);
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [user, form]);

  /* ---------------------------------- */
  /* Submit */
  /* ---------------------------------- */

  const onSubmit = async (values) => {
    if (!slug) return;

    setIsSubmitting(true);

    try {
      const response = await authFetch(
        `/api/community/${slug}/apply-club`,
        {
          method: "POST",
          body: JSON.stringify(values),
        }
      );

      toast.success(response.message || "Club created successfully!");
      router.push(`/community/${slug}`);
    } catch (error) {
      toast.error(error.message || "Failed to create club");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------------------------- */
  /* Loading states */
  /* ---------------------------------- */

  if (authLoading || profileLoading) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!user) return null;
  if (!slug) return <div>Loading community…</div>;

  /* ---------------------------------- */
  /* Render */
  /* ---------------------------------- */

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href={`/community/${slug}`}
          className="inline-flex items-center justify-center rounded-md border p-2 hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div>
          <h1 className="text-2xl font-semibold">Create Club</h1>
          <p className="text-sm text-muted-foreground">
            Creating club for {slug}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Club</CardTitle>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              {/* Club Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Club Name *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Scope Selector */}
              <FormField
                control={form.control}
                name="scope_type"
                render={() => (
                  <FormItem>
                    <FormLabel>Geographic Scope *</FormLabel>

                    <FormControl>
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
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />


              {/* Hidden scope_code */}
              <input
                type="hidden"
                {...form.register("scope_code")}
              />

              {/* Submit */}
              <div className="flex gap-3 pt-4">
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
