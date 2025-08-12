import { supabase } from '../../../utils/supabaseClient';

export default async function handler(req, res) {
  const { wardId } = req.query;

  if (!wardId) {
    return res.status(400).json({ error: 'Ward code is required' });
  }

  try {
    const { data, error } = await supabase
      .from('committee')
      .select(`
        user_id,
        phone,
        country_code,
        role:role (id, name),
        stakeholder:stakeholder (name),
        profile:profile (
          name,
          avatar_url,
          designation,
          social
        )
      `)
      .eq('ward_code', wardId)
      .order('role_id', { ascending: true });  // <-- changed from role.id to role_id

    if (error) {
      console.error('Committee API error:', error);
      return res.status(500).json({ error: error.message || 'Failed to fetch committee members' });
    }

    const members = data.map(member => ({
      user_id: member.user_id,
      name: member.profile?.name || 'User',
      avatar_url: member.profile?.avatar_url || null,
      designation: member.profile?.designation || '',
      role: member.role?.name || 'Member',
      stakeholder: member.stakeholder?.name || '',
      phone: member.phone || '',
      country_code: member.country_code || '',
      social: member.profile?.social || {},
    }));

    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch committee members' });
  }
}
