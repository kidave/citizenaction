"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useSpaces } from "@/hooks/space/useSpaces";

export default function FeaturedSpaceCard() {
  const { data: spaces, isLoading } = useSpaces();
  const space = spaces?.[0];

  if (isLoading) {
    return (
      <div className="mt-12 h-72 animate-pulse rounded-2xl border bg-muted" />
    );
  }

  if (!space) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="relative mt-12 overflow-hidden rounded-2xl shadow-xl"
      style={
        space.primary_color ? { borderColor: space.primary_color } : undefined
      }
    >
      {/* Cover */}
      <div className="relative h-56 overflow-hidden md:h-72">
        {space.cover_url ? (
          <Image
            src={space.cover_url}
            alt={`${space.name} cover`}
            fill
            sizes="(max-width: 768px) 100vw, 680px"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-muted" />
        )}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative -mt-14 px-8 pb-10">
        <div className="flex items-center gap-4">
          {space.logo_url && (
            <Image
              src={space.logo_url}
              alt={`${space.name} logo`}
              width={80}
              height={80}
              className="rounded-xl border bg-background p-2 shadow"
            />
          )}

          <div>
            <h3 className="text-2xl font-bold text-white">{space.name}</h3>

            {space.description && (
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {space.description}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <Link href={`/space/${space.slug}`}>
            <Button>View Space</Button>
          </Link>

          <Link href="/search">
            <Button variant="outline">Explore More</Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
