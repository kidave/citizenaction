import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2, GitBranch, Map, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  { value: "add", label: "Add record", icon: Plus },
  { value: "edit", label: "Correct record", icon: Pencil },
  { value: "move", label: "Move in hierarchy", icon: GitBranch },
  { value: "delete", label: "Request removal", icon: Trash2 },
];

export default function GovernanceContributionDialog({ open, onOpenChange, record = null, defaultParentId = null }) {
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
  }, [open, record, defaultParentId]);

  const { data: parentOptions = [] } = useGovernance({ search: "", entityType: "all", enabled: open });
  const { submitContribution, isSubmitting } = useGovernanceContribution();

  const actionMeta = useMemo(() => ACTIONS.find((item) => item.value === action) || ACTIONS[0], [action]);
  const isDelete = action === "delete";
  const isMove = action === "move";

  async function submit() {
    if (action !== "delete" && !name.trim()) throw new Error("A governance name is required");
    if (!summary.trim()) throw new Error("Please describe the change");

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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{record ? "Suggest a governance change" : "Suggest governance data"}</DialogTitle>
          <DialogDescription>
            Your suggestion is reviewed by an administrator before the public governance model changes.
          </DialogDescription>
        </DialogHeader>

        {!record && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ACTIONS.map(({ value, label, icon: Icon }) => (
              <Button key={value} type="button" variant={action === value ? "default" : "outline"} className="justify-start" onClick={() => setAction(value)}>
                <Icon className="mr-2 h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>
        )}

        <div className="rounded-lg border bg-muted/20 p-3 text-sm">
          <div className="font-medium">{actionMeta.label}</div>
          <div className="mt-1 text-muted-foreground">This will create a review item only. It will not change live governance data until approved.</div>
        </div>

        {!isDelete && !isMove && (
          <Tabs defaultValue="record" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="record"><FileText className="mr-2 h-4 w-4" />Record</TabsTrigger>
              <TabsTrigger value="hierarchy"><GitBranch className="mr-2 h-4 w-4" />Hierarchy</TabsTrigger>
              <TabsTrigger value="boundary"><Map className="mr-2 h-4 w-4" />Boundary</TabsTrigger>
            </TabsList>
            <TabsContent value="record" className="space-y-4 pt-4">
              <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ministry of Railways" /></div>
              <div className="space-y-2"><Label>Type</Label><Select value={entityType} onValueChange={setEntityType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TYPES.map(([value,label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Short name</Label><Input value={shortName} onChange={(e) => setShortName(e.target.value)} placeholder="Optional" /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What this body is responsible for..." /></div>
              <div className="space-y-2"><Label>Official website</Label><Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." /></div>
            </TabsContent>
            <TabsContent value="hierarchy" className="space-y-4 pt-4">
              <div className="space-y-2"><Label>Parent governance record</Label><Select value={parentId || "root"} onValueChange={(v) => setParentId(v === "root" ? null : v)}><SelectTrigger><SelectValue placeholder="Choose parent" /></SelectTrigger><SelectContent><SelectItem value="root">No parent (top-level)</SelectItem>{parentOptions.filter((item) => item.id !== record?.id).map((item) => <SelectItem key={item.id} value={item.id}>{item.label || item.name}</SelectItem>)}</SelectContent></Select></div>
              <p className="text-xs text-muted-foreground">The hierarchy is intentionally flexible: a governance record can sit under any other governance record.</p>
            </TabsContent>
            <TabsContent value="boundary" className="space-y-4 pt-4">
              <div className="space-y-2"><Label>GeoJSON boundary</Label><Textarea className="min-h-40 font-mono text-xs" value={geomGeojson} onChange={(e) => setGeomGeojson(e.target.value)} placeholder='{"type":"MultiPolygon","coordinates":[...]}' /></div>
              <p className="text-xs text-muted-foreground">Paste a Polygon or MultiPolygon GeoJSON geometry. It will be stored as the governance unit boundary in PostGIS after approval.</p>
            </TabsContent>
          </Tabs>
        )}

        {isMove && (
          <div className="space-y-4">
            <div className="space-y-2"><Label>New parent</Label><Select value={parentId || "root"} onValueChange={(v) => setParentId(v === "root" ? null : v)}><SelectTrigger><SelectValue placeholder="Choose parent" /></SelectTrigger><SelectContent><SelectItem value="root">No parent (top-level)</SelectItem>{parentOptions.filter((item) => item.id !== record?.id).map((item) => <SelectItem key={item.id} value={item.id}>{item.label || item.name}</SelectItem>)}</SelectContent></Select></div>
          </div>
        )}

        {isDelete && <p className="text-sm text-muted-foreground">Request removal of <span className="font-medium text-foreground">{record?.name}</span>. An administrator will verify the request before removing the record.</p>}

        <div className="space-y-4 border-t pt-4">
          <div className="space-y-2"><Label>What should change?</Label><Textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Explain the change and why it is needed." /></div>
          <div className="space-y-2"><Label>Source URL</Label><Input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="Official source, OSM page, government document, etc." /></div>
          <div className="space-y-2"><Label>Source notes</Label><Textarea value={sourceNotes} onChange={(e) => setSourceNotes(e.target.value)} placeholder="Optional notes about the evidence." /></div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="button" disabled={isSubmitting} onClick={async () => { try { await submit(); } catch (error) { /* hook reports API errors */ } }}>
            {isSubmitting ? "Submitting..." : "Submit for review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
