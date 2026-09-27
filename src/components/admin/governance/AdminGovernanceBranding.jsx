import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useAdminGovernanceEntities } from "@/hooks/governance/useAdminGovernanceEntities";
import ImageUpload from "@/components/ui/ImageUpload";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link2, Loader2 } from "lucide-react";
import { useImportGovernanceOrganizationImage } from "@/hooks/governance/useImportGovernanceOrganizationImage";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminGovernanceBranding() {
  const {
    data: entities = [],
    isLoading,
    error,
    updateGovernanceImage,
    isUpdating,
  } = useAdminGovernanceEntities();
  const [selectedId, setSelectedId] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const { importOrganizationImage } = useImportGovernanceOrganizationImage();

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

  async function importImage() {
    if (!selected || !sourceUrl.trim()) return;
    try {
      setImporting(true);
      const imported = await importOrganizationImage({
        organizationId: selected.id,
        sourceUrl: sourceUrl.trim(),
      });
      await handleChange(imported.imageUrl);
      setSourceUrl("");
    } catch (error) {
      toast.error(error?.message || "Unable to import organization image.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Governance branding</CardTitle>
        <CardDescription>
          Add or change the logo shown for governance entities across Citizen
          Action.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">
            Loading governance entities...
          </p>
        ) : error ? (
          <p className="text-sm text-destructive">
            Unable to load governance entities.
          </p>
        ) : entities.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No governance entities found.
          </p>
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
              <div className="space-y-4">
                <ImageUpload
                  bucket="governance"
                  path={`governance/organization/${selected.id}/logo`}
                  value={selected.image_url || null}
                  onChange={handleChange}
                  label={`${selected.name || "Governance"} logo`}
                  helperText="PNG, JPG or WebP · up to 5 MB"
                  disabled={isUpdating || importing}
                />
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">
                    Or import from URL
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="url"
                      value={sourceUrl}
                      onChange={(event) => setSourceUrl(event.target.value)}
                      placeholder="Paste Instagram image URL"
                      disabled={isUpdating || importing}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={importImage}
                      disabled={isUpdating || importing || !sourceUrl.trim()}
                    >
                      {importing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Link2 className="h-4 w-4" />
                      )}
                      <span className="hidden sm:inline">
                        {importing ? "Importing..." : "Import"}
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
