//pages/search/committees.js
import { useState } from "react";
import { useRouter } from "next/router";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useCommitteeSearch } from "@/hooks/useCommitteeSearch";

export default function CommitteesSearchPage() {
  const router = useRouter();
  const { data = [], isLoading } = useCommitteeSearch();
  
  console.log("Committees data:", data);
  console.log("First committee:", data[0]);

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

  if (isLoading) return <div className="p-10">Loading…</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Find Committees</h1>
        <p className="text-muted-foreground">
          Discover and join committees across communities
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-muted/30 rounded-lg">
        <div>
          <Input
            placeholder="Search committees…"
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
          Showing {filtered.length} of {data.length} committees
        </div>
      </div>

      {/* Committee Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold">No committees found</h3>
          <p className="text-muted-foreground mt-2">
            Try adjusting your filters or search terms
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((committee) => (
            <Card
              key={committee.id}
              className="group relative overflow-hidden cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1"
              onClick={() => router.push(`/community/${committee.community_slug}/committee/${committee.scope_type}/${committee.scope_code}`)}
            >
              {/* Cover Image */}
              {committee.cover_url ? (
                <div className="relative h-48 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10" />
                  <img
                    src={committee.cover_url}
                    alt={`${committee.name} cover`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                  />
                  
                  {/* Logo on Cover */}
                  {committee.logo_url && (
                    <div className="absolute bottom-4 left-4 z-20">
                      <img
                        src={committee.logo_url}
                        alt={`${committee.name} logo`}
                        className="h-12 w-12 rounded-md border-2 border-background bg-background object-contain shadow-sm"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative h-48 bg-gradient-to-br from-muted to-muted/50">
                  {committee.logo_url && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img
                        src={committee.logo_url}
                        alt={`${committee.name} logo`}
                        className="h-20 w-20 rounded-md object-contain"
                      />
                    </div>
                  )}
                </div>
              )}

              <CardContent className="pt-6">
                {/* Committee Name & Badge */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-xl line-clamp-1">
                    {committee.name}
                  </h3>
                  {committee.scope_type && (
                    <Badge variant="outline" className="ml-2 shrink-0">
                      {committee.scope_type}
                    </Badge>
                  )}
                </div>

                {/* Community */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-muted-foreground">Community:</span>
                  <Link 
                    href={`/community/${committee.community_slug}`}
                    className="text-sm font-medium hover:underline truncate"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {committee.community_name}
                  </Link>
                </div>

                {/* Description */}
                {committee.description && (
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                    {committee.description}
                  </p>
                )}

                {/* Scope Info */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="truncate max-w-[120px]">
                      {committee.scope_code || "Global"}
                    </span>
                  </div>
                  {committee.member_count !== undefined && (
                    <span className="font-medium">
                      {committee.member_count} members
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
                    router.push(`/community/${committee.community_slug}/committee/${committee.scope_type}/${committee.scope_code}`);
                  }}
                >
                  View Committee
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}