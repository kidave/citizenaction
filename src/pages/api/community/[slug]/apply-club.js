// pages/api/community/[slug]/apply-club.js
import { createServerSupabase } from "@/lib/supabase/server";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { slug } = req.query;
  const clubData = req.body;

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
        error: "You must be logged in to create a club",
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
        error: "Only community owners can create clubs",
        details: `You (${profile?.name || user.email}) are not the owner of "${community.name}"`
      });
    }

    // Validate required fields

    if (!clubData.scope_type?.trim() || !clubData.scope_code?.trim()) {
      return res.status(400).json({ error: "Scope type and code are required" });
    }

    // Validate that the scope exists in geographic_scope table
    const { data: geographicScope, error: scopeError } = await supabase
      .from("geographic_scope")
      .select("id, name, type, code")
      .eq("type", clubData.scope_type)
      .eq("code", clubData.scope_code)
      .single();

    if (scopeError) {
      return res.status(400).json({ 
        error: `Invalid scope: ${clubData.scope_type}:${clubData.scope_code} not found in geographic database`,
        details: "Please select a valid geographic scope"
      });
    }

    // Check if club already exists with same scope
    // Try community_committee first, then fall back to club
    let existingClub = null;
    
    const { data: existingCommunityClub } = await supabase
      .from("community_committee")
      .select("id, name")
      .eq("community_id", community.id)
      .eq("scope_type", clubData.scope_type)
      .eq("scope_code", clubData.scope_code)
      .maybeSingle();

    if (existingCommunityClub) {
      existingClub = existingCommunityClub;
    } else {
      // Fallback to club table
      const { data: existingRegularClub } = await supabase
        .from("club")
        .select("id, name")
        .eq("community_id", community.id)
        .eq("scope_type", clubData.scope_type)
        .eq("scope_code", clubData.scope_code)
        .maybeSingle();
      
      existingClub = existingRegularClub;
    }

    if (existingClub) {
      return res.status(400).json({ 
        error: `A club already exists for the selected ${clubData.scope_type}.`,
        existingClub: existingClub.name
      });
    }

    // Get user profile for contact info
    const { data: profile } = await supabase
      .from("profile")
      .select("name, email, mobile, phone")
      .eq("user_id", user.id)
      .single();

    // Create club - try community_committee first, then fall back to club
    let newClub = null;
    let createError = null;
    let clubId = null;

    // First try community_committee
    const { data: communityClub, error: ccError } = await supabase
      .from("community_committee")
      .insert({
        community_id: community.id,
        name: null,
        description: clubData.description?.trim() || null,
        scope_type: clubData.scope_type,
        scope_code: clubData.scope_code,
        contact_email: clubData.contact_email?.trim() || profile?.email || user.email,
        contact_phone: clubData.contact_phone?.trim() || profile?.mobile || profile?.phone,
        is_active: true,
        created_by: user.id,
      })
      .select()
      .single();

    if (ccError) {
      // If community_committee fails, try club table
      console.log("community_committee insert failed, trying club table:", ccError.message);
      
      const { data: regularClub, error: cError } = await supabase
        .from("club")
        .insert({
          community_id: community.id,
          name: null,
          description: clubData.description?.trim() || null,
          scope_type: clubData.scope_type,
          scope_code: clubData.scope_code,
          contact_email: clubData.contact_email?.trim() || profile?.email || user.email,
          contact_phone: clubData.contact_phone?.trim() || profile?.mobile || profile?.phone,
          is_active: true,
          created_by: user.id,
        })
        .select()
        .single();

      if (cError) {
        createError = cError;
      } else {
        newClub = regularClub;
        clubId = regularClub.id;
      }
    } else {
      newClub = communityClub;
      clubId = communityClub.id;
    }

    if (createError) {
      console.error("Club creation error:", createError);
      return res.status(500).json({ 
        error: "Failed to create club", 
        details: createError.message,
        code: createError.code
      });
    }

    // Auto-add creator as club member with chair role
    if (clubId) {
      try {
        // Try club_member table first
        const { error: memberError } = await supabase
          .from("club_member")
          .insert({
            club_id: clubId,
            user_id: user.id,
            role: 'chair', // Community owner becomes chair by default
            is_active: true,
          });

        if (memberError) {
          console.error("Failed to add creator as club_member:", memberError);
          // Try alternative table name if exists
        }
      } catch (memberError) {
        console.error("Error adding club member:", memberError);
        // Continue anyway - club was created
      }
    }

    return res.status(201).json({ 
      message: "Club created successfully",
      club: newClub,
      geographicScope: {
        name: geographicScope.name,
        type: geographicScope.type,
        code: geographicScope.code
      }
    });

  } catch (error) {
    console.error("Unexpected error in apply-club:", error);
    return res.status(500).json({ 
      error: "Internal server error",
      message: error.message
    });
  }
}