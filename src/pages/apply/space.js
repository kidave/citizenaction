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
import { ProtectedButton } from "@/components/auth/ProtectedButton";
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

  /* ========================================
     LOADING
  ======================================== */

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    );
  }

  /* ========================================
     ADD SOCIAL LINK
  ======================================== */

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

  /* ========================================
     REMOVE SOCIAL LINK
  ======================================== */

  function removeSocialLink(index) {
    const updated = socialLinks.filter((_, i) => i !== index);

    setSocialLinks(updated);

    form.setValue("social_links", updated);
  }

  /* ========================================
     SUBMIT
  ======================================== */

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

  /* ========================================
     PAGE
  ======================================== */

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-6">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        {/* ====================================
            BACK
        ==================================== */}

        <BackButton label="Back" />

        {/* ====================================
            HERO
        ==================================== */}

        <Card className="overflow-hidden rounded-[32px] border-4 bg-gradient-to-br from-primary/10 via-background to-pink-100">
          <CardContent className="space-y-6 p-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border-2 bg-background px-4 py-2 text-sm font-medium">
                <Building2 className="h-4 w-4" />
                Civic Spaces
              </div>

              <h1 className="text-4xl font-black tracking-tight">
                Start a Civic Space
              </h1>

              <p className="max-w-2xl text-muted-foreground">
                Organize civic actions, coordinate volunteers, host meetings,
                publish updates, and build local communities around causes that
                matter.
              </p>
            </div>

            {/* BENEFITS */}

            <div className="grid gap-4 md:grid-cols-3">
              <BenefitCard
                icon={Megaphone}
                title="Share Updates"
                description="Post reports, updates, and civic issues."
              />

              <BenefitCard
                icon={CalendarDays}
                title="Host Events"
                description="Coordinate meetings and community actions."
              />

              <BenefitCard
                icon={Users}
                title="Build Community"
                description="Bring volunteers and local stakeholders together."
              />
            </div>
          </CardContent>
        </Card>

        {/* ====================================
            FORM
        ==================================== */}

        <Card className="rounded-[32px] border-4">
          <CardHeader className="space-y-2">
            <h2 className="text-2xl font-black">Application</h2>

            <p className="text-sm text-muted-foreground">
              Tell us a little about your organization or initiative.
            </p>

            {!user && (
              <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Sign in is required before submitting your application.
              </div>
            )}
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                {/* ==================================
                    BASIC INFO
                ================================== */}

                <div className="grid gap-5 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="proposed_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization / Initiative Name</FormLabel>

                        <FormControl>
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

                        <FormControl>
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

                        <FormControl>
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

                        <FormControl>
                          <Input placeholder="https://example.org" {...field} />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* ==================================
                    DESCRIPTION
                ================================== */}

                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What does your organization do?</FormLabel>

                        <FormControl>
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

                        <FormControl>
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

                {/* ==================================
                    CONTACT
                ================================== */}

                <div className="grid gap-5 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email</FormLabel>

                        <FormControl>
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

                        <FormControl>
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

                        <FormControl>
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

                {/* ==================================
                    SOCIAL LINKS
                ================================== */}

                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-semibold">Social Links</h3>

                    <p className="text-sm text-muted-foreground">
                      Add social profiles or public pages.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 md:flex-row">
                    <Select
                      value={socialPlatform}
                      onValueChange={setSocialPlatform}
                    >
                      <SelectTrigger className="md:w-56">
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

                {/* ==================================
                    SUBMIT
                ================================== */}

                <ProtectedButton
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="h-14 w-full rounded-2xl text-base font-bold"
                  loginMessage="You need to sign in before submitting"
                >
                  {form.formState.isSubmitting
                    ? "Submitting..."
                    : user
                      ? "Submit Application"
                      : "Sign in to Continue"}
                </ProtectedButton>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* ========================================
          LOGIN MODAL
      ======================================== */}

      <LoginModal
        open={showLogin}
        onOpenChange={setShowLogin}
        redirectPath="/apply/space"
        message="You need to sign in before submitting"
      />
    </div>
  );
}

/* ==========================================
   BENEFIT CARD
========================================== */

function BenefitCard({ icon: Icon, title, description }) {
  return (
    <div className="rounded-3xl border-2 bg-background/80 p-5 backdrop-blur-sm">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border-2 bg-primary/10">
        <Icon className="h-5 w-5" />
      </div>

      <div className="space-y-1">
        <h3 className="font-bold">{title}</h3>

        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
