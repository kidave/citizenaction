// pages/apply/community/[community]/committee.js
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

const committeeSchema = z.object({
  name: z.string().min(2, "Committee name is required"),
  description: z.string().optional(),
  scope_type: z.string().min(1, "Scope type is required"),
  scope_code: z.string().min(1, "Geographic scope is required"),
  contact_email: z.string().email().optional().or(z.literal("")),
  contact_phone: z.string().optional(),
});

export default function CreateCommitteePage() {
  const router = useRouter();
  const { community: slug } = router.query;
  const { user, loading: authLoading } = useAuth();
  useRequireAuth(); // 🔐 Add this for page protection

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const form = useForm({
    resolver: zodResolver(committeeSchema),
    defaultValues: {
      name: "",
      description: "",
      scope_type: "",
      scope_code: "",
      contact_email: user?.email || "",
      contact_phone: "",
    },
  });

  // Load profile
  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      try {
        const data = await authFetch("/api/profile/getProfile");
        setProfile(data);
        
        // Set default values from profile
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

  const onSubmit = async (values) => {
    if (!slug) return;

    setIsSubmitting(true);
    
    try {
      const response = await authFetch(`/api/community/${slug}/apply-committee`, {
        method: "POST",
        body: JSON.stringify(values),
      });

      toast.success(response.message || "Committee created successfully!");
      router.push(`/community/${slug}`);
    } catch (error) {
      toast.error(error.message || "Failed to create committee");
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
        <div className="flex items-center gap-3 mb-8">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return null; // useRequireAuth will redirect
  }

  if (!slug) {
    return <div className="flex justify-center items-center h-64">Loading community...</div>;
  }

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
          <h1 className="text-2xl font-semibold">Create Committee</h1>
          <p className="text-sm text-muted-foreground">
            Creating committee for {slug} as {profile?.name || user.email}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Committee</CardTitle>
          <p className="text-sm text-muted-foreground">
            Create a new committee for your community. You’ll be automatically added as the creator.
          </p>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Committee Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Mumbai Ward 45 Committee" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the purpose and activities of this committee"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Scope Selector */}
              <FormField
                control={form.control}
                name="scope_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Geographic Scope *</FormLabel>
                    <FormControl>
                      <ScopeSelector
                        onScopeChange={(type, code) => {
                          field.onChange(type);
                          form.setValue("scope_code", code);
                        }}
                        defaultType="city"
                        defaultCountry="IN"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Hidden field for scope_code */}
              <FormField
                control={form.control}
                name="scope_code"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input {...field} type="hidden" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                          placeholder="committee@example.com" 
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

              <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-md">
                <p className="font-medium mb-1">Your Information:</p>
                <p>Name: {profile?.name || "Not set"}</p>
                <p>Email: {profile?.email || user.email}</p>
                <p>Phone: {profile?.mobile || profile?.phone || "Not set"}</p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Committee"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}