// index.js - Community Forum for Citizen Engagement
import { useEffect, useState } from "react";
import styles from "styles/pages/forum-home.module.css";
import Head from "next/head";
import { useAuth } from "context/AuthContext";
import Link from "next/link";
import { supabase } from "utils/supabaseClient";

// React Icons
import { 
  FaPalette, 
  FaBusinessTime, 
  FaNewspaper, 
  FaHandshake,
  FaLandmark,
  FaTheaterMasks,
  FaUtensils,
  FaLightbulb,
  FaCalendarAlt,
  FaUsers,
  FaChartLine,
  FaNetworkWired,
  FaBell
} from "react-icons/fa";

export default function CommunityForum() {
  const { user, loading, login } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [recentPosts, setRecentPosts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
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
    };

    fetchData();
  }, [user]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Community Connect | Share, Create, Grow Together</title>
        <meta
          name="description"
          content="Your platform to share ideas, showcase talents, promote business, and build meaningful community connections"
        />
      </Head>

      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Community Connect</h1>
          <p>
            Your voice, your creativity, your community. Share stories, showcase talents, 
            discuss ideas, and build meaningful connections with fellow citizens.
          </p>

          {!loading &&
            (user ? (
              <Link
                href="/forum/post/create-post"
                className={styles.primaryButton}
              >
                Share Your Story
              </Link>
            ) : (
              <button onClick={login} className={styles.primaryButton}>
                Join the Conversation
              </button>
            ))}
        </div>
      </header>

      <section className={styles.features}>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>
            <FaPalette size={48} />
          </div>
          <h3>Showcase Creativity</h3>
          <p>Share your art, writing, photography, or any creative work with the community</p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>
            <FaBusinessTime size={48} />
          </div>
          <h3>Promote Local Business</h3>
          <p>Highlight your services, products, or local ventures to neighborhood customers</p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>
            <FaNewspaper size={48} />
          </div>
          <h3>Community Journalism</h3>
          <p>Report local stories, events, and issues that matter to our community</p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>
            <FaHandshake size={48} />
          </div>
          <h3>Build Connections</h3>
          <p>Meet like-minded neighbors, form groups, and collaborate on local projects</p>
        </div>
      </section>

      <section className={styles.communityCategories}>
        <h2>Explore Community Topics</h2>
        <div className={styles.categoriesGrid}>
          <div className={styles.categoryItem}>
            <div className={styles.categoryIcon}>
              <FaLandmark size={40} />
            </div>
            <h3>Civic Matters</h3>
            <p>Discuss local governance, infrastructure, and community needs</p>
          </div>
          <div className={styles.categoryItem}>
            <div className={styles.categoryIcon}>
              <FaTheaterMasks size={40} />
            </div>
            <h3>Arts & Culture</h3>
            <p>Share artistic works, cultural events, and creative expressions</p>
          </div>
          <div className={styles.categoryItem}>
            <div className={styles.categoryIcon}>
              <FaUtensils size={40} />
            </div>
            <h3>Local Business</h3>
            <p>Promote shops, services, and entrepreneurial ventures</p>
          </div>
          <div className={styles.categoryItem}>
            <div className={styles.categoryIcon}>
              <FaNewspaper size={40} />
            </div>
            <h3>Community News</h3>
            <p>Report local happenings, events, and neighborhood stories</p>
          </div>
          <div className={styles.categoryItem}>
            <div className={styles.categoryIcon}>
              <FaLightbulb size={40} />
            </div>
            <h3>Ideas & Innovation</h3>
            <p>Propose community projects, solutions, and innovative ideas</p>
          </div>
          <div className={styles.categoryItem}>
            <div className={styles.categoryIcon}>
              <FaCalendarAlt size={40} />
            </div>
            <h3>Events & Meetups</h3>
            <p>Announce and organize local gatherings and activities</p>
          </div>
        </div>
      </section>

      <section className={styles.howItWorks}>
        <h2>How Our Community Platform Works</h2>
        <div className={styles.steps}>
          <div className={styles.step}>
            <h3>Join Our Community</h3>
            <p>Create your profile and become part of our growing neighborhood network</p>
          </div>
          <div className={styles.step}>
            <h3>Share Your Voice</h3>
            <p>Post stories, showcase work, promote business, or discuss local topics</p>
          </div>
          <div className={styles.step}>
            <h3>Connect & Engage</h3>
            <p>Interact with fellow citizens, collaborate, and build relationships</p>
          </div>
          <div className={styles.step}>
            <h3>Grow Together</h3>
            <p>Watch your ideas and connections flourish within the community</p>
          </div>
        </div>
      </section>

      <section className={styles.communityBenefits}>
        <h2>Why Join Our Community Platform?</h2>
        <div className={styles.benefitsGrid}>
          <div className={styles.benefitCard}>
            <h3>Amplify Your Voice</h3>
            <p>Reach neighbors and local audience with your messages and creations</p>
          </div>
          <div className={styles.benefitCard}>
            <h3>Discover Local Talent</h3>
            <p>Find amazing artists, entrepreneurs, and thinkers in your own backyard</p>
          </div>
          <div className={styles.benefitCard}>
            <h3>Build Your Network</h3>
            <p>Connect with potential customers, collaborators, and community partners</p>
          </div>
          <div className={styles.benefitCard}>
            <h3>Stay Informed</h3>
            <p>Get the pulse of your neighborhood through citizen journalism</p>
          </div>
        </div>
      </section>

      {!loading && user && (
        <section className={styles.userDashboard}>
          <h2>Your Community Hub</h2>
          <div className={styles.dashboardLinks}>
            <Link href="/forum/post/my-post" className={styles.dashboardCard}>
              <h3>My Contributions</h3>
              <p>Manage your posts, articles, and creative shares</p>
            </Link>
            <Link href="/forum/post/view-post" className={styles.dashboardCard}>
              <h3>Explore Community</h3>
              <p>Discover posts from fellow citizens</p>
            </Link>
            <Link href="/forum/connections" className={styles.dashboardCard}>
              <h3>My Connections</h3>
              <p>View and manage your community network</p>
            </Link>
            {isAdmin && (
              <Link
                href="/forum/post/review-post"
                className={styles.dashboardCard}
              >
                <h3>Community Moderation</h3>
                <p>Help maintain quality and positive engagement</p>
              </Link>
            )}
          </div>
        </section>
      )}

      {!loading && !user && (
        <section className={styles.joinCta}>
          <h2>Ready to Connect with Your Community?</h2>
          <p>Join thousands of citizens sharing, creating, and building together</p>
          <button onClick={login} className={styles.ctaButton}>
            Become a Community Member
          </button>
        </section>
      )}

    </div>
  );
}