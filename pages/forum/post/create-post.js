// create-post.js - Updated with all requested features
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../../../utils/supabaseClient';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { useForum } from '../../../src/context/ForumContext';
import styles from '../../../styles/forum/create-post.module.css';
import Link from 'next/link';

export default function NewPost() {
  const router = useRouter();
  const { user } = useForum();
  const editorRef = useRef(null);
  const [editorData, setEditorData] = useState(null); // Store editor content in state
  const [isEditorReady, setIsEditorReady] = useState(false);

  const [categories, setCategories] = useState([]);
  const [regions, setRegions] = useState([]);
  const [cities, setCities] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [wards, setWards] = useState([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(''); // New description field
  const [categoryId, setCategoryId] = useState('');
  const [regionCode, setRegionCode] = useState('');
  const [cityCode, setCityCode] = useState('');
  const [divisionCode, setDivisionCode] = useState('');
  const [wardCode, setWardCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState(null);
  const [isDraftSaved, setIsDraftSaved] = useState(false);

  // Load draft from localStorage on component mount
  useEffect(() => {
    const loadDraft = async () => {
      const draft = localStorage.getItem('forumPostDraft');
      if (draft) {
        const parsedDraft = JSON.parse(draft);
        setTitle(parsedDraft.title || '');
        setDescription(parsedDraft.description || '');
        setCategoryId(parsedDraft.categoryId || '');
        setRegionCode(parsedDraft.regionCode || '');
        setCityCode(parsedDraft.cityCode || '');
        setDivisionCode(parsedDraft.divisionCode || '');
        setWardCode(parsedDraft.wardCode || '');
        setEditorData(parsedDraft.editorData || null);
      }
    };

    loadDraft();
  }, []);

  // Save draft to localStorage when any field changes
  useEffect(() => {
    const saveDraft = () => {
      const draft = {
        title,
        description,
        categoryId,
        regionCode,
        cityCode,
        divisionCode,
        wardCode,
        editorData
      };
      localStorage.setItem('forumPostDraft', JSON.stringify(draft));
    };

    // Only save draft if user is logged in
    if (user) {
      saveDraft();
    }
  }, [title, description, categoryId, regionCode, cityCode, divisionCode, wardCode, editorData, user]);

  useEffect(() => {
    if (!user) return;

    const initEditor = async () => {
      const EditorJS = (await import('@editorjs/editorjs')).default;
      const HeaderTool = (await import('@editorjs/header')).default;
      const ListTool = (await import('@editorjs/list')).default;
      const ImageTool = (await import('@editorjs/image')).default;
      const EmbedTool = (await import('@editorjs/embed')).default;
      const TableTool = (await import('@editorjs/table')).default;
      const Paragraph = (await import('@editorjs/paragraph')).default;

      editorRef.current = new EditorJS({
        holder: 'editorjs',
        data: editorData || undefined, // Load saved data if exists
        tools: {
          paragraph: {
            class: Paragraph,
            inlineToolbar: true,
          },
          header: {
            class: HeaderTool,
            config: {
              placeholder: 'Enter a header',
              levels: [2, 3, 4],
              defaultLevel: 2
            }
          },
          list: {
            class: ListTool,
            inlineToolbar: true
          },
          image: {
            class: ImageTool,
            config: {
              uploader: {
                async uploadByFile(file) {
                  const fileName = `posts/${Date.now()}-${file.name}`;
                  const { data, error } = await supabase
                    .storage
                    .from('forum-images')
                    .upload(fileName, file);

                  if (error) {
                    console.error(error);
                    return { success: 0 };
                  }

                  const { data: { publicUrl } } = supabase.storage
                    .from('forum-images')
                    .getPublicUrl(data.path);

                  return {
                    success: 1,
                    file: {
                      url: publicUrl,
                    }
                  };
                }
              }
            }
          },
          embed: EmbedTool,
          table: {
            class: TableTool,
            inlineToolbar: true
          }
        },
        placeholder: 'Write your post here...',
        onReady: () => {
          console.log('Editor.js is ready to work!');
          setIsEditorReady(true);
        },
        onChange: async (api) => {
          const content = await api.saver.save();
          setEditorData(content);
        }
      });
    };

    initEditor();

    return () => {
      if (editorRef.current?.destroy) {
        editorRef.current.destroy();
      }
    };
  }, [user]);

  // Fetch cities when regionCode changes
  useEffect(() => {
    if (!regionCode) return;

    const fetchCities = async () => {
      const { data } = await supabase
        .from('city')
        .select('code,name')
        .eq('region_code', regionCode)
        .order('name');
      setCities(data || []);
      setCityCode('');
      setDivisions([]);
      setWards([]);
    };

    fetchCities();
  }, [regionCode]);

  // Fetch divisions when cityCode changes
  useEffect(() => {
    if (!cityCode) return;

    const fetchDivisions = async () => {
      const { data } = await supabase
        .from('division')
        .select('code,name')
        .eq('city_code', cityCode)
        .order('name');
      setDivisions(data || []);
      setDivisionCode('');
      setWards([]);
    };

    fetchDivisions();
  }, [cityCode]);

  // Fetch wards when divisionCode changes
  useEffect(() => {
    if (!divisionCode) return;

    const fetchWards = async () => {
      const { data } = await supabase
        .from('ward')
        .select('code,name')
        .eq('division_code', divisionCode)
        .order('name');
      setWards(data || []);
      setWardCode('');
    };

    fetchWards();
  }, [divisionCode]);

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: catData } = await supabase
        .from('forum_categories')
        .select('id,name')
        .order('name');
      const { data: regData } = await supabase
        .from('region')
        .select('code,name');
      
      setCategories(catData || []);
      setRegions(regData || []);
      if (catData?.length) setCategoryId(catData[0].id);
      if (regData?.length) setRegionCode(regData[0].code);
    };

    fetchInitialData();
  }, []);

  const handlePreview = async () => {
    try {
      const content = await editorRef.current.save();
      setPreviewContent(content);
      setPreview(true);
    } catch (err) {
      console.error('Failed to save editor content:', err);
    }
  };

  const saveAsDraft = async () => {
    try {
      const content = await editorRef.current.save();
      setEditorData(content);
      setIsDraftSaved(true);
      
      // Hide the success message after 3 seconds
      setTimeout(() => setIsDraftSaved(false), 3000);
    } catch (err) {
      setError('Failed to save draft');
    }
  };

  const clearDraft = () => {
    localStorage.removeItem('forumPostDraft');
    setTitle('');
    setDescription('');
    setCategoryId(categories[0]?.id || '');
    setRegionCode(regions[0]?.code || '');
    setCityCode('');
    setDivisionCode('');
    setWardCode('');
    setEditorData(null);
    
    if (editorRef.current) {
      editorRef.current.clear();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !categoryId || !regionCode) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const editorData = await editorRef.current.save();

      const slug = title.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);

      const { data, error: submissionError } = await supabase
        .from('forum_topics')
        .insert([{
          title,
          description, // Include description in submission
          content: editorData,
          category_id: categoryId,
          author_id: user.id,
          slug,
          region_code: regionCode || null,
          city_code: cityCode || null,
          division_code: divisionCode || null,
          ward_code: wardCode || null,
          status: 'Pending',
          view_count: 0,
          post_count: 0
        }])
        .select();

      if (submissionError) throw submissionError;

      // Clear draft after successful submission
      clearDraft();
      
      // redirect to the newly created post page
      router.push(`/forum/post/${slug}`);

      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.notLoggedIn}>
          <h2>Sign In Required</h2>
          <p>Please sign in to submit a post to the forum.</p>
          <button 
            onClick={() => router.push('/login?returnTo=/forum/post/create-post')}
            className={styles.primaryButton}
          >
            Sign In
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  if (success) {
    return (
      <div className={styles.container}>
        <Header />
        <main className={styles.successMessage}>
          <div className={styles.successIcon}>✓</div>
          <h1>Submission Received</h1>
          <p>Your post has been submitted and is pending review by our moderators.</p>
          <p>You'll receive a notification once it's approved.</p>
          <div className={styles.successActions}>
            <button 
              onClick={() => router.push('/forum')} 
              className={styles.primaryButton}
            >
              Return to Forum
            </button>
            <button 
              onClick={() => router.push('/forum/post/my-post')}
              className={styles.secondaryButton}
            >
              View My Posts
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (preview) {
    return (
      <div className={styles.container}>
        <Header />
        <main className={styles.previewContainer}>
          <h1>Preview Your Post</h1>
          
          <div className={styles.previewContent}>
            <h2>{title}</h2>
            {description && <p className={styles.previewDescription}>{description}</p>}
            {previewContent && (
              <div className={styles.editorContent}>
                {previewContent.blocks.map((block, index) => {
                  switch (block.type) {
                    case 'header':
                      return <h3 key={index}>{block.data.text}</h3>;
                    case 'paragraph':
                      return <p key={index}>{block.data.text}</p>;
                    case 'list':
                      return block.data.style === 'unordered' ? (
                        <ul key={index}>
                          {block.data.items.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <ol key={index}>
                          {block.data.items.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ol>
                      );
                    case 'image':
                      return (
                        <div key={index} className={styles.imageContainer}>
                          <img src={block.data.file.url} alt={block.data.caption || ''} />
                          {block.data.caption && (
                            <p className={styles.imageCaption}>{block.data.caption}</p>
                          )}
                        </div>
                      );
                    default:
                      return null;
                  }
                })}
              </div>
            )}
          </div>
          
          <div className={styles.previewActions}>
            <button 
              onClick={() => setPreview(false)}
              className={styles.secondaryButton}
            >
              Back to Editing
            </button>
            <button 
              onClick={handleSubmit}
              className={styles.primaryButton}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Post'}
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Create New Post | Community Forum</title>
      </Head>
      <Header />

      <main className={styles.newPostContainer}>
        <div className={styles.breadcrumbs}>
          <Link href="/forum">Forum</Link> &gt; <span>New Post</span>
        </div>
        
        <h1>Create New Post</h1>
        <p className={styles.subtitle}>Share walkability issues or ideas with the community</p>

        <form onSubmit={handleSubmit} className={styles.postForm}>
          {error && <div className={styles.error}>{error}</div>}
          {isDraftSaved && <div className={styles.success}>Draft saved successfully!</div>}

          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Post Details</h2>
            
            <div className={styles.formGroup}>
              <label htmlFor="title">Post Title*</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={100}
                placeholder="Briefly describe the issue or topic"
              />
              <div className={styles.characterCount}>{title.length}/100</div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">Short Description*</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                maxLength={200}
                placeholder="A brief summary of your post (max 200 characters)"
                rows={3}
              />
              <div className={styles.characterCount}>{description.length}/200</div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="category">Category*</label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                <option value="">Choose a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Post Content*</h2>
            <div className={styles.editorContainer}>
              <div id="editorjs"></div>
            </div>
            <div className={styles.editorTips}>
              <p>Tips: Use headers to organize content, add images to show the issue, and be as specific as possible.</p>
            </div>
          </div>

          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Location Information</h2>
            <p className={styles.sectionSubtitle}>Help others understand where this issue is located</p>
            
            <div className={styles.locationGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="region">Region*</label>
                <select
                  id="region"
                  value={regionCode}
                  onChange={(e) => setRegionCode(e.target.value)}
                  required
                >
                  {regions.map((region) => (
                    <option key={region.code} value={region.code}>{region.name}</option>
                  ))}
                </select>
              </div>

              {cities.length > 0 && (
                <div className={styles.formGroup}>
                  <label htmlFor="city">City</label>
                  <select
                    id="city"
                    value={cityCode}
                    onChange={(e) => setCityCode(e.target.value)}
                  >
                    <option value="">Select City</option>
                    {cities.map((city) => (
                      <option key={city.code} value={city.code}>{city.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {divisions.length > 0 && (
                <div className={styles.formGroup}>
                  <label htmlFor="division">Division</label>
                  <select
                    id="division"
                    value={divisionCode}
                    onChange={(e) => setDivisionCode(e.target.value)}
                  >
                    <option value="">Select Division</option>
                    {divisions.map((div) => (
                      <option key={div.code} value={div.code}>{div.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {wards.length > 0 && (
                <div className={styles.formGroup}>
                  <label htmlFor="ward">Ward</label>
                  <select
                    id="ward"
                    value={wardCode}
                    onChange={(e) => setWardCode(e.target.value)}
                  >
                    <option value="">Select Ward</option>
                    {wards.map((ward) => (
                      <option key={ward.code} value={ward.code}>{ward.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className={styles.formActions}>
            <div className={styles.draftActions}>
              <button 
                type="button"
                onClick={saveAsDraft}
                className={styles.draftButton}
                disabled={loading}
              >
                Save Draft
              </button>
              <button 
                type="button"
                onClick={clearDraft}
                className={styles.clearDraftButton}
                disabled={loading}
              >
                Clear Draft
              </button>
            </div>
            <div className={styles.submitActions}>
              <button 
                type="button"
                onClick={handlePreview}
                className={styles.secondaryButton}
                disabled={loading || !isEditorReady}
              >
                Preview Post
              </button>
              <button 
                type="submit" 
                disabled={loading || !isEditorReady} 
                className={styles.primaryButton}
              >
                {loading ? 'Submitting...' : 'Submit for Review'}
              </button>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}