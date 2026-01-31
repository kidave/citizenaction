// pages/api/community/[slug]/apply-committee.js
import { createServerSupabase } from "@/lib/supabase/server";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { slug } = req.query;
  const committeeData = req.body;

  if (!slug) {
    return res.status(400).json({ error: "Missing community slug" });
  }

  try {
    // Get the JWT token from the Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: "Authorization token required",
        details: "Please provide a valid Bearer token"
      });
    }
    
    const accessToken = authHeader.substring(7);
    
    // Create Supabase client with the user's JWT
    const supabase = createServerSupabase(accessToken);
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      console.error("Auth error:", authError);
      return res.status(401).json({ 
        error: "You must be logged in to create a committee",
        details: authError?.message || "Invalid authentication token"
      });
    }

    console.log("Authenticated user:", user.email);

    // Get community
    const { data: community, error: communityError } = await supabase
      .from("community")
      .select("id, owner_user_id, name")
      .eq("slug", slug)
      .single();

    if (communityError || !community) {
      console.error("Community error:", communityError);
      return res.status(404).json({ error: "Community not found" });
    }

    // Check if user is the community owner
    if (user.id !== community.owner_user_id) {
      // Get user profile for better error message
      const { data: profile } = await supabase
        .from("profile")
        .select("name")
        .eq("user_id", user.id)
        .single();
      
      return res.status(403).json({ 
        error: "Only community owners can create committees",
        details: `You (${profile?.name || user.email}) are not the owner of "${community.name}"`
      });
    }

    // Validate required fields
    if (!committeeData.name?.trim()) {
      return res.status(400).json({ error: "Committee name is required" });
    }

    if (!committeeData.scope_type?.trim() || !committeeData.scope_code?.trim()) {
      return res.status(400).json({ error: "Scope type and code are required" });
    }

    // Validate that the scope exists in geographic_scope table
    const { data: geographicScope, error: scopeError } = await supabase
      .from("geographic_scope")
      .select("id, name, type, code")
      .eq("type", committeeData.scope_type)
      .eq("code", committeeData.scope_code)
      .single();

    if (scopeError) {
      return res.status(400).json({ 
        error: `Invalid scope: ${committeeData.scope_type}:${committeeData.scope_code} not found in geographic database`,
        details: "Please select a valid geographic scope"
      });
    }

    // Check if committee already exists with same scope
    // Try community_committee first, then fall back to committee
    let existingCommittee = null;
    
    const { data: existingCommunityCommittee } = await supabase
      .from("community_committee")
      .select("id, name")
      .eq("community_id", community.id)
      .eq("scope_type", committeeData.scope_type)
      .eq("scope_code", committeeData.scope_code)
      .maybeSingle();

    if (existingCommunityCommittee) {
      existingCommittee = existingCommunityCommittee;
    } else {
      // Fallback to committee table
      const { data: existingRegularCommittee } = await supabase
        .from("committee")
        .select("id, name")
        .eq("community_id", community.id)
        .eq("scope_type", committeeData.scope_type)
        .eq("scope_code", committeeData.scope_code)
        .maybeSingle();
      
      existingCommittee = existingRegularCommittee;
    }

    if (existingCommittee) {
      return res.status(400).json({ 
        error: `Committee "${existingCommittee.name}" with scope ${committeeData.scope_type}:${committeeData.scope_code} already exists`,
        existingCommittee: existingCommittee.name
      });
    }

    // Get user profile for contact info
    const { data: profile } = await supabase
      .from("profile")
      .select("name, email, mobile, phone")
      .eq("user_id", user.id)
      .single();

    // Create committee - try community_committee first, then fall back to committee
    let newCommittee = null;
    let createError = null;
    let committeeId = null;

    // First try community_committee
    const { data: communityCommittee, error: ccError } = await supabase
      .from("community_committee")
      .insert({
        community_id: community.id,
        name: committeeData.name.trim(),
        description: committeeData.description?.trim() || null,
        scope_type: committeeData.scope_type,
        scope_code: committeeData.scope_code,
        contact_email: committeeData.contact_email?.trim() || profile?.email || user.email,
        contact_phone: committeeData.contact_phone?.trim() || profile?.mobile || profile?.phone,
        is_active: true,
        created_by: user.id,
      })
      .select()
      .single();

    if (ccError) {
      // If community_committee fails, try committee table
      console.log("community_committee insert failed, trying committee table:", ccError.message);
      
      const { data: regularCommittee, error: cError } = await supabase
        .from("committee")
        .insert({
          community_id: community.id,
          name: committeeData.name.trim(),
          description: committeeData.description?.trim() || null,
          scope_type: committeeData.scope_type,
          scope_code: committeeData.scope_code,
          contact_email: committeeData.contact_email?.trim() || profile?.email || user.email,
          contact_phone: committeeData.contact_phone?.trim() || profile?.mobile || profile?.phone,
          is_active: true,
          created_by: user.id,
        })
        .select()
        .single();

      if (cError) {
        createError = cError;
      } else {
        newCommittee = regularCommittee;
        committeeId = regularCommittee.id;
      }
    } else {
      newCommittee = communityCommittee;
      committeeId = communityCommittee.id;
    }

    if (createError) {
      console.error("Committee creation error:", createError);
      return res.status(500).json({ 
        error: "Failed to create committee", 
        details: createError.message,
        code: createError.code
      });
    }

    // Auto-add creator as committee member with chair role
    if (committeeId) {
      try {
        // Try committee_member table first
        const { error: memberError } = await supabase
          .from("committee_member")
          .insert({
            committee_id: committeeId,
            user_id: user.id,
            role: 'chair', // Community owner becomes chair by default
            is_active: true,
          });

        if (memberError) {
          console.error("Failed to add creator as committee_member:", memberError);
          // Try alternative table name if exists
        }
      } catch (memberError) {
        console.error("Error adding committee member:", memberError);
        // Continue anyway - committee was created
      }
    }

    return res.status(201).json({ 
      message: "Committee created successfully",
      committee: newCommittee,
      geographicScope: {
        name: geographicScope.name,
        type: geographicScope.type,
        code: geographicScope.code
      }
    });

  } catch (error) {
    console.error("Unexpected error in apply-committee:", error);
    return res.status(500).json({ 
      error: "Internal server error",
      message: error.message
    });
  }
}