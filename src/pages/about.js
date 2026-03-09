"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  PlayIcon,
  Rocket,
  Users,
  FileText,
  ShieldCheck,
  ChevronRight,
  SendIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import ScrollToTop from "@/components/ui/ScrollToTop";
import FeaturedSpaceCard from "@/components/shared/FeaturedSpaceCard";
import { useFeed } from "@/hooks/feed/useFeed";

/* ===========================
   VIDEO MODAL (YouTube)
=========================== */

function VideoModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className="size-14 rounded-full"
          size="icon"
        >
          <PlayIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0 max-w-4xl overflow-hidden">
        <div className="relative aspect-video w-full">
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/watch?v=atjFm2rAXXU"
            title="Citizen Action Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ===========================
   PAGE
=========================== */

export default function AboutPage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const faqs = [
    {
      id: "1",
      category: "getting-started",
      title: "How do I join a space?",
      content:
        "Sign in using Google, search for a space, and apply. Space admins review and approve applications.",
    },
    {
      id: "2",
      category: "governance",
      title: "How are permissions controlled?",
      content:
        "All permissions are enforced at the database level using Row Level Security. Unauthorized actions are blocked even if the frontend is bypassed.",
    },
    {
      id: "3",
      category: "security",
      title: "Is my data secure?",
      content:
        "Yes. Authentication uses Google OAuth via Supabase, and all data access is protected with database-level security policies.",
    },
    {
      id: "4",
      category: "spaces",
      title: "Can I create my own civic group?",
      content:
        "Yes. Any authenticated user can create a space and form clubs within it.",
    },
    {
      id: "5",
      category: "transparency",
      title: "What makes this different from social media?",
      content:
        "Citizen Action is structured governance infrastructure — not a social network. Posts are civic records linked to authorities and clubs.",
    },
  ];

  const filtered =
    activeCategory === "all"
      ? faqs
      : faqs.filter((f) => f.category === activeCategory);

  const { data: feed, isLoading } = useFeed();

  const reports =
    feed?.filter((item) => item.type === "report")?.slice(0, 3) || [];

  return (
    <div className="flex flex-col w-full">

      {/* ================= HERO ================= */}
      <section className="relative py-28 px-6 text-center bg-gradient-to-b from-background via-muted/30 to-background">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-bold tracking-tight max-w-4xl mx-auto"
        >
          Structured Civic Action.  
          Powered by Community.  
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto"
        >
          Citizen Action is a civic coordination platform that empowers spaces 
          to transform ideas into structured actions, organize contributors, 
          track progress transparently and improve local systems framework.
        </motion.p>

        <div className="mt-10 flex justify-center gap-6">
          <Link href="/">
            <Button size="lg" className="gap-2 text-base">
              Get Started
              <ArrowRight />
            </Button>
          </Link>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <Badge>How It Works</Badge>
          <h2 className="mt-6 text-3xl md:text-4xl font-semibold">
            Simple steps to build civic impact
          </h2>

          <div className="mt-16 grid md:grid-cols-4 gap-8">

            <div>
              <Rocket className="mx-auto size-8" />
              <h3 className="mt-4 font-semibold">Sign In</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Access your civic space securely and join your local community.
              </p>
            </div>

            <div>
              <Users className="mx-auto size-8" />
              <h3 className="mt-4 font-semibold">Join or Create Space</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Structure your community by administration.
              </p>
            </div>

            <div>
              <FileText className="mx-auto size-8" />
              <h3 className="mt-4 font-semibold">Create Civic Actions</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Create structured actions with clear goals and milestones.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ================= FEATURED COMMUNITY ================= */}

      <section className="py-24 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6">

          <Badge variant="secondary">Featured Space</Badge>

          <FeaturedSpaceCard />

        </div>
      </section>

      {/* ================= CREATE COMMUNITY SECTION ================= */}

      <section className="py-28 text-center">
        <div className="mx-auto max-w-6xl px-6">

          <Badge variant="outline">Create Your Own Space</Badge>

          <h2 className="mt-6 text-4xl md:text-5xl font-bold">
            Start Your Own Civic Movement
          </h2>

          <p className="mt-6 text-muted-foreground max-w-2xl mx-auto">
            Create a structured digital space for your locality or cause.
            Organize members and define clear action plans.
          </p>

          {/* Workflow Steps */}
          <div className="mt-16 grid md:grid-cols-3 gap-10 text-left">

            <div>
              <h3 className="font-semibold text-lg">1. Apply</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Submit your space application with geographic scope and purpose.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg">2. Organize</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Add members, create clubs, assign roles and responsibilities.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg">3. Act & Document</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Create meetings, action reports, and link issues to authorities.
              </p>
            </div>

          </div>

          {/* Feature Highlights */}
          <div className="mt-16 grid md:grid-cols-2 gap-10 text-left">

            <div>
              <h4 className="font-semibold">Structured Governance</h4>
              <p className="text-sm text-muted-foreground mt-2">
                Define hierarchy: Space → Club → Action → Authority.
              </p>
            </div>

            <div>
              <h4 className="font-semibold">Transparent Documentation</h4>
              <p className="text-sm text-muted-foreground mt-2">
                Every civic step is recorded and publicly visible.
              </p>
            </div>

            <div>
              <h4 className="font-semibold">Geographic Organization</h4>
              <p className="text-sm text-muted-foreground mt-2">
                Structure spaces by administrative boundaries.
              </p>
            </div>

          </div>

          {/* CTA */}
          <div className="mt-16">
            <Link href="/apply/space">
              <Button size="lg" className="gap-2 text-base">
                Create Your Space
                <ArrowRight />
              </Button>
            </Link>
          </div>

        </div>
      </section>

      {/* ================= BLOG SECTION (SMALL IMAGE HEIGHT) ================= */}

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-3xl font-semibold text-center mb-12">
            Latest Reports
          </h2>

          {isLoading && (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          )}

          {!isLoading && reports.length === 0 && (
            <p className="text-center text-muted-foreground">
              No reports available yet.
            </p>
          )}

          <div className="grid gap-6 md:grid-cols-3">
            {reports.map((post) => {
              const firstImage =
                post.attachments?.find((a) =>
                  a?.type?.startsWith("image")
                )?.url;

              const imageSrc =
                firstImage || "/images/walkability-bg.avif";

              return (
                <Link
                  key={post.id}
                  href={`/post/${post.id}`}
                  className="group"
                >
                  <Card className="overflow-hidden transition hover:shadow-md">

                    <div className="relative h-40">
                      <Image
                        src={imageSrc}
                        alt={post.summary}
                        fill
                        sizes="(max-width: 768px) 100vw, 680px"
                        className="object-cover transition"
                      />
                    </div>

                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-5">
                        {post.details}
                      </p>
                    </CardContent>

                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}

      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-3xl font-semibold text-center mb-12">
            Frequently Asked Questions
          </h2>

          <Accordion type="single" collapsible>
            {filtered.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger>
                  {item.title}
                </AccordionTrigger>
                <AccordionContent>
                  {item.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ================= CTA ================= */}

      <section className="py-24 text-center">
        <Badge variant="secondary">Join the Movement</Badge>
        <h2 className="mt-6 text-4xl font-bold">
          Change starts with structured civic action.
        </h2>

        <Button size="lg" className="rounded-full mt-8" asChild>
          <Link href="/action">
            <SendIcon className="mr-2 size-4" />
            Create Your First Action
          </Link>
          
        </Button>
      </section>
      <ScrollToTop />
    </div>
  );
}