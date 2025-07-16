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

// Dynamically import EditorJS renderer
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

  useEffect(() => {
    if (!slug) return;

    const fetchPostData = async () => {
      setLoading(true);
      try {
        // Fetch the post with author and category info
        const { data: postData, error: postError } = await supabase
          .from('forum_topics')
          .select(`
            *,
            forum_categories(name),
            author:profile(
              id,
              first_name,
              last_name,
              avatar_url
            )
          `)
          .eq('slug', slug)
          .eq('status', 'approved')
          .single();

        if (postError) throw postError;
        if (!postData) {
          throw new Error('Post not found or not approved');
        }

        // Increment view count
        await supabase
          .from('forum_topics')
          .update({ view_count: (postData.view_count || 0) + 1 })
          .eq('id', postData.id);

        // Fetch comments
        const { data: commentsData, error: commentsError } = await supabase
          .from('forum_posts')
          .select(`
            *,
            author:profile(
              id,
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
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
  }, [slug]);

  const handleCommentSubmit = async () => {
    if (!commentContent.trim() || !user || !post) return;
    
    setIsSubmitting(true);
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

      // Update the comments list
      setComments([...comments, ...data]);
      setCommentContent('');

      // Update the post's comment count
      await supabase
        .from('forum_topics')
        .update({ post_count: (post.post_count || 0) + 1 })
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
        <div className={styles.loading}>Loading post...</div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.errorContainer}>
          <h2>Error loading post</h2>
          <p>{error}</p>
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

  if (!post) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.notFound}>
          <h2>Post Not Found</h2>
          <p>The post you're looking for doesn't exist or isn't approved yet.</p>
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
        <meta name="description" content={post.title} />
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
              {post.author && (
                <div className={styles.authorInfo}>
                  <img 
                    src={post.author.avatar_url || '/default-avatar.png'} 
                    alt={`${post.author.first_name} ${post.author.last_name}`}
                    className={styles.authorAvatar}
                  />
                  <span>{post.author.first_name} {post.author.last_name}</span>
                </div>
              )}
              <span>{new Date(post.created_at).toLocaleDateString()}</span>
              <span>{post.view_count} views</span>
            </div>
          </header>

          <div className={styles.postBody}>
            <EditorJSRenderer 
              data={post.content} 
              renderers={{
                image: ({ data }) => (
                  <div className={styles.imageWrapper}>
                    <img src={data.file.url} alt={data.caption || ''} />
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
            <button className={styles.actionButton}>
              💬 Comment ({post.post_count || 0})
            </button>
            <button className={styles.actionButton}>
              🔗 Share
            </button>
          </div>
        </article>

        <section className={styles.commentsSection}>
          <h2>Comments ({comments.length})</h2>
          
          {comments.length > 0 ? (
            <div className={styles.commentsList}>
              {comments.map(comment => (
                <div key={comment.id} className={styles.comment}>
                  <div className={styles.commentHeader}>
                    {comment.author && (
                      <div className={styles.commentAuthor}>
                        <img 
                          src={comment.author.avatar_url || '/default-avatar.png'} 
                          alt={`${comment.author.first_name} ${comment.author.last_name}`}
                          className={styles.commentAvatar}
                        />
                        <span>{comment.author.first_name} {comment.author.last_name}</span>
                      </div>
                    )}
                    <span className={styles.commentDate}>
                      {new Date(comment.created_at).toLocaleDateString()}
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