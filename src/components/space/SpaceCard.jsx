"use client";

import Image from "next/image";
import Link from "next/link";

import { Check } from "lucide-react";

import { Card, CardContent, CardFooter } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

export default function SpaceCard({
  space,
  selectable = false,
  selected = false,
  onSelect,
}) {
  if (!space) {
    return null;
  }

  /* ======================================
     SELECTABLE CARD
  ====================================== */

  if (selectable) {
    return (
      <Card
        role="button"
        tabIndex={0}
        onClick={() => onSelect?.(space)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect?.(space);
          }
        }}
        className={`group relative cursor-pointer overflow-hidden transition-all ${
          selected
            ? "border-primary ring-2 ring-primary/20"
            : "hover:border-primary/40"
        } `}
      >
        {/* ======================================
            COVER
        ====================================== */}

        {space.cover_url ? (
          <div className="relative h-36 overflow-hidden">
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-background/80 to-transparent" />

            <Image
              src={space.cover_url}
              alt={`${space.name} cover`}
              fill
              sizes="300px"
              className="object-cover transition-transform duration-200 group-hover:scale-105"
            />

            {space.logo_url && (
              <div className="absolute bottom-3 left-3 z-20">
                <Image
                  src={space.logo_url}
                  alt={`${space.name} logo`}
                  width={44}
                  height={44}
                  className="h-11 w-11 rounded-md border bg-background object-contain"
                />
              </div>
            )}

            {/* SELECTED */}

            {selected && (
              <div className="absolute right-3 top-3 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
                <Check className="h-4 w-4" />
              </div>
            )}
          </div>
        ) : (
          <div className="relative flex h-36 items-center justify-center bg-muted">
            {space.logo_url ? (
              <Image
                src={space.logo_url}
                alt={`${space.name} logo`}
                width={72}
                height={72}
                className="h-16 w-16 rounded-xl object-contain"
              />
            ) : (
              <span className="text-2xl font-semibold text-muted-foreground">
                {space.name?.charAt(0)?.toUpperCase() || "S"}
              </span>
            )}

            {/* SELECTED */}

            {selected && (
              <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
                <Check className="h-4 w-4" />
              </div>
            )}
          </div>
        )}

        {/* ======================================
            CONTENT
        ====================================== */}

        <CardContent className="p-4">
          <h3 className="line-clamp-1 font-semibold">{space.name}</h3>

          {space.description && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {space.description}
            </p>
          )}

          {/* CATEGORY */}

          {space.category_name && (
            <p className="mt-2 text-xs font-medium text-muted-foreground">
              {space.category_name}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  /* ======================================
     NORMAL SPACE CARD
  ====================================== */

  return (
    <Card className="relative overflow-hidden">
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

      <CardContent className="pt-6">
        <h3 className="line-clamp-1 text-xl font-bold">{space.name}</h3>

        {space.description && (
          <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
            {space.description}
          </p>
        )}
      </CardContent>

      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href={`/space/${space.slug}`}>View Space</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
