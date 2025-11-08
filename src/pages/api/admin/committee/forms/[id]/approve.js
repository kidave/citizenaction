// pages/api/admin/committee/forms/[id]/approve.js
import { createServerSupabase } from "utils/supabaseServer";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const token = req.headers.authorization?.replace("Bearer ", "");
    const supabase = createServerSupabase(token);

    // Verify admin access
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return res.status(401).json({ message: 'Not authenticated' });

    // Update form status to approved - this will trigger the automatic committee creation
    const { error } = await supabase
      .from('committee_form')
      .update({ 
        application_status: 'approved',
      })
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({ message: 'Application approved successfully' });
  } catch (error) {
    console.error('Error approving application:', error);
    res.status(500).json({ message: error.message });
  }
}