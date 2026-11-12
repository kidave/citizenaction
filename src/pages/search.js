"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

import SpaceCardSkeleton from "@/components/skeletons/SpaceCardSkeleton";
import SpaceCard from "@/components/space/SpaceCard";

import { useSpaces } from "@/hooks/space/useSpaces";

export default function UnifiedSearchPage() {
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");

  const { data: spaces = [], isLoading } = useSpaces({
    search: submittedSearch,
  });

  function handleSubmit(event) {
    event.preventDefault();

    setSubmittedSearch(search.trim());
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-4">
      {/* ======================================
          SEARCH
      ====================================== */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSubmit} className="w-full sm:max-w-xl">
          <Field orientation="horizontal">
            <Input
              type="search"
              placeholder="Search spaces..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <Button type="submit" disabled={isLoading}>
              Search
            </Button>
          </Field>
        </form>

        {!isLoading && (
          <div className="text-sm text-muted-foreground">
            Showing {spaces.length} {spaces.length === 1 ? "space" : "spaces"}
          </div>
        )}
      </div>

      {/* ======================================
          RESULTS
      ====================================== */}

      {isLoading ? (
        <SpaceCardSkeleton />
      ) : spaces.length === 0 ? (
        <div className="py-16 text-center">
          <h3 className="text-xl font-semibold">No Spaces found</h3>

          <p className="mt-2 text-muted-foreground">
            Try adjusting your search.
          </p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {spaces.map((space) => (
            <SpaceCard key={space.id} space={space} />
          ))}
        </div>
      )}
    </div>
  );
}
