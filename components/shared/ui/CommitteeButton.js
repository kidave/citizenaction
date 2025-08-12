import { useState, useEffect } from 'react';
import styles from '../../../styles/profile.module.css';
import Form from '../../Form';
import { useAuth } from '../../../src/context/AuthContext';

export default function CommitteeButton() {
  const [showForm, setShowForm] = useState(false);
  const [hasRole, setHasRole] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, getAccessToken } = useAuth();

  const checkCommitteeStatus = async () => {
    try {
      setLoading(true);
      const token = await getAccessToken();
      
      const response = await fetch('/api/committee/check', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to check status');
      
      const { hasRole } = await response.json();
      setHasRole(hasRole);
    } catch (err) {
      console.error('Committee check error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) checkCommitteeStatus();
  }, [user]);

  if (loading) return null;
  if (hasRole) return null;

  return (
    <div className={styles.committeeButtonContainer}>
      <button 
        onClick={() => setShowForm(true)} 
        className={styles.applyBtn}
      >
        Apply to Join Committee
      </button>
      
      <Form 
        show={showForm}
        onClose={() => setShowForm(false)}
      />
    </div>
  );
}