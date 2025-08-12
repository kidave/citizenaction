import { useState, useEffect } from 'react';
import styles from '../../../styles/profile.module.css';
import Form from '../../Form';
import { useAuth } from '../../../src/context/AuthContext';

export default function CommitteeButton() {
  const [showForm, setShowForm] = useState(false);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getAccessToken } = useAuth();

  const checkStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getAccessToken();
      
      const response = await fetch('/api/committee/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch status');
      
      const { status: apiStatus } = await response.json();
      setStatus(apiStatus);
    } catch (err) {
      console.error('Status check error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, [showForm]);

  const handleSuccess = () => {
    setStatus('Pending');
    setShowForm(false);
  };

  if (loading) return <div className={styles.loading}>Loading status...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  return (
    <div className={styles.committeeButtonContainer}>
      {status !== 'Pending' && status !== 'Approved' && (
        <button 
          onClick={() => setShowForm(true)} 
          className={styles.applyBtn}
        >
          Apply to Join Committee
        </button>
      )}
      
      {status && (
        <div className={`${styles.statusBadge} ${status.toLowerCase()}`}>
          Status: {status}
        </div>
      )}

      <Form 
        show={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}