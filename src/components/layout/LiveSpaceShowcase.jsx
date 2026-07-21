"use client";

import Link from "next/link";
import Image from "next/image";

import { motion } from "framer-motion";

import { ArrowRight } from "lucide-react";

import { useFeed } from "@/hooks/feed/useFeed";
import { useSpaces } from "@/hooks/space/useSpaces";

import { Button } from "@/components/ui/button";

import { Card, CardContent } from "@/components/ui/card";

import ActivityPreviewCard from "@/components/feed/activity/ActivityPreviewCard";

/* =====================================================
   BADGE
===================================================== */

function FancyBadge({ children, className = "" }) {
  return (
    <div
      className={`inline-flex items-center rounded-full border-4 border-black bg-yellow-300 px-5 py-2 text-sm font-black ${className} `}
    >
      {children}
    </div>
  );
}

export default function LiveSpaceShowcase({ space = null }) {
  const { data: feed = [] } = useFeed();

  const { data: spaces = [] } = useSpaces();

  const featuredSpaces = space ? [space] : spaces.slice(0, 3);

  return (
    <section>
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <FancyBadge>Live Community Space</FancyBadge>

          <h2 className="mt-6 text-4xl font-black md:text-6xl">
            Communities documenting collaborative progress.
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground">
            Citizen Action helps organizations, institutions and communities
            share updates, meetings, initiatives and visible civic
            collaboration.
          </p>
        </div>

        <div className="mt-20 space-y-10">
          {featuredSpaces.map((currentSpace, index) => {
            const spaceFeed = feed.filter(
              (item) => item.space_id === currentSpace.id,
            );

            const latestPosts = spaceFeed.slice(0, 2);

            return (
              <motion.div
                key={currentSpace.id}
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
                <Card className="overflow-hidden rounded-[32px]">
                  <CardContent className="flex flex-col gap-8 p-8 xl:flex-row">
                    {/* =====================================================
                          SPACE INFO
                      ===================================================== */}

                    <div className="flex-shrink-0 xl:w-[340px]">
                      {/* LOGO */}

                      <div className="h-24 w-24 overflow-hidden rounded-3xl bg-muted">
                        {currentSpace.logo_url ? (
                          <Image
                            src={currentSpace.logo_url}
                            alt={currentSpace.name}
                            width={96}
                            height={96}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-3xl font-black">
                            {currentSpace.name?.[0]}
                          </div>
                        )}
                      </div>

                      {/* TITLE */}

                      <h3 className="mt-6 text-3xl font-black">
                        {currentSpace.name}
                      </h3>

                      {/* DESCRIPTION */}

                      <p className="mt-4 leading-relaxed text-muted-foreground">
                        {currentSpace.description}
                      </p>

                      {/* CTA */}

                      <Button className="mt-8 rounded-2xl font-black" asChild>
                        <Link href={`/space/${currentSpace.slug}`}>
                          View Space
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>

                    {/* =====================================================
                          ACTIVITY
                      ===================================================== */}

                    <div className="flex-1">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {latestPosts.map((post) => (
                          <ActivityPreviewCard key={post.id} post={post} />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
