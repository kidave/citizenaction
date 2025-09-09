// index.js - Updated with modern features
import { useEffect, useState } from "react";
import styles from "styles/forum/landing.module.css";
import Head from "next/head";
import Header from "components/home/Header";
import Footer from "components/home/Footer";
import { useAuth } from "context/AuthContext";
import Link from "next/link";
import { supabase } from "utils/supabaseClient";

export default function ForumLanding() {
  const { user, loading, login } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [recentPosts, setRecentPosts] = useState([]);
  const [stats, setStats] = useState({ posts: 0, users: 0, issues: 0 });

  useEffect(() => {
    const fetchData = async () => {
      // Check admin status
      if (user) {
        const { data: profile } = await supabase
          .from("profile")
          .select("is_convenor, is_co_convenor")
          .eq("user_id", user.id)
          .single();

        if (profile && (profile.is_convenor || profile.is_co_convenor)) {
          setIsAdmin(true);
        }
      }

      // Get recent approved posts
      //const { data: posts } = await supabase
      //.from('forum_topics')
      //.select('id, title, content, created_at, view_count, post_count')
      //.eq('status', 'approved')
      //.order('created_at', { ascending: false })
      //.limit(4);

      //setRecentPosts(posts || []);

      // Get forum stats
    };

    fetchData();
  }, [user]);

  return (
    <div className={styles.container}>
      <Header />
      <Head>
        <title>Community Forum | Walkability Discussions</title>
        <meta
          name="description"
          content="Join the conversation around improving walkability in our city"
        />
      </Head>

      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Walkability Forum</h1>
          <p>
            Join the conversation around making our streets safer and more
            pedestrian-friendly
          </p>

          {!loading &&
            (user ? (
              <Link
                href="/forum/post/create-post"
                className={styles.primaryButton}
              >
                Create New Post
              </Link>
            ) : (
              <button onClick={login} className={styles.primaryButton}>
                Sign in to participate
              </button>
            ))}
        </div>
      </header>

      <section className={styles.features}>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>📝</div>
          <h3>Report Issues</h3>
          <p>Document and share walkability problems in your neighborhood</p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>💡</div>
          <h3>Discuss Solutions</h3>
          <p>Collaborate with others to find practical improvements</p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>📈</div>
          <h3>Track Progress</h3>
          <p>Follow up on reported issues and see what's being fixed</p>
        </div>
      </section>

      {recentPosts.length > 0 && (
        <section className={styles.recentPosts}>
          <div className={styles.sectionHeader}>
            <h2>Recently Discussed Topics</h2>
            <Link href="/forum/post/view-post" className={styles.viewAllLink}>
              View All Posts →
            </Link>
          </div>
        </section>
      )}

      <section className={styles.howItWorks}>
        <h2>How the Forum Works</h2>
        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <h3>Create an account</h3>
            <p>Sign up to join the community and start contributing</p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <h3>Submit your issue</h3>
            <p>Describe the walkability problem with location details</p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <h3>Community discussion</h3>
            <p>Engage with others to find solutions and improvements</p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <h3>Track resolution</h3>
            <p>Follow the progress as authorities address the issues</p>
          </div>
        </div>
      </section>

      {!loading && user && (
        <section className={styles.userDashboard}>
          <h2>Your Dashboard</h2>
          <div className={styles.dashboardLinks}>
            <Link href="/forum/post/my-post" className={styles.dashboardCard}>
              <h3>My Posts</h3>
              <p>View and manage your submitted posts</p>
            </Link>
            <Link href="/forum/post/view-post" className={styles.dashboardCard}>
              <h3>Browse Discussions</h3>
              <p>Explore all approved posts</p>
            </Link>
            {isAdmin && (
              <Link
                href="/forum/post/review-post"
                className={styles.dashboardCard}
              >
                <h3>Moderation</h3>
                <p>Review pending posts</p>
              </Link>
            )}
          </div>
        </section>
      )}
      <Footer />
    </div>
  );
}
