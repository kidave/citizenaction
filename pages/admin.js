import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";
import UploadProject from "../components/shared/image/UploadProject";
import ProjectTab from "../components/ward/tabs/ProjectTab";
import useWardProjects from "../src/hooks/useWardProjects";

export default function AdminPage() {
  const router = useRouter();
  const [wardCode, setWardCode] = useState("KE");
  const { projects, loading, error } = useWardProjects(wardCode);

  const [user, setUser] = useState(null);

  // Fetch the current user when page loads
  useState(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (data?.user) {
        setUser(data.user);
      } else {
        router.push("/login"); // or show a message
      }
    });
  }, []);

  if (!user) {
    return <p>🔒 Please log in to access the admin page…</p>;
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
      <h1>Admin Dashboard</h1>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Create New Project</h2>
        <UploadProject wardCode={wardCode} />
      </section>

      <section>
        <h2>Existing Projects for Ward: {wardCode}</h2>
        {loading && <p>Loading projects…</p>}
        {error && <p style={{ color: "red" }}>Error: {error}</p>}
        {projects?.length === 0 && <p>No projects found yet.</p>}
        {projects?.length > 0 && <ProjectTab projects={projects} />}
      </section>
    </div>
  );
}
