"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Camera,
  Check,
  ImagePlus,
  Loader2,
  SendIcon,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import DotLottieAnimation from "@/components/animation/DotLottieAnimation";
import ScrollButton from "@/components/ui/ScrollButton";
import { supabase } from "@/lib/supabase/client";
import { useMyProfile } from "@/hooks/user/useMyProfile";

const ABOUT_BUCKET = "about";
const faqs = [
  {
    id: "1",
    title: "Who is Citizen Action for?",
    content: "Anyone interested in improving the places around them. You do not need special experience to get started.",
  },
  {
    id: "2",
    title: "Can I create my own Space?",
    content: "Yes. Spaces help organize people, discussions, meetings and projects around a shared topic or place.",
  },
  {
    id: "3",
    title: "What can I share?",
    content: "Issues, ideas, updates, meeting notes, documents, photos and other information that helps move work forward.",
  },
  {
    id: "4",
    title: "Is this another social network?",
    content: "Citizen Action is built around organized civic work: connecting people, places, governance and the record of what a community does together.",
  },
];

const stories = [
  {
    key: "people",
    eyebrow: "01 / PEOPLE",
    title: "Good work starts with people.",
    description: "Bring neighbours, volunteers, researchers and community groups into the same conversation, with a shared place to move ideas forward.",
    imageAlt: "People working together on a local civic initiative",
    imageQuery: "people",
  },
  {
    key: "places",
    eyebrow: "02 / PLACES",
    title: "Every issue belongs somewhere.",
    description: "Connect civic work to real places. Make local context easier to understand, from a street corner to a neighbourhood and beyond.",
    imageAlt: "A map representing local places and civic action",
    imageQuery: "places",
  },
  {
    key: "governance",
    eyebrow: "03 / GOVERNANCE",
    title: "Understand how decisions get made.",
    description: "Explore public institutions, organizations, positions and people so responsibility and relationships are easier to see.",
    imageAlt: "Public institution and civic governance",
    imageQuery: "governance",
  },
  {
    key: "contributions",
    eyebrow: "04 / CONTRIBUTIONS",
    title: "Make the work visible.",
    description: "Keep proposals, reports, photos, documents and updates connected to the effort they support—rather than scattered across chats and inboxes.",
    imageAlt: "Civic documents and project materials",
    imageQuery: "contributions",
  },
  {
    key: "timeline",
    eyebrow: "05 / TIMELINE",
    title: "Keep the history, not just the latest update.",
    description: "Build a shared record of what happened, what changed and what comes next. Progress becomes easier to follow when the story stays together.",
    imageAlt: "A visual record of community project progress",
    imageQuery: "timeline",
  },
];

const features = [
  {
    title: "Spaces",
    animation: "/lottie/city.lottie",
    description: "A shared home for people, conversations, meetings and projects.",
  },
  {
    title: "Geography",
    animation: "/lottie/location.lottie",
    description: "Connect local work to the places it affects.",
  },
  {
    title: "Governance",
    animation: "/lottie/politician.lottie",
    description: "Explore institutions, organizations and public roles.",
  },
  {
    title: "Posts",
    animation: "/lottie/report.lottie",
    description: "Publish ideas, updates, documents and reports.",
  },
  {
    title: "Contributions",
    animation: "/lottie/people.lottie",
    description: "Bring the work of a community into one shared record.",
  },
  {
    title: "Timeline",
    animation: "/lottie/calendar.lottie",
    description: "Follow activity and see how local efforts develop over time.",
  },
];

function ImageSlot({ slot, alt, assets, canEdit, uploadingSlot, onUpload, aspect = "aspect-[16/10]" }) {
  const inputRef = useRef(null);
  const asset = assets[slot];

  return (
    <div className={`group relative ${aspect} overflow-hidden rounded-2xl border bg-muted/40`}>
      {asset?.public_url ? (
        <img
          src={asset.public_url}
          alt={alt}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]"
        />
      ) : (
        <div className="flex h-full min-h-40 flex-col items-center justify-center gap-3 px-6 text-center text-muted-foreground">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border bg-background">
            <ImagePlus className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium text-foreground">Image placeholder</p>
            <p className="mt-1 text-sm">Upload a photo for this section</p>
          </div>
        </div>
      )}
      {canEdit && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onUpload(slot, file);
              event.target.value = "";
            }}
          />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={uploadingSlot === slot}
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-3 right-3 gap-2 shadow-md"
          >
            {uploadingSlot === slot ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : asset?.public_url ? (
              <Camera className="h-4 w-4" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploadingSlot === slot ? "Uploading…" : asset?.public_url ? "Replace image" : "Upload image"}
          </Button>
        </>
      )}
    </div>
  );
}

export default function AboutPage() {
  const { data: profile } = useMyProfile();
  const canEdit = profile?.role === "admin";
  const [assets, setAssets] = useState({});
  const [uploadingSlot, setUploadingSlot] = useState(null);

  useEffect(() => {
    let active = true;
    async function loadAssets() {
      const { data, error } = await supabase
        .from("about_page_assets")
        .select("slot, public_url, storage_path");
      if (error) {
        console.error("Unable to load About page assets", error);
        return;
      }
      if (active) {
        setAssets(Object.fromEntries((data || []).map((asset) => [asset.slot, asset])));
      }
    }
    loadAssets();
    return () => {
      active = false;
    };
  }, []);

  async function handleUpload(slot, file) {
    if (!canEdit) return;
    if (!file.type?.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      toast.error("Images must be 12 MB or smaller.");
      return;
    }

    setUploadingSlot(slot);
    const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const storagePath = `page/${slot}/${crypto.randomUUID()}.${extension}`;
    const previousAsset = assets[slot];

    try {
      const { error: uploadError } = await supabase.storage
        .from(ABOUT_BUCKET)
        .upload(storagePath, file, {
          contentType: file.type,
          cacheControl: "3600",
          upsert: false,
        });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from(ABOUT_BUCKET).getPublicUrl(storagePath);
      const publicUrl = urlData?.publicUrl;
      if (!publicUrl) throw new Error("The image uploaded, but its public URL could not be created.");

      const { error: saveError } = await supabase
        .from("about_page_assets")
        .upsert(
          {
            slot,
            storage_path: storagePath,
            public_url: publicUrl,
            updated_by: profile.user_id,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "slot" },
        );
      if (saveError) throw saveError;

      setAssets((current) => ({
        ...current,
        [slot]: { slot, storage_path: storagePath, public_url: publicUrl },
      }));
      toast.success("About page image updated.");

      if (previousAsset?.storage_path) {
        const { error: removeError } = await supabase.storage
          .from(ABOUT_BUCKET)
          .remove([previousAsset.storage_path]);
        if (removeError) console.warn("Old About page image could not be removed", removeError);
      }
    } catch (error) {
      console.error("About page image upload failed", error);
      toast.error(error?.message || "Could not upload this image.");
    } finally {
      setUploadingSlot(null);
    }
  }

  return (
    <main className="overflow-hidden bg-background">
      <section className="relative isolate">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--primary)/0.12),transparent_55%)]" />
        <div className="mx-auto grid min-h-[78vh] max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
            className="max-w-2xl"
          >
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              People-powered civic action
            </p>
            <h1 className="text-5xl font-semibold leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl">
              Better places
              <br />
              <span className="text-primary">start together.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl">
              The people improving our cities need more than good intentions. They need a way to connect, organize, understand their place and keep the work moving.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-2 rounded-full px-6">
                <Link href="/apply/space">
                  Create a Space <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-6">
                <Link href="/">Explore Citizen Action</Link>
              </Button>
            </div>
            <p className="mt-8 text-sm text-muted-foreground">
              From a local concern to a shared record of progress.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.75, delay: 0.1 }}
            className="relative"
          >
            <ImageSlot
              slot="hero"
              alt="Citizen action happening in a real community"
              assets={assets}
              canEdit={canEdit}
              uploadingSlot={uploadingSlot}
              onUpload={handleUpload}
              aspect="aspect-[4/3] sm:aspect-[5/4]"
            />
            <div className="pointer-events-none absolute -bottom-5 left-4 max-w-[85%] rounded-xl border bg-background/95 p-4 shadow-lg backdrop-blur sm:left-8 sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">A shared purpose</p>
              <p className="mt-1 text-base font-medium sm:text-lg">People. Places. Progress.</p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-y bg-muted/20">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Why Citizen Action</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Everything local action needs.
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl">
              A Space brings people, places, governance, contributions and the history of work together around a shared purpose. Instead of losing context across chats, files and disconnected platforms, keep the work connected.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.45, delay: (index % 3) * 0.06 }}
                className="group rounded-2xl border bg-background p-5 transition-colors hover:bg-muted/30 sm:p-6"
              >
                <div className="flex h-36 items-center justify-start">
                  <DotLottieAnimation src={feature.animation} className="h-full w-40 max-w-full" />
                </div>
                <h3 className="mt-3 text-xl font-semibold tracking-tight">{feature.title}</h3>
                <p className="mt-2 leading-7 text-muted-foreground">{feature.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="mb-14 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">How it comes together</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            From understanding to action.
          </h2>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Civic work is not one post or one meeting. It is a connected story that grows as people contribute.
          </p>
        </div>

        <div className="space-y-20 lg:space-y-28">
          {stories.map((story, index) => (
            <motion.article
              key={story.key}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.12 }}
              transition={{ duration: 0.5 }}
              className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-16 ${index % 2 ? "lg:[&>div:first-child]:order-2" : ""}`}
            >
              <ImageSlot
                slot={story.key}
                alt={story.imageAlt}
                assets={assets}
                canEdit={canEdit}
                uploadingSlot={uploadingSlot}
                onUpload={handleUpload}
                aspect="aspect-[4/3]"
              />
              <div className="max-w-xl py-2">
                <p className="text-sm font-semibold tracking-[0.16em] text-primary">{story.eyebrow}</p>
                <h3 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{story.title}</h3>
                <p className="mt-5 text-lg leading-8 text-muted-foreground">{story.description}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="border-y bg-muted/20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_0.8fr] lg:py-24">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Start anywhere</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Civic action should feel human, local and possible.</h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              Start with a place, a question or a group of people. Build the shared context that helps everyone take the next step.
            </p>
            <Button asChild size="lg" className="mt-8 gap-2 rounded-full px-6">
              <Link href="/apply/space">
                Create your Space <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="rounded-2xl border bg-background p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Check className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold">A shared record of progress</h3>
            </div>
            <p className="mt-4 leading-7 text-muted-foreground">
              Keep the people, context, resources and decisions connected—so the next person can understand what has happened and help move it forward.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-20 sm:px-8 lg:py-24">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Questions</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">A few things you might be wondering.</h2>
        </div>
        <Accordion type="single" collapsible className="mt-10">
          {faqs.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger className="text-left text-base font-semibold sm:text-lg">{item.title}</AccordionTrigger>
              <AccordionContent className="text-base leading-7 text-muted-foreground">{item.content}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="px-5 pb-24 sm:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-primary px-6 py-14 text-primary-foreground sm:px-12 sm:py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] opacity-80">The next chapter starts locally</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">Better places start with organized people.</h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 opacity-90">Bring your people and your purpose together. Then make the work count.</p>
            <Button asChild size="lg" variant="secondary" className="mt-8 gap-2 rounded-full px-6">
              <Link href="/">
                <SendIcon className="h-4 w-4" /> Get started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      <ScrollButton />
    </main>
  );
}

AboutPage.getLayout = (page) => page;
