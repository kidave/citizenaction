import { useState, useEffect } from "react";
import { supabase } from "../../../utils/supabaseClient";
import Head from "next/head";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import Link from "next/link";
import styles from "../../../styles/forum/view-post.module.css";

export default function ViewPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [regions, setRegions] = useState([]);
  const [sortOrder, setSortOrder] = useState("newest");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [{ data: catData }, { data: regData }] = await Promise.all([
        supabase.from("forum_categories").select("id,name"),
        supabase.from("region").select("code,name"),
      ]);
      setCategories(catData || []);
      setRegions(regData || []);
      await fetchPosts();
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("forum_topics")
        .select(`
          id, slug, title, description, created_at, view_count, post_count,
          forum_categories(name),
          author:author_id(first_name, last_name),
          region(name), city(name), division(name), ward(name)
        `)
        .eq("status", "Approved");

      if (searchTerm) query = query.ilike("title", `%${searchTerm}%`);
      if (selectedCategory) query = query.eq("category_id", selectedCategory);
      if (selectedRegion) query = query.eq("region_code", selectedRegion);

      if (sortOrder === "newest") {
        query = query.order("created_at", { ascending: false });
      } else if (sortOrder === "oldest") {
        query = query.order("created_at", { ascending: true });
      } else if (sortOrder === "most_viewed") {
        query = query.order("view_count", { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;

      setPosts(data || []);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <Head>
        <title>Forum Posts | Walkability Discussions</title>
      </Head>
      <Header />

      <main className={styles.container}>

        <section className={styles.filters}>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search posts…"
            className={styles.input}
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={styles.select}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className={styles.select}
          >
            <option value="">All Regions</option>
            {regions.map((r) => (
              <option key={r.code} value={r.code}>
                {r.name}
              </option>
            ))}
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className={styles.select}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="most_viewed">Most Viewed</option>
          </select>

          <button onClick={fetchPosts} className={styles.button}>
            Apply Filters
          </button>

          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("");
              setSelectedRegion("");
              setSortOrder("newest");
              fetchPosts();
            }}
            className={styles.buttonSecondary}
          >
            Clear Filters
          </button>
        </section>

        {loading ? (
          <p>Loading posts…</p>
        ) : posts.length === 0 ? (
          <p>No posts found. Try adjusting your search or filters.</p>
        ) : (
          <div className={styles.grid}>
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/forum/post/${post.slug}`}
                className={styles.card}
              >
                <h3 className={styles.cardTitle}>{post.title}</h3>
                <p className={styles.cardDesc}>
                  {post.description?.slice(0, 100) || "No description."}
                </p>
                <div className={styles.cardMeta}>
                  <span>
                    By {post.author?.first_name} {post.author?.last_name}
                  </span>
                  {", "}
                  <span>{formatDate(post.created_at)}</span>
                </div>
                {post.region && (
                  <div className={styles.cardLocation}>
                    {post.ward?.name
                      ? `Ward ${post.ward.name}${post.city?.name ? `, ${post.city.name}` : ''}`
                      : post.division?.name
                        ? `${post.division.name}${post.city?.name ? `, ${post.city.name}` : ''}`
                        : post.city?.name 
                          ? post.city.name
                          : post.region?.name 
                            ? post.region.name
                            : 'Global'}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
