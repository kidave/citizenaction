import { supabase } from '../../../utils/supabaseClient';

export default async function handler(req, res) {
  const { wardId } = req.query;
  if (!wardId) return res.status(400).json({ error: 'Ward code is required' });

  try {
    const { data, error } = await supabase
      .from('project')
      .select('*')
      .eq('ward_code', wardId)
      .order('created_at', { ascending: false }); // <-- FIXED

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    res.status(200).json(data || []);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch projects' });
  }
}