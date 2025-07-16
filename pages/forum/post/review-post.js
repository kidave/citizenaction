import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabaseClient";
import styles from "../../../styles/forum/review-post.module.css";

export default function PostReview() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("forum_topics")
        .select("id, title")
        .eq("status", "pending");
      setPosts(data);
    })();
  }, []);

  const handleAction = async (id, action) => {
    if (!confirm(`Are you sure you want to ${action} this post?`)) return;
    await supabase
      .from("forum_topics")
      .update({ status: action })
      .eq("id", id);
    setPosts(posts.filter((p) => p.id !== id));
  };

  return (
    <div className={styles.container}>
      <h1>Review Pending Posts</h1>
      {posts.map((post) => (
        <div key={post.id} className={styles.postRow}>
          <span>{post.title}</span>
          <div className={styles.actions}>
            <button
              onClick={() => handleAction(post.id, "approved")}
              className={`${styles.btn} ${styles.approve}`}
            >
              Approve
            </button>
            <button
              onClick={() => handleAction(post.id, "rejected")}
              className={`${styles.btn} ${styles.reject}`}
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
