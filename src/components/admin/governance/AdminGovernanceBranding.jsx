import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useAdminGovernanceEntities } from "@/hooks/governance/useAdminGovernanceEntities";
import ImageUpload from "@/components/media/ImageUpload";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminGovernanceBranding() {
  const { data: entities = [], isLoading, error, updateGovernanceImage, isUpdating } = useAdminGovernanceEntities();
  const [selectedId, setSelectedId] = useState("");

  const selected = entities.find((item) => item.id === selectedId) || null;

  useEffect(() => {
    if (!selectedId && entities.length > 0) {
      setSelectedId(entities[0].id);
    }
  }, [entities, selectedId]);

  async function handleChange(url) {
    if (!selected) return;

    try {
      await updateGovernanceImage({
        governanceId: selected.id,
        imageUrl: url || null,
      });
      toast.success("Governance logo updated.");
    } catch (updateError) {
      toast.error(updateError?.message || "Unable to update governance logo.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Governance branding</CardTitle>
        <CardDescription>
          Add or change the logo shown for governance entities across Citizen Action.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading governance entities...</p>
        ) : error ? (
          <p className="text-sm text-destructive">Unable to load governance entities.</p>
        ) : entities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No governance entities found.</p>
        ) : (
          <>
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger>
                <SelectValue placeholder="Select governance entity" />
              </SelectTrigger>
              <SelectContent>
                {entities.map((entity) => (
                  <SelectItem key={entity.id} value={entity.id}>
                    {entity.name || entity.short_name || entity.slug}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selected && (
              <ImageUpload
                bucket="governance"
                path={`governance/${selected.id}/logo`}
                value={selected.image_url || null}
                onChange={handleChange}
                label={`${selected.name || "Governance"} logo`}
                helperText="PNG, JPG or WebP · up to 5 MB"
                disabled={isUpdating}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
