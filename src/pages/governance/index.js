import { useRouter } from "next/router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AuthorityCard from "@/components/governance/AuthorityCard";
import EntityTypeSelector from "@/components/governance/EntityTypeSelector";
import { useGovernance } from "@/hooks/governance/useGovernance";
import { useGovernanceContribution } from "@/hooks/governance/useGovernanceContribution";
import { toast } from "sonner";

export default function GovernancePage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [entityType, setEntityType] = useState("all");
  const [showSuggest, setShowSuggest] = useState(false);
  const [summary, setSummary] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");

  const { data = [], isLoading, error } = useGovernance({
    search,
    entityType,
  });
  const { submitContribution, isSubmitting } = useGovernanceContribution();

  const submitSuggestion = async () => {
    if (!summary.trim()) {
      toast.error("Describe the governance change");
      return;
    }

    await submitContribution({
      summary,
      action: "edit",
      proposedChanges: {},
      sourceUrl: sourceUrl || null,
    });

    setSummary("");
    setSourceUrl("");
    setShowSuggest(false);
  };

  return (
    <main className="mx-auto min-h-dvh w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Governance</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Explore public governance data and help keep it accurate.
            </p>
          </div>
          <Button type="button" onClick={() => setShowSuggest((value) => !value)}>
            Suggest a change
          </Button>
        </div>

        {showSuggest && (
          <div className="space-y-3 rounded-xl border p-4">
            <Input
              placeholder="What should be added or corrected?"
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
            />
            <Input
              placeholder="Source URL (optional)"
              value={sourceUrl}
              onChange={(event) => setSourceUrl(event.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setShowSuggest(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={submitSuggestion} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit suggestion"}
              </Button>
            </div>
          </div>
        )}
      </header>

      <div className="space-y-3">
        <Input
          placeholder="Search government, authority, organisation, department..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <EntityTypeSelector value={entityType} onChange={setEntityType} />
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading governance...</p>}
      {error && <p className="text-sm text-destructive">Failed to load governance data.</p>}

      {!isLoading && !error && data.length === 0 && (
        <div className="rounded-xl border p-8 text-center text-sm text-muted-foreground">
          No governance entities found.
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((entity) => (
          <AuthorityCard
            key={entity.id}
            entity={entity}
            isSelected={false}
            onToggle={() => {}}
            onOpen={() => router.push(entity.slug ? `/governance/${entity.slug}` : "/governance")}
          />
        ))}
      </div>
    </main>
  );
}
