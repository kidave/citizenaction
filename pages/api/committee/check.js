import { createServerSupabase } from '../../../utils/supabaseServer';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    const supabase = createServerSupabase(token);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return res.status(401).json({ error: 'Invalid token' });

    // Check if user already has a role in committee table
    const { data: committeeData, error: committeeError } = await supabase
      .from('committee')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (committeeError) throw committeeError;

    return res.status(200).json({ 
      hasRole: !!committeeData 
    });
  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}