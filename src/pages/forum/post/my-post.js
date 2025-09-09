import { useEffect, useState } from "react";
import { supabase } from "utils/supabaseClient";
import { useRouter } from "next/router";
import Head from "next/head";
import Header from "components/home/Header";
import Footer from "components/home/Footer";
import Link from "next/link";
import styles from "styles/forum/my-post.module.css";

export default function MyPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/auth?returnTo=/forum/post/my-post");
          return;
        }

        const { data, error } = await supabase
          .from("forum_topics")
          .select(
            `
            id, 
            title, 
            slug,
            status,
            created_at,
            view_count,
            post_count,
            moderator_notes,
            forum_categories(name)
          `,
          )
          .eq("author_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setPosts(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      Approved: styles.approved,
      Pending: styles.pending,
      Rejected: styles.rejected,
    };
    return (
      <span className={`${styles.statusBadge} ${statusClasses[status]}`}>
        {status}
      </span>
    );
  };

  const getStatusFeedback = (status, moderatorNotes) => {
    // Default feedback messages
    const defaultFeedback = {
      Pending: "Your post is currently under review by our moderators.",
      Approved:
        "Your post has been approved and is now visible to the community.",
      Rejected: "Your post did not meet our community guidelines.",
    };

    // If custom notes exist, use them, otherwise use default feedback
    const feedback = moderatorNotes || defaultFeedback[status];

    return (
      <div className={styles.moderatorNotes}>
        <h4>Status Update:</h4>
        <p>{feedback}</p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.loading}>Loading your posts...</div>
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
        <title>My Posts | Community Forum</title>
      </Head>
      <Header />

      <main className={styles.main}>
        <div className={styles.header}>
          <h1>My Posts</h1>
          <Link href="/forum/post/create-post" className={styles.newPostButton}>
            Create New Post
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className={styles.noPosts}>
            <p>You haven't created any posts yet.</p>
            <Link
              href="/forum/post/create-post"
              className={styles.createPostLink}
            >
              Create your first post
            </Link>
          </div>
        ) : (
          <div className={styles.postsList}>
            {posts.map((post) => (
              <div key={post.id} className={styles.postCard}>
                <div className={styles.postHeader}>
                  <h3 className={styles.postTitle}>
                    <Link href={`/forum/post/${post.slug}`}>{post.title}</Link>
                  </h3>
                  {getStatusBadge(post.status)}
                </div>

                <div className={styles.postMeta}>
                  <span className={styles.category}>
                    {post.forum_categories?.name}
                  </span>
                  <span className={styles.date}>
                    {formatDate(post.created_at)}
                  </span>
                  <span className={styles.views}>
                    {" "}
                    {post.view_count || 0} views
                  </span>
                  <span className={styles.comments}>
                    {" "}
                    {post.post_count || 0} comments
                  </span>
                </div>

                {/* Display status feedback for all posts */}
                {getStatusFeedback(post.status, post.moderator_notes)}

                <div className={styles.postActions}>
                  <Link
                    href={`/forum/post/${post.slug}`}
                    className={styles.viewButton}
                  >
                    View Post
                  </Link>
                  {post.status === "Pending" && (
                    <button
                      className={styles.editButton}
                      onClick={() =>
                        router.push(`/forum/post/edit-post?id=${post.id}`)
                      }
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
