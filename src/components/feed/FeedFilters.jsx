"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/router";

import { usePostSearch } from "@/hooks/feed/usePostSearch";

import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function FeedFilters({
  categorySlug,
  onCategoryChange,
  categories = [],
}) {
  const router = useRouter();

  const searchContainerRef = useRef(null);

  const [search, setSearch] = useState("");

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [searchOpen, setSearchOpen] = useState(false);

  // --------------------------------
  // Debounce search
  // --------------------------------

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  // --------------------------------
  // Search query
  // --------------------------------

  const { data: results = [], isFetching: searchLoading } =
    usePostSearch(debouncedSearch);

  // --------------------------------
  // Close search when clicking outside
  // --------------------------------

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // --------------------------------
  // Navigate to post
  // --------------------------------

  const handleResultClick = (post) => {
    setSearchOpen(false);
    setSearch("");
    setDebouncedSearch("");

    if (!post.slug) {
      return;
    }

    router.push(`/post/${post.slug}`);
  };

  // --------------------------------
  // Clear search
  // --------------------------------

  const handleClearSearch = () => {
    setSearch("");
    setDebouncedSearch("");
    setSearchOpen(false);
  };

  return (
    <div className="flex w-full items-center gap-2 px-4 py-2 sm:px-0">
      {/* ================================= */}
      {/* SEARCH */}
      {/* ================================= */}

      <div ref={searchContainerRef} className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);

            setSearchOpen(true);
          }}
          onFocus={() => {
            if (search.trim().length >= 2) {
              setSearchOpen(true);
            }
          }}
          placeholder="Search posts..."
          aria-label="Search posts"
          className="h-10 rounded-xl pl-9 pr-9"
        />

        {search && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* ================================= */}
        {/* SEARCH RESULTS */}
        {/* ================================= */}

        {searchOpen && search.trim().length >= 2 && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border bg-popover shadow-lg">
            {/* Loading */}

            {searchLoading ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            ) : results.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                No posts found.
              </div>
            ) : (
              <div className="max-h-[420px] overflow-y-auto py-1">
                {results.map((post) => (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => handleResultClick(post)}
                    className="flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-muted"
                  >
                    {/* ======================= */}
                    {/* AVATAR */}
                    {/* ======================= */}

                    <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-muted">
                      {post.matched_contributor_avatar ? (
                        <img
                          src={post.matched_contributor_avatar}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : post.author_avatar ? (
                        <img
                          src={post.author_avatar}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-medium text-muted-foreground">
                          {(
                            post.matched_contributor_name ||
                            post.author_name ||
                            "?"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* ======================= */}
                    {/* RESULT CONTENT */}
                    {/* ======================= */}

                    <div className="min-w-0 flex-1">
                      {/* POST TITLE */}

                      <p className="line-clamp-2 text-sm font-medium">
                        {post.title}
                      </p>

                      {/* MATCH INFORMATION */}

                      {post.match_type === "contribution_content" && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Contribution by{" "}
                          <span className="font-medium text-foreground">
                            {post.matched_contributor_name}
                          </span>
                        </p>
                      )}

                      {post.match_type === "contributor" && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Contributor:{" "}
                          <span className="font-medium text-foreground">
                            {post.matched_contributor_name}
                          </span>
                        </p>
                      )}

                      {post.match_type === "title" && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Post title
                        </p>
                      )}

                      {post.match_type === "content" && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Post content
                        </p>
                      )}

                      {/* EXCERPT */}

                      {post.search_excerpt && (
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {post.search_excerpt}
                        </p>
                      )}

                      {/* SPACE */}

                      {post.space_name && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {post.space_name}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================================= */}
      {/* CATEGORY */}
      {/* ================================= */}

      <Select
        value={categorySlug || "all"}
        onValueChange={(value) =>
          onCategoryChange(value === "all" ? "" : value)
        }
      >
        <SelectTrigger className="h-10 w-[150px] shrink-0 rounded-xl sm:w-[180px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>

          {categories.map((category) => (
            <SelectItem key={category.id} value={category.slug}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
