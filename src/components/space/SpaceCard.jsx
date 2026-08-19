"use client";

import Image from "next/image";
import Link from "next/link";

import { Card, CardContent, CardFooter } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

export default function SpaceCard({ space }) {
  return (
    <Card className="relative overflow-hidden">
      {/* ======================================
          COVER
      ====================================== */}

      {space.cover_url ? (
        <div className="relative h-48 overflow-hidden">
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-background/80 to-transparent" />

          <Image
            src={space.cover_url}
            alt={`${space.name} cover`}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover"
          />

          {space.logo_url && (
            <div className="absolute bottom-4 left-4 z-20">
              <Image
                src={space.logo_url}
                alt={`${space.name} logo`}
                width={48}
                height={48}
                className="h-12 w-12 rounded-md border bg-background object-contain"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="flex h-48 items-center justify-center bg-muted">
          {space.logo_url ? (
            <Image
              src={space.logo_url}
              alt={`${space.name} logo`}
              width={80}
              height={80}
              className="object-contain"
            />
          ) : (
            <span className="text-sm text-muted-foreground">No image</span>
          )}
        </div>
      )}

      {/* ======================================
          CONTENT
      ====================================== */}

      <CardContent className="pt-6">
        <h3 className="line-clamp-1 text-xl font-bold">{space.name}</h3>

        {space.description && (
          <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
            {space.description}
          </p>
        )}
      </CardContent>

      {/* ======================================
          ACTION
      ====================================== */}

      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href={`/space/${space.slug}`}>View Space</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
