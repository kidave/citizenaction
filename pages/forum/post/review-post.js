import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabaseClient";
import Head from "next/head";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import styles from "../../../styles/forum/review-post.module.css";
import { useForum } from "../../../src/context/ForumContext";
import RenderEditorBlock from '../../../components/shared/RenderEditorBlock';
import PostPreviewModal from '../../../components/forum/PostPreviewModal';

export default function PostReview() {
  const { user } = useForum();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [moderatorNotes, setModeratorNotes] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      
      const { data: profile } = await supabase
        .from('profile')
        .select('is_convenor, is_co_convenor')
        .eq('user_id', user.id)
        .single();

      if (profile && (profile.is_convenor || profile.is_co_convenor)) {
        setIsAdmin(true);
        fetchPendingPosts();
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const fetchPendingPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("forum_topics")
        .select(`
          id, 
          title, 
          description,
          content,
          created_at,
          author:author_id(first_name, last_name),
          forum_categories(name),
          region(name),
          city(name),
          division(name),
          ward(name)
        `)
        .eq("status", "Pending")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      if (action === 'Rejected' && !moderatorNotes.trim()) {
        throw new Error('Please provide moderator notes when rejecting a post');
      }

      const { error } = await supabase
        .from('forum_topics')
        .update({ 
          status: action,
          moderator_notes: action === 'Rejected' ? moderatorNotes : null,
          moderator_id: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      // Refresh the posts list
      await fetchPendingPosts();
      setSelectedPost(null);
      setModeratorNotes("");
      setConfirmAction(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user || !isAdmin) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.accessDenied}>
          <h2>Access Denied</h2>
          <p>You must be a convenor or co-convenor to access this page.</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.loading}>Loading pending posts...</div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.error}>{error}</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Review Posts | Community Forum</title>
      </Head>
      <Header />
      
      <main className={styles.main}>
        <h1>Review Pending Posts</h1>
        <p className={styles.subtitle}>
          {posts.length} post{posts.length !== 1 ? 's' : ''} awaiting approval
        </p>

        {posts.length === 0 ? (
          <div className={styles.noPosts}>
            <p>No posts pending review at this time.</p>
          </div>
        ) : (
          <div className={styles.postsList}>
            {posts.map((post) => (
              <div key={post.id} className={styles.postCard}>
                <div className={styles.postHeader}>
                  <h3>{post.title}</h3>
                  <span className={styles.postDate}>
                    Submitted on {formatDate(post.created_at)}
                  </span>
                </div>
                
                <div className={styles.postMeta}>
                  <span>Category: {post.forum_categories?.name}</span>
                  <span>Author: {post.author?.first_name} {post.author?.last_name}</span>
                  {post.region && (
                    <span>
                      Location: {[
                        post.ward?.name,
                        post.division?.name,
                        post.city?.name,
                        post.region?.name
                      ].filter(Boolean).join(', ')}
                    </span>
                  )}
                </div>
                
                {post.description && (
                  <div className={styles.postDescription}>
                    <p>{post.description}</p>
                  </div>
                )}
                
                <div className={styles.postActions}>
                  <button 
                    onClick={() => setSelectedPost(post)}
                    className={styles.viewButton}
                  >
                    Review Post
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedPost && (
          <PostPreviewModal
            post={selectedPost}
            onClose={() => {
              setSelectedPost(null);
              setModeratorNotes("");
              setConfirmAction(null);
            }}
            showActions={false}
          >
            <div className={styles.modalActions}>
              <div className={styles.notesSection}>
                <label htmlFor="moderatorNotes">
                  {confirmAction === 'Rejected' 
                    ? "Please confirm rejection with notes:" 
                    : "Moderator Notes (required for rejection):"}
                </label>
                <textarea
                  id="moderatorNotes"
                  value={moderatorNotes}
                  onChange={(e) => setModeratorNotes(e.target.value)}
                  placeholder="Provide feedback if rejecting..."
                  className={styles.notesInput}
                  required={confirmAction === 'Rejected'}
                />
              </div>
              
              <div className={styles.actionButtons}>
                {confirmAction !== 'Approved' && (
                  <button
                    onClick={() => {
                      if (moderatorNotes.trim() || confirmAction !== 'Rejected') {
                        setConfirmAction('Approved');
                      }
                    }}
                    className={styles.approveButton}
                  >
                    {confirmAction === 'Rejected' ? 'Cancel Rejection' : 'Approve Post'}
                  </button>
                )}
                
                {confirmAction !== 'Rejected' && (
                  <button
                    onClick={() => setConfirmAction('Rejected')}
                    className={styles.rejectButton}
                  >
                    Reject Post
                  </button>
                )}
                
                {confirmAction === 'Approved' && (
                  <button
                    onClick={() => handleAction(selectedPost.id, "Approved")}
                    className={styles.confirmButton}
                  >
                    Confirm Approval
                  </button>
                )}
                
                {confirmAction === 'Rejected' && (
                  <button
                    onClick={() => handleAction(selectedPost.id, "Rejected")}
                    className={styles.confirmButton}
                    disabled={!moderatorNotes.trim()}
                  >
                    Confirm Rejection
                  </button>
                )}
              </div>
            </div>
          </PostPreviewModal>
        )}
      </main>
      
      <Footer />
    </div>
  );
}