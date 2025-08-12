// pages/api/committee/role.js
import { supabase } from '../../../utils/supabaseClient';

export default async function handler(req, res) {
  try {
    const { data, error } = await supabase
      .from('role')
      .select('id, name')
      .order('name');
    
    if (error) throw error;
    res.status(200).json(data || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
}