// pages/search.js
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

import SearchFiltersSkeleton from "@/components/skeletons/SearchFiltersSkeleton";
import CardGridSkeleton from "@/components/skeletons/CardGridSkeleton";

import { useSpaces } from "@/hooks/space/useSpaces";
import { useClubs } from "@/hooks/space/useClubs";

export default function UnifiedSearchPage() {
  const [searchType, setSearchType] = useState("space");
  const [search, setSearch] = useState("");
  const [scopeType, setScopeType] = useState("all");
  const [spaceSlug, setSpaceSlug] = useState("all");

  const { data: spaces = [], isLoading: spacesLoading } = useSpaces({
    search: searchType === "space" ? search : undefined,
  });

  const { data: clubs = [], isLoading: clubsLoading } = useClubs({
    search: searchType === "club" ? search : undefined,
    scopeType,
    spaceSlug,
  });

  const isLoading = spacesLoading || clubsLoading;

  const scopeTypes = [...new Set(clubs.map((c) => c.scope_type))].filter(
    Boolean,
  );
  const spaceOptions = [...new Set(clubs.map((c) => c.space_slug))].filter(
    Boolean,
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-4 px-4 py-4">
        <SearchFiltersSkeleton />
        <CardGridSkeleton />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-4 py-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search spaces or clubs…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />

        <div className="flex gap-2">
          <Button
            variant={searchType === "space" ? "default" : "outline"}
            onClick={() => setSearchType("space")}
          >
            Spaces
          </Button>
          <Button
            variant={searchType === "club" ? "default" : "outline"}
            onClick={() => setSearchType("club")}
          >
            Clubs
          </Button>
        </div>

        {searchType === "club" && (
          <>
            <Select value={scopeType} onValueChange={setScopeType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {scopeTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={spaceSlug} onValueChange={setSpaceSlug}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Space" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Spaces</SelectItem>
                {spaceOptions.map((slug) => (
                  <SelectItem key={slug} value={slug}>
                    {slug}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}

        <div className="text-sm text-muted-foreground">
          {searchType === "space"
            ? `Showing ${spaces.length} spaces`
            : `Showing ${clubs.length} clubs`}
        </div>
      </div>

      {searchType === "space" ? (
        spaces.length === 0 ? (
          <EmptyState label="spaces" />
        ) : (
          <Grid>
            {spaces.map((space) => (
              <SpaceCard key={space.id} space={space} />
            ))}
          </Grid>
        )
      ) : clubs.length === 0 ? (
        <EmptyState label="clubs" />
      ) : (
        <Grid>
          {clubs.map((club) => (
            <ClubCard key={club.id} club={club} />
          ))}
        </Grid>
      )}
    </div>
  );
}

function Grid({ children }) {
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">{children}</div>
  );
}

function EmptyState({ label }) {
  return (
    <div className="py-16 text-center">
      <h3 className="text-xl font-semibold">No {label} found</h3>
      <p className="mt-2 text-muted-foreground">
        Try adjusting your search or filters
      </p>
    </div>
  );
}

function SpaceCard({ space }) {
  return (
    <Card className="relative overflow-hidden">
      {/* Cover Image */}
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
          {space.logo_url && (
            <Image
              src={space.logo_url}
              alt={`${space.name} logo`}
              width={80}
              height={80}
              className="object-contain"
            />
          )}
        </div>
      )}

      <CardContent className="pt-6">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="line-clamp-1 text-xl font-bold">{space.name}</h3>
        </div>

        {space.description && (
          <p className="mb-2 line-clamp-3 text-sm text-muted-foreground">
            {space.description}
          </p>
        )}
      </CardContent>

      <CardFooter>
        <Link href={`/space/${space.slug}`} className="w-full">
          <Button variant="outline" className="w-full">
            View Space
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

function ClubCard({ club }) {
  return (
    <Card className="relative overflow-hidden">
      {/* Cover */}
      {club.cover_url ? (
        <div className="relative h-48 overflow-hidden">
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-background/80 to-transparent" />
          <Image
            src={club.cover_url}
            alt={`${club.name} cover`}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover"
          />

          {club.logo_url && (
            <div className="absolute bottom-4 left-4 z-20">
              <Image
                src={club.logo_url}
                alt={`${club.name} logo`}
                width={48}
                height={48}
                className="h-12 w-12 rounded-md border bg-background object-contain"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="flex h-48 items-center justify-center bg-muted">
          {club.logo_url && (
            <Image
              src={club.logo_url}
              alt={`${club.name} logo`}
              width={80}
              height={80}
              className="object-contain"
            />
          )}
        </div>
      )}

      <CardContent className="pt-6">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="line-clamp-1 text-xl font-bold">{club.name}</h3>
          {club.scope_type && (
            <Badge variant="outline">{club.scope_type.toUpperCase()}</Badge>
          )}
        </div>

        {/* Space link (IMPORTANT) */}
        <div className="mb-2 text-sm text-muted-foreground">
          Space:{" "}
          <Link
            href={`/space/${club.space_slug}`}
            className="font-medium hover:underline"
          >
            {club.space_name}
          </Link>
        </div>

        {club.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {club.description}
          </p>
        )}
      </CardContent>

      <CardFooter>
        <Link
          href={`/space/${club.space_slug}/${club.scope_type}/${club.scope_code}`}
          className="w-full"
        >
          <Button variant="outline" className="w-full">
            View Club
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
