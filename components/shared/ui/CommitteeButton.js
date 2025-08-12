import { useState } from 'react';
import styles from '../../../styles/profile.module.css';
import Form from '../../Form';
import { useAuth } from '../../../src/context/AuthContext';

export default function CommitteeButton() {
  const [showForm, setShowForm] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const { user, getAccessToken } = useAuth();

  const handleButtonClick = async () => {
    if (!user) return;
    
    setIsChecking(true);
    try {
      const token = await getAccessToken();
      const response = await fetch('/api/committee/check', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error('Failed to check status');
      
      const { has_application, is_member } = await response.json();
      
      if (is_member) {
        alert('You are already a committee member in another ward');
        return;
      }
      
      if (has_application) {
        alert('You already have a pending application');
        return;
      }
      
      setShowForm(true);
    } catch (err) {
      console.error('Error checking status:', err);
      alert('Error checking your application status. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  if (!user) return null;

  return (
    <div className={styles.committeeButtonContainer}>
      <button 
        onClick={handleButtonClick}
        className={styles.applyBtn}
        disabled={isChecking}
      >
        {isChecking ? 'Checking...' : 'Apply to Join Committee'}
      </button>
      
      <Form 
        show={showForm}
        onClose={() => setShowForm(false)}
      />
    </div>
  );
}