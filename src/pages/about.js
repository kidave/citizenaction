"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  MapPinned,
  Users,
  Megaphone,
  Sparkles,
  Building2,
  HeartHandshake,
  SendIcon,
} from "lucide-react";
import { HeroGeometric } from "@/components/ui/shape-landing-hero";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import FancyBadge from "@/components/ui/FancyBadge";
import LiveSpaceShowcase from "@/components/layout/LiveSpaceShowcase";
import ScrollButton from "@/components/ui/ScrollButton";

const features = [
  {
    icon: MapPinned,
    title: "Fix local issues",
    desc: "Track roads, footpaths, drainage, safety and public infrastructure together.",
    color: "bg-pink-100",
  },

  {
    icon: Users,
    title: "Build real communities",
    desc: "Create spaces for buildings, neighborhoods, wards and civic groups.",
    color: "bg-blue-100",
  },

  {
    icon: Megaphone,
    title: "Make voices visible",
    desc: "Document meetings, updates and civic actions publicly.",
    color: "bg-yellow-100",
  },

  {
    icon: Building2,
    title: "Coordinate better",
    desc: "Organize members, responsibilities and local initiatives clearly.",
    color: "bg-green-100",
  },
];

const faqs = [
  {
    id: "1",
    title: "Do I need to be an expert?",
    content: "No. Anyone can join and help improve their neighborhood.",
  },

  {
    id: "2",
    title: "Can I create my own Space?",
    content: "Yes. You can create spaces for your cause.",
  },

  {
    id: "3",
    title: "What can people do here?",
    content:
      "People can organize events and meetings, document reports, share updates and coordinate actions.",
  },

  {
    id: "4",
    title: "Is this like social media?",
    content:
      "No. Citizen Action focuses on documenting actions and coordination. It's not for sharing personal updates or photos.",
  },
];

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden bg-background">
      {/* =====================================================
          HERO
      ===================================================== */}

      <HeroGeometric />

      {/* =====================================================
          INTRO
      ===================================================== */}

      <section className="relative py-24">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <motion.div
            initial={{
              opacity: 0,
              y: 30,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.5,
            }}
          >
            <FancyBadge>Community Powered</FancyBadge>

            <h2 className="mt-6 text-4xl font-black tracking-tight md:text-6xl">
              Civic action should feel human, local and fun.
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground">
              Citizen Action is a collaborative platform for documenting civic
              participation, local initiatives, and community progress.
            </p>
          </motion.div>
        </div>
      </section>

      {/* =====================================================
          FEATURES
      ===================================================== */}

      <section className="pb-28">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 md:grid-cols-2">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{
                  opacity: 0,
                  y: 40,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  delay: index * 0.1,
                }}
              >
                <Card className="overflow-hidden rounded-3xl border-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition hover:-translate-y-1">
                  <CardContent className="relative p-8">
                    <div
                      className={`flex h-16 w-16 items-center justify-center rounded-2xl ${feature.color} `}
                    >
                      <Icon className="h-8 w-8" />
                    </div>

                    <h3 className="mt-6 text-2xl font-black">
                      {feature.title}
                    </h3>

                    <p className="mt-3 leading-relaxed text-muted-foreground">
                      {feature.desc}
                    </p>

                    <motion.div
                      animate={{
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 4,
                      }}
                      className="absolute -right-5 -top-5 opacity-10"
                    >
                      <Sparkles className="h-24 w-24" />
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* =====================================================
          COMMUNITY SPACES
      ===================================================== */}

      <LiveSpaceShowcase />

      {/* =====================================================
          BIG CTA
      ===================================================== */}

      <section className="py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="relative overflow-hidden rounded-[40px] border-4 bg-yellow-300 p-12 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:p-20">
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 4,
              }}
              className="absolute right-6 top-6"
            >
              <HeartHandshake className="h-16 w-16 opacity-20" />
            </motion.div>

            <FancyBadge>Start Your Community</FancyBadge>

            <h2 className="mt-6 max-w-3xl text-4xl font-black md:text-6xl">
              Create a civic space for your cause.
            </h2>

            <p className="mt-6 max-w-2xl text-lg">
              Organize people, track local issues, run meetings and build
              visible progress together.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Button size="lg" className="rounded-full text-base" asChild>
                <Link href="/apply/space">
                  Create Your Space
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FAQ
      ===================================================== */}

      <section className="py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center">
            <FancyBadge>FAQ</FancyBadge>

            <h2 className="mt-6 text-4xl font-black md:text-5xl">
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

      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="pb-32">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <FancyBadge>Join The Movement</FancyBadge>

          <h2 className="mt-6 text-4xl font-black md:text-6xl">
            Better cities start with organized people.
          </h2>

          <Button size="lg" className="mt-10 rounded-full text-base" asChild>
            <Link href="/action">
              <SendIcon className="mr-2 h-4 w-4" />
              Create Your First Action
            </Link>
          </Button>
        </div>
      </section>

      <ScrollButton />
    </div>
  );
}
