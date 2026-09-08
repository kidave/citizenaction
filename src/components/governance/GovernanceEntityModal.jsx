import { useEffect, useState } from "react";
import { ExternalLink, Pencil, Save, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { getGovernanceLabel } from "@/utils/governance";

const ENTITY_TYPES = [
  "authority",
  "unit",
  "position",
  "person",
  "organisation",
  "committee",
  "programme",
  "project",
  "ministry",
  "department",
  "division",
  "office",
  "ward",
  "station",
];

function formatType(entity) {
  const type = entity?.entity_type || entity?.unit_type;
  if (!type) return "Governance";
  return type.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function getInitials(value) {
  return value?.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "G";
}

function EditableField({ label, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export default function GovernanceEntityModal({
  open,
  onOpenChange,
  entity,
  parent,
  childEntities = [],
  canEdit = false,
  onSelect,
  onSaved,
}) {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    if (!open) {
      setEditing(false);
      setDraft(null);
      return;
    }
    if (entity) {
      setEditing(false);
      setDraft({
        name: entity.name || "",
        short_name: entity.short_name || "",
        description: entity.description || "",
        website: entity.website || "",
        entity_type: entity.entity_type || "authority",
      });
    }
  }, [open, entity]);

  if (!entity) return null;

  const label = getGovernanceLabel(entity);
  const updateDraft = (key, value) => setDraft((current) => ({ ...current, [key]: value }));

  const save = async () => {
    if (!draft?.name?.trim()) {
      toast.error("Name is required");
      return;
    }

    setSaving(true);
    const { data, error } = await supabase
      .from("governance")
      .update({
        name: draft.name.trim(),
        short_name: draft.short_name.trim() || null,
        description: draft.description.trim() || null,
        website: draft.website.trim() || null,
        entity_type: draft.entity_type,
        ...(user?.id ? { updated_by: user.id } : {}),
      })
      .eq("id", entity.id)
      .select("*")
      .single();

    if (error) {
      toast.error(error.message || "Unable to save governance entity");
      setSaving(false);
      return;
    }

    setSaving(false);
    setEditing(false);
    setDraft(null);
    onSaved?.(data);
    toast.success("Governance entity updated");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <div className="flex items-start gap-3 pr-8">
          <Avatar className="h-12 w-12 rounded-xl">
            <AvatarImage src={entity.image_url || undefined} alt="" />
            <AvatarFallback className="rounded-xl">{getInitials(label)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            {editing ? (
              <Input autoFocus value={draft?.name || ""} onChange={(event) => updateDraft("name", event.target.value)} className="text-lg font-semibold" />
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold">{label}</h2>
                <Badge variant="outline">{formatType(entity)}</Badge>
              </div>
            )}
            {editing && (
              <div className="mt-2">
                <Select value={draft?.entity_type || "authority"} onValueChange={(value) => updateDraft("entity_type", value)}>
                  <SelectTrigger className="h-8 w-52"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ENTITY_TYPES.map((type) => <SelectItem key={type} value={type}>{formatType({ entity_type: type })}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          {canEdit && !editing && (
            <Button type="button" variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="mr-2 h-3.5 w-3.5" />Edit
            </Button>
          )}
        </div>

        {editing ? (
          <div className="space-y-4 py-2">
            <EditableField label="Short name"><Input value={draft?.short_name || ""} onChange={(event) => updateDraft("short_name", event.target.value)} placeholder="Optional" /></EditableField>
            <EditableField label="Description"><Textarea value={draft?.description || ""} onChange={(event) => updateDraft("description", event.target.value)} rows={4} placeholder="Optional" /></EditableField>
            <EditableField label="Official website"><Input type="url" value={draft?.website || ""} onChange={(event) => updateDraft("website", event.target.value)} placeholder="https://" /></EditableField>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => { setEditing(false); setDraft(null); }} disabled={saving}><X className="mr-2 h-4 w-4" />Cancel</Button>
              <Button type="button" onClick={save} disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? "Saving..." : "Save changes"}</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {parent && (
              <section>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Parent</p>
                <button type="button" onClick={() => onSelect?.(parent)} className="mt-2 w-full rounded-lg border p-3 text-left hover:bg-accent">
                  <span className="block truncate text-sm font-medium">{getGovernanceLabel(parent)}</span>
                  <span className="text-xs text-muted-foreground">{formatType(parent)}</span>
                </button>
              </section>
            )}

            {entity.description && (
              <section>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">About</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{entity.description}</p>
              </section>
            )}

            <section>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Children</p>
                <span className="text-xs text-muted-foreground">{childEntities.length}</span>
              </div>
              {childEntities.length ? (
                <div className="mt-2 max-h-52 space-y-1 overflow-y-auto">
                  {childEntities.map((child) => (
                    <button type="button" key={child.id} onClick={() => onSelect?.(child)} className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left hover:bg-muted">
                      <span className="min-w-0 truncate text-sm font-medium">{getGovernanceLabel(child)}</span>
                      <span className="ml-3 shrink-0 text-xs text-muted-foreground">{formatType(child)}</span>
                    </button>
                  ))}
                </div>
              ) : <p className="mt-2 text-sm text-muted-foreground">No child entities recorded yet.</p>}
            </section>

            {entity.website && (
              <a href={entity.website} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm font-medium hover:underline">
                Official website <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </a>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
