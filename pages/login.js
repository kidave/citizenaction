// pages/login.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../utils/supabaseClient';
import Head from 'next/head';
import styles from '../styles/auth.module.css';
import { FcGoogle } from 'react-icons/fc';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const returnTo = localStorage.getItem('returnTo') || '/';
      localStorage.removeItem('returnTo');
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(returnTo)}`
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

      <div className={styles.loginCard}>
        <h1 className={styles.h1}>Login</h1>
        <img src="/wp_text_logo.png" alt="Logo" className={styles.logo} />
        
        <p className={styles.p}>Please sign in with your Google account</p>

        {error && <div className={styles.error}>{error}</div>}

        <button 
          onClick={handleGoogleLogin} 
          className={styles.googleButton}
          disabled={loading}
        >
          <FcGoogle size={20} style={{ marginRight: '10px' }} />
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </button>
      </div>
    </div>
  );
}