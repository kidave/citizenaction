import { useState } from "react";
import { useRouter } from "next/router";

import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

import { useCommunitySearch } from "@/hooks/useCommunitySearch";

export default function CommunitySearchPage() {
  const router = useRouter();
  const { data = [], isLoading } = useCommunitySearch();
  
  // Debug: log the data to see what's being returned
  console.log("Communities data:", data);
  console.log("First community:", data[0]);

  const [scopeType, setScopeType] = useState("country");
  const [scopeCode, setScopeCode] = useState("");
  const [search, setSearch] = useState("");

  const filtered = data.filter((c) => {
    // FIXED: This logic was filtering out country-scoped communities
    if (scopeType !== "country") {
      if (c.scope_type !== scopeType) return false;
      if (scopeCode && c.scope_code !== scopeCode) return false;
    }

    if (search && !c.name.toLowerCase().includes(search.toLowerCase()))
      return false;

    return true;
  });

  if (isLoading) return <div className="p-10">Loading…</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-muted/30 rounded-lg">
        <div>
          <Input
            placeholder="Search communities…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
        </div>
        
        <div className="text-sm text-muted-foreground">
          Showing {filtered.length} of {data.length} communities
        </div>
      </div>

      {/* Community Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold">No communities found</h3>
          <p className="text-muted-foreground mt-2">
            Try adjusting your filters or search terms
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((community) => (
            <Card
              key={community.id}
              className="group relative overflow-hidden cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1"
              onClick={() => router.push(`/community/${community.slug}`)}
            >
              {/* Cover Image */}
              {community.cover_url ? (
                <div className="relative h-48 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10" />
                  <Image
                    src={community.cover_url}
                    alt={`${community.name} cover`}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="w-40 h-40 object-cover"
                  />
                  
                  {/* Logo on Cover */}
                  {community.logo_url && (
                    <div className="absolute bottom-4 left-4 z-20">
                      <Image
                        src={community.logo_url}
                        alt={`${community.name} logo`}
                        width={32}
                        height={32}
                        className="h-12 w-12 rounded-md border-2 border-background bg-background object-contain shadow-sm"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative h-48 bg-gradient-to-br from-muted to-muted/50">
                  {community.logo_url && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Image
                        src={community.logo_url}
                        alt={`${community.name} logo`}
                        width={32}
                        height={32}
                        className="h-20 w-20 rounded-md object-contain"
                      />
                    </div>
                  )}
                </div>
              )}

              <CardContent className="pt-6">
                {/* Community Name & Badge */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-xl line-clamp-1">
                    {community.name}
                  </h3>
                  {community.scope_type && (
                    <Badge variant="outline" className="ml-2 shrink-0">
                      {community.scope_type}
                    </Badge>
                  )}
                </div>

                {/* Description */}
                {community.description && (
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                    {community.description}
                  </p>
                )}

                {/* Additional Info */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="truncate max-w-[120px]">
                      {community.owner_name || "Community"}
                    </span>
                  </div>
                  {community.scope_code && (
                    <span className="font-medium">
                      {community.scope_code}
                    </span>
                  )}
                </div>
              </CardContent>

              <CardFooter className="pt-0">
                <Button 
                  variant="outline" 
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/community/${community.slug}`);
                  }}
                >
                  View Community
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}