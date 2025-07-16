// view-post.js - Updated with modern features
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../../utils/supabaseClient";
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import styles from "../../../styles/forum/view-post.module.css";
import Link from "next/link";

// Dynamically import EditorJS renderer to avoid SSR issues
const EditorJSRenderer = dynamic(() => import("editorjs-react-renderer"), { 
  ssr: false,
  loading: () => <p>Loading content...</p>
});

export default function ViewPosts() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [regions, setRegions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories and regions for filters
        const { data: catData } = await supabase
          .from('forum_categories')
          .select('id,name');
        
        const { data: regData } = await supabase
          .from('region')
          .select('code,name');
        
        setCategories(catData || []);
        setRegions(regData || []);

        // Build the initial query
        let query = supabase
          .from('forum_topics')
          .select(`
            id, 
            title, 
            content,
            created_at,
            view_count,
            post_count,
            status,
            forum_categories(name),
            region(name),
            city(name),
            division(name),
            ward(name)
          `)
          .eq('status', 'approved')
          .order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) throw error;

        setPosts(data || []);
      } catch (err) {
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('forum_topics')
        .select(`
          id, 
          title, 
          content,
          created_at,
          view_count,
          post_count,
          status,
          forum_categories(name),
          region(name),
          city(name),
          division(name),
          ward(name)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }

      if (selectedRegion) {
        query = query.eq('region_code', selectedRegion);
      }

      const { data, error } = await query;

      if (error) throw error;

      setPosts(data || []);
    } catch (err) {
      console.error('Error searching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading && !posts.length) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.loading}>Loading posts...</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Forum Posts | Walkability Discussions</title>
      </Head>
      <Header />

      <main className={styles.mainContent}>
        {selectedPost ? (
          <div className={styles.postDetail}>
            <button 
              onClick={() => setSelectedPost(null)}
              className={styles.backButton}
            >
              ← Back to All Posts
            </button>
            
            <div className={styles.postHeader}>
              <h1>{selectedPost.title}</h1>
              
              <div className={styles.postMeta}>
                <span className={styles.metaItem}>
                  Posted on {formatDate(selectedPost.created_at)}
                </span>
                <span className={styles.metaItem}>
                  {selectedPost.view_count} views
                </span>
                <span className={styles.metaItem}>
                  {selectedPost.post_count} comments
                </span>
                {selectedPost.region && (
                  <span className={styles.metaItem}>
                    Location: {[
                      selectedPost.ward?.name,
                      selectedPost.division?.name,
                      selectedPost.city?.name,
                      selectedPost.region?.name
                    ].filter(Boolean).join(', ')}
                  </span>
                )}
              </div>
            </div>

            <div className={styles.postBody}>
              <EditorJSRenderer 
                data={selectedPost.content} 
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
                👍 Upvote
              </button>
              <button className={styles.actionButton}>
                💬 Comment
              </button>
              <button className={styles.actionButton}>
                🔗 Share
              </button>
            </div>

            <div className={styles.commentsSection}>
              <h2>Comments</h2>
              <div className={styles.commentForm}>
                <textarea 
                  placeholder="Add your comment..."
                  className={styles.commentInput}
                />
                <button className={styles.commentSubmit}>
                  Post Comment
                </button>
              </div>
              
              {/* Comment list would go here */}
              <div className={styles.commentList}>
                <p>No comments yet. Be the first to comment!</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.filterSection}>
              <h1>Forum Discussions</h1>
              
              <div className={styles.searchBar}>
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button 
                  onClick={handleSearch}
                  className={styles.searchButton}
                >
                  Search
                </button>
              </div>
              
              <div className={styles.filters}>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                >
                  <option value="">All Regions</option>
                  {regions.map(region => (
                    <option key={region.code} value={region.code}>{region.name}</option>
                  ))}
                </select>
                
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                    setSelectedRegion('');
                    handleSearch();
                  }}
                  className={styles.clearFilters}
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {posts.length === 0 ? (
              <div className={styles.noResults}>
                <h2>No posts found</h2>
                <p>Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className={styles.postsGrid}>
                {posts.map((post) => (
                  <Link href={`/forum/post/${post.slug}`} key={post.id} passHref>
                    <div className={styles.postCard}>
                      <h2>{post.title}</h2>
                        <div className={styles.cardMeta}>
                          <span className={styles.category}>
                            {post.forum_categories?.name}
                          </span>
                          <span>
                            {formatDate(post.created_at)}
                          </span>
                        </div>
                        <div className={styles.cardFooter}>
                        <span>👁 {post.view_count} views</span>
                        <span>💬 {post.post_count} comments</span>
                        </div>
                        {post.region && (
                          <div className={styles.location}>
                            📍 {[
                              post.ward?.name,
                              post.division?.name,
                              post.city?.name,
                              post.region?.name
                            ].filter(Boolean).join(', ')}
                          </div>
                        )}
                      </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}