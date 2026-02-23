"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useCommunities } from "@/hooks/useCommunities";

export default function FeaturedCommunityCard() {
  const { data: communities, isLoading } = useCommunities();
  const community = communities?.[0];

  if (isLoading) {
    return (
      <div className="mt-12 h-72 rounded-2xl border bg-muted animate-pulse" />
    );
  }

  if (!community) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="mt-12 relative rounded-2xl overflow-hidden shadow-xl"
      style={
        community.primary_color
          ? { borderColor: community.primary_color }
          : undefined
      }
    >
      {/* Cover */}
      <div className="relative h-56 md:h-72 overflow-hidden">
        {community.cover_url ? (
          <Image
            src={community.cover_url}
            alt={`${community.name} cover`}
            fill
            className="object-cover group-hover:scale-105 transition duration-500"
          />
        ) : (
          <div className="h-full w-full bg-muted" />
        )}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative -mt-14 px-8 pb-10">

        <div className="flex items-center gap-4">
          {community.logo_url && (
            <Image
              src={community.logo_url}
              alt={`${community.name} logo`}
              width={80}
              height={80}
              className="rounded-xl border bg-background p-2 shadow"
            />
          )}

          <div>
            <h3 className="text-2xl font-bold text-white">
              {community.name}
            </h3>

            {community.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {community.description}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <Link href={`/community/${community.slug}`}>
            <Button>View Community</Button>
          </Link>

          <Link href="/search">
            <Button variant="outline">Explore More</Button>
          </Link>
        </div>

      </div>
    </motion.div>
  );
}