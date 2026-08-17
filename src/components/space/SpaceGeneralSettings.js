"use client";

import { useEffect, useState } from "react";

import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { supabase } from "@/lib/supabase/client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function SpaceGeneralSettings({ spaceSlug }) {
  const [space, setSpace] = useState(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    email: "",
    website: "",
    contact_number: "",
    logo_url: "",
    cover_url: "",
    primary_color: "",
  });

  /* ========================================
     LOAD
  ======================================== */

  useEffect(() => {
    if (!spaceSlug) {
      return;
    }

    async function loadSpace() {
      setLoading(true);

      const { data, error } = await supabase
        .from("space")
        .select(
          `
          id,
          name,
          slug,
          description,
          email,
          website,
          contact_number,
          logo_url,
          cover_url,
          primary_color
        `,
        )
        .eq("slug", spaceSlug)
        .single();

      if (error) {
        console.error(error);

        toast.error("Unable to load Space settings.");

        setLoading(false);

        return;
      }

      setSpace(data);

      setForm({
        name: data.name || "",
        slug: data.slug || "",
        description: data.description || "",
        email: data.email || "",
        website: data.website || "",
        contact_number: data.contact_number || "",
        logo_url: data.logo_url || "",
        cover_url: data.cover_url || "",
        primary_color: data.primary_color || "",
      });

      setLoading(false);
    }

    loadSpace();
  }, [spaceSlug]);

  /* ========================================
     CHANGE
  ======================================== */

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  /* ========================================
     SAVE
  ======================================== */

  async function handleSubmit(event) {
    event.preventDefault();

    if (!space) {
      return;
    }

    if (!form.name.trim()) {
      toast.error("Space name is required.");
      return;
    }

    if (!form.email.trim()) {
      toast.error("Space email is required.");
      return;
    }

    setSaving(true);

    /*
     * We intentionally update only editable
     * Space information.
     *
     * owner_user_id
     * category_id
     * is_active
     *
     * are NOT editable here.
     */

    const { error } = await supabase
      .from("space")
      .update({
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || null,
        email: form.email.trim(),
        website: form.website.trim() || null,
        contact_number: form.contact_number.trim() || null,
        logo_url: form.logo_url.trim() || null,
        cover_url: form.cover_url.trim() || null,
        primary_color: form.primary_color.trim() || null,
      })
      .eq("id", space.id);

    setSaving(false);

    if (error) {
      console.error(error);

      if (error.code === "23505") {
        toast.error("That Space URL is already in use.");
      } else {
        toast.error(error.message || "Unable to save Space settings.");
      }

      return;
    }

    toast.success("Space settings saved.");

    setSpace((current) => ({
      ...current,
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || null,
      email: form.email.trim(),
      website: form.website.trim() || null,
      contact_number: form.contact_number.trim() || null,
      logo_url: form.logo_url.trim() || null,
      cover_url: form.cover_url.trim() || null,
      primary_color: form.primary_color.trim() || null,
    }));
  }

  /* ========================================
     LOADING
  ======================================== */

  if (loading) {
    return (
      <Card>
        <CardContent className="flex min-h-40 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!space) {
    return null;
  }

  /* ========================================
     FORM
  ======================================== */

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>

          <CardDescription>
            Manage the information displayed on your Space.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* NAME */}

          <div className="space-y-2">
            <Label htmlFor="space-name">Space name</Label>

            <Input
              id="space-name"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              disabled={saving}
            />
          </div>

          {/* SLUG */}

          <div className="space-y-2">
            <Label htmlFor="space-slug">Space URL</Label>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">/space/</span>

              <Input
                id="space-slug"
                value={form.slug}
                onChange={(event) =>
                  updateField(
                    "slug",
                    event.target.value.toLowerCase().replace(/\s+/g, "-"),
                  )
                }
                disabled={saving}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Changing the URL will change the public address of this Space.
            </p>
          </div>

          {/* DESCRIPTION */}

          <div className="space-y-2">
            <Label htmlFor="space-description">Description</Label>

            <Textarea
              id="space-description"
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              rows={5}
              maxLength={2000}
              disabled={saving}
            />

            <div className="text-right text-xs text-muted-foreground">
              {form.description.length}/2000
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact</CardTitle>

          <CardDescription>
            Public contact information for this Space.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="space-email">Email</Label>

            <Input
              id="space-email"
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="space-website">Website</Label>

            <Input
              id="space-website"
              type="url"
              placeholder="https://example.com"
              value={form.website}
              onChange={(event) => updateField("website", event.target.value)}
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="space-contact">Contact number</Label>

            <Input
              id="space-contact"
              value={form.contact_number}
              onChange={(event) =>
                updateField("contact_number", event.target.value)
              }
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>

          <CardDescription>
            Configure the visual identity of your Space.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="space-logo">Logo URL</Label>

            <Input
              id="space-logo"
              type="url"
              value={form.logo_url}
              onChange={(event) => updateField("logo_url", event.target.value)}
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="space-cover">Cover URL</Label>

            <Input
              id="space-cover"
              type="url"
              value={form.cover_url}
              onChange={(event) => updateField("cover_url", event.target.value)}
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="space-primary-color">Primary color</Label>

            <Input
              id="space-primary-color"
              placeholder="#000000"
              value={form.primary_color}
              onChange={(event) =>
                updateField("primary_color", event.target.value)
              }
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
