import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { supabase } from "utils/supabaseClient";
import Header from "components/Header";
import Footer from "components/Footer";
import PostForm from "components/forum/PostForm";
import PostPreviewModal from "components/forum/PostPreviewModal";
import { useAuth } from "context/AuthContext";
import styles from "styles/forum/create-post.module.css";
import Link from "next/link";

export default function NewPost() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const editorRef = useRef(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [regionCode, setRegionCode] = useState("");
  const [cityCode, setCityCode] = useState("");
  const [divisionCode, setDivisionCode] = useState("");
  const [wardCode, setWardCode] = useState("");
  const [editorData, setEditorData] = useState({ blocks: [] });
  const [showPreview, setShowPreview] = useState(false);

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);

  // Data for selects
  const [categories, setCategories] = useState([]);
  const [regions, setRegions] = useState([]);
  const [cities, setCities] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [wards, setWards] = useState([]);

  // Check if form has any content
  const hasContent = () => {
    return (
      title.trim() ||
      description.trim() ||
      categoryId ||
      regionCode ||
      cityCode ||
      divisionCode ||
      wardCode ||
      (editorData.blocks && editorData.blocks.length > 0)
    );
  };

  // Validate form fields
  const validateForm = () => {
    if (!title.trim()) {
      setError("Title is required");
      return false;
    }
    if (!description.trim()) {
      setError("Description is required");
      return false;
    }
    if (!categoryId) {
      setError("Category is required");
      return false;
    }
    if (!regionCode) {
      setError("Region is required");
      return false;
    }
    if (!editorData.blocks || editorData.blocks.length === 0) {
      setError("Post content is required");
      return false;
    }
    return true;
  };

  // Load draft from localStorage
  useEffect(() => {
    if (!user) return;
    const draft = localStorage.getItem("forumPostDraft");
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setTitle(parsed.title || "");
        setDescription(parsed.description || "");
        setCategoryId(parsed.categoryId || "");
        setRegionCode(parsed.regionCode || "");
        setCityCode(parsed.cityCode || "");
        setDivisionCode(parsed.divisionCode || "");
        setWardCode(parsed.wardCode || "");
        setEditorData(parsed.editorData || { blocks: [] });
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
  }, [user]);

  // Initialize Editor.js
  useEffect(() => {
    if (!user || authLoading) return;

    const initEditor = async () => {
      const EditorJS = (await import("@editorjs/editorjs")).default;
      const HeaderTool = (await import("@editorjs/header")).default;
      const ListTool = (await import("@editorjs/list")).default;
      const ImageTool = (await import("@editorjs/image")).default;

      if (!editorRef.current) {
        editorRef.current = new EditorJS({
          holder: "editorjs",
          data: editorData,
          tools: {
            header: {
              class: HeaderTool,
              config: {
                placeholder: "Enter a header...",
                levels: [2, 3, 4],
                defaultLevel: 2,
              },
            },
            list: {
              class: ListTool,
              inlineToolbar: true,
            },
            image: {
              class: ImageTool,
              config: {
                uploader: {
                  uploadByFile: async (file) => {
                    try {
                      setLoading(true);
                      // Generate unique filename
                      const fileName = `posts/${user.id}/${Date.now()}-${file.name}`;

                      // Upload the file
                      const { data: uploadData, error: uploadError } =
                        await supabase.storage
                          .from("forum-images")
                          .upload(fileName, file, {
                            cacheControl: "3600",
                            upsert: false,
                          });

                      if (uploadError) {
                        console.error("Upload error:", uploadError);
                        throw uploadError;
                      }

                      // Get public URL
                      const {
                        data: { publicUrl },
                      } = supabase.storage
                        .from("forum-images")
                        .getPublicUrl(uploadData.path);

                      return {
                        success: 1,
                        file: {
                          url: publicUrl,
                        },
                      };
                    } catch (error) {
                      console.error("Image upload failed:", error);
                      setError("Failed to upload image. Please try again.");
                      return {
                        success: 0,
                        error: {
                          message: error.message,
                        },
                      };
                    } finally {
                      setLoading(false);
                    }
                  },
                },
              },
            },
          },
          placeholder: "Write your post here...",
          onChange: async (api) => {
            const content = await api.saver.save();
            setEditorData(content);
          },
        });
      }
    };

    initEditor();

    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [user, authLoading]);

  // Fetch initial dropdown data
  useEffect(() => {
    const fetchInitialData = async () => {
      const [catRes, regRes] = await Promise.all([
        supabase.from("forum_categories").select("id,name").order("name"),
        supabase.from("region").select("code,name"),
      ]);
      setCategories(catRes.data || []);
      setRegions(regRes.data || []);
    };
    fetchInitialData();
  }, []);

  // Location dropdown logic
  useEffect(() => {
    if (!regionCode) return setCities([]);
    supabase
      .from("city")
      .select("code,name")
      .eq("region_code", regionCode)
      .order("name")
      .then((res) => setCities(res.data || []));
  }, [regionCode]);

  useEffect(() => {
    if (!cityCode) return setDivisions([]);
    supabase
      .from("division")
      .select("code,name")
      .eq("city_code", cityCode)
      .order("name")
      .then((res) => setDivisions(res.data || []));
  }, [cityCode]);

  useEffect(() => {
    if (!divisionCode) return setWards([]);
    supabase
      .from("ward")
      .select("code,name")
      .eq("division_code", divisionCode)
      .order("name")
      .then((res) => setWards(res.data || []));
  }, [divisionCode]);

  // Auto-save draft
  useEffect(() => {
    if (user && hasContent()) {
      const draft = {
        title,
        description,
        categoryId,
        regionCode,
        cityCode,
        divisionCode,
        wardCode,
        editorData,
      };
      localStorage.setItem("forumPostDraft", JSON.stringify(draft));
    }
  }, [
    title,
    description,
    categoryId,
    regionCode,
    cityCode,
    divisionCode,
    wardCode,
    editorData,
    user,
  ]);

  const saveAsDraft = async () => {
    if (!hasContent()) {
      setError("Nothing to save - your draft is empty");
      return;
    }
    try {
      const content = editorRef.current
        ? await editorRef.current.save()
        : editorData;
      const draft = {
        title,
        description,
        categoryId,
        regionCode,
        cityCode,
        divisionCode,
        wardCode,
        editorData: content,
      };

      localStorage.setItem("forumPostDraft", JSON.stringify(draft));

      alert("Draft saved successfully!");
    } catch (err) {
      setError("Failed to save draft.");
      console.error("Draft save error:", err);
    }
  };

  const clearDraft = () => {
    if (!hasContent()) {
      setError("Nothing to clear - your form is already empty");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to clear all fields? This cannot be undone.",
    );

    if (confirmed) {
      localStorage.removeItem("forumPostDraft");
      setTitle("");
      setDescription("");
      setCategoryId("");
      setRegionCode("");
      setCityCode("");
      setDivisionCode("");
      setWardCode("");
      setEditorData({ blocks: [] });
      if (editorRef.current) editorRef.current.clear();
      setError(null);
    }
  };

  const handlePreview = async () => {
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      const content = editorRef.current
        ? await editorRef.current.save()
        : editorData;
      setEditorData(content);
      setShowPreview(true);
    } catch (err) {
      setError("Failed to generate preview.");
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to submit this post for review?",
    );

    if (!confirmed) {
      setLoading(false);
      return;
    }

    try {
      const content = editorRef.current
        ? await editorRef.current.save()
        : editorData;
      const slug = `${title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "")}-${Date.now().toString(36)}`;

      const { error: submissionError } = await supabase
        .from("forum_topics")
        .insert([
          {
            title,
            description,
            content,
            category_id: categoryId,
            author_id: user.id,
            slug,
            region_code: regionCode || null,
            city_code: cityCode || null,
            division_code: divisionCode || null,
            ward_code: wardCode || null,
            status: "Pending",
          },
        ]);

      if (submissionError) throw submissionError;

      // Clear draft after successful submission
      localStorage.removeItem("forumPostDraft");
      setSuccess(true);
      setShowPreview(false);
    } catch (err) {
      setError(
        err.message || "An unexpected error occurred while creating the post.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.loading}>Loading...</div>
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
          <h1>Post Submitted for Review!</h1>
          <p>
            Thank you for your contribution. Your post is now pending review by
            our moderators.
          </p>
          <div className={styles.successActions}>
            <Link href="/forum" className={styles.primaryButton}>
              Return to Forum
            </Link>
            <Link href="/forum/post/my-post" className={styles.secondaryButton}>
              View My Posts
            </Link>
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
        <p className={styles.subtitle}>
          Share walkability issues or ideas with the community
        </p>

        <form onSubmit={handleSubmit} className={styles.postForm}>
          {error && <div className={styles.error}>{error}</div>}
          {isDraftSaved && <div className={styles.success}>Draft saved!</div>}

          <PostForm
            isEditMode={false}
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            categoryId={categoryId}
            setCategoryId={setCategoryId}
            categories={categories}
            regionCode={regionCode}
            handleRegionChange={(value) => {
              setRegionCode(value);
              setCityCode("");
              setDivisionCode("");
              setWardCode("");
            }}
            regions={regions}
            cityCode={cityCode}
            handleCityChange={(value) => {
              setCityCode(value);
              setDivisionCode("");
              setWardCode("");
            }}
            cities={cities}
            divisionCode={divisionCode}
            handleDivisionChange={(value) => {
              setDivisionCode(value);
              setWardCode("");
            }}
            divisions={divisions}
            wardCode={wardCode}
            setWardCode={setWardCode}
            wards={wards}
          />

          <div className={styles.formActions}>
            <div className={styles.draftActions}>
              <button
                type="button"
                onClick={saveAsDraft}
                className={styles.draftButton}
              >
                {isDraftSaving ? "Saving..." : "Save Draft"}
              </button>
              <button
                type="button"
                onClick={clearDraft}
                className={styles.clearDraftButton}
                disabled={loading || !hasContent()}
              >
                Clear All
              </button>
            </div>
            <div className={styles.submitActions}>
              <button
                type="button"
                onClick={handlePreview}
                className={styles.secondaryButton}
                disabled={loading}
              >
                Preview
              </button>
              <button
                type="submit"
                disabled={loading}
                className={styles.primaryButton}
              >
                {loading ? "Submitting..." : "Submit for Review"}
              </button>
            </div>
          </div>
        </form>

        {showPreview && (
          <PostPreviewModal
            post={{
              title,
              description,
              content: editorData,
            }}
            onClose={() => setShowPreview(false)}
            onSubmit={handleSubmit}
            submitLabel="Submit for Review"
            isSubmitting={loading}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
