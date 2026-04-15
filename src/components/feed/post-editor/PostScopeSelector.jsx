"use client";

import { useMemo, useEffect } from "react";
import Image from "next/image";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useClubs } from "@/hooks/useClubs";

export default function PostScopeSelector({
  profile,
  post, // 🔥 IMPORTANT (add this)
  space_id,
  setSpaceId,
  club_id,
  setClubId,
}) {
  const spaces = profile?.spaces ?? [];
  const userClubs = profile?.clubs ?? [];

  /* ------------------------- */
  /* Selected space            */
  /* ------------------------- */

  const selectedSpace = spaces.find((s) => s.id === space_id);
  const spaceSlug = selectedSpace?.slug;

  /* ------------------------- */
  /* Fetch ALL clubs           */
  /* ------------------------- */

  const { data: allClubs = [] } = useClubs({
    spaceSlug,
    enabled: !!spaceSlug,
  });

  /* ------------------------- */
  /* Selected club             */
  /* ------------------------- */

  const selectedClub =
    allClubs.find((c) => c.id === club_id) ||
    (post && post.club_id === club_id
      ? {
          id: post.club_id,
          name: post.club_name,
          geographic_name: post.geographic_name,
        }
      : null);
  /* ------------------------- */
  /* Split: Your vs Others     */
  /* ------------------------- */

  const { myClubs, otherClubs } = useMemo(() => {
    const userClubIds = new Set(userClubs.map((c) => c.id));

    const mine = [];
    const others = [];

    allClubs.forEach((club) => {
      if (userClubIds.has(club.id)) mine.push(club);
      else others.push(club);
    });

    return { myClubs: mine, otherClubs: others };
  }, [allClubs, userClubs]);

  /* ------------------------- */
  /* Sort                      */
  /* ------------------------- */

  const sortFn = (a, b) => {
    const order = {
      ward: 1,
      city: 2,
      region: 3,
      state: 4,
      country: 5,
    };
    return (order[a.scope_type] || 999) - (order[b.scope_type] || 999);
  };

  const sortedMyClubs = useMemo(
    () => [...myClubs].sort(sortFn),
    [myClubs]
  );

  const sortedOtherClubs = useMemo(
    () => [...otherClubs].sort(sortFn),
    [otherClubs]
  );

  /* ------------------------- */
  /* DEFAULT SPACE (SAFE)      */
  /* ------------------------- */

  useEffect(() => {
    if (!profile) return;

    // 🔥 DO NOTHING in edit mode
    if (post) return;

    setSpaceId((prev) => {
      if (prev) return prev;
      return profile.primary_space?.id || spaces[0]?.id || null;
    });
  }, [profile, post]);

  /* ------------------------- */
  /* DEFAULT CLUB (SAFE)       */
  /* ------------------------- */

  useEffect(() => {
    if (!profile || !allClubs.length) return;

    if (post) return;

    setClubId((prev) => {
      if (prev) return prev;

      const preferred = sortedMyClubs[0];
      if (preferred) return preferred.id;

      return sortedOtherClubs[0]?.id || null;
    });
  }, [profile, allClubs, sortedMyClubs, sortedOtherClubs, post]);

  /* ------------------------- */
  /* Handlers                  */
  /* ------------------------- */

  function handleSpaceChange(value) {
    setSpaceId(value);
    setClubId(null);
  }

  function handleClubChange(value) {
    setClubId(value);
  }

  /* ------------------------- */
  /* UI                        */
  /* ------------------------- */

  return (
    <div className="flex flex-wrap items-center gap-2 w-full">

      {/* SPACE */}
      <Select value={space_id || ""} onValueChange={handleSpaceChange}>
        <SelectTrigger className="min-w-[140px] flex-1 h-9 text-xs">
          <SelectValue placeholder="Space" />
        </SelectTrigger>

        <SelectContent>
          {spaces.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              <div className="flex items-center gap-2">
                {s.logo_url && (
                  <Image
                    src={s.logo_url}
                    width={16}
                    height={16}
                    className="rounded-sm"
                    alt=""
                  />
                )}
                {s.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* CLUB */}
      <Select
        value={club_id || ""}
        onValueChange={handleClubChange}
        disabled={!space_id}
      >
        <SelectTrigger className="min-w-[200px] flex-1 h-9 text-xs">
          <SelectValue placeholder="Select Area">
            {selectedClub
              ? selectedClub.geographic_name || selectedClub.name
              : post
              ? "Loading..."
              : ""}
          </SelectValue>
        </SelectTrigger>

        <SelectContent>

          {/* YOUR CLUBS */}
          {sortedMyClubs.length > 0 && (
            <>
              <div className="px-2 py-1 text-xs text-muted-foreground">
                Your Clubs
              </div>

              {sortedMyClubs.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.geographic_name || c.name}
                </SelectItem>
              ))}
            </>
          )}

          {/* OTHER CLUBS */}
          {sortedOtherClubs.length > 0 && (
            <>
              <div className="px-2 py-1 text-xs text-muted-foreground mt-2">
                Other Areas
              </div>

              {sortedOtherClubs.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.geographic_name || c.name}
                </SelectItem>
              ))}
            </>
          )}

        </SelectContent>
      </Select>

    </div>
  );
}