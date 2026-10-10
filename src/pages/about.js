"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ImagePlus, Loader2, SendIcon, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ScrollButton from "@/components/ui/ScrollButton";
import DotLottieAnimation from "@/components/animation/DotLottieAnimation";
import { supabase } from "@/lib/supabase/client";
import { useMyProfile } from "@/hooks/user/useMyProfile";

const faqs = [
  {
    id: "1",
    title: "Who is this for?",
    content:
      "Anyone interested in improving places around them. No special experience required.",
  },
  {
    id: "2",
    title: "Can I create my own Space?",
    content:
      "Yes. Spaces help organize people, discussions, meetings and projects around a topic or place.",
  },
  {
    id: "3",
    title: "What can I post?",
    content:
      "Issues, ideas, updates, meeting notes, documents, photos and anything that helps move work forward.",
  },
  {
    id: "4",
    title: "Is this another social network?",
    content:
      "Not really. It's designed for organizing work and keeping useful information in one place. It's not for sharing personal updates or photos.",
  },
];

const title1 = "Local action,";
const title2 = "made simple.";

const features = [
  {
    title: "Space",
    media: "image",
    slot: "space",
    imageAlt: "People organizing local action together",
    description:
      "Bring people, discussions, meetings and projects together around a topic or place.",
  },
  {
    title: "Geography",
    animation: "/lottie/location.lottie",
    description:
      "Connect civic work to the places it affects, from neighbourhoods to larger geographic areas.",
  },
  {
    title: "Governance",
    media: "image",
    slot: "governance",
    imageAlt: "Public institutions and local governance",
    description:
      "Explore organizations, public institutions and the people and positions that make up local governance.",
  },
  {
    title: "Post",
    animation: "/lottie/report.lottie",
    description:
      "Share issues, ideas, updates, documents and other information that helps move work forward.",
  },
  {
    title: "Contribution",
    animation: "/lottie/people.lottie",
    description:
      "Turn ideas, issues, updates, documents and discussions into a shared record of civic work.",
  },
  {
    title: "Timeline",
    animation: "/lottie/calendar.lottie",
    description:
      "Follow what has happened in a Space over time and keep the history of local work visible.",
  },
];

const ABOUT_BUCKET = "about";
function FeatureImage({ feature, asset, canEdit, uploading, onUpload }) {
  const inputRef = useRef(null);

  return (
    <div className="group relative flex h-full min-h-0 w-full items-center justify-center overflow-hidden rounded-xl">
      {asset?.public_url ? (
        <img
          src={asset.public_url}
          alt={feature.imageAlt || feature.title}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/30 px-4 text-center text-muted-foreground">
          <ImagePlus className="h-7 w-7" />
          <span className="text-sm">Add {feature.title.toLowerCase()} image</span>
          {canEdit && <span className="text-xs">Upload an image for this section</span>}
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
              if (file) onUpload(feature.slot, file);
              event.target.value = "";
            }}
          />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => inputRef.current?.click()}
            disabled={uploading === feature.slot}
            className="absolute bottom-2 right-2 h-8 gap-2 rounded-full px-3 text-xs shadow-md"
          >
            {uploading === feature.slot ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="h-3.5 w-3.5" />
            )}
            {uploading === feature.slot ? "Uploading…" : asset?.public_url ? "Replace image" : "Upload image"}
          </Button>
        </>
      )}
    </div>
  );
}

export default function AboutPage() {
  const { data: profile } = useMyProfile();
  const canEdit = ["admin", "super_admin"].includes(profile?.role);
  const [assets, setAssets] = useState({});
  const [uploading, setUploading] = useState(null);

  useEffect(() => {
    let active = true;
    async function loadAssets() {
      const { data, error } = await supabase
        .from("about_page_assets")
        .select("slot, public_url, storage_path");
      if (error) {
        console.error("Unable to load About page image assets", error);
        return;
      }
      if (active) setAssets(Object.fromEntries((data || []).map((item) => [item.slot, item])));
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

    setUploading(slot);
    const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const storagePath = `features/${slot}/${crypto.randomUUID()}.${extension}`;
    const previousAsset = assets[slot];

    try {
      const { error: uploadError } = await supabase.storage
        .from(ABOUT_BUCKET)
        .upload(storagePath, file, { contentType: file.type, cacheControl: "3600", upsert: false });
      if (uploadError) throw uploadError;

      const publicUrl = supabase.storage.from(ABOUT_BUCKET).getPublicUrl(storagePath).data?.publicUrl;
      if (!publicUrl) throw new Error("Could not create a public URL for the uploaded image.");

      const { error: saveError } = await supabase.from("about_page_assets").upsert(
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

      setAssets((current) => ({ ...current, [slot]: { slot, storage_path: storagePath, public_url: publicUrl } }));
      toast.success("About page image updated.");

      if (previousAsset?.storage_path) {
        const { error: removeError } = await supabase.storage.from(ABOUT_BUCKET).remove([previousAsset.storage_path]);
        if (removeError) console.warn("Previous image could not be removed", removeError);
      }
    } catch (error) {
      console.error("About page image upload failed", error);
      toast.error(error?.message || "Could not upload this image.");
    } finally {
      setUploading(null);
    }
  }

  return (
    <div className="relative overflow-hidden bg-background">
      <section className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ x: [-40, 40, -40], y: [0, -30, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-[-10%] top-20 h-[520px] w-[520px] rounded-full bg-primary/10 blur-[120px]"
          />

          <motion.div
            animate={{ x: [30, -30, 30], y: [0, 40, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-0 right-[-10%] h-[500px] w-[500px] rounded-full bg-primary/5 blur-[140px]"
          />

          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
          linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
          linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
        `,
              backgroundSize: "64px 64px",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl font-semibold tracking-tight md:text-8xl"
          >
            <span className="block">{title1}</span>
            <span className="mt-4 block text-primary">{title2}</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-10 flex justify-center gap-4"
          >
            <Button size="lg" className="rounded-full text-base" asChild>
              <Link href="/apply/space">
                Create a Space
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="mt-24 flex justify-center"
          >
            <div className="flex h-14 w-8 justify-center rounded-full border border-border">
              <motion.div
                animate={{ y: [4, 20, 4] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="mt-2 h-2 w-2 rounded-full bg-primary"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative flex min-h-dvh items-center border-y bg-muted/20">
        <div className="mx-auto w-full max-w-6xl px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl text-center"
          >
            <h2 className="mt-4 text-4xl tracking-tight md:text-6xl">
              Everything local action needs.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              A space brings together people, places, governance, contributions
              and the history of work around a shared
            </p>
            <h2 className="mt-4 text-4xl tracking-tight md:text-6xl">
              Purpose
            </h2>
          </motion.div>

          <div className="mt-16 space-y-8">
            {features.filter((feature) => feature.media === "image").map((feature, index) => (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45 }}
                className={`grid items-center gap-8 overflow-hidden rounded-3xl border bg-background/80 p-4 md:grid-cols-2 md:gap-12 md:p-8 ${index % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""}`}
              >
                <div className="h-64 min-w-0 sm:h-80">
                  <FeatureImage
                    feature={feature}
                    asset={assets[feature.slot]}
                    canEdit={canEdit}
                    uploading={uploading}
                    onUpload={handleUpload}
                  />
                </div>
                <div className="px-2 py-4 md:px-4 md:py-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Citizen Action / {String(index + 1).padStart(2, "0")}</p>
                  <h3 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">{feature.title}</h3>
                  <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">{feature.description}</p>
                </div>
              </motion.article>
            ))}
          </div>

          <div className="mt-20">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">The toolkit</p>
              <h3 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Everything connected, in one place.</h3>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                A few focused tools help turn local concerns into organized, lasting work.
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.filter((feature) => feature.animation).map((feature, index) => (
                <motion.article
                  key={feature.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="overflow-hidden rounded-2xl border bg-background/80 p-5"
                >
                  <div className="flex h-36 items-center justify-center rounded-xl bg-muted/40 p-3">
                    <DotLottieAnimation src={feature.animation} className="h-full min-h-0 w-full" />
                  </div>
                  <h4 className="mt-5 text-lg font-semibold tracking-tight">{feature.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                </motion.article>
              ))}
            </div>
          </div>

          <div className="mt-24">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mx-auto max-w-3xl text-center"
            >
              <span className="text-sm font-medium uppercase tracking-[0.16em] text-primary">
                From concern to collective progress
              </span>
              <h3 className="mt-4 text-3xl tracking-tight md:text-5xl">
                Local change is a story we build together.
              </h3>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
                Every effort starts with people who care about a place. Bring their perspectives together,
                understand the local context, and make the work visible so others can participate and progress can last.
              </p>
            </motion.div>

            <div className="mt-12 space-y-6">
              {[
                {
                  slot: "story_people",
                  eyebrow: "01 / PEOPLE",
                  title: "Start with people",
                  description: "Neighbours, volunteers and community groups turn individual concerns into a shared purpose.",
                  imageAlt: "Neighbours and community members working together",
                },
                {
                  slot: "story_places",
                  eyebrow: "02 / PLACE",
                  title: "Understand the place",
                  description: "Ground ideas in the streets, neighbourhoods and public spaces where change is needed.",
                  imageAlt: "A neighbourhood and its public spaces",
                },
                {
                  slot: "story_progress",
                  eyebrow: "03 / PROGRESS",
                  title: "Keep progress visible",
                  description: "Collect updates, documents and decisions in one place so the next step is easier to take.",
                  imageAlt: "A community project documenting its progress",
                },
              ].map((story, index) => (
                <motion.article
                  key={story.slot}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                  className={`grid items-center gap-6 overflow-hidden rounded-3xl border bg-background/80 p-3 md:grid-cols-2 md:gap-10 md:p-5 ${index % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""}`}
                >
                  <div className="h-56 min-w-0 sm:h-72">
                    <FeatureImage
                      feature={story}
                      asset={assets[story.slot]}
                      canEdit={canEdit}
                      uploading={uploading}
                      onUpload={handleUpload}
                    />
                  </div>
                  <div className="px-3 py-5 md:px-6 md:py-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{story.eyebrow}</p>
                    <h4 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">{story.title}</h4>
                    <p className="mt-3 max-w-lg text-base leading-relaxed text-muted-foreground">{story.description}</p>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="flex min-h-dvh items-center">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="block">Start Anywhere</span>

            <h2 className="mt-6 text-4xl tracking-tight md:text-6xl">
              Civic action should feel human, local and fun.
            </h2>

            <Button size="lg" className="mt-10 rounded-full text-base" asChild>
              <Link href="/">
                <SendIcon className="mr-2 h-4 w-4" />
                Create Your First Post
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="flex min-h-dvh items-center">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center">
            <span className="block">FAQ</span>

            <h2 className="mt-6 text-4xl md:text-5xl">
              Questions people usually ask
            </h2>
          </div>

          <Accordion type="single" collapsible className="mt-14">
            {faqs.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger className="text-left text-lg font-semibold">
                  {item.title}
                </AccordionTrigger>
                <AccordionContent className="leading-relaxed text-muted-foreground">
                  {item.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="flex min-h-dvh items-center">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="mt-6 text-4xl md:text-6xl">
            Better cities start with organized people.
          </h2>

          <div className="mt-10 flex justify-center">
            <Button
              asChild
              size="lg"
              className="rounded-full px-8 text-base font-semibold"
            >
              <Link href="/">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <ScrollButton />
    </div>
  );
}

AboutPage.getLayout = (page) => page;
