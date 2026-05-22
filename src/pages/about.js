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

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import ScrollToTop from "@/components/ui/ScrollToTop";

import LiveSpaceShowcase from "@/components/layout/LiveSpaceShowcase";

/* =====================================================
   BOLDKIT BADGE
===================================================== */

function FancyBadge({
  children,
  className = "",
}) {
  return (
    <div
      className={`
        inline-flex
        items-center
        rounded-full
        border-4
        border-black
        bg-yellow-300
        px-5
        py-2
        text-sm
        font-black
        shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
        ${className}
      `}
    >
      {children}
    </div>
  );
}

/* =====================================================
   FEATURES
===================================================== */

const features = [
  {
    icon: MapPinned,

    title:
      "Fix local issues",

    desc:
      "Track roads, footpaths, drainage, safety and public infrastructure together.",

    color:
      "bg-pink-100",
  },

  {
    icon: Users,

    title:
      "Build real communities",

    desc:
      "Create spaces for buildings, neighborhoods, wards and civic groups.",

    color:
      "bg-blue-100",
  },

  {
    icon: Megaphone,

    title:
      "Make voices visible",

    desc:
      "Document meetings, updates and civic actions publicly.",

    color:
      "bg-yellow-100",
  },

  {
    icon: Building2,

    title:
      "Coordinate better",

    desc:
      "Organize members, responsibilities and local initiatives clearly.",

    color:
      "bg-green-100",
  },
];

/* =====================================================
   FAQ
===================================================== */

const faqs = [
  {
    id: "1",

    title:
      "Do I need to be a politician?",

    content:
      "No. Anyone can join and help improve their neighborhood.",
  },

  {
    id: "2",

    title:
      "Can I create my own community?",

    content:
      "Yes. You can create spaces for buildings, streets, localities or causes.",
  },

  {
    id: "3",

    title:
      "What can people do here?",

    content:
      "People can organize meetings, report problems, share updates and coordinate civic work.",
  },

  {
    id: "4",

    title:
      "Is this like social media?",

    content:
      "Not really. Citizen Action focuses on real civic coordination instead of likes and followers.",
  },

  {
    id: "5",

    title:
      "Can NGOs and local groups join?",

    content:
      "Yes. Resident groups, NGOs and civic volunteers can all create spaces.",
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

            <FancyBadge>
              Community Powered
            </FancyBadge>

            <h2
              className="
                mt-6
                text-4xl
                md:text-6xl
                font-black
                tracking-tight
              "
            >

              Civic action should feel
              human, local and fun.

            </h2>

            <p
              className="
                mt-6
                text-lg
                text-muted-foreground
                max-w-3xl
                mx-auto
              "
            >

              Citizen Action is a collaborative platform for documenting civic participation, local initiatives, and community progress.

            </p>

          </motion.div>

        </div>

      </section>

      {/* =====================================================
          FEATURES
      ===================================================== */}

      <section className="pb-28">

        <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 md:grid-cols-2 gap-6">

          {features.map(
            (
              feature,
              index
            ) => {
              const Icon =
                feature.icon;

              return (
                <motion.div
                  key={
                    feature.title
                  }
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
                    delay:
                      index * 0.1,
                  }}
                >

                  <Card
                    className="
                      rounded-3xl
                      border-4
                      shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
                      hover:-translate-y-1
                      transition
                      overflow-hidden
                    "
                  >

                    <CardContent
                      className="
                        p-8
                        relative
                      "
                    >

                      <div
                        className={`
                          w-16
                          h-16
                          rounded-2xl
                          flex
                          items-center
                          justify-center
                          ${feature.color}
                        `}
                      >

                        <Icon className="h-8 w-8" />

                      </div>

                      <h3
                        className="
                          mt-6
                          text-2xl
                          font-black
                        "
                      >
                        {feature.title}
                      </h3>

                      <p
                        className="
                          mt-3
                          text-muted-foreground
                          leading-relaxed
                        "
                      >
                        {feature.desc}
                      </p>

                      <motion.div
                        animate={{
                          rotate: [
                            0,
                            5,
                            -5,
                            0,
                          ],
                        }}
                        transition={{
                          repeat:
                            Infinity,
                          duration: 4,
                        }}
                        className="
                          absolute
                          -top-5
                          -right-5
                          opacity-10
                        "
                      >

                        <Sparkles className="h-24 w-24" />

                      </motion.div>

                    </CardContent>

                  </Card>

                </motion.div>
              );
            }
          )}

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

          <div
            className="
              relative
              overflow-hidden
              rounded-[40px]
              border-4
              bg-yellow-300
              p-12
              md:p-20
              shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]
            "
          >

            <motion.div
              animate={{
                y: [
                  0,
                  -10,
                  0,
                ],
              }}
              transition={{
                repeat:
                  Infinity,
                duration: 4,
              }}
              className="
                absolute
                top-6
                right-6
              "
            >

              <HeartHandshake className="h-16 w-16 opacity-20" />

            </motion.div>

            <FancyBadge>
              Start Your Community
            </FancyBadge>

            <h2
              className="
                mt-6
                text-4xl
                md:text-6xl
                font-black
                max-w-3xl
              "
            >

              Create a civic space
              for your cause.

            </h2>

            <p
              className="
                mt-6
                text-lg
                max-w-2xl
              "
            >

              Organize people, track local
              issues, run meetings and build
              visible progress together.

            </p>

            <div className="mt-10 flex flex-wrap gap-4">

              <Button
                size="lg"
                className="
                  rounded-full
                  text-base
                "
                asChild
              >

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

            <FancyBadge>
              FAQ
            </FancyBadge>

            <h2
              className="
                mt-6
                text-4xl
                md:text-5xl
                font-black
              "
            >

              Questions people usually ask

            </h2>

          </div>

          <Accordion
            type="single"
            collapsible
            className="mt-14"
          >

            {faqs.map(
              (item) => (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                >

                  <AccordionTrigger className="text-left text-lg font-semibold">
                    {item.title}
                  </AccordionTrigger>

                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {item.content}
                  </AccordionContent>

                </AccordionItem>
              )
            )}

          </Accordion>

        </div>

      </section>

      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="pb-32">

        <div className="mx-auto max-w-4xl px-6 text-center">

          <FancyBadge>
            Join The Movement
          </FancyBadge>

          <h2
            className="
              mt-6
              text-4xl
              md:text-6xl
              font-black
            "
          >

            Better cities start
            with organized people.

          </h2>

          <Button
            size="lg"
            className="
              mt-10
              rounded-full
              text-base
            "
            asChild
          >

            <Link href="/action">

              <SendIcon className="mr-2 h-4 w-4" />

              Create Your First Action

            </Link>

          </Button>

        </div>

      </section>

      <ScrollToTop />

    </div>
  );
}