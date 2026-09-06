import { useState } from "react";
import { useRouter } from "next/router";
import { GitBranch, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import EntityTypeSelector from "@/components/governance/EntityTypeSelector";
import GovernanceContributionDialog from "@/components/governance/GovernanceContributionDialog";
import GovernanceCard from "@/components/governance/GovernanceCard";
import { useGovernance } from "@/hooks/governance/useGovernance";

export default function GovernancePage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [entityType, setEntityType] = useState("all");
  const [showSuggest, setShowSuggest] = useState(false);

  const { data = [], isLoading, error } = useGovernance({ search, entityType });

  return (
    <main className="mx-auto min-h-dvh w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><GitBranch className="h-4 w-4" /> Governance model</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Governance</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Explore the organisations, authorities and governance units that make up the public model. Community contributions are reviewed before publication.</p>
        </div>
        <Button onClick={() => setShowSuggest(true)}><Plus className="mr-2 h-4 w-4" />Suggest a change</Button>
      </header>

      <Card><CardContent className="space-y-4 p-4">
        <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Search governance..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <EntityTypeSelector value={entityType} onChange={setEntityType} />
      </CardContent></Card>

      {isLoading && <div className="text-sm text-muted-foreground">Loading governance...</div>}
      {error && <div className="text-sm text-destructive">Failed to load governance data.</div>}

      {!isLoading && !error && data.length === 0 && <Card><CardContent className="py-14 text-center text-sm text-muted-foreground">No governance entities found.</CardContent></Card>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((entity) => (
          <GovernanceCard
            key={entity.id}
            entity={entity}
            isSelected={false}
            onOpen={() => entity.path && router.push(entity.path)}
          />
        ))}
      </div>

      {data.length > 0 && <div className="flex items-center justify-between border-t pt-4 text-xs text-muted-foreground"><span>{data.length} governance records</span><Badge variant="outline">Community maintained</Badge></div>}

      <GovernanceContributionDialog open={showSuggest} onOpenChange={setShowSuggest} />
    </main>
  );
}
