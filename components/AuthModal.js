import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import styles from '../styles/auth.module.css';
import { FcGoogle } from 'react-icons/fc';
import { FiX } from 'react-icons/fi';

export default function AuthModal({ show, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
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

  if (!show) return null;

  return (
    <div className={styles.authModalOverlay} onClick={onClose}>
      <div className={styles.authModal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <FiX size={24} />
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