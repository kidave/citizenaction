// pages/api/committee/[community]/[scopeType]/[scopeCode]/settings.js
import { createServerSupabase } from "@/lib/supabase/server";
import { committeeUpdateSchema } from "@/schemas/committee";

async function verifyCommitteeOwnership(supabase, community, scopeType, scopeCode, userId) {
  // First get community to get community_id
  const { data: communityData, error: communityError } = await supabase
    .from("community")
    .select("id")
    .eq("slug", community)
    .single();

  if (communityError || !communityData) {
    return { error: "Community not found", status: 404 };
  }

  // Then get committee using community_id
  const { data: committee, error } = await supabase
    .from("community_committee")
    .select("id, created_by, logo_url, cover_url")
    .eq("community_id", communityData.id)
    .eq("scope_type", scopeType)
    .eq("scope_code", scopeCode)
    .single();

  if (error || !committee) {
    return { error: "Committee not found", status: 404 };
  }

  if (committee.created_by !== userId) {
    return { error: "You don't own this committee", status: 403 };
  }

  return { committee };
}

async function cleanupOldFiles(supabase, community, scopeType, scopeCode, newData, currentData) {
  try {
    // Check if logo is being changed or removed
    if (newData.logo_url !== undefined) {
      if (currentData.logo_url && (newData.logo_url === null || newData.logo_url === "" || newData.logo_url !== currentData.logo_url)) {
        const logoFileName = currentData.logo_url.split('/').pop();
        await supabase.storage
          .from('committee-branding')
          .remove([`${community}/${scopeType}/${scopeCode}/${logoFileName}`])
          .catch(err => console.log("Logo cleanup (non-critical):", err.message));
      }
    }

    // Check if cover is being changed or removed
    if (newData.cover_url !== undefined) {
      if (currentData.cover_url && (newData.cover_url === null || newData.cover_url === "" || newData.cover_url !== currentData.cover_url)) {
        const coverFileName = currentData.cover_url.split('/').pop();
        await supabase.storage
          .from('committee-branding')
          .remove([`${community}/${scopeType}/${scopeCode}/${coverFileName}`])
          .catch(err => console.log("Cover cleanup (non-critical):", err.message));
      }
    }
  } catch (error) {
    console.log("File cleanup error (non-critical):", error.message);
  }
}

export default async function handler(req, res) {
  const { method } = req;
  const { community, scopeType, scopeCode } = req.query;
  
  console.log("Committee settings API called:", { community, scopeType, scopeCode, method });
  
  if (!community || !scopeType || !scopeCode) {
    return res.status(400).json({ error: "Community, scope type, and scope code are required" });
  }

  const token = req.headers.authorization?.replace("Bearer ", "");
  
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const supabase = createServerSupabase(token);

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error("Auth error:", authError);
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    console.log("Authenticated user:", user.id);

    if (method === "GET") {
      const ownershipCheck = await verifyCommitteeOwnership(supabase, community, scopeType, scopeCode, user.id);
      
      if (ownershipCheck.error) {
        console.error("Ownership check failed:", ownershipCheck.error);
        return res.status(ownershipCheck.status).json({ error: ownershipCheck.error });
      }

      // Get community to get community_id
      const { data: communityData, error: communityError } = await supabase
        .from("community")
        .select("id")
        .eq("slug", community)
        .single();

      if (communityError || !communityData) {
        return res.status(404).json({ error: "Community not found" });
      }

      // Get committee data from the public view
      const { data: committee, error } = await supabase
        .from("community_committee_public")
        .select("*")
        .eq("community_slug", community)
        .eq("scope_type", scopeType)
        .eq("scope_code", scopeCode)
        .single();

      if (error || !committee) {
        console.error("Committee fetch error:", error);
        return res.status(404).json({ error: "Committee not found" });
      }

      console.log("Found committee:", committee);

      return res.status(200).json(committee || {});
    }

    if (method === "PUT" || method === "DELETE") {
      const ownershipCheck = await verifyCommitteeOwnership(supabase, community, scopeType, scopeCode, user.id);
      
      if (ownershipCheck.error) {
        console.error("Ownership check failed:", ownershipCheck.error);
        return res.status(ownershipCheck.status).json({ error: ownershipCheck.error });
      }

      if (method === "PUT") {
        const validatedData = committeeUpdateSchema.parse(req.body);
        
        console.log("Updating committee with:", validatedData);
        
        // Get current data for cleanup
        const { data: currentData } = await supabase
          .from("community_committee")
          .select("logo_url, cover_url")
          .eq("id", ownershipCheck.committee.id)
          .single();

        if (currentData) {
          await cleanupOldFiles(supabase, community, scopeType, scopeCode, validatedData, currentData);
        }
        
        // Update committee
        const { error: updateError } = await supabase
          .from("community_committee")
          .update(validatedData)
          .eq("id", ownershipCheck.committee.id);

        if (updateError) {
          console.error("Database update error:", updateError);
          return res.status(500).json({ error: "Failed to update committee" });
        }

        return res.status(200).json({ success: true });
      }

      if (method === "DELETE") {
        console.log("Deleting committee:", ownershipCheck.committee.id);
        
        // Clean up all files before deleting
        try {
          const { data: currentData } = await supabase
            .from("community_committee")
            .select("logo_url, cover_url")
            .eq("id", ownershipCheck.committee.id)
            .single();

          if (currentData) {
            if (currentData.logo_url) {
              const logoFileName = currentData.logo_url.split('/').pop();
              await supabase.storage
                .from('committee-branding')
                .remove([`${community}/${scopeType}/${scopeCode}/${logoFileName}`])
                .catch(err => console.log("Logo deletion error:", err.message));
            }
            
            if (currentData.cover_url) {
              const coverFileName = currentData.cover_url.split('/').pop();
              await supabase.storage
                .from('committee-branding')
                .remove([`${community}/${scopeType}/${scopeCode}/${coverFileName}`])
                .catch(err => console.log("Cover deletion error:", err.message));
            }
          }
        } catch (error) {
          console.log("File deletion during committee delete:", error.message);
        }

        // Delete committee
        const { error: deleteError } = await supabase
          .from("community_committee")
          .delete()
          .eq("id", ownershipCheck.committee.id);

        if (deleteError) {
          console.error("Committee delete error:", deleteError);
          return res.status(500).json({ error: "Failed to delete committee" });
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