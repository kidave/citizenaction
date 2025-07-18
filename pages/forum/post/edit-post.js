import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import useAuthCheck from '../../../src/hooks/useAuthCheck';
import usePostForm from '../../../src/hooks/usePostForm';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import PostForm from '../../../components/forum/PostForm';
import PostPreviewModal from '../../../components/forum/PostPreviewModal';
import styles from '../../../styles/forum/create-post.module.css';

export default function EditPostPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading: authLoading } = useAuthCheck();
  const editorRef = useRef(null);

  const {
    status, error, isEditMode,
    title, setTitle, description, setDescription,
    categoryId, setCategoryId, editorData, setEditorData,
    regionCode, handleRegionChange, cityCode, handleCityChange,
    divisionCode, handleDivisionChange, wardCode, setWardCode,
    categories, regions, cities, divisions, wards,
    loadFormData, handleSubmit
  } = usePostForm(id);

  const [isEditorReady, setIsEditorReady] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // Load all form data when user is available
  useEffect(() => {
    if (user && id) {
      loadFormData(user);
    }
  }, [user, id, loadFormData]);

  // Initialize Editor.js only when data is ready
  useEffect(() => {
    if (status !== 'ready' || !editorData) return;

    const initEditor = async () => {
      const EditorJS = (await import('@editorjs/editorjs')).default;
      const HeaderTool = (await import('@editorjs/header')).default;
      const ListTool = (await import('@editorjs/list')).default;
      const ImageTool = (await import('@editorjs/image')).default;
      
      if (!editorRef.current) {
        editorRef.current = new EditorJS({
          holder: 'editorjs',
          data: editorData,
          tools: {
            header: {
              class: HeaderTool,
              config: {
                placeholder: 'Enter a header...',
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
                    const { data, error } = await supabase.storage
                      .from('forum-images')
                      .upload(fileName, file);
                    if (error) return { success: 0 };
                    const { data: { publicUrl } } = supabase.storage
                      .from('forum-images')
                      .getPublicUrl(data.path);
                    return { success: 1, file: { url: publicUrl } };
                  }
                }
              }
            }
          },
          placeholder: 'Write your post here...',
          onReady: () => setIsEditorReady(true),
          onChange: async (api) => {
            const content = await api.saver.save();
            setEditorData(content);
          }
        });
      }
    };
    initEditor();
    return () => {
      if (editorRef.current?.destroy) editorRef.current.destroy();
      editorRef.current = null;
    };
  }, [status, editorData]);

  const handlePreview = async () => {
    if (!title || !description || !categoryId) {
      setError('Please fill all required fields: Title, Description, and Category.');
      return;
    }

    try {
      const content = editorRef.current ? await editorRef.current.save() : editorData;
      setEditorData(content);
      setShowPreview(true);
    } catch (err) {
      setError("Failed to generate preview.");
    }
  };

  const onSubmit = async (e) => {
    e?.preventDefault();
    if (!editorRef.current) return;
    const content = await editorRef.current.save();
    
    const confirmed = window.confirm('Are you sure you want to update this post?');
    if (!confirmed) return;
    
    const success = await handleSubmit(user, content, false);
    if (success) {
      router.push('/forum/post/my-post?status=updated');
    }
  };
  
  if (authLoading || (status === 'loading' && !error)) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.loading}>Loading editor...</div>
        <Footer />
      </div>
    );
  }
  
  if (status === 'error') {
    return (
      <div className={styles.container}>
        <Header />
        <main className={styles.newPostContainer}>
          <div className={styles.error}>{error}</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Edit Post | Community Forum</title>
      </Head>
      <Header />
      <main className={styles.newPostContainer}>
        <div className={styles.breadcrumbs}>
          <Link href="/forum">Forum</Link> &gt; 
          <Link href="/forum/post/my-post">My Posts</Link> &gt; 
          <span>Edit Post</span>
        </div>
        <h1>Edit Post</h1>
        <form onSubmit={onSubmit} className={styles.postForm}>
          {error && <div className={styles.error}>{error}</div>}
          <PostForm 
            isEditMode={true}
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            categoryId={categoryId}
            setCategoryId={setCategoryId}
            categories={categories}
            regionCode={regionCode}
            handleRegionChange={handleRegionChange}
            regions={regions}
            cityCode={cityCode}
            handleCityChange={handleCityChange}
            cities={cities}
            divisionCode={divisionCode}
            handleDivisionChange={handleDivisionChange}
            divisions={divisions}
            wardCode={wardCode}
            setWardCode={setWardCode}
            wards={wards}
          />
          <div className={styles.formActions}>
            <div className={styles.submitActions}>
              <button 
                type="button" 
                onClick={handlePreview} 
                className={styles.secondaryButton} 
                disabled={status === 'loading' || !isEditorReady}
              >
                Preview
              </button>
              <button 
                type="submit" 
                disabled={status === 'loading' || !isEditorReady} 
                className={styles.primaryButton}
              >
                {status === 'loading' ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>

        {showPreview && (
          <PostPreviewModal
            post={{
              title,
              description,
              content: editorData
            }}
            onClose={() => setShowPreview(false)}
            onSubmit={onSubmit}
            submitLabel="Save Changes"
            isSubmitting={status === 'loading'}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}