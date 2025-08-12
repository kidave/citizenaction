import { supabase } from '../../../utils/supabaseClient';

export default async function handler(req, res) {
  const { division } = req.query;

  try {
    let query = supabase
      .from('ward')
      .select('code, name')
      .order('name');

    if (division) {
      query = query.eq('division_code', division);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    res.status(200).json(data || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wards' });
  }
}