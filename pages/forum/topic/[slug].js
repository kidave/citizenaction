import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import Head from 'next/head';
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { useForum } from '../../../src/context/ForumContext';
import Post from '../../../components/forum/common/PostCard';
import styles from '../../../styles/components/forum/post.module.css';

export default function ForumPost() {
  const router = useRouter();
  const { slug } = router.query;
  const { user } = useForum();
  
  const [topic, setTopic] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch topic and posts
  useEffect(() => {
    if (!slug) return;

    const fetchTopicAndPosts = async () => {
      setLoading(true);
      try {
        // Fetch the topic
        const { data: topicData, error: topicError } = await supabase
          .from('forum.topics')
          .select(`
            *,
            author:forum.users(username, avatar_url, display_name),
            category:forum.categories(name, slug)
          `)
          .eq('slug', slug)
          .single();

        if (topicError) throw topicError;

        // Increment view count
        await supabase
          .from('forum.topics')
          .update({ view_count: (topicData.view_count || 0) + 1 })
          .eq('id', topicData.id);

        // Fetch posts for this topic
        const { data: postsData, error: postsError } = await supabase
          .from('forum.posts')
          .select(`
            *,
            author:forum.users(id, username, avatar_url, display_name)
          `)
          .eq('topic_id', topicData.id)
          .order('created_at', { ascending: true });

        if (postsError) throw postsError;

        setTopic(topicData);
        setPosts(postsData || []);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching topic:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopicAndPosts();
  }, [slug]);

  const handleReplySubmit = async () => {
    if (!replyContent.trim() || !user) return;
    
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('forum.posts')
        .insert([{
          content: replyContent,
          topic_id: topic.id,
          author_id: user.id
        }])
        .select(`
          *,
          author:forum.users(id, username, avatar_url, display_name)
        `);

      if (error) throw error;

      // Update the posts list
      setPosts([...posts, data[0]]);
      setReplyContent('');

      // Update the topic's post count
      await supabase
        .from('forum.topics')
        .update({ post_count: (topic.post_count || 0) + 1 })
        .eq('id', topic.id);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading post...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!topic) return <div className={styles.notFound}>Post not found</div>;

  return (
    <div className={styles.forumContainer}>
      <Head>
        <title>{topic.title} | Community Forum</title>
        <meta name="description" content={topic.content.substring(0, 160)} />
      </Head>
      
      <Header />
      
      <main className={styles.postContainer}>
        <div className={styles.breadcrumbs}>
          <Link href="/forum">Forum</Link> &gt; 
          <Link href={`/forum/category/${topic.category.slug}`}>{topic.category.name}</Link> &gt; 
          <span>{topic.title}</span>
        </div>

        <h1 className={styles.topicTitle}>{topic.title}</h1>
        
        {/* Original Post */}
        <Post 
          post={{
            ...topic,
            content: topic.content,
            author: topic.author,
            created_at: topic.created_at
          }} 
          isOriginalPost={true}
          onReply={() => {
            if (!user) {
              alert('Please sign in to reply');
              return;
            }
            document.getElementById('replyTextarea').focus();
          }}
        />

        {/* Replies */}
        <div className={styles.repliesSection}>
          <h2 className={styles.repliesHeading}>
            {posts.length - 1} {posts.length === 2 ? 'Reply' : 'Replies'}
          </h2>
          
          {posts.slice(1).map((post) => (
            <Post 
              key={post.id}
              post={post}
              onReply={() => {
                if (!user) {
                  alert('Please sign in to reply');
                  return;
                }
                setReplyContent(`@${post.author.username} `);
                document.getElementById('replyTextarea').focus();
              }}
            />
          ))}
        </div>

        {/* Reply Form */}
        {user ? (
          <div className={styles.replyForm}>
            <h3>Post a Reply</h3>
            <textarea
              id="replyTextarea"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write your reply here..."
              className={styles.replyTextarea}
            />
            <button
              onClick={handleReplySubmit}
              disabled={isSubmitting || !replyContent.trim()}
              className={styles.replyButton}
            >
              {isSubmitting ? 'Posting...' : 'Post Reply'}
            </button>
            {error && <div className={styles.formError}>{error}</div>}
          </div>
        ) : (
          <div className={styles.loginPrompt}>
            <p>Please sign in to post a reply.</p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}