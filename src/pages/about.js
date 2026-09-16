"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  Globe2,
  History,
  Map,
  SendIcon,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ScrollButton from "@/components/ui/ScrollButton";
import DotLottieAnimation from "@/components/ui/DotLottieAnimation";

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

const animations = {
  attachment: "/lottie/attachment.lottie",
  report: "/lottie/report.lottie",
  workflow: "/lottie/workflow.lottie",
};

const features = [
  {
    icon: Users,
    title: "Spaces",
    description:
      "Bring people, discussions, meetings and projects together around a topic or place.",
  },
  {
    icon: Map,
    title: "Geography",
    description:
      "Connect civic work to the places it affects, from neighbourhoods to larger geographic areas.",
  },
  {
    icon: Globe2,
    title: "Governance",
    description:
      "Explore organizations, public institutions and the people and positions that make up local governance.",
  },
  {
    icon: Activity,
    title: "Contributions",
    description:
      "Turn ideas, issues, updates, documents and discussions into a shared record of civic work.",
  },
  {
    icon: History,
    title: "Timeline",
    description:
      "Follow what has happened in a Space over time and keep the history of local work visible.",
  },
  {
    icon: CalendarDays,
    title: "Meetings & Events",
    description:
      "Keep meetings and events alongside the conversations and activity they create.",
  },
];

export default function AboutPage() {
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

        <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 px-6 py-20 text-center lg:grid-cols-[1.15fr_0.85fr] lg:text-left">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl font-semibold tracking-tight md:text-8xl"
            >
              <span className="block">{title1}</span>
              <span className="mt-4 block text-primary">{title2}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground lg:mx-0 md:text-xl"
            >
              A place to turn local ideas into organized action.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-10 flex justify-center gap-4 lg:justify-start"
            >
              <Button size="lg" className="rounded-full text-base" asChild>
                <Link href="/apply/space">
                  Create a Space
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.7 }}
            className="mx-auto w-full max-w-sm lg:max-w-md"
          >
            <DotLottieAnimation src={animations.attachment} className="aspect-square" />
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
            <span className="text-sm font-medium text-primary">Inside a Space</span>
            <h2 className="mt-4 text-4xl tracking-tight md:text-6xl">
              Everything local action needs, in one place.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              A Space brings together people, places, governance, contributions and the history of work around a shared purpose.
            </p>
          </motion.div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Card className="h-full rounded-3xl border bg-background/80 shadow-none transition-colors hover:bg-background">
                    <CardHeader>
                      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <CardTitle>{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <div className="mx-auto mt-16 max-w-md">
            <DotLottieAnimation src={animations.workflow} className="aspect-square" />
          </div>
        </div>
      </section>

      <section className="flex min-h-dvh items-center">
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-6 py-24 md:grid-cols-[0.7fr_1.3fr]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mx-auto w-48 md:w-64"
          >
            <DotLottieAnimation src={animations.report} className="aspect-square" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center md:text-left"
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
        <div className="mx-auto max-w-4xl px-6 py-24">
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
