"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

import { LoginModal } from "@/components/auth/LoginModal";
import ApplicationTopbar from "@/components/application/ApplicationTopbar";
import DotLottieAnimation from "@/components/ui/DotLottieAnimation";
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

const STORY = [
  {
    title: "Start with a Space",
    description:
      "Give your local work a home where people, ideas and discussions can come together.",
    animation: "/lottie/city.lottie",
  },
  {
    title: "Connect it to a place",
    description:
      "Make the work easier to understand by connecting it to the neighbourhoods and places it affects.",
    animation: "/lottie/location.lottie",
  },
  {
    title: "Bring people together",
    description:
      "A Space can become a shared place for contributions, updates, documents and the work that follows.",
    animation: "/lottie/people.lottie",
  },
  {
    title: "Keep the story moving",
    description:
      "Over time, the Space becomes a living record of what happened and what comes next.",
    animation: "/lottie/calendar.lottie",
  },
];

export default function ApplySpace() {
  const { user, loading: authLoading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);
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

  const currentStory = STORY[storyIndex];

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

      <div className="mx-auto w-full max-w-4xl space-y-8 p-4 sm:px-6">
        <section className="relative overflow-hidden py-2 sm:py-4" aria-label="How Spaces work">
          <div className="grid items-center gap-6 md:grid-cols-[180px_1fr]">
            <div className="flex justify-center md:justify-start">
              <motion.div
                key={currentStory.animation}
                initial={{ opacity: 0, scale: 0.92, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="h-32 w-32 sm:h-36 sm:w-36"
              >
                <DotLottieAnimation
                  src={currentStory.animation}
                  className="h-full min-h-0 w-full"
                />
              </motion.div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                <span>How it works</span>
                <span aria-hidden="true">·</span>
                <span>{storyIndex + 1}/{STORY.length}</span>
              </div>

              <motion.div
                key={storyIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-2"
              >
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  {currentStory.title}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {currentStory.description}
                </p>
              </motion.div>

              <div className="mt-4 flex items-center gap-2">
                {STORY.map((story, index) => (
                  <button
                    key={story.title}
                    type="button"
                    aria-label={`Show story step ${index + 1}`}
                    onClick={() => setStoryIndex(index)}
                    className={`h-1.5 rounded-full transition-all ${
                      index === storyIndex ? "w-8 bg-foreground" : "w-2 bg-border hover:bg-muted-foreground/50"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                      <Input type="email" placeholder="contact@example.org" {...field} />
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
                      <Textarea rows={3} placeholder="Organization or office address" {...field} />
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
