import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import Head from 'next/head';
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { useForum } from '../../../src/context/ForumContext';
import Link from 'next/link';
import styles from '../../../styles/forum/post.module.css';

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

  useEffect(() => {
    if (!router.isReady || !slug) return;

    const fetchPostData = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: postExists, error: existsError } = await supabase
          .from('forum_topics')
          .select('id,status')
          .eq('slug', slug)
          .maybeSingle();

        if (existsError) throw existsError;
        if (!postExists) throw new Error('No post found with this URL');

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
            )
          `)
          .eq('slug', slug)
          .single();

        if (postError) throw postError;
        if (!postData) throw new Error('Post data could not be loaded');

        if (postData.status !== 'Approved') {
          throw new Error(`Post status: ${postData.status}`);
        }

        postData.content = typeof postData.content === 'string'
          ? JSON.parse(postData.content)
          : postData.content;

        await supabase
          .from('forum_topics')
          .update({ view_count: (postData.view_count || 0) + 1 })
          .eq('id', postData.id);

        const { data: commentsData, error: commentsError } = await supabase
          .from('forum_posts')
          .select(`
            *,
            profile:author_id(
              user_id,
              first_name,
              last_name,
              avatar_url
            )
          `)
          .eq('topic_id', postData.id)
          .order('created_at', { ascending: true });

        if (commentsError) throw commentsError;

        setPost(postData);
        setComments(commentsData || []);
      } catch (err) {
        console.error('Fetch error:', { error: err, slug });
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
  }, [router.isReady, slug]);

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

      setComments([...comments, ...data]);
      setCommentContent('');

      await supabase
        .from('forum_topics')
        .update({ 
          post_count: (post.post_count || 0) + 1,
          last_post_at: new Date().toISOString()
        })
        .eq('id', post.id);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.loading}>Loading…</div>
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
          <p>{error}</p>
          <button onClick={() => router.push('/forum')} className={styles.primaryButton}>
            Back to Forum
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return null;
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
                    src={post.profile.avatar_url || '/user1.png'}
                    alt={`${post.profile.first_name} ${post.profile.last_name}`}
                    className={styles.authorAvatar}
                    onError={(e) => { e.target.src = '/user1.png'; }}
                  />
                  <span>by {post.profile.first_name} {post.profile.last_name}</span>
                </div>
              )}
              <span>{post.forum_categories.name}</span>
              <span>{new Date(post.created_at).toLocaleDateString()}</span>
              <span>{post.view_count || 0} views</span>
            </div>
          </header>

          {post.description && <p>{post.description}</p>}

          <div className={styles.postBody}>
            {post.content.blocks.map((block, i) => {
              switch (block.type) {
                case 'paragraph':
                  return <p key={i}>{block.data.text}</p>;
                case 'header': {
                  const Tag = `h${block.data.level}`;
                  return <Tag key={i}>{block.data.text}</Tag>;
                }
                case 'image':
                  return (
                    <div key={i} className={styles.imageWrapper}>
                      <img
                        src={block.data.file?.url || '/image-placeholder.png'}
                        alt={block.data.caption || ''}
                        onError={(e) => { e.target.src = '/image-placeholder.png'; }}
                      />
                      {block.data.caption && <p>{block.data.caption}</p>}
                    </div>
                  );
                default:
                  return null;
              }
            })}
          </div>

          <div className={styles.postActions}>
            <button className={styles.actionButton}>👍 Upvote ({post.upvote_count || 0})</button>
            <button className={styles.actionButton}>💬 Comment ({post.post_count || 0})</button>
            <button className={styles.actionButton}>🔗 Share</button>
          </div>
        </article>

        <section className={styles.commentsSection}>
          <h2>Comments ({comments.length})</h2>

          {comments.length > 0 ? (
            <div className={styles.commentsList}>
              {comments.map(comment => (
                <div key={comment.id} className={styles.comment}>
                  <div className={styles.commentHeader}>
                    {comment.profile && (
                      <div className={styles.commentAuthor}>
                        <img 
                          src={comment.profile.avatar_url || '/user1.png'} 
                          alt={`${comment.profile.first_name} ${comment.profile.last_name}`}
                          className={styles.commentAvatar}
                          onError={(e) => { e.target.src = '/user1.png'; }}
                        />
                        <span>{comment.profile.first_name} {comment.profile.last_name}</span>
                      </div>
                    )}
                    <span className={styles.commentDate}>
                      {new Date(comment.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div className={styles.commentContent}>
                    {comment.content}
                  </div>
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
                {isSubmitting ? 'Posting…' : 'Post Comment'}
              </button>
              {error && <div className={styles.formError}>{error}</div>}
            </div>
          ) : (
            <div className={styles.loginPrompt}>
              <p>
                Please{' '}
                <button onClick={() => router.push('/login')} className={styles.loginLink}>
                  sign in
                </button>{' '}
                to post a comment.
              </p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
