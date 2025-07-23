import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../utils/supabaseClient';
import Head from 'next/head';
import styles from '../styles/auth.module.css';
import { FcGoogle } from 'react-icons/fc';
import { FiArrowLeft } from 'react-icons/fi';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      // Save the current path so we can redirect back after login
      const returnTo = window.location.pathname + window.location.search;
      localStorage.setItem('returnTo', returnTo);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      
      if (error) throw error;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Login | Walking Project</title>
      </Head>

      <div className={styles.authCard}>
        <button 
          onClick={() => router.back()}
          className={styles.backButton}
        >
          <FiArrowLeft size={20} />
          Back
        </button>
        <h1 className={styles.h1}>Login</h1>
        <img src="/wp_text_logo.png" alt="Logo" className={styles.logo} />
        
        <p className={styles.p}>Mumbai Sustainability Centre © 2024</p>

        {error && <div className={styles.error}>{error}</div>}

        <button 
          onClick={handleGoogleLogin} 
          className={styles.googleButton}
          disabled={loading}
        >
          <FcGoogle size={20} style={{ marginRight: '10px' }} />
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </button>
        
        <div className={styles.existingUserNote}>
          Already have an account? You can sign in with the same Google account.
        </div>
      </div>
    </div>
  );
}