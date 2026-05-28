// pages/api/[space]/[scopeType]/[scopeCode].js
import { createServerSupabase } from "@/lib/supabase/server";
import { clubUpdateSchema } from "@/schemas/club";

async function verifyClubOwnership(
  supabase,
  space,
  scopeType,
  scopeCode,
  userId,
) {
  // First get space to get space_id
  const { data: spaceData, error: spaceError } = await supabase
    .from("space")
    .select("id")
    .eq("slug", space)
    .single();

  if (spaceError || !spaceData) {
    return { error: "Space not found", status: 404 };
  }

  // Then get club using space_id
  const { data: club, error } = await supabase
    .from("club")
    .select("id, created_by, logo_url, cover_url")
    .eq("space_id", spaceData.id)
    .eq("scope_type", scopeType)
    .eq("scope_code", scopeCode)
    .single();

  if (error || !club) {
    return { error: "Club not found", status: 404 };
  }

  if (club.created_by !== userId) {
    return { error: "You don't own this club", status: 403 };
  }

  return { club };
}

async function cleanupOldFiles(
  supabase,
  space,
  scopeType,
  scopeCode,
  newData,
  currentData,
) {
  try {
    // Check if logo is being changed or removed
    if (newData.logo_url !== undefined) {
      if (
        currentData.logo_url &&
        (newData.logo_url === null ||
          newData.logo_url === "" ||
          newData.logo_url !== currentData.logo_url)
      ) {
        const logoFileName = currentData.logo_url.split("/").pop();
        await supabase.storage
          .from("committee-branding")
          .remove([`${space}/${scopeType}/${scopeCode}/${logoFileName}`])
          .catch((err) =>
            console.log("Logo cleanup (non-critical):", err.message),
          );
      }
    }

    // Check if cover is being changed or removed
    if (newData.cover_url !== undefined) {
      if (
        currentData.cover_url &&
        (newData.cover_url === null ||
          newData.cover_url === "" ||
          newData.cover_url !== currentData.cover_url)
      ) {
        const coverFileName = currentData.cover_url.split("/").pop();
        await supabase.storage
          .from("committee-branding")
          .remove([`${space}/${scopeType}/${scopeCode}/${coverFileName}`])
          .catch((err) =>
            console.log("Cover cleanup (non-critical):", err.message),
          );
      }
    }
  } catch (error) {
    console.log("File cleanup error (non-critical):", error.message);
  }
}

export default async function handler(req, res) {
  const { method } = req;
  const { space, scopeType, scopeCode } = req.query;

  console.log("Club settings API called:", {
    space,
    scopeType,
    scopeCode,
    method,
  });

  if (!space || !scopeType || !scopeCode) {
    return res
      .status(400)
      .json({ error: "Space, scope type, and scope code are required" });
  }

  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const supabase = createServerSupabase(token);

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Auth error:", authError);
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    console.log("Authenticated user:", user.id);

    if (method === "GET") {
      const ownershipCheck = await verifyClubOwnership(
        supabase,
        space,
        scopeType,
        scopeCode,
        user.id,
      );

      if (ownershipCheck.error) {
        console.error("Ownership check failed:", ownershipCheck.error);
        return res
          .status(ownershipCheck.status)
          .json({ error: ownershipCheck.error });
      }

      // Get space to get space_id
      const { data: spaceData, error: spaceError } = await supabase
        .from("space")
        .select("id")
        .eq("slug", space)
        .single();

      if (spaceError || !spaceData) {
        return res.status(404).json({ error: "Space not found" });
      }

      // Get club data from the public view
      const { data: club, error } = await supabase
        .from("club_view")
        .select("*")
        .eq("space_slug", space)
        .eq("scope_type", scopeType)
        .eq("scope_code", scopeCode)
        .single();

      if (error || !club) {
        console.error("Club fetch error:", error);
        return res.status(404).json({ error: "Club not found" });
      }

      console.log("Found club:", club);

      return res.status(200).json(club || {});
    }

    if (method === "PUT" || method === "DELETE") {
      const ownershipCheck = await verifyClubOwnership(
        supabase,
        space,
        scopeType,
        scopeCode,
        user.id,
      );

      if (ownershipCheck.error) {
        console.error("Ownership check failed:", ownershipCheck.error);
        return res
          .status(ownershipCheck.status)
          .json({ error: ownershipCheck.error });
      }

      if (method === "PUT") {
        const validatedData = clubUpdateSchema.parse(req.body);

        console.log("Updating club with:", validatedData);

        // Get current data for cleanup
        const { data: currentData } = await supabase
          .from("club")
          .select("logo_url, cover_url")
          .eq("id", ownershipCheck.club.id)
          .single();

        if (currentData) {
          await cleanupOldFiles(
            supabase,
            space,
            scopeType,
            scopeCode,
            validatedData,
            currentData,
          );
        }

        // Update club
        const { error: updateError } = await supabase
          .from("club")
          .update(validatedData)
          .eq("id", ownershipCheck.club.id);

        if (updateError) {
          console.error("Database update error:", updateError);
          return res.status(500).json({ error: "Failed to update club" });
        }

        return res.status(200).json({ success: true });
      }

      if (method === "DELETE") {
        console.log("Deleting club:", ownershipCheck.club.id);

        // Clean up all files before deleting
        try {
          const { data: currentData } = await supabase
            .from("club")
            .select("logo_url, cover_url")
            .eq("id", ownershipCheck.club.id)
            .single();

          if (currentData) {
            if (currentData.logo_url) {
              const logoFileName = currentData.logo_url.split("/").pop();
              await supabase.storage
                .from("committee-branding")
                .remove([`${space}/${scopeType}/${scopeCode}/${logoFileName}`])
                .catch((err) =>
                  console.log("Logo deletion error:", err.message),
                );
            }

            if (currentData.cover_url) {
              const coverFileName = currentData.cover_url.split("/").pop();
              await supabase.storage
                .from("committee-branding")
                .remove([`${space}/${scopeType}/${scopeCode}/${coverFileName}`])
                .catch((err) =>
                  console.log("Cover deletion error:", err.message),
                );
            }
          }
        } catch (error) {
          console.log("File deletion during club delete:", error.message);
        }

        // Delete club
        const { error: deleteError } = await supabase
          .from("club")
          .delete()
          .eq("id", ownershipCheck.club.id);

        if (deleteError) {
          console.error("Club delete error:", deleteError);
          return res.status(500).json({ error: "Failed to delete club" });
        }

        return res.status(200).json({ success: true });
      }
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("API Error:", error);

    if (error.name === "ZodError") {
      return res.status(400).json({
        error: "Validation failed",
        details: error.errors,
      });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
}
