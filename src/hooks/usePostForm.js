// src/hooks/usePostForm.js
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function usePostForm(postId = null) {
  const router = useRouter();
  const { user } = useAuth();

  // Overall status: 'loading', 'ready', 'error', 'success'
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [editorData, setEditorData] = useState(null);

  // Location fields
  const [regionCode, setRegionCode] = useState('');
  const [cityCode, setCityCode] = useState('');
  const [divisionCode, setDivisionCode] = useState('');
  const [wardCode, setWardCode] = useState('');

  // Dropdown options
  const [categories, setCategories] = useState([]);
  const [regions, setRegions] = useState([]);
  const [cities, setCities] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [wards, setWards] = useState([]);

  const isEditMode = !!postId;

  // ==== DATA FETCHING AND INITIALIZATION ====

  const loadFormData = useCallback(async () => {
    // Prevent running if the user isn't loaded yet
    if (!user) {
      if (isEditMode) setStatus('loading'); // Stay in loading state if we expect to fetch data
      return;
    }

    setStatus('loading');
    try {
      // Fetch base dropdowns first
      const [catRes, regRes] = await Promise.all([
        supabase.from('forum_categories').select('id,name').order('name'),
        supabase.from('region').select('code,name').order('name')
      ]);
      setCategories(catRes.data || []);
      setRegions(regRes.data || []);

      if (isEditMode) {
        // In EDIT mode, fetch the post and its related location data
        const { data: post, error: postError } = await supabase
          .from('forum_topics')
          .select('*')
          .eq('id', postId)
          .single();

        if (postError) throw postError;
        if (!post) throw new Error('Post not found.');
        
        // Use the user from context for the authorization check
        if (post.author_id !== user.id) throw new Error('You are not authorized to edit this post.');
        if (post.status !== 'Pending') throw new Error('Only posts with "Pending" status can be edited.');

        // Populate form state from fetched post
        setTitle(post.title);
        setDescription(post.description || '');
        setCategoryId(post.category_id || '');
        setRegionCode(post.region_code || '');
        setCityCode(post.city_code || '');
        setDivisionCode(post.division_code || '');
        setWardCode(post.ward_code || '');
        setEditorData(post.content || { blocks: [] });

        // Fetch dependent location dropdowns based on the loaded post data
        if (post.region_code) {
          const { data } = await supabase
          .from('city')
          .select('code,name')
          .eq('region_code', post.region_code)
          .order('name');
          setCities(data || []);
        }
        if (post.city_code) {
          const { data } = await supabase
          .from('division')
          .select('code,name')
          .eq('city_code', post.city_code)
          .order('name');
          setDivisions(data || []);
        }
        if (post.division_code) {
          const { data } = await supabase
          .from('ward')
          .select('code,name')
          .eq('division_code', post.division_code)
          .order('name');
          setWards(data || []);
        }
      } else {
        // In CREATE mode, no need to do anything here as it's handled by the component's state
        setEditorData({ blocks: [] });
      }
      setStatus('ready');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }, [postId, isEditMode, user]); // Add 'user' to the dependency array

  // ==== LOCATION DROPDOWN LOGIC (no changes needed here) ====
  
  const handleRegionChange = async (newRegionCode) => {
    setRegionCode(newRegionCode);
    setCityCode('');
    setDivisionCode('');
    setWardCode('');
    setCities([]);
    setDivisions([]);
    setWards([]);
    if (newRegionCode) {
      const { data } = await supabase
      .from('city')
      .select('code,name')
      .eq('region_code', newRegionCode)
      .order('name');
      setCities(data || []);
    }
  };

  const handleCityChange = async (newCityCode) => {
    setCityCode(newCityCode);
    setDivisionCode('');
    setWardCode('');
    setDivisions([]);
    setWards([]);
    if (newCityCode) {
      const { data } = await supabase
        .from('division')
        .select('code,name')
        .eq('city_code', newCityCode)
        .order('name');
      setDivisions(data || []);
    }
  };

  const handleDivisionChange = async (newDivisionCode) => {
    setDivisionCode(newDivisionCode);
    setWardCode('');
    setWards([]);
    if (newDivisionCode) {
      const { data } = await supabase
      .from('ward')
      .select('code,name')
      .eq('division_code', newDivisionCode)
      .order('name');
      setWards(data || []);
    }
  };
  
  // ==== FORM SUBMISSION ====
  
  const handleSubmit = async (editorContent, showConfirmation = true) => {
    // The 'user' parameter is removed, it's now taken from the useAuth() hook
    if (!title || !description || !categoryId) {
      setError('Please fill all required fields: Title, Description, and Category.');
      return false;
    }
    
    if (showConfirmation) {
      const confirmed = window.confirm(
        isEditMode 
        ? 'Are you sure you want to update this post?' 
        : 'Are you sure you want to submit this post for review?'
      );
      if (!confirmed) return false;
    }

    setStatus('loading');
    setError(null);

    try {
      const postData = {
        title,
        description,
        content: editorContent,
        category_id: categoryId,
        region_code: regionCode || null,
        city_code: cityCode || null,
        division_code: divisionCode || null,
        ward_code: wardCode || null,
        updated_at: new Date().toISOString(),
      };

      if (isEditMode) {
        const { error: updateError } = await supabase
        .from('forum_topics')
        .update(postData)
        .eq('id', postId);
        if (updateError) throw updateError;
      } else {
        // Use the user from context here
        postData.author_id = user.id;
        postData.status = 'Pending';
        postData.slug = `${title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')}-${Date.now().toString(36)}`;
        
        const { error: insertError } = await supabase
        .from('forum_topics')
        .insert([postData]);
        if (insertError) throw insertError;
      }

        setStatus('success');
        return true;      
      } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
      setStatus('error');
      setTimeout(() => setStatus('ready'), 3000);
      return false;
    }
  };

  return {
    status,
    error,
    isEditMode,
    title, setTitle,
    description, setDescription,
    categoryId, setCategoryId,
    editorData, setEditorData,
    regionCode, handleRegionChange,
    cityCode, handleCityChange,
    divisionCode, handleDivisionChange,
    wardCode, setWardCode,
    categories,
    regions,
    cities,
    divisions,
    wards,
    loadFormData,
    handleSubmit
  };
}