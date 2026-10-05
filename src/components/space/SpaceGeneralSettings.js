"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useSpaces } from "@/hooks/space/useSpaces";
import { useUpdateSpace } from "@/hooks/space/useUpdateSpace";
import ImageUpload from "@/components/ui/ImageUpload";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function SpaceGeneralSettings({ spaceSlug }) {
  const {
    data: space,
    isLoading,
    error,
  } = useSpaces({
    slug: spaceSlug,
    privateAccess: true,
    includeInactive: true,
    enabled: !!spaceSlug,
  });

  const { updateSpace, isUpdating } = useUpdateSpace();

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    email: "",
    website: "",
    contact_number: "",
    logo_url: "",
    cover_url: "",
  });

  useEffect(() => {
    if (!space) return;

    setForm({
      name: space.name || "",
      slug: space.slug || "",
      description: space.description || "",
      email: space.email || "",
      website: space.website || "",
      contact_number: space.contact_number || "",
      logo_url: space.logo_url || "",
      cover_url: space.cover_url || "",
    });
  }, [space]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!space) return;

    const name = form.name.trim();
    const slug = form.slug.trim();
    const email = form.email.trim();

    if (!name) return toast.error("Space name is required.");
    if (!slug) return toast.error("Space URL is required.");
    if (!email) return toast.error("Space email is required.");

    try {
      await updateSpace({
        spaceId: space.id,
        name,
        slug,
        description: form.description.trim() || null,
        email,
        website: form.website.trim() || null,
        contact_number: form.contact_number.trim() || null,
        logo_url: form.logo_url.trim() || null,
        cover_url: form.cover_url.trim() || null,
      });
      toast.success("Space profile saved.");
    } catch (updateError) {
      console.error(updateError);
      if (updateError?.code === "23505") {
        toast.error("That Space URL is already in use.");
      } else {
        toast.error(updateError?.message || "Unable to save Space profile.");
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="font-medium">Unable to load Space profile.</p>
        <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  if (!space) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Info & identity</h2>
          <p className="text-sm text-muted-foreground">
            Manage the identity and public information for this Space.
          </p>
        </div>
        <Card>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="space-name">Space name</Label>
              <Input id="space-name" value={form.name} onChange={(event) => updateField("name", event.target.value)} disabled={isUpdating} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="space-slug">Space URL</Label>
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-sm text-muted-foreground">/space/</span>
                <Input
                  id="space-slug"
                  value={form.slug}
                  onChange={(event) =>
                    updateField("slug", event.target.value.toLowerCase().replace(/\s+/g, "-"))
                  }
                  disabled={isUpdating}
                />
              </div>
              <p className="text-xs text-muted-foreground">Changing the URL will change the public address of this Space.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="space-description">Description</Label>
              <Textarea
                id="space-description"
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
                rows={5}
                maxLength={2000}
                disabled={isUpdating}
              />
              <div className="text-right text-xs text-muted-foreground">{form.description.length}/2000</div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Contact</h2>
          <p className="text-sm text-muted-foreground">Public contact information for this Space.</p>
        </div>
        <Card>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="space-email">Email</Label>
              <Input id="space-email" type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} disabled={isUpdating} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="space-website">Website</Label>
              <Input id="space-website" type="url" placeholder="https://example.com" value={form.website} onChange={(event) => updateField("website", event.target.value)} disabled={isUpdating} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="space-contact">Contact number</Label>
              <Input id="space-contact" value={form.contact_number} onChange={(event) => updateField("contact_number", event.target.value)} disabled={isUpdating} />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Appearance</h2>
          <p className="text-sm text-muted-foreground">Configure the visual identity of your Space.</p>
        </div>
        <Card>
          <CardContent className="space-y-8 pt-6">
            <ImageUpload
              bucket="space"
              path={`${space.slug}/logo`}
              value={form.logo_url || null}
              onChange={(url) => updateField("logo_url", url || "")}
              label="Space logo"
              helperText="PNG, JPG or WebP · up to 5 MB"
              disabled={isUpdating}
            />
            <ImageUpload
              bucket="space"
              path={`${space.slug}/cover`}
              value={form.cover_url || null}
              onChange={(url) => updateField("cover_url", url || "")}
              label="Cover image"
              helperText="PNG, JPG or WebP · up to 5 MB"
              disabled={isUpdating}
            />
          </CardContent>
        </Card>
      </section>

      <div className="flex justify-end">
        <Button type="submit" disabled={isUpdating}>
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
