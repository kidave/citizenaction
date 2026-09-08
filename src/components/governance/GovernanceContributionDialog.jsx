import { useEffect, useMemo, useState } from "react";
import { GitBranch, Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGovernance } from "@/hooks/governance/useGovernance";
import { useGovernanceContribution } from "@/hooks/governance/useGovernanceContribution";

const TYPES = [
  ["authority", "Authority"],
  ["unit", "Unit"],
  ["ministry", "Ministry"],
  ["department", "Department"],
  ["organisation", "Organisation"],
  ["committee", "Committee"],
  ["office", "Office"],
  ["division", "Division"],
  ["ward", "Ward"],
  ["station", "Station"],
  ["person", "Person"],
  ["position", "Position"],
  ["programme", "Programme"],
  ["project", "Project"],
];

const ACTIONS = [
  {
    value: "add",
    label: "Add something",
    description: "A governance body or unit is missing.",
    icon: Plus,
  },
  {
    value: "edit",
    label: "Correct information",
    description: "Something about a record is incorrect or outdated.",
    icon: Pencil,
  },
  {
    value: "move",
    label: "Change hierarchy",
    description: "A record belongs under a different parent.",
    icon: GitBranch,
  },
  {
    value: "delete",
    label: "Request removal",
    description: "A record should no longer be shown.",
    icon: Trash2,
  },
];

export default function GovernanceContributionDialog({
  open,
  onOpenChange,
  record = null,
  defaultParentId = null,
}) {
  const [action, setAction] = useState(record ? "edit" : "add");
  const [name, setName] = useState("");
  const [entityType, setEntityType] = useState("organisation");
  const [shortName, setShortName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [parentId, setParentId] = useState(defaultParentId || null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceNotes, setSourceNotes] = useState("");
  const [summary, setSummary] = useState("");
  const [geomGeojson, setGeomGeojson] = useState("");
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    if (!open) return;
    setAction(record ? "edit" : "add");
    setName(record?.name || "");
    setEntityType(record?.entity_type || "organisation");
    setShortName(record?.short_name || "");
    setDescription(record?.description || "");
    setWebsite(record?.website || "");
    setParentId(record?.parent_id || defaultParentId || null);
    setSourceUrl("");
    setSourceNotes("");
    setSummary("");
    setGeomGeojson("");
    setShowMore(false);
  }, [open, record, defaultParentId]);

  const { data: parentOptions = [] } = useGovernance({
    search: "",
    entityType: "all",
    includeAll: true,
    enabled: open,
  });
  const { submitContribution, isSubmitting } = useGovernanceContribution();

  const actionMeta = useMemo(
    () => ACTIONS.find((item) => item.value === action) || ACTIONS[0],
    [action]
  );
  const isDelete = action === "delete";
  const isMove = action === "move";

  async function submit() {
    if (action !== "delete" && !name.trim()) {
      throw new Error("Please enter the governance name");
    }

    if (!summary.trim()) {
      throw new Error("Please tell us what should change");
    }

    await submitContribution({
      summary: summary.trim(),
      action,
      proposedGovernanceId: record?.id || null,
      proposedParentId: parentId || null,
      proposedEntityType: action === "move" || action === "delete" ? null : entityType,
      proposedChanges: {
        ...(name.trim() ? { name: name.trim() } : {}),
        ...(shortName.trim() ? { short_name: shortName.trim() } : {}),
        ...(description.trim() ? { description: description.trim() } : {}),
        ...(website.trim() ? { website: website.trim() } : {}),
        ...(geomGeojson.trim() ? { geom_geojson: geomGeojson.trim() } : {}),
      },
      sourceUrl: sourceUrl.trim() || null,
      sourceNotes: sourceNotes.trim() || null,
    });

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {record ? "Suggest a change" : "Help improve Governance"}
          </DialogTitle>
          <DialogDescription>
            Tell us what is wrong or missing. An administrator will review your suggestion before anything changes.
          </DialogDescription>
        </DialogHeader>

        {!record && (
          <section className="space-y-3">
            <div>
              <h3 className="text-sm font-medium">What would you like to do?</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Choose the option that best describes your suggestion.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {ACTIONS.map(({ value, label, description: actionDescription, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAction(value)}
                  className={`rounded-lg border p-3 text-left transition-colors hover:bg-muted/50 ${
                    action === value ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{label}</span>
                      <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                        {actionDescription}
                      </span>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="rounded-lg border bg-muted/20 p-3">
          <div className="text-sm font-medium">{actionMeta.label}</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Your suggestion goes to review. It will not change the live governance data immediately.
          </p>
        </div>

        {!isDelete && !isMove && (
          <section className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="governance-name">Governance name</Label>
              <Input
                id="governance-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ministry of Railways"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="governance-type">What type is it?</Label>
              <Select value={entityType} onValueChange={setEntityType}>
                <SelectTrigger id="governance-type">
                  <SelectValue placeholder="Choose a type" />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="governance-summary">What should we change?</Label>
              <Textarea
                id="governance-summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="For example: The official name has changed to..."
              />
            </div>
          </section>
        )}

        {isMove && (
          <section className="space-y-3">
            <div>
              <Label>Where should this record belong?</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Choose its new parent in the governance hierarchy.
              </p>
            </div>
            <Select
              value={parentId || "root"}
              onValueChange={(value) => setParentId(value === "root" ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose parent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="root">Top level — no parent</SelectItem>
                {parentOptions
                  .filter((item) => item.id !== record?.id)
                  .map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.label || item.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <div className="space-y-2">
              <Label htmlFor="governance-move-summary">Why should it move?</Label>
              <Textarea
                id="governance-move-summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Explain why the hierarchy should change."
              />
            </div>
          </section>
        )}

        {isDelete && (
          <section className="space-y-3">
            <p className="text-sm text-muted-foreground">
              You are suggesting that <span className="font-medium text-foreground">{record?.name}</span> should be removed from the governance directory.
            </p>
            <div className="space-y-2">
              <Label htmlFor="governance-delete-summary">Why should it be removed?</Label>
              <Textarea
                id="governance-delete-summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Explain what is wrong with this record."
              />
            </div>
          </section>
        )}

        {!isMove && !isDelete && (
          <section className="space-y-3">
            <Button
              type="button"
              variant="ghost"
              className="px-0 text-sm"
              onClick={() => setShowMore((value) => !value)}
            >
              {showMore ? "Hide additional details" : "Add more details (optional)"}
            </Button>

            {showMore && (
              <div className="space-y-4 rounded-lg border bg-muted/10 p-4">
                <div className="space-y-2">
                  <Label htmlFor="governance-short-name">Short name</Label>
                  <Input
                    id="governance-short-name"
                    value={shortName}
                    onChange={(e) => setShortName(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="governance-description">Description</Label>
                  <Textarea
                    id="governance-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What does this body do?"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="governance-website">Official website</Label>
                  <Input
                    id="governance-website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="governance-source">Source URL</Label>
                  <Input
                    id="governance-source"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="Official source, government page, document, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="governance-source-notes">Source notes</Label>
                  <Textarea
                    id="governance-source-notes"
                    value={sourceNotes}
                    onChange={(e) => setSourceNotes(e.target.value)}
                    placeholder="Optional notes about your source."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="governance-geometry">Boundary GeoJSON</Label>
                  <Textarea
                    id="governance-geometry"
                    className="min-h-28 font-mono text-xs"
                    value={geomGeojson}
                    onChange={(e) => setGeomGeojson(e.target.value)}
                    placeholder='Optional Polygon or MultiPolygon GeoJSON'
                  />
                </div>
              </div>
            )}
          </section>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={async () => {
              try {
                await submit();
              } catch (error) {
                // The contribution hook is responsible for reporting API errors.
              }
            }}
          >
            {isSubmitting ? "Sending..." : "Send suggestion"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
