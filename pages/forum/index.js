// pages/forum/index.js
import styles from '../../styles/forum/landing.module.css';
import Head from 'next/head';
import Header from "../../components/Header"
import Footer from "../../components/Footer";
import { useForum } from '../../src/context/ForumContext';
import Link from 'next/link';

export default function ForumLanding() {
  const { user, loading, login } = useForum();

  return (
    <div className={styles.container}>
      <Header />
      <Head>
        <title>Community Forum | Walkability Discussions</title>
        <meta name="description" content="Join the conversation about improving walkability in our city" />
      </Head>
      
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Walkability Forum</h1>
          <p>Join the conversation about making our streets safer and more pedestrian-friendly</p>
          {!loading && (
            user ? (
              <Link href="/forum/post" className={styles.newPostButton}>
                Create New Post
              </Link>
            ) : (
              <button 
                onClick={login}
                className={styles.loginButton}
              >
                Sign in to post
              </button>
            )
          )}
        </div>
      </header>

      <section className={styles.features}>
        <div className={styles.feature}>
          <h3>Report Issues</h3>
          <p>Document and share walkability problems in your neighborhood</p>
        </div>
        <div className={styles.feature}>
          <h3>Discuss Solutions</h3>
          <p>Collaborate with others to find practical improvements</p>
        </div>
        <div className={styles.feature}>
          <h3>Track Progress</h3>
          <p>Follow up on reported issues and see what's being fixed</p>
        </div>
      </section>

      <section className={styles.howItWorks}>
        <h2>How the Forum Works</h2>
        <ol>
          <li>Create an account or login</li>
          <li>Browse existing discussions or start a new topic</li>
          <li>Submit your walkability issue with location details</li>
          <li>Our moderators will review and approve your post</li>
          <li>Engage with the community to find solutions</li>
        </ol>
      </section>

      <section className={styles.recentPosts}>
        <h2>Recently Discussed Topics</h2>
        <div className={styles.postPreview}>
          <h4>Broken Sidewalk on Kandivali SV Road</h4>
          <p>Reported 3 days ago • 12 comments</p>
          <p className={styles.postContent}>The sidewalk near the intersection of Boraspada Road and SV Road has been broken for months, creating a hazard for pedestrians.</p>
        </div>
        <div className={styles.postPreview}>
          <h4>Dangerous Intersection at Kandivali Link Road </h4>
          <p>Reported 1 week ago • 24 comments</p>
          <p className={styles.postContent}>The crosswalk signals at Link Road and Boraspada Road don't give pedestrians enough time to cross safely.</p>
        </div>
      </section>
      <Footer />
    </div>
  );
}