// contexts/ForumContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useRouter } from 'next/router';

const ForumContext = createContext();

export function ForumProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      }
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
      } else if (session) {
        supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    login: () => {
      const returnTo = window.location.pathname;
      localStorage.setItem('returnTo', returnTo);
      router.push('/login');
    },
    logout: async () => {
      await supabase.auth.signOut();
      router.push('/forum');
    }
  };

  return <ForumContext.Provider value={value}>{children}</ForumContext.Provider>;
}

export function useForum() {
  return useContext(ForumContext);
}