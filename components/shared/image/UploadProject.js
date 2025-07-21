import { useState } from "react";
import { supabase } from "../../../utils/supabaseClient";

export default function UploadProject({ wardCode }) {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("Pending");
  const [rationale, setRationale] = useState("");
  const [designSummary, setDesignSummary] = useState("");
  const [beforeFiles, setBeforeFiles] = useState([]);
  const [proposedFiles, setProposedFiles] = useState([]);
  const [afterFiles, setAfterFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!wardCode || !title) {
      alert("Ward code and title are required.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const beforeUrls = await uploadFiles(beforeFiles, "before");
      const proposedUrls = await uploadFiles(proposedFiles, "proposed");
      const afterUrls = await uploadFiles(afterFiles, "completed");

      const { error } = await supabase.from("project").insert({
        ward_code: wardCode,
        title,
        status,
        rationale,
        design_summary: designSummary,
        start_date: new Date().toISOString().slice(0, 10),
        before_images: beforeUrls,
        proposed_design_images: proposedUrls,
        after_images: afterUrls,
      });

      if (error) throw error;

      setMessage("✅ Project created successfully!");
      setTitle("");
      setStatus("Pending");
      setRationale("");
      setDesignSummary("");
      setBeforeFiles([]);
      setProposedFiles([]);
      setAfterFiles([]);
    } catch (err) {
      console.error(err);
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const uploadFiles = async (files, folder) => {
    const urls = [];
    for (const file of files) {
      const filePath = `${folder}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("project-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("project-images")
        .getPublicUrl(filePath);

      urls.push(data.publicUrl);
    }
    return urls;
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: "0 auto" }}>
      <h2>Create Project</h2>

      <input
        type="text"
        placeholder="Project Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        {[
          "Pending",
          "Approved",
          "Rejected",
          "In Progress",
          "Blocked",
          "Resolved",
          "Completed",
          "Available",
          "Unavailable",
          "Active",
          "Inactive",
        ].map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <textarea
        placeholder="Rationale"
        value={rationale}
        onChange={(e) => setRationale(e.target.value)}
      />

      <textarea
        placeholder="Design Summary"
        value={designSummary}
        onChange={(e) => setDesignSummary(e.target.value)}
      />

      <label>Before Images</label>
      <input
        type="file"
        multiple
        onChange={(e) => setBeforeFiles([...e.target.files])}
      />

      <label>Proposed Images</label>
      <input
        type="file"
        multiple
        onChange={(e) => setProposedFiles([...e.target.files])}
      />

      <label>After Images</label>
      <input
        type="file"
        multiple
        onChange={(e) => setAfterFiles([...e.target.files])}
      />

      <button type="submit" disabled={loading}>
        {loading ? "Submitting…" : "Create Project"}
      </button>

      {message && <p>{message}</p>}
    </form>
  );
}
