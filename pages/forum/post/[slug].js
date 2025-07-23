import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import Head from 'next/head';
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { useForum } from '../../../src/context/ForumContext';
import Link from 'next/link';
import styles from '../../../styles/forum/post.module.css';
import RenderEditorBlock from '../../../components/shared/RenderEditorBlock';
import { FaRegThumbsDown, FaRegThumbsUp, FaRegShareFromSquare } from "react-icons/fa6";

import { FaRegComment } from 'react-icons/fa';

export default function ForumPost() {
  const router = useRouter();
  const { slug } = router.query;
  const { user } = useForum();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentContent, setCommentContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [votes, setVotes] = useState(0);

  useEffect(() => {
    if (!router.isReady || !slug) return;

    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: postData, error: postError } = await supabase
          .from('forum_topics')
          .select(`
            *,
            forum_categories(name),
            profile:author_id(user_id,first_name,last_name,avatar_url)
          `)
          .eq('slug', slug)
          .maybeSingle();

        if (postError) throw postError;
        if (!postData) throw new Error('Post not found.');

        const { data: { user } } = await supabase.auth.getUser();

        if (postData.status !== 'Approved' && postData.author_id !== user?.id) {
          throw new Error(`Post not available.`);
        }


        postData.content = typeof postData.content === 'string'
          ? JSON.parse(postData.content)
          : postData.content;

        setPost(postData);
        setVotes(postData.upvote_count || 0);

        await supabase
          .from('forum_topics')
          .update({ view_count: (postData.view_count || 0) + 1 })
          .eq('id', postData.id);

        const { data: commentsData, error: commentsError } = await supabase
          .from('forum_posts')
          .select(`
            *,
            profile:author_id(user_id,first_name,last_name,avatar_url)
          `)
          .eq('topic_id', postData.id)
          .order('created_at', { ascending: true });

        if (commentsError) throw commentsError;

        setComments(commentsData || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [router.isReady, slug]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleUpvote = async () => {
    const newVotes = votes + 1;
    setVotes(newVotes);
    await supabase.from('forum_topics').update({ upvote_count: newVotes }).eq('id', post.id);
  };

  const handleDownvote = async () => {
    const newVotes = votes > 0 ? votes - 1 : 0;
    setVotes(newVotes);
    await supabase.from('forum_topics').update({ upvote_count: newVotes }).eq('id', post.id);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.description || '',
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert('Your browser does not support sharing.');
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentContent.trim() || !user || !post) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('forum_posts')
        .insert([{ content: commentContent, topic_id: post.id, author_id: user.id }]);

      if (!error) {
        const { data: updatedComments } = await supabase
          .from('forum_posts')
          .select(`
            *,
            profile:author_id(user_id,first_name,last_name,avatar_url)
          `)
          .eq('topic_id', post.id)
          .order('created_at', { ascending: true });

        setComments(updatedComments || []);
        setCommentContent('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
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
              <span>{formatDate(post.created_at)}</span>
            </div>
          </header>

          {post.description && 
            <div className={styles.postDescription}>
            <p>{post.description}</p>
            </div>
          }

          <div className={styles.postBody}>
            {post.content.blocks.map((block, i) => (
              <RenderEditorBlock block={block} index={i} key={i} />
            ))}
          </div>


          <div className={styles.postActions}>
            <button className={styles.actionButton} onClick={handleUpvote}>
              <FaRegThumbsUp /> Upvote ({votes})
            </button>
            <button className={styles.actionButton} onClick={handleDownvote}>
              <FaRegThumbsDown /> Downvote
            </button>
            <button className={styles.actionButton} onClick={handleShare}>
              <FaRegShareFromSquare /> Share
            </button>
          </div>
        </article>

        <section className={styles.commentsSection}>
          <h2><FaRegComment /> Comments ({comments.length})</h2>

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
                      {formatDate(comment.created_at)}
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
                disabled={submitting || !commentContent.trim()}
                className={styles.commentSubmit}
              >
                {submitting ? 'Posting…' : 'Post Comment'}
              </button>
              {error && <div className={styles.formError}>{error}</div>}
            </div>
          ) : (
            <div className={styles.loginPrompt}>
              <p>
                Please{' '}
                <button onClick={() => router.push('/auth')} className={styles.loginLink}>
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
