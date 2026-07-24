"use client";

import { useRouter } from "next/navigation";
import BackButton from "@/components/ui/back-button";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building2,
  Plus,
  Users,
  Megaphone,
  CalendarDays,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

import { LoginModal } from "@/components/auth/LoginModal";
import { spaceApplicationSchema } from "@/schemas/spaceApplication";
import { supabase } from "@/lib/supabase/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SOCIAL_PLATFORMS = [
  "Instagram",
  "Twitter",
  "LinkedIn",
  "Facebook",
  "YouTube",
  "WhatsApp",
  "Telegram",
  "Discord",
  "Website",
  "Other",
];

export default function ApplySpace() {
  const { user, loading: authLoading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const router = useRouter();
  const [socialLinks, setSocialLinks] = useState([]);
  const [socialPlatform, setSocialPlatform] = useState("Instagram");
  const [socialValue, setSocialValue] = useState("");
  const form = useForm({
    resolver: zodResolver(spaceApplicationSchema),

    defaultValues: {
      proposed_name: "",
      proposed_slug: "",
      category: "",
      description: "",
      justification: "",
      email: "",
      contact_number: "",
      address: "",
      website: "",
      social_links: [],
    },
  });

  if (authLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    );
  }

  function addSocialLink() {
    if (!socialValue.trim()) {
      return;
    }

    const updated = [
      ...socialLinks,
      {
        platform: socialPlatform,
        value: socialValue.trim(),
      },
    ];

    setSocialLinks(updated);

    form.setValue("social_links", updated);

    setSocialValue("");
  }

  function removeSocialLink(index) {
    const updated = socialLinks.filter((_, i) => i !== index);

    setSocialLinks(updated);

    form.setValue("social_links", updated);
  }

  async function onSubmit(values) {
    if (!user) {
      setShowLogin(true);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("space_application")
        .insert({
          ...values,
          applicant_user_id: user.id,
        })
        .select(
          `
        id,
        proposed_name,
        status
      `,
        )
        .single();

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Application submitted successfully");
      router.push(`/space/application/${data.id}`);
    } catch (err) {
      toast.error("Something went wrong");
    }
  }

  return (
    <div className="min-h-dvh px-4 py-6">
      <div className="mx-auto w-full max-w-4xl space-y-2">
        <BackButton label="Back" />

        <div>
          <CardContent className="space-y-4 p-4">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border-2 bg-muted px-4 py-2 text-sm font-medium">
                <Building2 className="h-4 w-4" />
                Register a Space
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="rounded-xl border-2 bg-muted p-5">
                <div className="flex gap-4">
                  <Megaphone className="mb-4 h-6 w-6" />

                  <h3 className="mb-1 font-semibold">Share Updates</h3>
                </div>

                <p className="text-sm text-muted-foreground">
                  Post reports, updates, and minutes of meetings.
                </p>
              </Card>

              <Card className="rounded-xl border-2 bg-muted p-5">
                <div className="flex gap-4">
                  <CalendarDays className="mb-4 h-6 w-6" />

                  <h3 className="mb-1 font-semibold">Organize Events</h3>
                </div>

                <p className="text-sm text-muted-foreground">
                  Coordinate meetings and community actions.
                </p>
              </Card>

              <Card className="rounded-xl border-2 bg-muted p-5">
                <div className="flex gap-4">
                  <Users className="mb-4 h-6 w-6" />

                  <h3 className="mb-1 font-semibold">Build Community</h3>
                </div>

                <p className="text-sm text-muted-foreground">
                  Bring volunteers and local stakeholders together.
                </p>
              </Card>
            </div>
          </CardContent>
        </div>

        <div>
          <CardHeader className="space-y-2">
            <h2 className="text-2xl">
              Tell us a little about your organization or initiative.
            </h2>

            {!user && (
              <Card className="bg-warning px-4 py-3 text-sm">
                Sign in required
              </Card>
            )}
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <div className="grid gap-5 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="proposed_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization / Initiative Name</FormLabel>

                        <FormControl className="bg-muted">
                          <Input
                            placeholder="Mumbai Walkability Forum"
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="proposed_slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Space URL</FormLabel>

                        <FormControl className="bg-muted">
                          <Input placeholder="mumbai-walkability" {...field} />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category (optional)</FormLabel>

                        <FormControl className="bg-muted">
                          <Input
                            placeholder="Mobility, Heritage, Environment..."
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website (optional)</FormLabel>

                        <FormControl className="bg-muted">
                          <Input placeholder="https://example.org" {...field} />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What does your organization do?</FormLabel>

                        <FormControl className="bg-muted">
                          <Textarea
                            rows={4}
                            placeholder="Tell us about your mission, goals, or work..."
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="justification"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Why should this space exist?</FormLabel>

                        <FormControl className="bg-muted">
                          <Textarea
                            rows={4}
                            placeholder="How will this space help people organize or collaborate?"
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email</FormLabel>

                        <FormControl className="bg-muted">
                          <Input
                            type="email"
                            placeholder="contact@example.org"
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number</FormLabel>

                        <FormControl className="bg-muted">
                          <Input placeholder="+91 9876543210" {...field} />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Address (optional)</FormLabel>

                        <FormControl className="bg-muted">
                          <Textarea
                            rows={3}
                            placeholder="Organization or office address"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-semibold">Social Links</h3>
                  </div>

                  <div className="flex flex-col gap-3 md:flex-row">
                    <Select
                      value={socialPlatform}
                      onValueChange={setSocialPlatform}
                    >
                      <SelectTrigger className="bg-muted md:w-56">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        {SOCIAL_PLATFORMS.map((platform) => (
                          <SelectItem key={platform} value={platform}>
                            {platform}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      className="bg-muted"
                      value={socialValue}
                      onChange={(e) => setSocialValue(e.target.value)}
                      placeholder="@username or URL"
                    />

                    <Button type="button" onClick={addSocialLink}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add
                    </Button>
                  </div>

                  {!!socialLinks.length && (
                    <div className="flex flex-wrap gap-2">
                      {socialLinks.map((social, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => removeSocialLink(index)}
                          className="rounded-full border-2 bg-muted px-3 py-1.5 text-sm transition hover:bg-destructive hover:text-white"
                        >
                          {social.platform}: {social.value}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="h-14 w-full rounded-2xl text-base font-bold"
                >
                  {form.formState.isSubmitting
                    ? "Submitting..."
                    : user
                      ? "Submit Application"
                      : "Sign in to Continue"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </div>
      </div>

      <LoginModal
        open={showLogin}
        onOpenChange={setShowLogin}
        redirectPath="/apply/space"
        message="You need to sign in before submitting"
      />
    </div>
  );
}
