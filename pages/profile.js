import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../utils/supabaseClient';
import Head from 'next/head';
import styles from '../styles/profile.module.css';
import { FiArrowLeft, FiEdit, FiSave, FiX } from 'react-icons/fi';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [categories, setCategories] = useState([]);
  const [wards, setWards] = useState([]);
  const [updateStatus, setUpdateStatus] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }

      // Check if user profile exists
      const { data: existingProfile } = await supabase
        .from('profile')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setProfileData(existingProfile || null);
      setUser(user);
      setLoading(false);
      
      // If we have profile data, initialize edit data
      if (existingProfile) {
        setEditData({
          first_name: existingProfile.first_name,
          last_name: existingProfile.last_name,
          phone: existingProfile.phone,
          designation: existingProfile.designation,
          stakeholder: existingProfile.stakeholder,
          ward_code: existingProfile.ward_code
        });
      }
    };

    fetchData();
  }, []);

  // Fetch categories and wards for the form
  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from('stakeholder_category')
        .select('id, name')
        .order('name', { ascending: true });
      if (!error) setCategories(data || []);
    }
    
    async function fetchWards() {
      const { data, error } = await supabase
        .from('ward')
        .select('code, name')
        .order('name', { ascending: true });
      if (!error) setWards(data || []);
    }
    
    if (isEditing || showJoinForm) {
      fetchCategories();
      fetchWards();
    }
  }, [isEditing, showJoinForm]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (!user || !profileData) return;
    
    setLoading(true);
    setUpdateStatus(null);
    
    try {
      const { error } = await supabase
        .from('profile')
        .update(editData)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Refresh profile data
      const { data: updatedProfile } = await supabase
        .from('profile')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      setProfileData(updatedProfile);
      setUpdateStatus('success');
    } catch (error) {
      console.error('Update failed:', error);
      setUpdateStatus('error');
    } finally {
      setLoading(false);
      setIsEditing(false);
    }
  };

  if (loading) return (
    <div className={styles.loading}>
      <div className={styles.spinner}></div>
    </div>
  );

  return (
    <div className={styles.container}>
      <Head>
        <title>Profile | Walking Project</title>
      </Head>

      <div className={styles.header}>
        <button 
          onClick={() => router.back()} 
          className={styles.backButton}
          aria-label="Go back"
        >
          <FiArrowLeft size={24} />
        </button>
        <h1>Your Profile</h1>
        
        {profileData && !isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className={styles.editButton}
          >
            <FiEdit size={20} />
            Edit
          </button>
        )}
      </div>

      <div className={styles.profileCard}>
        <div className={styles.avatarSection}>
          <div className={styles.avatarWrapper}>
            <img
              src={user.user_metadata?.avatar_url || '/user1.png'}
              alt="Profile"
              className={styles.avatar}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/user1.png";
              }}
            />
          </div>
          <h2 className={styles.userName}>
            {user.user_metadata?.full_name || 'User'}
          </h2>
          <div className={styles.userEmail}>{user.email}</div>
        </div>

        {updateStatus === 'success' && (
          <div className={styles.successMessage}>
            Profile updated successfully!
          </div>
        )}
        {updateStatus === 'error' && (
          <div className={styles.errorMessage}>
            Failed to update profile. Please try again.
          </div>
        )}

        <div className={styles.detailsSection}>
          {profileData ? (
            isEditing ? (
              <div className={styles.editForm}>
                <div className={styles.formGroup}>
                  <label>First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={editData.first_name || ''}
                    onChange={handleEditChange}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={editData.last_name || ''}
                    onChange={handleEditChange}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={editData.phone || ''}
                    onChange={handleEditChange}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Designation</label>
                  <input
                    type="text"
                    name="designation"
                    value={editData.designation || ''}
                    onChange={handleEditChange}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Category</label>
                  <select
                    name="stakeholder"
                    value={editData.stakeholder || ''}
                    onChange={handleEditChange}
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label>Ward</label>
                  <select
                    name="ward_code"
                    value={editData.ward_code || ''}
                    onChange={handleEditChange}
                  >
                    <option value="">Select ward</option>
                    {wards.map(ward => (
                      <option key={ward.code} value={ward.code}>
                        {ward.name} ({ward.code})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className={styles.formActions}>
                  <button 
                    onClick={handleSaveProfile} 
                    className={styles.saveButton}
                    disabled={loading}
                  >
                    <FiSave size={18} />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className={styles.cancelButton}
                  >
                    <FiX size={18} />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.detailsGrid}>
                <div className={styles.detailCard}>
                  <h3>Committee Information</h3>
                  <div className={styles.detailItem}>
                    <span className={styles.label}>Role:</span>
                    <span className={styles.value}>{profileData.role || 'N/A'}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.label}>Ward:</span>
                    <span className={styles.value}>
                      {profileData.ward || 'N/A'}
                      {profileData.ward_code && ` (${profileData.ward_code})`}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.label}>Category:</span>
                    <span className={styles.value}>{profileData.stakeholder || 'N/A'}</span>
                  </div>
                </div>

                <div className={styles.detailCard}>
                  <h3>Personal Information</h3>
                  <div className={styles.detailItem}>
                    <span className={styles.label}>Name:</span>
                    <span className={styles.value}>
                      {profileData.first_name} {profileData.last_name}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.label}>Phone:</span>
                    <span className={styles.value}>{profileData.phone || 'N/A'}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.label}>Designation:</span>
                    <span className={styles.value}>{profileData.designation || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className={styles.notMember}>
              <p>You're not currently a committee member</p>
              <button 
                onClick={() => setShowJoinForm(true)}
                className={styles.applyBtn}
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

      {showJoinForm && (
        <div className={styles.joinFormModal}>
          <div className={styles.joinFormContent}>
            <div className={styles.joinFormHeader}>
              <h2>Apply to Join Committee</h2>
              <button 
                onClick={() => setShowJoinForm(false)}
                className={styles.closeButton}
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className={styles.formGroup}>
              <label>First Name</label>
              <input
                type="text"
                defaultValue={user.user_metadata?.given_name || ''}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Last Name</label>
              <input
                type="text"
                defaultValue={user.user_metadata?.family_name || ''}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Email</label>
              <input
                type="email"
                defaultValue={user.email}
                readOnly
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Phone</label>
              <input
                type="tel"
                placeholder="Enter your phone number"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Ward</label>
              <select>
                <option value="">Select ward</option>
                {wards.map(ward => (
                  <option key={ward.code} value={ward.code}>
                    {ward.name} ({ward.code})
                  </option>
                ))}
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label>Role</label>
              <select>
                <option value="">Select role</option>
                <option value="member">Member</option>
                <option value="convener">Convener</option>
                <option value="co-convener">Co-Convener</option>
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label>Category</label>
              <select>
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label>Designation</label>
              <input
                type="text"
                placeholder="Your professional designation"
              />
            </div>
            
            <div className={styles.formActions}>
              <button className={styles.submitButton}>
                Submit Application
              </button>
              <button 
                onClick={() => setShowJoinForm(false)}
                className={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}