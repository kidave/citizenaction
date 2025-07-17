// [slug].js - Improved version with better comments and design
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import Head from 'next/head';
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { useForum } from '../../../src/context/ForumContext';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import styles from '../../../styles/forum/post.module.css';
import { format } from 'date-fns';

const EditorJSRenderer = dynamic(() => import("editorjs-react-renderer"), {
  ssr: false,
  loading: () => <p>Loading content...</p>
});

export default function ForumPost() {
  const router = useRouter();
  const { slug } = router.query;
  const { user } = useForum();
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentContent, setCommentContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    if (!router.isReady || !slug) return;

    const fetchPostData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch post data
        const { data: postData, error: postError } = await supabase
          .from('forum_topics')
          .select(`
            *,
            forum_categories(name),
            profile:author_id(
              user_id,
              first_name,
              last_name,
              avatar_url
            ),
            region:region_code(name),
            city:city_code(name),
            division:division_code(name),
            ward:ward_code(name)
          `)
          .eq('slug', slug)
          .single();

        if (postError) throw postError;
        if (!postData) throw new Error('Post not found');
        if (postData.status !== 'Approved' && (!user || user.id !== postData.author_id)) {
          throw new Error(`Post status: ${postData.status}`);
        }

        // Increment view count (only for approved posts)
        if (postData.status === 'Approved') {
          await supabase
            .from('forum_topics')
            .update({ view_count: (postData.view_count || 0) + 1 })
            .eq('id', postData.id);
        }

        // Fetch comments with replies
        const { data: commentsData, error: commentsError } = await supabase
          .from('forum_posts')
          .select(`
            *,
            profile:author_id(
              user_id,
              first_name,
              last_name,
              avatar_url
            ),
            replies:forum_post_replies(
              *,
              profile:author_id(
                user_id,
                first_name,
                last_name,
                avatar_url
              )
            )
          `)
          .eq('topic_id', postData.id)
          .is('parent_id', null)
          .order('created_at', { ascending: true });

        if (commentsError) throw commentsError;

        setPost(postData);
        setComments(commentsData || []);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
  }, [router.isReady, slug, user]);

  const handleCommentSubmit = async () => {
    if (!commentContent.trim() || !user || !post) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .insert([{
          content: commentContent,
          topic_id: post.id,
          author_id: user.id
        }])
        .select();

      if (error) throw error;

      // Add the new comment to our state
      const newComment = {
        ...data[0],
        profile: {
          first_name: user.user_metadata?.first_name || 'Anonymous',
          last_name: user.user_metadata?.last_name || '',
          avatar_url: user.user_metadata?.avatar_url || ''
        },
        replies: []
      };

      setComments([...comments, newComment]);
      setCommentContent('');

      // Update the post's comment count
      await supabase
        .from('forum_topics')
        .update({ 
          post_count: (post.post_count || 0) + 1,
          last_post_at: new Date().toISOString()
        })
        .eq('id', post.id);

      // Update our local post data
      setPost({
        ...post,
        post_count: (post.post_count || 0) + 1,
        last_post_at: new Date().toISOString()
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplySubmit = async (commentId) => {
    if (!replyContent.trim() || !user) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('forum_post_replies')
        .insert([{
          content: replyContent,
          post_id: commentId,
          author_id: user.id
        }])
        .select();

      if (error) throw error;

      // Add the reply to our state
      const newReply = {
        ...data[0],
        profile: {
          first_name: user.user_metadata?.first_name || 'Anonymous',
          last_name: user.user_metadata?.last_name || '',
          avatar_url: user.user_metadata?.avatar_url || ''
        }
      };

      // Update the comments state with the new reply
      setComments(comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply]
          };
        }
        return comment;
      }));

      setReplyContent('');
      setReplyingTo(null);

      // Update the post's comment count
      await supabase
        .from('forum_topics')
        .update({ 
          post_count: (post.post_count || 0) + 1,
          last_post_at: new Date().toISOString()
        })
        .eq('id', post.id);

      // Update our local post data
      setPost({
        ...post,
        post_count: (post.post_count || 0) + 1,
        last_post_at: new Date().toISOString()
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMMM d, yyyy \'at\' h:mm a');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.loading}>
          <div className={styles.loadingSkeleton}>
            <div className={styles.skeletonHeader}></div>
            <div className={styles.skeletonContent}></div>
            <div className={styles.skeletonContent}></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.errorContainer}>
          <h2>{error.includes('not found') ? 'Post Not Found' : 'Post Not Available'}</h2>
          
          <div className={styles.errorMessage}>
            {error.includes('not found') ? (
              <>
                <p>We couldn't find a post with this URL.</p>
                <p>It may have been moved or deleted.</p>
              </>
            ) : error.includes('status') ? (
              <>
                <p>This post exists but isn't publicly available.</p>
                <p>Status: <strong>{error.split(': ')[1]}</strong></p>
              </>
            ) : (
              <p>{error}</p>
            )}
          </div>

          <div className={styles.errorActions}>
            <button
              onClick={() => router.push('/forum')}
              className={styles.primaryButton}
            >
              Back to Forum
            </button>
            <button
              onClick={() => window.location.reload()}
              className={styles.secondaryButton}
            >
              Refresh Page
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.notFound}>
          <h2>Post Not Found</h2>
          <p>We couldn't load this post. It may have been removed.</p>
          <button 
            onClick={() => router.push('/forum')}
            className={styles.primaryButton}
          >
            Back to Forum
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>{post.title} | Community Forum</title>
        <meta name="description" content={post.description || post.title} />
      </Head>
      <Header />

      <main className={styles.postContainer}>
        <div className={styles.breadcrumbs}>
          <Link href="/forum">Forum</Link> &gt; 
          {post.forum_categories && (
            <Link href={`/forum/category/${post.category_id}`}>
              {post.forum_categories.name}
            </Link>
          )} &gt; 
          <span>{post.title}</span>
        </div>

        <article className={styles.postContent}>
          <header className={styles.postHeader}>
            <h1>{post.title}</h1>
            <div className={styles.postMeta}>
              {post.profile && (
                <div className={styles.authorInfo}>
                  <img 
                    src={post.profile.avatar_url || '/default-avatar.png'} 
                    alt={`${post.profile.first_name} ${post.profile.last_name}`}
                    className={styles.authorAvatar}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                  <span>{post.profile.first_name} {post.profile.last_name}</span>
                </div>
              )}
              <span>{formatDate(post.created_at)}</span>
              <span>{post.view_count || 0} views</span>
              {(post.region || post.city || post.division || post.ward) && (
                <span className={styles.location}>
                  📍 {[
                    post.ward?.name,
                    post.division?.name,
                    post.city?.name,
                    post.region?.name
                  ].filter(Boolean).join(', ')}
                </span>
              )}
            </div>
          </header>

          {post.description && (
            <div className={styles.postDescription}>
              <p>{post.description}</p>
            </div>
          )}

          <div className={styles.postBody}>
            <EditorJSRenderer 
              data={post.content} 
              renderers={{
                image: ({ data }) => (
                  <div className={styles.imageWrapper}>
                    <img 
                      src={data.file.url} 
                      alt={data.caption || ''}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/image-placeholder.png';
                      }}
                    />
                    {data.caption && (
                      <p className={styles.imageCaption}>{data.caption}</p>
                    )}
                  </div>
                ),
                header: ({ data, level }) => {
                  const Tag = `h${level}`;
                  return <Tag className={styles[`header${level}`]}>{data.text}</Tag>;
                }
              }}
            />
          </div>

          <div className={styles.postActions}>
            <button className={styles.actionButton}>
              👍 Upvote ({post.upvote_count || 0})
            </button>
            <button 
              className={styles.actionButton}
              onClick={() => {
                document.querySelector(`.${styles.commentForm} textarea`)?.focus();
              }}
            >
              💬 Comment ({post.post_count || 0})
            </button>
            <button className={styles.actionButton}>
              🔗 Share
            </button>
          </div>
        </article>

        <section className={styles.commentsSection}>
          <h2>Comments ({post.post_count || 0})</h2>
          
          {comments.length > 0 ? (
            <div className={styles.commentsList}>
              {comments.map(comment => (
                <div key={comment.id} className={styles.comment}>
                  <div className={styles.commentHeader}>
                    {comment.profile && (
                      <div className={styles.commentAuthor}>
                        <img 
                          src={comment.profile.avatar_url || '/default-avatar.png'} 
                          alt={`${comment.profile.first_name} ${comment.profile.last_name}`}
                          className={styles.commentAvatar}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/default-avatar.png';
                          }}
                        />
                        <span>{comment.profile.first_name} {comment.profile.last_name}</span>
                      </div>
                    )}
                    <span className={styles.commentDate}>
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <div className={styles.commentContent}>
                    {comment.content}
                  </div>
                  
                  {/* Reply button */}
                  <button 
                    className={styles.replyButton}
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  >
                    Reply
                  </button>
                  
                  {/* Reply form */}
                  {replyingTo === comment.id && (
                    <div className={styles.replyForm}>
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write your reply..."
                        className={styles.commentInput}
                        rows={3}
                      />
                      <div className={styles.replyActions}>
                        <button
                          onClick={() => setReplyingTo(null)}
                          className={styles.secondaryButton}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleReplySubmit(comment.id)}
                          disabled={isSubmitting || !replyContent.trim()}
                          className={styles.primaryButton}
                        >
                          {isSubmitting ? 'Posting...' : 'Post Reply'}
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Replies list */}
                  {comment.replies?.length > 0 && (
                    <div className={styles.repliesList}>
                      {comment.replies.map(reply => (
                        <div key={reply.id} className={styles.reply}>
                          <div className={styles.replyHeader}>
                            {reply.profile && (
                              <div className={styles.replyAuthor}>
                                <img 
                                  src={reply.profile.avatar_url || '/default-avatar.png'} 
                                  alt={`${reply.profile.first_name} ${reply.profile.last_name}`}
                                  className={styles.replyAvatar}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/default-avatar.png';
                                  }}
                                />
                                <span>{reply.profile.first_name} {reply.profile.last_name}</span>
                              </div>
                            )}
                            <span className={styles.replyDate}>
                              {formatDate(reply.created_at)}
                            </span>
                          </div>
                          <div className={styles.replyContent}>
                            {reply.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.noComments}>No comments yet. Be the first to comment!</p>
          )}

          {user ? (
            <div className={styles.commentForm}>
              <h3>Add a Comment</h3>
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Write your comment here..."
                className={styles.commentInput}
                rows={4}
              />
              <button
                onClick={handleCommentSubmit}
                disabled={isSubmitting || !commentContent.trim()}
                className={styles.commentSubmit}
              >
                {isSubmitting ? 'Posting...' : 'Post Comment'}
              </button>
              {error && <div className={styles.formError}>{error}</div>}
            </div>
          ) : (
            <div className={styles.loginPrompt}>
              <p>Please <button onClick={() => router.push('/login')} className={styles.loginLink}>sign in</button> to post a comment.</p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}