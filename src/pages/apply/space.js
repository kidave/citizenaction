"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

import { LoginModal } from "@/components/auth/LoginModal";
import ApplicationTopbar from "@/components/application/ApplicationTopbar";
import SpaceConceptStrip from "@/components/application/SpaceConceptStrip";
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
    if (!socialValue.trim()) return;

    const updated = [
      ...socialLinks,
      { platform: socialPlatform, value: socialValue.trim() },
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
        .insert({ ...values, applicant_user_id: user.id })
        .select(`id, proposed_name, status`)
        .single();

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Application submitted successfully");
      router.push(`/application/space/${data.id}`);
    } catch (err) {
      toast.error("Something went wrong");
    }
  }

  return (
    <div className="mx-auto w-full">
      <ApplicationTopbar
        items={[{ label: "Home", href: "/" }, { label: "Apply for a Space" }]}
        title="Apply for a Space"
        backHref="/"
      />

      <main className="mx-auto w-full max-w-4xl px-4 py-5 sm:px-6 sm:py-6">
        <SpaceConceptStrip />

        <div className="mb-8 mt-8">
          <p className="text-sm font-medium text-primary">Create something useful</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Tell us about your Space
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Give people a clear place to organize around a purpose, a community,
            or a place.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
            <section className="space-y-5">
              <div>
                <h2 className="text-base font-semibold">Identity</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose how your Space will appear to people.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="proposed_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization / Initiative Name</FormLabel>
                      <FormControl className="bg-muted">
                        <Input placeholder="Mumbai Walkability Forum" {...field} />
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
            </section>

            <section className="space-y-5 border-t pt-8">
              <div>
                <h2 className="text-base font-semibold">Purpose</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Help people understand what this Space is for.
                </p>
              </div>

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
                    <FormLabel>Why should this Space exist?</FormLabel>
                    <FormControl className="bg-muted">
                      <Textarea
                        rows={4}
                        placeholder="How will this Space help people organize or collaborate?"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            <section className="space-y-5 border-t pt-8">
              <div>
                <h2 className="text-base font-semibold">Contact</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Give us a way to reach the people responsible for this Space.
                </p>
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
            </section>

            <section className="space-y-5 border-t pt-8">
              <div>
                <h2 className="text-base font-semibold">Social presence</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add public links that help people find or verify your work.
                </p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <Select value={socialPlatform} onValueChange={setSocialPlatform}>
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
                    <Button
                      key={index}
                      type="button"
                      onClick={() => removeSocialLink(index)}
                      className="rounded-full"
                      variant="outline"
                    >
                      {social.platform}: {social.value}
                    </Button>
                  ))}
                </div>
              )}
            </section>

            <div className="border-t pt-8">
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
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Your application will be reviewed before the Space is created.
              </p>
            </div>
          </form>
        </Form>
      </main>

      <LoginModal
        open={showLogin}
        onOpenChange={setShowLogin}
        redirectPath="/apply/space"
        message="You need to sign in before submitting"
      />
    </div>
  );
}
