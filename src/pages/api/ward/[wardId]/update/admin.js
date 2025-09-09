// pages/api/ward/[wardId]/update/admin.js
import { createServerSupabase } from "utils/supabaseServer";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const supabase = createServerSupabase(token);
    const { wardId } = req.query;

    // Verify user has admin access to this ward
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if user is admin for this ward
    const { data: role } = await supabase
      .from('committee')
      .select('role_id')
      .eq('user_id', user.id)
      .eq('ward_code', wardId)
      .single();

    if (!role || ![1, 2, 3].includes(role.role_id)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Fetch updates
    const { data: updates, error } = await supabase
      .from('update')
      .select('*')
      .eq('ward_code', wardId)
      .order('date', { ascending: false });

    if (error) {
      throw error;
    }

    res.status(200).json(updates || []);
  } catch (err) {
    console.error('Error fetching updates:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}