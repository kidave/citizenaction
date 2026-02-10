//pages/search/club.js
import { useState } from "react";
import { useRouter } from "next/router";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SearchFiltersSkeleton from "@/components/skeletons/SearchFiltersSkeleton";
import CardGridSkeleton from "@/components/skeletons/CardGridSkeleton";
import Link from "next/link";
import { useClubSearch } from "@/hooks/useClubSearch";

export default function ClubSearchPage() {
  const router = useRouter();
  const { data = [], isLoading } = useClubSearch();
  
  console.log("Club data:", data);
  console.log("First club:", data[0]);

  const [communitySlug, setCommunitySlug] = useState("");
  const [scopeType, setScopeType] = useState("");
  const [search, setSearch] = useState("");

  const filtered = data.filter((c) => {
    if (communitySlug && c.community_slug !== communitySlug) return false;
    if (scopeType && c.scope_type !== scopeType) return false;

    if (search && !c.name.toLowerCase().includes(search.toLowerCase()))
      return false;

    return true;
  });

  // Extract unique communities and scope types for dropdowns
  const communities = [...new Set(data.map(c => c.community_slug).filter(Boolean))];
  const scopeTypes = [...new Set(data.map(c => c.scope_type).filter(Boolean))];

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto my-auto px-4 py-4 space-y-4">
        <SearchFiltersSkeleton />
        <CardGridSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto my-auto px-4 py-4 space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-2 bg-muted/30 rounded-lg">
        <div>
          <Input
            placeholder="Search clubs…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
        </div>
        
        {/* Community Filter */}
        <Select value={communitySlug} onValueChange={setCommunitySlug}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Communities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Communities</SelectItem>
            {communities.map((slug) => (
              <SelectItem key={slug} value={slug}>
                {slug}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Scope Type Filter */}
        <Select value={scopeType} onValueChange={setScopeType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Scopes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Scopes</SelectItem>
            {scopeTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="text-sm text-muted-foreground">
          Showing {filtered.length} of {data.length} clubs
        </div>
      </div>

      {/* Club Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold">No clubs found</h3>
          <p className="text-muted-foreground mt-2">
            Try adjusting your filters or search terms
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((club) => (
            <Card
              key={club.id}
              className="group relative overflow-hidden cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1"
              onClick={() => router.push(`/community/${club.community_slug}/club/${club.scope_type}/${club.scope_code}`)}
            >
              {/* Cover Image */}
              {club.cover_url ? (
                <div className="relative h-48 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10" />
                  <Image
                    src={club.cover_url}
                    alt={`${club.name} cover`}
                    width={160}
                    height={90}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Logo on Cover */}
                  {club.logo_url && (
                    <div className="absolute bottom-4 left-4 z-20">
                      <Image
                        src={club.logo_url}
                        alt={`${club.name} logo`}
                        width={32}
                        height={32}
                        className="h-12 w-12 rounded-md border-2 border-background bg-background object-contain shadow-sm"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative h-48 bg-gradient-to-br from-muted to-muted/50">
                  {club.logo_url && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Image
                        src={club.logo_url}
                        alt={`${club.name} logo`}
                        width={32}
                        height={32}
                        className="h-20 w-20 rounded-md object-contain"
                      />
                    </div>
                  )}
                </div>
              )}

              <CardContent className="pt-6">
                {/* Club Name & Badge */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-xl line-clamp-1">
                    {club.name}
                  </h3>
                  {club.scope_type && (
                    <Badge variant="outline" className="ml-2 shrink-0">
                      {club.scope_type}
                    </Badge>
                  )}
                </div>

                {/* Community */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-muted-foreground">Community:</span>
                  <Link 
                    href={`/community/${club.community_slug}`}
                    className="text-sm font-medium hover:underline truncate"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {club.community_name}
                  </Link>
                </div>

                {/* Description */}
                {club.description && (
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                    {club.description}
                  </p>
                )}

                {/* Scope Info */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="truncate max-w-[120px]">
                      {club.scope_name || "Global"}
                    </span>
                  </div>
                  {club.member_count !== undefined && (
                    <span className="font-medium">
                      {club.member_count} members
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
                    router.push(`/community/${club.community_slug}/club/${club.scope_type}/${club.scope_code}`);
                  }}
                >
                  View Club
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}