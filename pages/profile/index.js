import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../utils/supabaseClient';
import Head from 'next/head';
import styles from '../../styles/profile.module.css';
import Form from '../../components/Form';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [isCommitteeMember, setIsCommitteeMember] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Check if user is already in committee
      const { data: existingProfile } = await supabase
        .from('profile')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!existingProfile) {
        // Insert a new profile row
        const { data: newProfile, error: insertError } = await supabase
          .from('profile')
          .insert([{
            user_id: user.id,
            email: user.email,
            first_name: user.user_metadata?.given_name || user.user_metadata?.full_name?.split(" ")[0] || '',
            last_name: user.user_metadata?.family_name || user.user_metadata?.full_name?.split(" ").slice(1).join(" ") || '',
            avatar_url: user.user_metadata?.avatar_url || '',
            created_at: new Date()
          }])
          .select()
          .single();

        setProfileData(newProfile);
      } else {
        setProfileData(existingProfile);
      }
      setUser(user);

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.container}>
      <Head>
        <title>Profile | Walking Project</title>
      </Head>

      <div className={styles.profileCard}>
        <div className={styles.avatarSection}>
          <img
            src={user.user_metadata?.avatar_url || '/default-avatar.png'}
            alt="Profile"
            className={styles.avatar}
          />
          <h2>{user.user_metadata?.full_name || 'User'}</h2>
        </div>

        <div className={styles.detailsSection}>
          {profileData ? (
            <>
              <div className={styles.detailItem}>
                <span className={styles.label}>Ward:</span>
                <span className={styles.value}>{profileData.ward || 'N/A'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Role:</span>
                <span className={styles.value}>{profileData.role || 'N/A'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Name:</span>
                <span className={styles.value}>
                  {profileData.first_name} {profileData.last_name}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Email:</span>
                <span className={styles.value}>{profileData.email}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Phone:</span>
                <span className={styles.value}>{profileData.phone || 'N/A'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Category:</span>
                <span className={styles.value}>{profileData.stakeholder || 'N/A'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Designation:</span>
                <span className={styles.value}>{profileData.designation || 'N/A'}</span>
              </div>
            </>
          ) : (
            <div className={styles.notMember}>
              <p>You're not currently a committee member</p>
              <button 
                onClick={() => setShowForm(true)}
                className={styles.applyFloatingBtn}
              >
                Apply to Join Committee
              </button>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/');
            }}
            className={styles.logoutButton}
          >
            Sign Out
          </button>
        </div>
      </div>

      {showForm && (
        <Form 
          show={showForm} 
          onClose={() => setShowForm(false)}
          defaultEmail={user.email}
          defaultFirstName={user.user_metadata?.given_name || ''}
          defaultLastName={user.user_metadata?.family_name || ''}
        />
      )}
    </div>
  );
}