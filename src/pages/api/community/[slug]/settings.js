import { createServerSupabase } from "@/lib/supabase/server";
import { communityUpdateSchema } from "@/schemas/community";

/**
 * Helper to check if user owns the community
 */
async function verifyCommunityOwnership(supabase, slug, userId) {
  const { data: community, error } = await supabase
    .from("community")
    .select("owner_user_id, logo_url, cover_url")
    .eq("slug", slug)
    .single();

  if (error || !community) {
    return { error: "Community not found", status: 404 };
  }

  if (community.owner_user_id !== userId) {
    return { error: "You don't own this community", status: 403 };
  }

  return { community };
}

/**
 * Clean up old files from storage when they're being replaced or removed
 */
async function cleanupOldFiles(supabase, slug, newData, currentData) {
  try {
    // Check if logo is being changed or removed
    if (newData.logo_url !== undefined) {
      if (currentData.logo_url && (newData.logo_url === null || newData.logo_url === "" || newData.logo_url !== currentData.logo_url)) {
        const logoFileName = currentData.logo_url.split('/').pop();
        await supabase.storage
          .from('community-branding')
          .remove([`${slug}/${logoFileName}`])
          .catch(err => console.log("Logo cleanup (non-critical):", err.message));
      }
    }

    // Check if cover is being changed or removed
    if (newData.cover_url !== undefined) {
      if (currentData.cover_url && (newData.cover_url === null || newData.cover_url === "" || newData.cover_url !== currentData.cover_url)) {
        const coverFileName = currentData.cover_url.split('/').pop();
        await supabase.storage
          .from('community-branding')
          .remove([`${slug}/${coverFileName}`])
          .catch(err => console.log("Cover cleanup (non-critical):", err.message));
      }
    }
  } catch (error) {
    console.log("File cleanup error (non-critical):", error.message);
  }
}

export default async function handler(req, res) {
  const { method } = req;
  const slug = Array.isArray(req.query.slug) ? req.query.slug[0] : req.query.slug;
  
  if (!slug) {
    return res.status(400).json({ error: "Community slug is required" });
  }

  const token = req.headers.authorization?.replace("Bearer ", "");
  
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  // Create Supabase client with service role key (bypasses RLS)
  const supabase = createServerSupabase(token);

  try {
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    if (method === "GET") {
      const ownershipCheck = await verifyCommunityOwnership(supabase, slug, user.id);
      
      if (ownershipCheck.error) {
        return res.status(ownershipCheck.status).json({ error: ownershipCheck.error });
      }

      const { data: community } = await supabase
        .from("community_public")
        .select("*")
        .eq("slug", slug)
        .single();

      return res.status(200).json(community || {});
    }

    if (method === "PUT" || method === "DELETE") {
      const ownershipCheck = await verifyCommunityOwnership(supabase, slug, user.id);
      
      if (ownershipCheck.error) {
        return res.status(ownershipCheck.status).json({ error: ownershipCheck.error });
      }

      if (method === "PUT") {
        const validatedData = communityUpdateSchema.parse(req.body);
        
        // Get current data to compare for cleanup
        const { data: currentData } = await supabase
          .from("community")
          .select("logo_url, cover_url")
          .eq("slug", slug)
          .single();

        if (currentData) {
          // Clean up old files if needed
          await cleanupOldFiles(supabase, slug, validatedData, currentData);
        }
        
        // Update community data using service role (bypasses RLS)
        const { error: updateError } = await supabase
          .from("community")
          .update(validatedData)
          .eq("slug", slug);

        if (updateError) {
          console.error("Database update error:", updateError);
          return res.status(500).json({ error: "Failed to update community" });
        }

        return res.status(200).json({ success: true });
      }

      if (method === "DELETE") {
        // Clean up all files before deleting community
        try {
          const { data: currentData } = await supabase
            .from("community")
            .select("logo_url, cover_url")
            .eq("slug", slug)
            .single();

          if (currentData) {
            // Delete logo
            if (currentData.logo_url) {
              const logoFileName = currentData.logo_url.split('/').pop();
              await supabase.storage
                .from('community-branding')
                .remove([`${slug}/${logoFileName}`]);
            }
            
            // Delete cover
            if (currentData.cover_url) {
              const coverFileName = currentData.cover_url.split('/').pop();
              await supabase.storage
                .from('community-branding')
                .remove([`${slug}/${coverFileName}`]);
            }
          }
        } catch (error) {
          console.log("File deletion during community delete:", error.message);
        }

        const { error: deleteError } = await supabase
          .from("community")
          .delete()
          .eq("slug", slug);

        if (deleteError) {
          console.error("Community delete error:", deleteError);
          return res.status(500).json({ error: "Failed to delete community" });
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
        details: error.errors 
      });
    }
    
    return res.status(500).json({ error: "Internal server error" });
  }
}