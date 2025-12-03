// utils/userMapping.js
import { supabase } from 'utils/supabaseClient';

// Cache for user lookups
const userCache = new Map();

/**
 * Find user_id by name (fuzzy matching)
 */
export async function findUserIdByName(name) {
  if (!name) return null;
  
  // Check cache first
  if (userCache.has(name.toLowerCase())) {
    return userCache.get(name.toLowerCase());
  }
  
  try {
    const { data, error } = await supabase
      .from('profile')
      .select('user_id, name')
      .or(`name.ilike.%${name}%,name.ilike.${name}%`)
      .limit(1);
    
    if (error || !data || data.length === 0) {
      userCache.set(name.toLowerCase(), null);
      return null;
    }
    
    const userId = data[0].user_id;
    userCache.set(name.toLowerCase(), userId);
    return userId;
  } catch (err) {
    console.error('Error finding user by name:', err);
    return null;
  }
}

/**
 * Batch find user_ids for multiple names
 */
export async function findUserIdsByNames(names) {
  const results = {};
  
  for (const name of names) {
    const userId = await findUserIdByName(name);
    if (userId) {
      results[name] = userId;
    }
  }
  
  return results;
}

/**
 * Get user profiles by IDs
 */
export async function getUserProfiles(userIds) {
  if (!userIds || userIds.length === 0) return {};
  
  try {
    const { data, error } = await supabase
      .from('profile')
      .select('user_id, name, avatar_url, designation, email')
      .in('user_id', userIds);
    
    if (error) return {};
    
    const profiles = {};
    data.forEach(profile => {
      profiles[profile.user_id] = profile;
    });
    
    return profiles;
  } catch (err) {
    console.error('Error fetching user profiles:', err);
    return {};
  }
}