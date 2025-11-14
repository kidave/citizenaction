// hooks/useCommitteeData.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "utils/supabaseClient";
import { useAuth } from "context/AuthContext";

// Committee Forms with profile data
export function useCommitteeForms() {
  const { getAccessToken } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['committee-forms'],
    queryFn: async () => {
      // First try to use the view
      const { data: viewData, error: viewError } = await supabase
        .from('committee_form_with_profile')
        .select('*')
        .order('created_at', { ascending: false });

      if (!viewError) {
        console.log('Using committee_form_with_profile view');
        return viewData;
      }

      // If view doesn't exist, use direct joins
      console.log('View not found, using direct query with joins');
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('committee_form')
        .select(`
          *,
          profile:user_id (
            name,
            email,
            avatar_url,
            phone,
            stakeholder
          )
        `)
        .order('created_at', { ascending: false });
        
      if (fallbackError) {
        console.error('Fallback query error:', fallbackError);
        throw fallbackError;
      }
      
      return fallbackData;
    }
  });

  const assignMutation = useMutation({
    mutationFn: async ({ formId, scope_type, scope_role, scope_code }) => {
      const token = await getAccessToken();
      const res = await fetch(`/api/admin/committee/forms/${formId}/assign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          scope_type,
          scope_role,
          scope_code
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to assign member');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['committee-forms']);
      queryClient.invalidateQueries(['committee-members']);
    }
  });

  return {
    data,
    loading: isLoading,
    error: error?.message,
    refresh: refetch,
    assignMember: assignMutation.mutateAsync
  };
}

// Committee Members using your existing view - UPDATED FOR SCOPE
export function useCommitteeMembers() {
  const { getAccessToken } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['committee-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('committee_member_view')
        .select('*')
        .order('joined_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ memberId, updateData }) => {
      const token = await getAccessToken();
      const res = await fetch(`/api/admin/committee/members/${memberId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update member');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['committee-members']);
    }
  });

  const removeMutation = useMutation({
    mutationFn: async (memberId) => {
      const token = await getAccessToken();
      const res = await fetch(`/api/admin/committee/members/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to remove member');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['committee-members']);
    }
  });

  return {
    data,
    loading: isLoading,
    error: error?.message,
    refresh: refetch,
    updateMember: (memberId, updateData) => updateMutation.mutateAsync({ memberId, updateData }),
    removeMember: removeMutation.mutateAsync
  };
}

// Supporting data hooks - FIXED SCOPES HOOK
export function useScopes(scopeType = 'ward') {
  // Convert scopeType to lowercase for table names
  const tableName = scopeType.toLowerCase();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['scopes', tableName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(tableName) // Direct table access: 'ward', 'city', 'region', 'state'
        .select('code, name')
        .order('name');

      if (error) {
        console.error(`Error fetching ${tableName}:`, error);
        throw error;
      }
      return data;
    },
    enabled: ['ward', 'city', 'region', 'state'].includes(tableName)
  });

  return { 
    data, 
    loading: isLoading, 
    error: error?.message 
  };
}

// Enhanced scopes hook that handles different scope types properly
export function useCommitteeScopes(scopeType = 'Ward') {
  const { data, isLoading, error } = useQuery({
    queryKey: ['committee-scopes', scopeType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(tableName)
        .select('code, name')
        .order('name');

      if (error) {
        console.error(`Error fetching ${scopeType} scopes:`, error);
        throw error;
      }
      return data;
    }
  });

  return { 
    data, 
    loading: isLoading, 
    error: error?.message 
  };
}

// Keep wards for backward compatibility during migration
export function useWards() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['wards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ward')
        .select('code, name')
        .order('name');

      if (error) throw error;
      return data;
    }
  });

  return { data, loading: isLoading, error: error?.message };
}

// New hook to get committee member by user ID
export function useCommitteeMember(userId) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['committee-member', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('committee_member_view')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }
      return data;
    },
    enabled: !!userId
  });

  return { data, loading: isLoading, error: error?.message };
}